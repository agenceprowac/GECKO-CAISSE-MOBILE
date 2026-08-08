const CACHE_NAME = 'gecko-caisse-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/icons.svg'
];

// Installation du Service Worker et mise en cache immédiate des assets de base
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force le Service Worker à devenir actif immédiatement
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('Service Worker: Nettoyage de l\'ancien cache', cache);
              return caches.delete(cache);
            }
          })
        );
      });
    })
  );
});

// Stratégie Network-First avec fallback sur le cache (idéal pour avoir toujours la version la plus récente en ligne)
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes qui ne sont pas en HTTP/HTTPS (comme chrome-extension:// ou les requêtes websocket)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre à jour le cache avec la nouvelle réponse
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si le réseau échoue (Offline), on utilise le cache
        return caches.match(event.request);
      })
  );
});
