import React from 'react';
import { usePOSStore } from '../../store';
import { User, DollarSign, ShoppingBag, CreditCard, Banknote, Smartphone, Clock, ShieldAlert, QrCode, Upload, X } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const currentUser = usePOSStore(state => state.currentUser);
  const currentTenant = usePOSStore(state => state.currentTenant);
  const deleteTenant = usePOSStore(state => state.deleteTenant);
  const showNotification = usePOSStore(state => state.showNotification);
  const updateTenantQrCode = usePOSStore(state => state.updateTenantQrCode);
  const getSalesByTenant = usePOSStore(state => state.getSalesByTenant);
  const sales = getSalesByTenant();

  // Filtrer les ventes du vendeur actuel
  const mySales = sales.filter(sale => sale.sellerId === currentUser?.id);

  // Calculs statistiques
  const totalSalesAmount = mySales.reduce((sum, sale) => sum + sale.total, 0);
  const salesCount = mySales.length;
  const averageBasket = salesCount > 0 ? Math.round(totalSalesAmount / salesCount) : 0;

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification('error', 'L\'image est trop grande (max 2 Mo).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateTenantQrCode(currentTenant!.id, base64String);
        showNotification('success', 'QR Code de paiement mis à jour !');
      };
      reader.readAsDataURL(file);
    }
  };

  const getPaymentMethodIcon = (method: 'CASH' | 'CARD' | 'MOBILE') => {
    switch (method) {
      case 'CASH':
        return <Banknote className="text-green-400" size={16} />;
      case 'CARD':
        return <CreditCard className="text-blue-400" size={16} />;
      case 'MOBILE':
        return <Smartphone className="text-purple-400" size={16} />;
    }
  };

  const getPaymentMethodLabel = (method: 'CASH' | 'CARD' | 'MOBILE') => {
    switch (method) {
      case 'CASH':
        return 'Espèces';
      case 'CARD':
        return 'Carte';
      case 'MOBILE':
        return 'Mobile Money';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-dark-900 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
        
        {/* Header/Profil Info */}
        <div className="p-6 bg-dark-800 border border-dark-700 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-xl">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-2 border-primary text-primary font-bold text-3xl">
            {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-3xl font-bold text-white">{currentUser?.name || 'Vendeur'}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/20 text-primary border border-primary/30">
                Rôle: {currentUser?.role}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-dark-700 text-gray-300">
                ID: {currentUser?.id}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 shrink-0">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Ventes du jour (CA)</p>
              <h3 className="text-xl font-bold mt-1">
                {totalSalesAmount.toLocaleString('fr-FR')} F CFA
              </h3>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
              <ShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Nombre de Ventes</p>
              <h3 className="text-xl font-bold mt-1">{salesCount}</h3>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0">
              <User size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Panier Moyen</p>
              <h3 className="text-xl font-bold mt-1">
                {averageBasket.toLocaleString('fr-FR')} F CFA
              </h3>
            </div>
          </div>
        </div>

        {/* Historique des Ventes */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Historique des Ventes Journalières
          </h3>
          
          {mySales.length === 0 ? (
            <div className="p-8 bg-dark-800 border border-dark-700 rounded-3xl text-center text-gray-400">
              Aucune vente n'a été enregistrée aujourd'hui pour votre profil.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {mySales.map(sale => (
                <div 
                  key={sale.id} 
                  className="p-5 bg-dark-800 border border-dark-700 rounded-2xl flex flex-col gap-3 shadow-lg"
                >
                  <div className="flex justify-between items-start border-b border-dark-700/50 pb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{sale.createdAt}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                        {getPaymentMethodIcon(sale.paymentMethod)}
                        <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-white">
                      {sale.total.toLocaleString('fr-FR')} F CFA
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-400 font-medium">
                        <span>{item.quantity}x {item.product.name}</span>
                        <span>{(item.product.price * item.quantity).toLocaleString('fr-FR')} F CFA</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section Paramètres de Paiement (Seulement pour l'Administrateur) - TEMPORAIREMENT MASQUÉ 
        {currentUser?.role === 'ADMIN' && currentTenant && (
          <div className="p-6 bg-dark-900 border border-dark-700 rounded-3xl shadow-xl flex flex-col gap-6 mt-4">
            <div className="flex items-center gap-3 text-blue-400 border-b border-dark-700 pb-4">
              <QrCode size={24} />
              <h3 className="text-lg font-bold text-white">Paramètres de Paiement (Mobile Money)</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4">
                <p className="text-sm text-gray-400">
                  Ajoutez ici le QR Code de votre compte marchand (Wave, Orange, MTN). Il s'affichera automatiquement sur l'écran de caisse lorsque vous choisirez le paiement Mobile Money.
                </p>
                <div>
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-xl cursor-pointer transition-colors text-sm font-bold w-fit text-white">
                    <Upload size={18} />
                    Importer une image (Max 2 Mo)
                    <input type="file" accept="image/*" onChange={handleQrUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="shrink-0">
                {currentTenant.mobileMoneyQrCode ? (
                  <div className="relative">
                    <img src={currentTenant.mobileMoneyQrCode} alt="QR Code Paiement" className="w-32 h-32 rounded-xl object-contain bg-white p-2 border border-dark-600" />
                    <button 
                      onClick={() => {
                        updateTenantQrCode(currentTenant.id, '');
                        showNotification('success', 'QR Code supprimé.');
                      }}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                      title="Supprimer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-dark-800 border-2 border-dashed border-dark-600 flex items-center justify-center text-gray-500">
                    <QrCode size={40} className="opacity-50" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        */}

        {/* Section Gestion de l'Établissement & Abonnement (Seulement pour l'Administrateur) */}
        {currentUser?.role === 'ADMIN' && currentTenant && (
          <div className="p-6 bg-red-950/20 border border-red-500/20 rounded-3xl shadow-xl flex flex-col gap-6 mt-4">
            <div className="flex items-center gap-3 text-red-400 border-b border-red-500/10 pb-4">
              <ShieldAlert size={24} />
              <h3 className="text-lg font-bold text-white">Gestion de l'Établissement & Abonnement</h3>
            </div>
            
            <div className="space-y-2 text-sm text-gray-400">
              <p>
                <strong>Établissement :</strong> <span className="text-white">{currentTenant.establishmentName}</span>
              </p>
              <p>
                <strong>Email Propriétaire :</strong> <span className="text-white">{currentTenant.email}</span>
              </p>
              <p>
                <strong>Statut du compte :</strong> <span className={`font-bold px-2 py-0.5 rounded border ${currentTenant.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>{currentTenant.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}</span>
              </p>
              <p>
                <strong>Plan d'abonnement :</strong> <span className="text-primary font-bold">{currentTenant.plan}</span>
              </p>
              <p>
                <strong>Valable jusqu'au :</strong> <span className="text-white">
                  {currentTenant.subscriptionEndDate ? new Date(currentTenant.subscriptionEndDate).toLocaleDateString('fr-FR') : 'Non définie'}
                </span>
              </p>
            </div>

            <div className="flex justify-start border-b border-red-500/10 pb-6 mb-2">
              <button
                onClick={() => {
                  showNotification('alert', 'Votre demande de réabonnement/mise à niveau a été transmise à notre équipe.');
                }}
                className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
              >
                Renouveler mon abonnement / Mettre à niveau
              </button>
            </div>

            <div className="p-4 bg-red-950/40 rounded-2xl border border-red-950 text-xs text-red-300 leading-relaxed">
              <strong>Attention :</strong> Cliquer sur le bouton ci-dessous annulera immédiatement votre abonnement. Cela supprimera définitivement votre espace de caisse, votre catalogue d'articles, la liste de vos tables, vos profils d'employés et l'ensemble de l'historique de vos ventes de cet appareil. Cette action est irréversible.
            </div>

            <button
              onClick={() => {
                showNotification(
                  'confirm',
                  `Êtes-vous sûr de vouloir résilier votre abonnement et supprimer définitivement l'espace "${currentTenant.establishmentName}" ? Toutes vos données seront effacées.`,
                  () => {
                    deleteTenant(currentTenant.id);
                  }
                );
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-red-600/10 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              Se désabonner & Supprimer l'espace
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
