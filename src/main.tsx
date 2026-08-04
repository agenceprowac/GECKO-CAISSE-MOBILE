import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Enregistrement du Service Worker pour la PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('PWA Service Worker enregistré avec succès :', registration.scope);

        // Détecter les mises à jour du Service Worker pour forcer le rafraîchissement
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nouvelle version de l\'application détectée. Rechargement...');
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Échec de l\'enregistrement du Service Worker PWA :', error);
      });
  });
}
