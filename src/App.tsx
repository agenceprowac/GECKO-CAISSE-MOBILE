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
  
  const setOnlineStatus = usePOSStore(state => state.setOnlineStatus);
  const syncSalesWithServer = usePOSStore(state => state.syncSalesWithServer);
  const setDeferredPrompt = usePOSStore(state => state.setDeferredPrompt);

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

  return (
    <>
      {!hasEnteredApp && !isStandalone && (
        <LandingPage onEnterApp={() => setHasEnteredApp(true)} />
      )}

      {hasEnteredApp && isAuthenticatingSuperAdmin && (
        <LockScreen />
      )}

      {hasEnteredApp && !isAuthenticatingSuperAdmin && !currentTenant && (
        <TenantAuth />
      )}

      {hasEnteredApp && !isAuthenticatingSuperAdmin && currentTenant && !currentUser && (
        <LockScreen />
      )}

      {hasEnteredApp && !isAuthenticatingSuperAdmin && currentTenant && currentUser && currentUser.role === 'SUPER_ADMIN' && (
        <SuperAdminDashboard />
      )}

      {hasEnteredApp && !isAuthenticatingSuperAdmin && currentTenant && currentUser && currentUser.role !== 'SUPER_ADMIN' && (
        <POSLayout />
      )}

      <NotificationModal />
    </>
  );
}

export default App;
