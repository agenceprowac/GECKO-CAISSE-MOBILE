import { useEffect } from 'react';
import { POSLayout } from './components/POS/POSLayout';
import { LockScreen } from './components/Auth/LockScreen';
import { LandingPage } from './components/UI/LandingPage';
import { TenantAuth } from './components/Auth/TenantAuth';
import { SuperAdminDashboard } from './components/Auth/SuperAdminDashboard';
import { NotificationModal } from './components/UI/NotificationModal';
import { usePOSStore } from './store';

function App() {
  const currentUser = usePOSStore(state => state.currentUser);
  const currentTenant = usePOSStore(state => state.currentTenant);
  const hasEnteredApp = usePOSStore(state => state.hasEnteredApp);
  const setHasEnteredApp = usePOSStore(state => state.setHasEnteredApp);
  const isAuthenticatingSuperAdmin = usePOSStore(state => state.isAuthenticatingSuperAdmin);
  const impersonatedFromSuperAdmin = usePOSStore(state => state.impersonatedFromSuperAdmin);
  const exitImpersonation = usePOSStore(state => state.exitImpersonation);
  
  const setOnlineStatus = usePOSStore(state => state.setOnlineStatus);
  const syncSalesWithServer = usePOSStore(state => state.syncSalesWithServer);
  const setDeferredPrompt = usePOSStore(state => state.setDeferredPrompt);
  const theme = usePOSStore(state => state.theme);

  // Appliquer le thème au démarrage / changement
  useEffect(() => {
    const htmlEl = document.documentElement;
    if (theme === 'light') {
      htmlEl.classList.add('light');
    } else {
      htmlEl.classList.remove('light');
    }
  }, [theme]);

  // Network & PWA event listeners
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      syncSalesWithServer();
    };
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setOnlineStatus(navigator.onLine);
    if (navigator.onLine) {
      syncSalesWithServer();
    }

    // PWA Install prompt listener
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, [setOnlineStatus, syncSalesWithServer, setDeferredPrompt]);

  // Auto-refresh (Polling) pour synchroniser en temps réel
  useEffect(() => {
    // Ne rafraîchir que si on est dans un tenant actif
    if (!currentTenant || isAuthenticatingSuperAdmin) return;
    
    const interval = setInterval(() => {
      syncSalesWithServer();
    }, 15000); // toutes les 15 secondes

    return () => clearInterval(interval);
  }, [currentTenant, isAuthenticatingSuperAdmin, syncSalesWithServer]);

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;

  const shouldShowApp = hasEnteredApp || isStandalone;

  return (
    <>
      {impersonatedFromSuperAdmin && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-lg relative z-[9999]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
            MODE SUPPORT - {currentTenant?.establishmentName}
          </div>
          <button 
            onClick={() => exitImpersonation()}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
          >
            Quitter
          </button>
        </div>
      )}

      {!shouldShowApp && (
        <LandingPage onEnterApp={() => setHasEnteredApp(true)} />
      )}

      {shouldShowApp && isAuthenticatingSuperAdmin && (
        <LockScreen />
      )}

      {shouldShowApp && !isAuthenticatingSuperAdmin && !currentTenant && (
        <TenantAuth />
      )}

      {shouldShowApp && !isAuthenticatingSuperAdmin && currentTenant && !currentUser && (
        <LockScreen />
      )}

      {shouldShowApp && !isAuthenticatingSuperAdmin && currentTenant && currentUser && currentUser.role === 'SUPER_ADMIN' && (
        <SuperAdminDashboard />
      )}

      {shouldShowApp && !isAuthenticatingSuperAdmin && currentTenant && currentUser && currentUser.role !== 'SUPER_ADMIN' && (
        <POSLayout />
      )}

      <NotificationModal />
    </>
  );
}

export default App;
