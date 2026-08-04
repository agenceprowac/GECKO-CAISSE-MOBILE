import { useEffect } from 'react';
import { POSLayout } from './components/POS/POSLayout';
import { LockScreen } from './components/Auth/LockScreen';
import { LandingPage } from './components/UI/LandingPage';
import { TenantAuth } from './components/Auth/TenantAuth';
import { usePOSStore } from './store';

function App() {
  const currentUser = usePOSStore(state => state.currentUser);
  const currentTenant = usePOSStore(state => state.currentTenant);
  const hasEnteredApp = usePOSStore(state => state.hasEnteredApp);
  const setHasEnteredApp = usePOSStore(state => state.setHasEnteredApp);
  
  const setOnlineStatus = usePOSStore(state => state.setOnlineStatus);
  const syncSalesWithServer = usePOSStore(state => state.syncSalesWithServer);

  // Network offline/online event listeners
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      // Tentative de synchronisation en arrière-plan dès la reconnexion
      syncSalesWithServer();
    };

    const handleOffline = () => {
      setOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Première synchro si on démarre en ligne
    if (navigator.onLine) {
      syncSalesWithServer();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, syncSalesWithServer]);

  if (!hasEnteredApp) {
    return <LandingPage onEnterApp={() => setHasEnteredApp(true)} />;
  }

  if (!currentTenant) {
    return <TenantAuth />;
  }

  if (!currentUser) {
    return <LockScreen />;
  }

  return (
    <POSLayout />
  );
}

export default App;

