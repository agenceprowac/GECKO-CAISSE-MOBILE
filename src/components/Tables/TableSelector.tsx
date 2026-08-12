import React from 'react';
import { usePOSStore } from '../../store';
import { X, Users } from 'lucide-react';

interface TableSelectorProps {
  onClose: () => void;
}

export const TableSelector: React.FC<TableSelectorProps> = ({ onClose }) => {
  const { setTable, currentTable, getTablesByTenant, tableCarts } = usePOSStore();
  const tables = getTablesByTenant();

  const handleSelect = (table: any) => {
    setTable(table);
    onClose();
  };

  const directCart = tableCarts['direct'] || [];
  const directTotal = directCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-dark-800 rounded-3xl w-full max-w-3xl flex flex-col max-h-full shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-dark-700 bg-dark-900 rounded-t-3xl">
          <h2 className="text-2xl font-bold">Sélection de Table / Ardoise</h2>
          <button onClick={onClose} className="p-2 bg-dark-800 rounded-full text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleSelect(null)}
              className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 border-2 relative ${
                currentTable === null ? 'border-primary bg-primary/20 text-white' : 'border-dark-700 bg-dark-900 text-gray-400 hover:border-gray-500'
              } ${directCart.length > 0 ? 'ring-2 ring-emerald-500/30' : ''}`}
            >
              <Users size={32} />
              <span className="font-bold text-lg">Vente Directe (Comptoir)</span>
              {directCart.length > 0 && (
                <span className="text-xs bg-emerald-500 text-black px-2.5 py-1 rounded-full font-extrabold shadow-md shadow-emerald-500/20">
                  {directTotal.toLocaleString('fr-FR')} F CFA
                </span>
              )}
            </button>

            {tables.map(table => {
              const tableCart = tableCarts[table.id] || [];
              const tableTotal = tableCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
              const isActive = tableCart.length > 0;
              
              return (
                <button
                  key={table.id}
                  onClick={() => handleSelect(table)}
                  className={`p-6 rounded-2xl flex flex-col items-center justify-center gap-3 transition-transform active:scale-95 border-2 relative ${
                    currentTable?.id === table.id 
                      ? 'border-primary bg-primary/20 text-white' 
                      : isActive 
                        ? 'border-amber-500/50 bg-amber-500/5 text-amber-400 hover:border-amber-400' 
                        : 'border-dark-700 bg-dark-900 text-gray-400 hover:border-gray-500'
                  } ${isActive ? 'ring-2 ring-amber-500/30' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
                    isActive ? 'bg-amber-500 text-black' : 'bg-dark-700 text-white'
                  }`}>
                    {table.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-lg text-center">{table.name}</span>
                  {isActive && (
                    <span className="text-xs bg-amber-500 text-black px-2.5 py-1 rounded-full font-extrabold shadow-md shadow-amber-500/20">
                      {tableTotal.toLocaleString('fr-FR')} F CFA
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
