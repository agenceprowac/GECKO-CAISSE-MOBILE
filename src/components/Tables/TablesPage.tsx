import React, { useState } from 'react';
import { usePOSStore } from '../../store';
import { Plus, Edit2, Trash2, Check, LayoutGrid } from 'lucide-react';
import type { Table } from '../../types';

export const TablesPage: React.FC = () => {
  const { getTablesByTenant, addTable, updateTable, deleteTable, showNotification } = usePOSStore();
  const tables = getTablesByTenant();
  const [isEditing, setIsEditing] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState('');

  const handleEditClick = (table: Table) => {
    setEditingTable(table);
    setTableName(table.name);
    setIsEditing(true);
  };

  const handleDeleteClick = (tableId: string) => {
    showNotification(
      'confirm',
      'Voulez-vous vraiment supprimer cette table ?',
      () => deleteTable(tableId)
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    if (editingTable) {
      updateTable({ id: editingTable.id, name: tableName });
    } else {
      addTable(tableName);
    }

    setTableName('');
    setEditingTable(null);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-dark-900 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Gestion des Tables & Ardoises
            </h2>
            <p className="text-gray-400 mt-1">Configurez les emplacements de service</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => {
                setEditingTable(null);
                setTableName('');
                setIsEditing(true);
              }}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Ajouter une Table
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="p-6 bg-dark-800 border border-dark-700 rounded-3xl max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingTable ? 'Modifier la Table' : 'Ajouter une nouvelle Table'}
            </h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-400 mb-2 font-medium">Nom de la table / ardoise</label>
                <input
                  type="text"
                  required
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white"
                  placeholder="Ex: Table 12, Ardoise Jean"
                />
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 bg-dark-700 text-white rounded-xl font-bold hover:bg-dark-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {tables.map(table => (
              <div key={table.id} className="p-6 bg-dark-800 border border-dark-700 rounded-3xl flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <LayoutGrid size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{table.name}</p>
                    <span className="text-xs text-gray-400">ID : {table.id}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(table)}
                    className="p-2 bg-dark-700 rounded-lg text-blue-400 hover:bg-dark-600 transition-colors"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(table.id)}
                    className="p-2 bg-dark-700 rounded-lg text-red-500 hover:bg-dark-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
