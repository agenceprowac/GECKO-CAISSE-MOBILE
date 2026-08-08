import React, { useState, useMemo } from 'react';

import { usePOSStore } from '../../store';
import { mockCategories } from '../../data/mockData';
import { Beer, Martini, Wine, CupSoda, Pizza, Search, X } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Beer: <Beer size={24} />,
  Martini: <Martini size={24} />,
  Wine: <Wine size={24} />,
  CupSoda: <CupSoda size={24} />,
  Pizza: <Pizza size={24} />,
};

export const ProductGrid: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(mockCategories[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, getProductsByTenant } = usePOSStore();
  const products = getProductsByTenant();

  const filteredProducts = useMemo(() => {
    let result = [];
    if (searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      result = products.filter(p => p.name.toLowerCase().includes(lowerQuery));
    } else {
      result = products.filter(p => p.categoryId === activeCategory);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-dark-900 overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 bg-dark-800 border-b border-dark-700 shrink-0">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher un produit (local)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-900 text-white pl-12 pr-10 py-3 rounded-xl border border-dark-700 focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
      {/* Categories Bar */}
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar shrink-0 bg-dark-800 border-b border-dark-700">
        {mockCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex flex-col items-center justify-center min-w-[90px] h-[90px] rounded-xl transition-transform active:scale-95 ${
              activeCategory === cat.id ? cat.color + ' text-white' : 'bg-dark-700 text-gray-300'
            }`}
          >
            <div className="mb-2">{iconMap[cat.icon]}</div>
            <span className="text-sm font-medium">{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
          {filteredProducts.map(product => {
            const category = mockCategories.find(c => c.id === product.categoryId);
            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                style={product.image ? { backgroundImage: `url(${product.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                className="relative flex flex-col items-start justify-between p-4 h-[120px] rounded-2xl bg-dark-800 border border-dark-700 hover:border-gray-500 transition-all active:scale-95 shadow-sm overflow-hidden"
              >
                {product.image && <div className="absolute inset-0 bg-black/50 z-0" />}
                <div className={`absolute top-0 left-0 w-1 h-full ${category?.color || 'bg-primary'} z-10`} />
                <div className="w-full flex justify-between items-start mb-1 z-10">
                  <span className="text-left font-semibold text-white leading-tight pl-2">
                    {product.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.stock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {product.stock}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-200 pl-2 z-10">
                  {Math.round(product.price).toLocaleString('fr-FR')} F CFA
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
