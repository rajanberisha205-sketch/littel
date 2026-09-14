const CACHE_NAME = 'fasqoo-lite-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/fasqoologo.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png'
  // Füge hier bei Bedarf weitere Dateien hinzu (z.B. CSS/JS falls ausgelagert)
];

// 1. Installieren & Dateien cachen
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Alte Caches aufräumen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => clients.claim())
  );
});

// 3. Netzwerkanfragen abfangen (Cache first, sonst Netztwerk)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Aus Cache liefern
      }
      return fetch(event.request).catch(() => {
        // Fallback falls komplett offline und nicht im Cache (z.B. für Startseite)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
