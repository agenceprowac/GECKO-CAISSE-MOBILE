import React, { useState } from 'react';
import { X, Check, CreditCard, Shield, Zap, Sparkles } from 'lucide-react';
import { usePOSStore } from '../../store';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const commonFeatures = ['Produits illimités', 'Gestion complète des tables', 'Rapports & Statistiques', 'Support technique inclus'];

const plans = [
  {
    id: 'TRIAL',
    name: 'Essai Gratuit',
    durationMonths: 0.5, // 2 weeks
    price: 0,
    features: commonFeatures,
    icon: <Zap size={24} className="text-gray-400" />,
    color: 'border-gray-500/50 bg-gray-500/10'
  },
  {
    id: 'STANDARD',
    name: 'Standard (3 mois)',
    durationMonths: 3,
    price: 25000,
    monthlyEquivalent: 8333,
    features: commonFeatures,
    icon: <Shield size={24} className="text-blue-400" />,
    color: 'border-blue-500/50 bg-blue-500/10'
  },
  {
    id: 'PREMIUM',
    name: 'Premium (6 mois)',
    durationMonths: 6,
    price: 45000,
    monthlyEquivalent: 7500,
    features: commonFeatures,
    icon: <Sparkles size={24} className="text-purple-400" />,
    color: 'border-purple-500/50 bg-purple-500/10'
  },
  {
    id: 'ULTRA',
    name: 'Ultra (12 mois)',
    durationMonths: 12,
    price: 75000,
    monthlyEquivalent: 6250,
    features: commonFeatures,
    icon: <Sparkles size={24} className="text-yellow-400" />,
    color: 'border-yellow-500/50 bg-yellow-500/10',
    recommended: true
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const currentTenant = usePOSStore(state => state.currentTenant);
  const updateTenantSubscription = usePOSStore(state => state.updateTenantSubscription);
  const showNotification = usePOSStore(state => state.showNotification);
  
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !currentTenant) return null;

  const handleSubscribe = () => {
    if (!selectedPlan) return;
    setIsProcessing(true);

    // Simulation d'un délai de paiement réseau
    setTimeout(() => {
      // Calculer la nouvelle date de fin
      const currentDate = currentTenant.subscriptionEndDate 
        ? new Date(currentTenant.subscriptionEndDate) 
        : new Date();
      
      // Si la date est déjà passée, on repart d'aujourd'hui
      const baseDate = currentDate < new Date() ? new Date() : currentDate;
      
      const newEndDate = new Date(baseDate);
      if (selectedPlan.id === 'TRIAL') {
        newEndDate.setDate(newEndDate.getDate() + 14);
      } else {
        newEndDate.setMonth(newEndDate.getMonth() + selectedPlan.durationMonths);
      }

      updateTenantSubscription(
        currentTenant.id,
        selectedPlan.id as 'STANDARD' | 'PREMIUM' | 'ULTRA',
        'ACTIVE',
        newEndDate.toISOString()
      );

      setIsProcessing(false);
      showNotification('success', `Félicitations ! Vous avez souscrit au plan ${selectedPlan.name}. Votre abonnement est valide jusqu'au ${newEndDate.toLocaleDateString('fr-FR')}.`);
      onClose();
    }, 1500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <div className="bg-dark-900 border border-dark-700 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
          
          <div className="flex justify-between items-center p-6 border-b border-dark-700">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Mettre à niveau votre Établissement
              </h2>
              <p className="text-gray-400 mt-1">Choisissez le plan adapté à la croissance de votre activité.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-dark-800 rounded-full hover:bg-dark-700 text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedPlan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {plans.map(plan => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all hover:scale-105 ${plan.color} ${plan.recommended ? 'shadow-[0_0_30px_rgba(234,179,8,0.15)] border-yellow-500' : 'hover:border-primary border-transparent bg-dark-800'}`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        RECOMMANDÉ
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-xl ${plan.color.split(' ')[1]}`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-3xl font-black text-white">
                        {plan.price.toLocaleString('fr-FR')} <span className="text-sm text-gray-400 font-normal">FCFA</span>
                      </div>
                      {plan.monthlyEquivalent && (
                        <div className="text-sm text-emerald-400 font-medium mt-1">
                          Soit {plan.monthlyEquivalent.toLocaleString('fr-FR')} FCFA / mois
                        </div>
                      )}
                    </div>

                    <ul className="flex-1 space-y-3 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button 
                      className={`w-full py-3 rounded-xl font-bold transition-all ${plan.recommended ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-dark-700 text-white hover:bg-primary'}`}
                    >
                      Sélectionner
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-dark-800 p-8 rounded-3xl border border-dark-700 shadow-xl">
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="text-sm text-primary mb-6 hover:underline flex items-center gap-1"
                >
                  ← Retour aux plans
                </button>
                
                <h3 className="text-2xl font-bold text-white mb-2">Confirmation de Paiement</h3>
                <p className="text-gray-400 mb-6">Vous êtes sur le point de souscrire au plan <strong>{selectedPlan.name}</strong>.</p>
                
                <div className="bg-dark-900 p-6 rounded-2xl border border-dark-700 mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Plan choisi</span>
                    <span className="font-bold text-white">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Durée</span>
                    <span className="font-bold text-white">{selectedPlan.id === 'TRIAL' ? '14 jours' : `${selectedPlan.durationMonths} mois`}</span>
                  </div>
                  <div className="border-t border-dark-700 my-4" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-gray-300">Total à payer</span>
                    <span className="text-2xl font-black text-emerald-400">{selectedPlan.price.toLocaleString('fr-FR')} FCFA</span>
                  </div>
                </div>

                <button 
                  onClick={handleSubscribe}
                  disabled={isProcessing}
                  className="w-full py-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={20} />
                      {selectedPlan.price === 0 ? 'Activer l\'Essai Gratuit' : 'Payer maintenant (Simulation)'}
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">
                  *Ceci est un environnement de test local. Aucun débit réel ne sera effectué.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
