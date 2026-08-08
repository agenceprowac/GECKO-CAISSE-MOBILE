import React, { useState } from 'react';
import { X, PackagePlus, Plus, Minus, Check, Clock, ListFilter } from 'lucide-react';
import { usePOSStore } from '../../store';

interface StockManagerProps {
  onClose: () => void;
}

export const StockManager: React.FC<StockManagerProps> = ({ onClose }) => {
  const { 
    getProductsByTenant, 
    getStockHistoryByTenant, 
    updateStock 
  } = usePOSStore();

  const products = getProductsByTenant();
  const stockHistory = getStockHistoryByTenant();

  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'HISTORY'>('INVENTORY');
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('TODAY');
  
  // Dictionnaire pour gérer la quantité saisie manuellement pour chaque produit
  const [manualInputs, setManualInputs] = useState<{ [productId: string]: string }>({});

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Parser la date d'un mouvement
  const parseEntryDate = (entry: any) => {
    if (entry.rawDate) return new Date(entry.rawDate);
    // Fallback pour les anciennes entrées : "Le 08/08/2026 à 14:30:00"
    const parts = entry.createdAt.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (parts) {
      return new Date(`${parts[3]}-${parts[2]}-${parts[1]}T00:00:00`);
    }
    return new Date();
  };

  const filteredHistory = stockHistory.filter(entry => {
    if (period === 'ALL') return true;
    
    const entryDate = parseEntryDate(entry);
    const now = new Date();
    
    if (period === 'TODAY') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return entryDate >= startOfToday;
    }
    
    if (period === 'WEEK') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return entryDate >= startOfWeek;
    }
    
    if (period === 'MONTH') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return entryDate >= startOfMonth;
    }
    
    return true;
  });

  const handleStockAdjust = (productId: string, quantity: number) => {
    updateStock(productId, quantity);
  };

  const handleManualSubmit = (e: React.FormEvent, productId: string) => {
    e.preventDefault();
    const valueStr = manualInputs[productId];
    if (!valueStr) return;
    
    const value = parseInt(valueStr, 10);
    if (isNaN(value) || value === 0) return;

    handleStockAdjust(productId, value);
    
    // Réinitialiser le champ de saisie de ce produit
    setManualInputs(prev => ({ ...prev, [productId]: '' }));
  };

  const handleInputChange = (productId: string, value: string) => {
    setManualInputs(prev => ({ ...prev, [productId]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-800 rounded-3xl w-full max-w-2xl flex flex-col h-[85vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-dark-700 bg-dark-900 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <PackagePlus size={28} className="text-primary" />
            <h2 className="text-2xl font-bold">Gestion des Stocks & Inventaire</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-dark-800 rounded-full text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-dark-900 px-6 py-2 border-b border-dark-700 shrink-0 gap-4">
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'INVENTORY' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Ajuster l'Inventaire
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`pb-2 px-1 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'HISTORY' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Clock size={16} />
            Historique des Mouvements
          </button>
        </div>
        
        {activeTab === 'INVENTORY' ? (
          /* TAB 1: CURRENT INVENTORY & ADJUSTMENTS */
          <>
            <div className="p-4 border-b border-dark-700 bg-dark-900 shrink-0">
              <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {filteredProducts.map(product => (
                <div key={product.id} className="flex flex-col bg-dark-900 border border-dark-700 rounded-2xl p-4 gap-4 shadow-md">
                  
                  {/* Produit Info */}
                  <div className="flex items-center gap-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover border border-dark-700" />
                    ) : (
                      <div className="w-14 h-14 bg-dark-800 rounded-xl border border-dark-700 flex items-center justify-center text-gray-500 font-bold">
                        N/A
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-white text-lg">{product.name}</p>
                      <p className={`text-sm mt-1 font-semibold ${product.stock > 10 ? 'text-green-400' : 'text-red-400'}`}>
                        Stock actuel : {product.stock}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-dark-800 pt-3">
                    
                    {/* Saisie Manuelle de la quantité */}
                    <form 
                      onSubmit={(e) => handleManualSubmit(e, product.id)}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs text-gray-400 whitespace-nowrap">Saisie manuelle :</span>
                      <input 
                        type="number" 
                        placeholder="+/- Quantité" 
                        value={manualInputs[product.id] || ''}
                        onChange={(e) => handleInputChange(product.id, e.target.value)}
                        className="w-24 px-2.5 py-1.5 bg-dark-800 border border-dark-700 rounded-xl text-center text-xs font-semibold text-white focus:outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1 cursor-pointer"
                        title="Valider la quantité saisie"
                      >
                        <Check size={12} />
                        OK
                      </button>
                    </form>

                    {/* Ajustement rapide */}
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-gray-400 mr-1 hidden sm:inline">Ajuster de :</span>
                      <button 
                        onClick={() => handleStockAdjust(product.id, -1)}
                        className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center text-red-400 hover:bg-dark-700 transition-colors active:scale-95 shrink-0 cursor-pointer"
                        title="Retirer 1"
                      >
                        <Minus size={16} />
                      </button>
                      <button 
                        onClick={() => handleStockAdjust(product.id, 1)}
                        className="w-9 h-9 rounded-xl bg-dark-800 flex items-center justify-center text-green-400 hover:bg-dark-700 transition-colors active:scale-95 shrink-0 cursor-pointer"
                        title="Ajouter 1"
                      >
                        <Plus size={16} />
                      </button>
                      <button 
                        onClick={() => handleStockAdjust(product.id, 10)}
                        className="px-2.5 h-9 rounded-xl bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition-colors active:scale-95 shrink-0 cursor-pointer"
                      >
                        +10
                      </button>
                      <button 
                        onClick={() => handleStockAdjust(product.id, 24)}
                        className="px-2.5 h-9 rounded-xl bg-primary/20 text-primary text-xs font-bold hover:bg-primary/30 transition-colors active:scale-95 shrink-0 cursor-pointer"
                      >
                        +24
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center text-gray-500 py-10">Aucun produit trouvé.</div>
              )}
            </div>
          </>
        ) : (
          /* TAB 2: INVENTORY HISTORY LOG */
          <>
            {/* Filter */}
            <div className="p-4 border-b border-dark-700 bg-dark-900 shrink-0">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-white font-medium"
              >
                <option value="TODAY">Aujourd'hui</option>
                <option value="WEEK">Cette Semaine</option>
                <option value="MONTH">Ce Mois</option>
                <option value="ALL">Tout l'historique</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {filteredHistory.length === 0 ? (
              <div className="text-center text-gray-500 py-12 flex-1 flex flex-col items-center justify-center gap-2">
                <ListFilter size={40} className="text-gray-600" />
                <p className="font-semibold text-sm">Aucun mouvement de stock enregistré.</p>
                <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                  Les modifications de quantité d'articles s'afficheront ici en temps réel.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredHistory
                  .sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime())
                  .map(entry => (
                  <div 
                    key={entry.id} 
                    className="p-4 bg-dark-900 border border-dark-700 rounded-2xl flex items-center justify-between gap-4 text-xs shadow-md"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{entry.productName}</span>
                        <span className="text-[9px] bg-dark-800 text-gray-400 px-2 py-0.5 rounded font-semibold border border-dark-700">
                          Auteur : {entry.userLabel}
                        </span>
                      </div>
                      <p className="text-gray-500 font-medium">{entry.createdAt}</p>
                    </div>
                    
                    <span className={`text-base font-black shrink-0 ${
                      entry.quantityAdded >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {entry.quantityAdded >= 0 ? `+${entry.quantityAdded}` : entry.quantityAdded}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  </div>
  );
};
