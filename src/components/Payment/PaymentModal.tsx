import React, { useState } from 'react';
import { usePOSStore } from '../../store';
import { X, Banknote, CreditCard, Smartphone } from 'lucide-react';

interface PaymentModalProps {
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ onClose }) => {
  const { total, clearCart, cart, updateStock, showNotification, addSale, currentUser } = usePOSStore();
  const [amountGiven, setAmountGiven] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE'>('CASH');

  const given = parseInt(amountGiven, 10) || 0;
  const change = given - total;
  const isExactOrMore = given >= total;

  const handleNumpad = (num: string) => {
    if (num === 'C') setAmountGiven('');
    else if (num === '00') setAmountGiven(prev => prev ? prev + '00' : '');
    else setAmountGiven(prev => prev + num);
  };

  const quickAmounts = [1000, 2000, 5000, 10000, 20000];

  const handleValidate = () => {
    // Enregistrer la vente dans l'historique
    if (currentUser) {
      addSale({
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        items: [...cart],
        total,
        paymentMethod
      });
    }

    // Déduire les stocks pour chaque article vendu
    cart.forEach(item => {
      updateStock(item.product.id, -item.quantity);
    });

    showNotification(
      'alert',
      `Paiement de ${Math.round(total).toLocaleString('fr-FR')} F CFA validé par ${paymentMethod === 'CASH' ? 'Espèces' : paymentMethod === 'CARD' ? 'Carte' : 'Mobile Money'}.`
    );
    clearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className="bg-dark-800 rounded-3xl w-full max-w-4xl flex flex-col md:flex-row max-h-[98vh] shadow-2xl overflow-hidden my-auto">
        
        {/* Left column: Payment method & Total */}
        <div className="flex-1 p-4 md:p-6 border-b md:border-b-0 md:border-r border-dark-700 bg-dark-900 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Encaissement</h2>
            <button onClick={onClose} className="p-2 bg-dark-800 rounded-full text-gray-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
          
          <div className="text-center mb-8">
            <span className="text-gray-400 block mb-2">Total à payer</span>
            <span className="text-5xl font-bold text-white">{Math.round(total).toLocaleString('fr-FR')} F CFA</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`p-4 rounded-xl flex items-center justify-between text-xl font-bold transition-all ${
                paymentMethod === 'CASH' ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-4"><Banknote size={32} /> Espèces</div>
              {paymentMethod === 'CASH' && <span>✓</span>}
            </button>
            <button
              onClick={() => setPaymentMethod('CARD')}
              className={`p-4 rounded-xl flex items-center justify-between text-xl font-bold transition-all ${
                paymentMethod === 'CARD' ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-4"><CreditCard size={32} /> Carte Bancaire</div>
              {paymentMethod === 'CARD' && <span>✓</span>}
            </button>
            <button
              onClick={() => setPaymentMethod('MOBILE')}
              className={`p-4 rounded-xl flex items-center justify-between text-xl font-bold transition-all ${
                paymentMethod === 'MOBILE' ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-4"><Smartphone size={32} /> Mobile Money (Wave, Orange, MTN)</div>
              {paymentMethod === 'MOBILE' && <span>✓</span>}
            </button>
          </div>
        </div>

        {/* Right column: Numpad (for cash) or validation */}
        <div className="flex-1 p-4 md:p-6 flex flex-col overflow-y-auto">
          {paymentMethod === 'CASH' ? (
            <>
              {/* Cash amount inputs */}
              <div className="flex justify-between items-center mb-6 bg-dark-900 p-4 rounded-xl">
                <span className="text-gray-400">Reçu :</span>
                <span className="text-3xl font-bold">{(given).toLocaleString('fr-FR')} F CFA</span>
              </div>
              
              <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
                {quickAmounts.map(amt => (
                  <button
                    key={amt}
                    onClick={() => setAmountGiven(amt.toString())}
                    className="flex-1 min-w-[80px] bg-dark-700 py-3 rounded-lg text-lg font-bold active:scale-95 transition-transform shrink-0"
                  >
                    {amt.toLocaleString('fr-FR')}
                  </button>
                ))}
              </div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2 flex-1 mb-6">
                {['1','2','3','4','5','6','7','8','9','C','0','00'].map(key => (
                  <button
                    key={key}
                    onClick={() => handleNumpad(key)}
                    className={`rounded-xl text-2xl font-bold active:scale-95 transition-transform flex items-center justify-center min-h-[50px]
                      ${key === 'C' ? 'bg-red-500/20 text-red-500' : 'bg-dark-800 hover:bg-dark-700 text-white'}`}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Change indicator */}
              <div className={`p-4 rounded-xl text-center mb-4 border ${
                change >= 0 ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-dark-900 border-dark-700 text-gray-500'
              }`}>
                <span className="block text-sm mb-1">À rendre :</span>
                <span className="text-2xl font-bold">{change > 0 ? change.toLocaleString('fr-FR') : '0'} F CFA</span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
              {paymentMethod === 'MOBILE' ? (
                <>
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-6 animate-pulse">
                    <Smartphone size={48} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-blue-400">Paiement Mobile Money</h3>
                  <p className="text-gray-400 font-medium text-lg">
                    Veuillez valider le paiement de {Math.round(total).toLocaleString('fr-FR')} F CFA via l'application mobile de votre client.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-6 animate-pulse">
                    <CreditCard size={48} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">En attente de paiement</h3>
                  <p className="text-gray-400 font-medium text-lg">
                    Veuillez procéder au paiement de {Math.round(total).toLocaleString('fr-FR')} F CFA sur le terminal bancaire.
                  </p>
                </>
              )}
            </div>
          )}

          <button
            onClick={handleValidate}
            disabled={paymentMethod === 'CASH' && !isExactOrMore}
            className={`w-full py-5 rounded-2xl text-2xl font-bold transition-all active:scale-95 ${
              (paymentMethod !== 'CASH' || isExactOrMore)
                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                : 'bg-dark-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            VALIDER {Math.round(total).toLocaleString('fr-FR')} F CFA
          </button>
        </div>
      </div>
    </div>
  );
};
