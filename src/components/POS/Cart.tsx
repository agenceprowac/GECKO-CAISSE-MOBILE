import React from 'react';
import { usePOSStore } from '../../store';
import { Minus, Plus, Trash2, CreditCard } from 'lucide-react';

interface CartProps {
  onPay: () => void;
}

export const Cart: React.FC<CartProps> = ({ onPay }) => {
  const { cart, total, updateQuantity, clearCart, currentTable } = usePOSStore();

  return (
    <div className="flex flex-col h-full bg-dark-800 border-l border-dark-700">
      {/* Header */}
      <div className="p-4 border-b border-dark-700 bg-dark-900 shrink-0 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Ticket en cours</h2>
          <span className="text-sm text-gray-400">
            {currentTable ? currentTable.name : 'Vente comptoir'}
          </span>
        </div>
        <button
          onClick={clearCart}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          disabled={cart.length === 0}
        >
          <Trash2 size={24} />
        </button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
        {cart.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            Le panier est vide
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {cart.map(item => (
              <div key={item.id} className="flex flex-col bg-dark-700 rounded-lg p-3">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-white">{item.product.name}</span>
                  <span className="font-bold text-white">{Math.round(item.product.price * item.quantity).toLocaleString('fr-FR')} F CFA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{Math.round(item.product.price).toLocaleString('fr-FR')} F CFA / u</span>
                  
                  <div className="flex items-center gap-3 bg-dark-900 rounded-full p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-dark-800 flex items-center justify-center text-white active:scale-90"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                      className="font-bold w-12 text-center bg-transparent focus:outline-none border-b border-dark-600 focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Total */}
      <div className="p-4 bg-dark-900 border-t border-dark-700 shrink-0">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold text-gray-300">Total</span>
          <span className="text-3xl font-bold text-white">{Math.round(total).toLocaleString('fr-FR')} F CFA</span>
        </div>
        <button
          onClick={onPay}
          disabled={cart.length === 0}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all active:scale-95 ${
            cart.length > 0 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-dark-700 text-gray-500'
          }`}
        >
          <CreditCard size={24} />
          ENCAISSER
        </button>
      </div>
    </div>
  );
};
