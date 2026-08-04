import { useEffect } from 'react';
import { POSLayout } from './components/POS/POSLayout';
import { LockScreen } from './components/Auth/LockScreen';
import { LandingPage } from './components/UI/LandingPage';
import { TenantAuth } from './components/Auth/TenantAuth';
import { SuperAdminDashboard } from './components/Auth/SuperAdminDashboard';
import { usePOSStore } from './store';

function App() {
  const currentUser = usePOSStore(state => state.currentUser);
  const currentTenant = usePOSStore(state => state.currentTenant);
  const hasEnteredApp = usePOSStore(state => state.hasEnteredApp);
  const setHasEnteredApp = usePOSStore(state => state.setHasEnteredApp);
  
  const setOnlineStatus = usePOSStore(state => state.setOnlineStatus);
  const syncSalesWithServer = usePOSStore(state => state.syncSalesWithServer);
  const setDeferredPrompt = usePOSStore(state => state.setDeferredPrompt);

  // Network & PWA event listeners
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      // Tentative de synchronisation en arrière-plan dès la reconnexion
      syncSalesWithServer();
    };

    const handleOffline = () => {
      setOnlineStatus(false);
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      // Empêcher l'affichage automatique de la bannière système par défaut
      e.preventDefault();
      // Stocker l'événement pour un déclenchement ultérieur au clic du bouton
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Première synchro si on démarre en ligne
    if (navigator.onLine) {
      syncSalesWithServer();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [setOnlineStatus, syncSalesWithServer, setDeferredPrompt]);

  // Détecter si l'application est ouverte en mode autonome (PWA installée sur l'écran d'accueil)
  const isStandalone = typeof window !== 'undefined' && (
    (window.navigator as any).standalone || 
    window.matchMedia('(display-mode: standalone)').matches
  );

  if (!hasEnteredApp && !isStandalone) {
    return <LandingPage onEnterApp={() => setHasEnteredApp(true)} />;
  }

  if (!currentTenant) {
    return <TenantAuth />;
  }

  if (!currentUser) {
    return <LockScreen />;
  }

  if (currentUser.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  }

  return (
    <POSLayout />
  );
}

export default App;

