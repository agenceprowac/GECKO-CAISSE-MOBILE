import React, { useState } from 'react';
import { usePOSStore } from '../../store';
import { Plus, Edit2, Trash2, Check, ShieldCheck, Key } from 'lucide-react';
import type { User } from '../../types';

export const UsersPage: React.FC = () => {
  const { getUsersByTenant, addUser, updateUser, deleteUser, showNotification } = usePOSStore();
  const users = getUsersByTenant(true); // Inclure les inactifs pour pouvoir les gérer
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form states
  const [userName, setUserName] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'BARMAN' | 'WAITER'>('WAITER');
  const [isActive, setIsActive] = useState(true);

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setUserName(user.name);
    setPinCode(user.pinCode);
    setRole(user.role as any);
    setIsActive(user.isActive !== false);
    setIsEditing(true);
  };

  const handleToggleActive = (user: User) => {
    updateUser({ ...user, isActive: user.isActive === false ? true : false });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || pinCode.length !== 4) {
      showNotification('alert', 'Veuillez entrer un nom et un code PIN à 4 chiffres.');
      return;
    }

    if (editingUser) {
      updateUser({ id: editingUser.id, name: userName, pinCode, role, isActive });
    } else {
      addUser({ name: userName, pinCode, role, isActive });
    }

    setUserName('');
    setPinCode('');
    setRole('WAITER');
    setIsActive(true);
    setEditingUser(null);
    setIsEditing(false);
  };

  const getRolePermissions = (roleName: 'SUPER_ADMIN' | 'ADMIN' | 'BARMAN' | 'WAITER') => {
    switch (roleName) {
      case 'SUPER_ADMIN':
        return 'Accès global SaaS Cloud (Gestion de tous les établissements, plans et abonnements)';
      case 'ADMIN':
        return 'Accès complet (Caisse, Stocks, Tarifs, Rapports, Tables, Utilisateurs)';
      case 'BARMAN':
        return 'Accès Préparation (KDS, Gestion Stocks boissons, Caisse)';
      case 'WAITER':
        return 'Accès Prise de commandes (Caisse, Tables affectées)';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-dark-900 text-white">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Gestion des Utilisateurs & Rôles
            </h2>
            <p className="text-gray-400 mt-1">Gérez le personnel, leurs codes PIN et leurs droits d'accès</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => {
                setEditingUser(null);
                setUserName('');
                setPinCode('');
                setRole('WAITER');
                setIsActive(true);
                setIsEditing(true);
              }}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Ajouter un Utilisateur
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="p-6 bg-dark-800 border border-dark-700 rounded-3xl max-w-md">
            <h3 className="text-xl font-bold mb-6">
              {editingUser ? 'Modifier l\'Utilisateur' : 'Ajouter un nouveau Membre'}
            </h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-400 mb-2 font-medium">Nom complet</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white"
                  placeholder="Ex: Jean Kouassi"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2 font-medium">Code PIN (4 chiffres)</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white text-center tracking-widest text-2xl font-bold"
                  placeholder="0000"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2 font-medium">Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary text-white font-semibold"
                >
                  <option value="WAITER">Serveur (WAITER)</option>
                  <option value="BARMAN">Barman (BARMAN)</option>
                  <option value="ADMIN">Gérant / Admin (ADMIN)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 p-4 bg-dark-900 border border-dark-700 rounded-xl">
                <input
                  type="checkbox"
                  id="userActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 accent-primary bg-dark-800 border-dark-700 rounded"
                />
                <label htmlFor="userActive" className="text-white font-medium cursor-pointer">
                  Utilisateur Actif <span className="text-gray-400 text-sm block font-normal">S'il est désactivé, l'utilisateur ne pourra plus se connecter.</span>
                </label>
              </div>

              <div className="flex gap-4 mt-4">
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
          <div className="flex flex-col gap-6">
            {users.map(user => (
              <div key={user.id} className={`p-6 bg-dark-800 border border-dark-700 rounded-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg transition-opacity ${user.isActive === false ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 shrink-0">
                    {user.role === 'ADMIN' ? <ShieldCheck size={24} /> : <Key size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-bold text-lg">{user.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : user.role === 'BARMAN' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {user.role}
                      </span>
                      {user.isActive === false && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-red-500/20 text-red-500">
                          DÉSACTIVÉ
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                      Code PIN : <span className="font-mono font-bold text-white bg-dark-900 px-2 py-0.5 rounded border border-dark-700">•••• (Masqué)</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      <span className="font-semibold text-gray-400">Droits :</span> {getRolePermissions(user.role)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t md:border-t-0 border-dark-700 pt-3 md:pt-0">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="p-3 bg-dark-700 rounded-xl text-blue-400 hover:bg-dark-600 transition-colors flex items-center gap-2 text-sm font-semibold"
                  >
                    <Edit2 size={16} /> Modifier
                  </button>
                  {user.isActive !== false ? (
                    <button
                      onClick={() => handleToggleActive(user)}
                      className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 text-sm font-semibold"
                    >
                      Désactiver
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleActive(user)}
                      className="p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors flex items-center gap-2 text-sm font-semibold"
                    >
                      Activer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
