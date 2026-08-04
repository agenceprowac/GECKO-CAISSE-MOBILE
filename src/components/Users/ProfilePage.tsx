import React from 'react';
import { usePOSStore } from '../../store';
import { User, DollarSign, ShoppingBag, CreditCard, Banknote, Smartphone, Clock } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const currentUser = usePOSStore(state => state.currentUser);
  const getSalesByTenant = usePOSStore(state => state.getSalesByTenant);
  const sales = getSalesByTenant();

  // Filtrer les ventes du vendeur actuel
  const mySales = sales.filter(sale => sale.sellerId === currentUser?.id);

  // Calculs statistiques
  const totalSalesAmount = mySales.reduce((sum, sale) => sum + sale.total, 0);
  const salesCount = mySales.length;
  const averageBasket = salesCount > 0 ? Math.round(totalSalesAmount / salesCount) : 0;

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

      </div>
    </div>
  );
};
