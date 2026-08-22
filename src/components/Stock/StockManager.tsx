import React, { useState } from 'react';
import { X, PackagePlus, Plus, Search, Edit2, Check } from 'lucide-react';
import { usePOSStore } from '../../store';
import type { Product } from '../../types';

interface StockManagerProps {
  onClose: () => void;
}

export const StockManager: React.FC<StockManagerProps> = ({ onClose }) => {
  const { 
    getProductsByTenant, 
    getStockHistoryByTenant, 
    updateStock,
    updateStockHistoryEntry
  } = usePOSStore();

  const products = getProductsByTenant();
  const stockHistory = getStockHistoryByTenant();

  // États pour les modales et la recherche
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM' | 'ALL'>('TODAY');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // États pour la création d'une nouvelle entrée
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantityInput, setQuantityInput] = useState('');

  // États pour la modification d'une entrée existante
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editSearchProductQuery, setEditSearchProductQuery] = useState('');
  const [editSelectedProduct, setEditSelectedProduct] = useState<Product | null>(null);
  const [editQuantityInput, setEditQuantityInput] = useState('');

  // Filtrage des produits pour la recherche dans les modales
  const filteredProductsForAdd = products.filter(p => 
    p.name.toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  const filteredProductsForEdit = products.filter(p => 
    p.name.toLowerCase().includes(editSearchProductQuery.toLowerCase())
  );

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

  // Filtrer par période et s'assurer que quantityAdded > 0
  const filteredHistory = stockHistory.filter(entry => {
    if (entry.quantityAdded <= 0) return false;
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

    if (period === 'CUSTOM') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (entryDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (entryDate > end) return false;
      }
      return true;
    }
    
    return true;
  });

  // Soumission d'une nouvelle entrée
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const qty = parseInt(quantityInput, 10);
    if (isNaN(qty) || qty === 0) return;

    updateStock(selectedProduct.id, qty);
    
    // Réinitialisation
    setSelectedProduct(null);
    setQuantityInput('');
    setSearchProductQuery('');
    setShowAddModal(false);
  };

  // Ouverture de la modale de modification avec les valeurs actuelles
  const openEditModal = (entry: any) => {
    const product = products.find(p => p.id === entry.productId) || null;
    setEditingEntryId(entry.id);
    setEditSelectedProduct(product);
    setEditQuantityInput(entry.quantityAdded.toString());
    setEditSearchProductQuery(product ? product.name : '');
    setShowEditModal(true);
  };

  // Soumission de la modification
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntryId || !editSelectedProduct) return;
    const qty = parseInt(editQuantityInput, 10);
    if (isNaN(qty) || qty === 0) return;

    updateStockHistoryEntry(editingEntryId, editSelectedProduct.id, qty);

    // Réinitialisation
    setEditingEntryId(null);
    setEditSelectedProduct(null);
    setEditQuantityInput('');
    setEditSearchProductQuery('');
    setShowEditModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-800 rounded-3xl w-full max-w-3xl flex flex-col h-[85vh] shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-dark-700 bg-dark-900 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <PackagePlus size={28} className="text-primary" />
            <h2 className="text-2xl font-bold">Gestion des Stocks & Inventaire</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-dark-800 rounded-full text-gray-400 hover:text-white cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Barre d'action principale */}
        <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-dark-900 border-b border-dark-700 gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-white font-medium text-sm"
            >
              <option value="ALL">Toutes les périodes</option>
              <option value="TODAY">Aujourd'hui</option>
              <option value="WEEK">Cette Semaine</option>
              <option value="MONTH">Ce Mois</option>
              <option value="CUSTOM">Période personnalisée</option>
            </select>

            {period === 'CUSTOM' && (
              <div className="flex items-center gap-2 animate-fadeIn">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  title="Date de début"
                />
                <span className="text-gray-500 text-xs">à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-dark-800 border border-dark-700 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  title="Date de fin"
                />
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setQuantityInput('');
              setSearchProductQuery('');
              setShowAddModal(true);
            }}
            className="w-full sm:w-auto px-5 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20 active:scale-95 animate-pulse"
          >
            <Plus size={18} />
            Nouvelle Entrée
          </button>
        </div>

        {/* Liste des entrées */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center text-gray-500 py-16 flex flex-col items-center justify-center gap-3">
              <PackagePlus size={48} className="text-gray-600" />
              <p className="font-semibold text-lg">Aucune entrée de stock pour cette période.</p>
              <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
                Ajustez le filtre périodique ou appuyez sur "Nouvelle Entrée" pour ajouter du stock.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredHistory
                .sort((a, b) => new Date(b.rawDate || 0).getTime() - new Date(a.rawDate || 0).getTime())
                .map(entry => (
                  <div 
                    key={entry.id} 
                    className="p-4 bg-dark-900 border border-dark-700 rounded-2xl flex items-center justify-between gap-4 text-sm shadow-md hover:border-dark-600 transition-colors"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-base">{entry.productName}</span>
                        <span className="text-[10px] bg-dark-800 text-gray-400 px-2 py-0.5 rounded font-semibold border border-dark-700">
                          {entry.userLabel}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs font-medium">{entry.createdAt}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 shrink-0">
                      <span className={`text-lg font-black ${
                        entry.quantityAdded >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {entry.quantityAdded >= 0 ? `+${entry.quantityAdded}` : entry.quantityAdded}
                      </span>
                      
                      <button
                        onClick={() => openEditModal(entry)}
                        className="p-2 bg-dark-800 text-gray-400 hover:text-white rounded-xl border border-dark-700 hover:border-gray-500 transition-all cursor-pointer"
                        title="Modifier cette entrée"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* MODALE : Nouvelle Entrée */}
        {showAddModal && (
          <div className="absolute inset-0 bg-black/90 flex justify-center items-center z-50 p-4 rounded-3xl">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md p-6 flex flex-col max-h-[90%] shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-dark-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus size={20} className="text-primary" />
                  Nouvelle Entrée de Stock
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 bg-dark-900 rounded-full text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {/* Recherche d'article */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Rechercher un Article
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nom de l'article..."
                      value={searchProductQuery}
                      onChange={(e) => {
                        setSearchProductQuery(e.target.value);
                        setSelectedProduct(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white"
                    />
                    <Search size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  </div>
                </div>

                {/* Liste des résultats de recherche */}
                {!selectedProduct && searchProductQuery.trim() !== '' && (
                  <div className="bg-dark-950 border border-dark-700 rounded-xl max-h-40 overflow-y-auto flex flex-col divide-y divide-dark-800">
                    {filteredProductsForAdd.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product);
                          setSearchProductQuery(product.name);
                        }}
                        className="px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-800 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold">{product.name}</span>
                        <span className="text-xs text-gray-500">Stock act: {product.stock}</span>
                      </button>
                    ))}
                    {filteredProductsForAdd.length === 0 && (
                      <div className="p-3 text-center text-xs text-gray-500">Aucun article trouvé</div>
                    )}
                  </div>
                )}

                {/* Article sélectionné */}
                {selectedProduct && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary font-bold">Article sélectionné :</p>
                      <p className="text-sm font-semibold text-white">{selectedProduct.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        setSearchProductQuery('');
                      }}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>
                )}

                {/* Saisie de la Quantité */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Quantité à Ajouter
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ex: 10, 24, 50..."
                    value={quantityInput}
                    onChange={(e) => setQuantityInput(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white font-semibold"
                  />
                </div>

                {/* Validation */}
                <button
                  type="submit"
                  disabled={!selectedProduct || !quantityInput}
                  className="w-full py-3 mt-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                >
                  <Check size={16} />
                  Valider l'Entrée
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODALE : Modifier Entrée */}
        {showEditModal && (
          <div className="absolute inset-0 bg-black/90 flex justify-center items-center z-50 p-4 rounded-3xl">
            <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md p-6 flex flex-col max-h-[90%] shadow-2xl">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-dark-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Edit2 size={20} className="text-primary" />
                  Modifier l'Entrée de Stock
                </h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-1 bg-dark-900 rounded-full text-gray-400 hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4 flex-1 overflow-y-auto">
                {/* Recherche d'article */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Rechercher un Article
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Nom de l'article..."
                      value={editSearchProductQuery}
                      onChange={(e) => {
                        setEditSearchProductQuery(e.target.value);
                        setEditSelectedProduct(null);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white"
                    />
                    <Search size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                  </div>
                </div>

                {/* Liste des résultats de recherche pour Edit */}
                {!editSelectedProduct && editSearchProductQuery.trim() !== '' && (
                  <div className="bg-dark-950 border border-dark-700 rounded-xl max-h-40 overflow-y-auto flex flex-col divide-y divide-dark-800">
                    {filteredProductsForEdit.map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setEditSelectedProduct(product);
                          setEditSearchProductQuery(product.name);
                        }}
                        className="px-4 py-3 text-left text-sm text-gray-300 hover:bg-dark-800 hover:text-white transition-colors flex items-center justify-between"
                      >
                        <span className="font-semibold">{product.name}</span>
                        <span className="text-xs text-gray-500">Stock act: {product.stock}</span>
                      </button>
                    ))}
                    {filteredProductsForEdit.length === 0 && (
                      <div className="p-3 text-center text-xs text-gray-500">Aucun article trouvé</div>
                    )}
                  </div>
                )}

                {/* Article sélectionné pour Edit */}
                {editSelectedProduct && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary font-bold">Article sélectionné :</p>
                      <p className="text-sm font-semibold text-white">{editSelectedProduct.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditSelectedProduct(null);
                        setEditSearchProductQuery('');
                      }}
                      className="text-xs text-red-400 hover:underline cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>
                )}

                {/* Saisie de la Quantité */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Nouvelle Quantité
                  </label>
                  <input 
                    type="number" 
                    placeholder="Ex: 10, 24, 50..."
                    value={editQuantityInput}
                    onChange={(e) => setEditQuantityInput(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-dark-950 border border-dark-700 rounded-xl text-sm focus:outline-none focus:border-primary text-white font-semibold"
                  />
                </div>

                {/* Validation */}
                <button
                  type="submit"
                  disabled={!editSelectedProduct || !editQuantityInput}
                  className="w-full py-3 mt-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/95 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
                >
                  <Check size={16} />
                  Enregistrer les modifications
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
