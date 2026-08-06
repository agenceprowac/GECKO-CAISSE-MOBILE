import React, { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import { PaymentModal } from '../Payment/PaymentModal';
import { TableSelector } from '../Tables/TableSelector';
import { Sidebar } from './Sidebar';
import { StockManager } from '../Stock/StockManager';
import { ArticleManager } from '../Stock/ArticleManager';
import { ReportsPage } from '../Reports/ReportsPage';
import { TablesPage } from '../Tables/TablesPage';
import { UsersPage } from '../Users/UsersPage';
import { ProfilePage } from '../Users/ProfilePage';
import { Menu, Search, Users, X, Wifi, WifiOff, RefreshCw, PackagePlus, Tag } from 'lucide-react';
import { usePOSStore } from '../../store';

export const POSLayout: React.FC = () => {
  const [showPayment, setShowPayment] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showStockManager, setShowStockManager] = useState(false);
  const [showArticleManager, setShowArticleManager] = useState(false);
  
  // Navigation views: 'pos' | 'reports' | 'users' | 'tables' | 'profile'
  const [currentView, setCurrentView] = useState<'pos' | 'reports' | 'users' | 'tables' | 'profile'>('pos');
  
  // Mobile only toggle
  const [showCartMobile, setShowCartMobile] = useState(false);

  const { currentTenant, currentUser, currentTable, cart, setCurrentUser, isOnline, isSyncing, getSalesByTenant, syncSalesWithServer } = usePOSStore();
  const canManageStock = currentUser?.role === 'ADMIN' || currentUser?.role === 'BARMAN';
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const unsyncedCount = getSalesByTenant().filter(s => !s.synced).length;

  const renderMainContent = () => {
    switch (currentView) {
      case 'reports':
        return <ReportsPage />;
      case 'tables':
        return <TablesPage />;
      case 'users':
        return <UsersPage />;
      case 'profile':
        return <ProfilePage />;
      case 'pos':
      default:
        return (
          <div className="flex-1 flex overflow-hidden w-full h-full">
            {/* Left: Product Grid (Hidden on mobile when cart is shown) */}
            <div className={`flex-1 w-full h-full ${showCartMobile ? 'hidden md:block' : 'block'}`}>
              <ProductGrid />
            </div>

            {/* Right: Cart (Hidden on mobile unless toggled) */}
            <div className={`w-full h-full md:w-[400px] lg:w-[450px] shrink-0 ${
              showCartMobile ? 'block' : 'hidden md:block'
            }`}>
              <Cart onPay={() => setShowPayment(true)} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-900 text-white overflow-hidden selection:bg-primary/30">
      {/* Top Navbar */}
      <header className="h-16 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSidebar(true)}
            className="p-2 bg-dark-700 rounded-lg text-gray-300 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-[200px]">
              {currentTenant?.establishmentName 
                ? (currentTenant.establishmentName.length > 10 
                    ? currentTenant.establishmentName.substring(0, 10) + '...' 
                    : currentTenant.establishmentName)
                : 'BarPOS'}
            </h1>
            
            {/* Raccourci d'accès direct aux Articles pour l'ADMIN */}
            {currentUser?.role === 'ADMIN' && (
              <button
                onClick={() => setShowArticleManager(true)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all border border-primary/30 cursor-pointer shadow-lg shadow-primary/5 active:scale-95 sm:ml-2 shrink-0"
                title="Ouvrir le Catalogue d'Articles"
              >
                <Tag size={14} />
                <span className="hidden sm:inline">Articles</span>
              </button>
            )}

            {/* Raccourci d'accès direct au Gestionnaire de Stock pour l'ADMIN / BARMAN */}
            {canManageStock && (
              <button
                onClick={() => setShowStockManager(true)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all border border-primary/30 cursor-pointer shadow-lg shadow-primary/5 active:scale-95 shrink-0"
                title="Ouvrir la Gestion des Stocks"
              >
                <PackagePlus size={14} />
                <span className="hidden sm:inline">Stocks</span>
              </button>
            )}
            
            {/* Status Réseau / Synchro */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
              {isOnline ? (
                isSyncing ? (
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[9px] sm:text-[10px] font-bold border border-yellow-500/20 whitespace-nowrap">
                    <RefreshCw size={10} className="animate-spin" />
                    <span className="hidden sm:inline">Synchro...</span>
                  </span>
                ) : unsyncedCount > 0 ? (
                  <button 
                    onClick={() => syncSalesWithServer()}
                    className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white text-[9px] sm:text-[10px] font-bold border border-blue-500/30 transition-all cursor-pointer animate-pulse whitespace-nowrap"
                    title="Cliquer pour synchroniser les ventes locales"
                  >
                    <RefreshCw size={10} />
                    <span className="hidden sm:inline">Synchro </span>({unsyncedCount})
                  </button>
                ) : (
                  <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[9px] sm:text-[10px] font-bold border border-green-500/20 whitespace-nowrap">
                    <Wifi size={10} />
                    <span className="hidden sm:inline">En Ligne</span>
                  </span>
                )
              ) : (
                <span 
                  className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 text-[9px] sm:text-[10px] font-bold border border-orange-500/20 whitespace-nowrap"
                  title="Vos ventes sont sauvegardées localement et seront envoyées dès le retour du réseau."
                >
                  <WifiOff size={10} />
                  <span className="hidden sm:inline">Hors Ligne </span>
                  {unsyncedCount > 0 && `(${unsyncedCount})`}
                </span>
              )}
            </div>
          </div>
        </div>

        
        <div className="flex items-center gap-4">
          {currentView === 'pos' && (
            <>
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="pl-10 pr-4 py-2 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-primary w-64 transition-colors"
                />
              </div>
              
              <button 
                onClick={() => setShowTableSelector(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                  currentTable ? 'bg-primary/20 text-primary border border-primary/50' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                <Users size={20} />
                <span className="hidden sm:inline">{currentTable ? currentTable.name : 'Table / Client'}</span>
              </button>
            </>
          )}
          
          {currentView !== 'pos' && (
            <button
              onClick={() => setCurrentView('pos')}
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/95 transition-colors"
            >
              Retour à la Caisse
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden w-full relative">
        {renderMainContent()}
      </main>

      {/* Mobile Cart Toggle Button (Only show on POS view) */}
      {currentView === 'pos' && (
        <button 
          className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white z-20"
          onClick={() => setShowCartMobile(!showCartMobile)}
        >
          <div className="relative">
            {showCartMobile ? <X size={28} /> : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                {totalItems > 0 && (
                  <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </>
            )}
          </div>
        </button>
      )}

      {/* Modals & Overlays */}
      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        currentView={currentView}
        onViewChange={setCurrentView}
        onStockClick={() => setShowStockManager(true)}
        onArticleClick={() => setShowArticleManager(true)}
        onLogout={() => setCurrentUser(null)}
      />
      {showStockManager && <StockManager onClose={() => setShowStockManager(false)} />}
      {showArticleManager && <ArticleManager onClose={() => setShowArticleManager(false)} />}
      {showPayment && <PaymentModal onClose={() => setShowPayment(false)} />}
      {showTableSelector && <TableSelector onClose={() => setShowTableSelector(false)} />}
    </div>
  );
};
