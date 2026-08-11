import React from 'react';
import { X, LayoutDashboard, FileText, LogOut, PackagePlus, Users, LayoutGrid, User, Tag, TestTube } from 'lucide-react';
import { usePOSStore } from '../../store';
import { GeckoLogo } from '../common/GeckoLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: 'pos' | 'reports' | 'users' | 'tables' | 'profile';
  onViewChange: (view: 'pos' | 'reports' | 'users' | 'tables' | 'profile') => void;
  onStockClick: () => void;
  onArticleClick: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  currentView, 
  onViewChange, 
  onStockClick,
  onArticleClick,
  onLogout
}) => {
  const currentUser = usePOSStore(state => state.currentUser);
  const currentTenant = usePOSStore(state => state.currentTenant);
  const logoutTenant = usePOSStore(state => state.logoutTenant);
  const isLocalTestMode = usePOSStore(state => state.isLocalTestMode);
  const toggleTestMode = usePOSStore(state => state.toggleTestMode);

  if (!isOpen) return null;

  const menuItems: { id: 'pos' | 'reports' | 'tables' | 'users' | 'profile'; name: string; icon: React.ReactNode; allowedRoles: ('ADMIN' | 'BARMAN' | 'WAITER')[] }[] = [
    { id: 'pos', name: 'Caisse (Point de Vente)', icon: <LayoutDashboard size={20} />, allowedRoles: ['ADMIN', 'BARMAN', 'WAITER'] },
    { id: 'profile', name: 'Mon Profil & Ventes', icon: <User size={20} className="text-primary" />, allowedRoles: ['ADMIN', 'BARMAN', 'WAITER'] },
    { id: 'reports', name: 'Rapports & Stats', icon: <FileText size={20} />, allowedRoles: ['ADMIN'] },
    { id: 'tables', name: 'Gestion des Tables', icon: <LayoutGrid size={20} />, allowedRoles: ['ADMIN', 'WAITER'] },
    { id: 'users', name: 'Gestion Utilisateurs & Accès', icon: <Users size={20} />, allowedRoles: ['ADMIN'] },
  ];

  const allowedMenuItems = menuItems.filter(item => 
    currentUser && currentUser.role !== 'SUPER_ADMIN' && item.allowedRoles.includes(currentUser.role as any)
  );

  const canManageStock = currentUser?.role === 'ADMIN' || currentUser?.role === 'BARMAN';

  const userInitial = currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'U';

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity" 
        onClick={onClose}
      />
      
      {/* Sidebar Panel */}
      <div className="fixed top-0 left-0 w-72 h-full bg-dark-900 border-r border-dark-700 z-50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        
        {/* Header */}
        <div className="h-20 flex flex-col justify-center px-6 border-b border-dark-700 bg-dark-800 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GeckoLogo size={28} iconOnly />
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                {currentTenant?.establishmentName || 'BarPOS'}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-mono">
            {currentTenant?.email}
          </span>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {allowedMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                onClose();
              }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl font-semibold transition-colors ${
                currentView === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-gray-400 hover:bg-dark-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
          
          {(currentUser?.role === 'ADMIN' || canManageStock) && (
            <>
              <div className="border-t border-dark-800 my-2" />
              
              {currentUser?.role === 'ADMIN' && (
                <button 
                  onClick={() => {
                    onClose();
                    onArticleClick();
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-dark-800 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  <Tag size={20} />
                  Configuration Articles
                </button>
              )}

              {canManageStock && (
                <button 
                  onClick={() => {
                    onClose();
                    onStockClick();
                  }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-400 hover:bg-dark-800 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  <PackagePlus size={20} />
                  Gestion des Stocks
                </button>
              )}

              {currentUser?.role === 'ADMIN' && (
                <>
                  <div className="border-t border-dark-800 my-2" />
                  <button 
                    onClick={() => {
                      toggleTestMode();
                      onClose();
                    }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                      isLocalTestMode 
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                        : 'text-gray-400 hover:bg-dark-800 hover:text-white'
                    }`}
                    title="Activer/Désactiver le bac à sable local"
                  >
                    <TestTube size={20} />
                    {isLocalTestMode ? 'Mode Test (Actif)' : 'Mode Test Isolé'}
                  </button>
                </>
              )}
            </>
          )}
        </nav>

        {/* Footer / User */}
        <div className="p-4 border-t border-dark-700 shrink-0 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-2 px-2">
            <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-gray-300 font-bold">
              {userInitial}
            </div>
            <div>
              <p className="font-semibold text-white">{currentUser?.name || 'Utilisateur'}</p>
              <p className="text-sm text-gray-400">{currentUser?.role || 'Rôle'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 text-xs transition-colors"
              title="Changer de session de serveur / verrouiller"
            >
              <LogOut size={16} />
              Session
            </button>
            <button 
              onClick={() => {
                onClose();
                logoutTenant();
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-dark-700 text-gray-300 font-bold hover:bg-dark-600 text-xs transition-colors"
              title="Quitter cet espace de travail"
            >
              Quitter
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
