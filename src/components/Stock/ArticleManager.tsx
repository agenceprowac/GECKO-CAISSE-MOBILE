import React, { useState } from 'react';
import { X, Plus, Check, Edit2, Trash2, Tag } from 'lucide-react';
import { usePOSStore } from '../../store';
import { mockCategories } from '../../data/mockData';
import type { Product } from '../../types';

interface ArticleManagerProps {
  onClose: () => void;
}

export const ArticleManager: React.FC<ArticleManagerProps> = ({ onClose }) => {
  const { currentTenant, getProductsByTenant, addProduct, updateProduct, deleteProduct, showNotification } = usePOSStore();
  const products = getProductsByTenant(true);
  
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newPurchasePrice, setNewPurchasePrice] = useState('');
  const [newStock, setNewStock] = useState('0');
  const [newCategoryId, setNewCategoryId] = useState(mockCategories[0].id);
  const [newImage, setNewImage] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setNewName(product.name);
    setNewPrice(product.price.toString());
    setNewPurchasePrice(product.purchasePrice?.toString() || '');
    setNewStock(product.stock.toString());
    setNewCategoryId(product.categoryId);
    setNewImage(product.image || '');
    setIsAvailable(product.isAvailable !== false);
    setIsCreating(true);
  };

  const handleToggleAvailable = (product: Product) => {
    updateProduct({ ...product, isAvailable: product.isAvailable === false ? true : false });
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    
    if (editingProduct) {
      updateProduct({
        id: editingProduct.id,
        name: newName,
        price: parseFloat(newPrice) || 0,
        purchasePrice: parseFloat(newPurchasePrice) || 0,
        stock: parseInt(newStock, 10) || 0,
        categoryId: newCategoryId,
        image: newImage || undefined,
        isAvailable
      });
    } else {
      // Restriction de plan Standard : Limite à 15 produits
      if (currentTenant?.plan === 'STANDARD' && products.length >= 15) {
        showNotification(
          'alert', 
          `Limite de 15 produits atteinte pour le Plan Standard de "${currentTenant.establishmentName}". Veuillez passer à un plan supérieur.`
        );
        return;
      }

      addProduct({
        name: newName,
        price: parseFloat(newPrice) || 0,
        purchasePrice: parseFloat(newPurchasePrice) || 0,
        stock: parseInt(newStock, 10) || 0,
        categoryId: newCategoryId,
        image: newImage || undefined,
        isAvailable
      });
    }
    
    // Reset Form
    setNewName('');
    setNewPrice('');
    setNewPurchasePrice('');
    setNewStock('0');
    setNewImage('');
    setIsAvailable(true);
    setEditingProduct(null);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-dark-800 rounded-3xl w-full max-w-2xl flex flex-col h-[85vh] shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-dark-700 bg-dark-900 rounded-t-3xl shrink-0">
          <div className="flex items-center gap-3">
            <Tag size={28} className="text-primary" />
            <h2 className="text-2xl font-bold">
              {isCreating ? (editingProduct ? 'Modifier la Fiche Article' : 'Nouvel Article') : 'Configuration des Articles & Catalogue'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-dark-800 rounded-full text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        {!isCreating ? (
          <>
            {/* Search and Create Actions */}
            <div className="p-3 sm:p-4 border-b border-dark-700 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative w-full">
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary transition-colors text-white"
                />
              </div>
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setNewName('');
                  setNewPrice('');
                  setNewStock('0');
                  setNewImage('');
                  setIsCreating(true);
                }}
                className="px-4 sm:px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shrink-0 animate-pulse w-full sm:w-auto"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Créer un Article</span>
                <span className="sm:hidden">Nouvel Article</span>
              </button>
            </div>

            {/* Articles List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {filteredProducts.map(product => (
                <div key={product.id} className={`flex items-center justify-between bg-dark-900 border border-dark-700 rounded-2xl p-4 gap-4 shadow-md transition-opacity ${product.isAvailable === false ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex items-center gap-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-14 h-14 rounded-xl object-cover border border-dark-700" />
                    ) : (
                      <div className="w-14 h-14 bg-dark-800 rounded-xl border border-dark-700 flex items-center justify-center text-gray-500 font-bold">
                        N/A
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-white text-lg">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 bg-dark-800 px-2 py-0.5 rounded border border-dark-700">
                          {mockCategories.find(c => c.id === product.categoryId)?.name || 'Catégorie'}
                        </span>
                        <span className="text-sm font-bold text-emerald-400">
                          {Math.round(product.price).toLocaleString('fr-FR')} F CFA
                        </span>
                        {product.isAvailable === false && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-500 ml-2">
                            INDISPONIBLE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-3 bg-dark-700 rounded-xl text-blue-400 hover:bg-dark-600 transition-colors active:scale-95 cursor-pointer"
                      title="Modifier les informations"
                    >
                      <Edit2 size={18} />
                    </button>
                    {product.isAvailable !== false ? (
                      <button
                        onClick={() => handleToggleAvailable(product)}
                        className="p-3 bg-red-500/10 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors active:scale-95 cursor-pointer text-sm font-semibold"
                        title="Désactiver l'article"
                      >
                        Désactiver
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleAvailable(product)}
                        className="p-3 bg-green-500/10 rounded-xl text-green-400 hover:bg-green-500/20 transition-colors active:scale-95 cursor-pointer text-sm font-semibold"
                        title="Activer l'article"
                      >
                        Activer
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center text-gray-500 py-10">Aucun article dans le catalogue.</div>
              )}
            </div>
          </>
        ) : (
          /* CREATE / UPDATE ARTICLE FORM */
          <div className="flex-1 overflow-y-auto p-6 bg-dark-900">
            <form onSubmit={handleCreateOrUpdate} className="flex flex-col gap-6 max-w-md mx-auto">
              <div>
                <label className="block text-gray-400 mb-2 font-medium">Nom de l'article</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white"
                  placeholder="Ex: Guinness 33cl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col justify-end">
                  <label className="block text-gray-400 mb-2 font-medium text-sm truncate">Prix d'Achat</label>
                  <input 
                    type="number"
                    value={newPurchasePrice}
                    onChange={(e) => setNewPurchasePrice(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white"
                    placeholder="Ex: 1500"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-gray-400 mb-2 font-medium text-sm truncate">Prix de Vente</label>
                  <input 
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white"
                    placeholder="Ex: 2000"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="block text-gray-400 mb-2 font-medium text-sm truncate">Stock Initial</label>
                  <input 
                    type="number"
                    required
                    disabled={!!editingProduct} // Le stock est géré via le bouton Stocks, pas ici à l'édition
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white disabled:opacity-50"
                  />
                </div>

              <div>
                <label className="block text-gray-400 mb-2 font-medium">Catégorie</label>
                <select 
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white font-semibold"
                >
                  {mockCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-dark-900 border border-dark-700 rounded-xl">
                <input
                  type="checkbox"
                  id="productAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-5 h-5 accent-primary bg-dark-800 border-dark-700 rounded"
                />
                <label htmlFor="productAvailable" className="text-white font-medium cursor-pointer">
                  Article Disponible <span className="text-gray-400 text-sm block font-normal">S'il est désactivé, l'article disparaîtra de la caisse.</span>
                </label>
              </div>

              <div>
                <label className="block text-gray-400 mb-2 font-medium">Image de l'article</label>
                <div className="flex flex-col gap-4">
                  {newImage && (
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-dark-700">
                      <img src={newImage} alt="Aperçu" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setNewImage('')}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setNewImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer cursor-pointer bg-dark-800 border border-dark-700 p-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-4 py-4 bg-dark-700 text-white rounded-xl font-bold hover:bg-dark-600 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Check size={20} />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
