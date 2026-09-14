const CACHE_NAME = 'fasqoo-lite-v2';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/fasqoologo.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/apple-touch-icon.png'
];

// Install
self.addEventListener('install', event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch
self.addEventListener('fetch', event => {

  const request = event.request;

  // Speed-Test-Daten NIEMALS aus dem Cache laden
  if (
    request.method !== 'GET' ||
    request.url.includes('speed') ||
    request.url.includes('download') ||
    request.url.includes('upload') ||
    request.url.includes('ping') ||
    request.url.includes('picsum') ||
    request.url.includes('cdnjs')
  ) {
    event.respondWith(
      fetch(request, {
        cache: 'no-store'
      })
    );
    return;
  }

  // Normale Website-Dateien:
  // Network First, danach Cache
  event.respondWith(
    fetch(request)
      .then(response => {

        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
