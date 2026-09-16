const CACHE_NAME = "fasqoo-lite-v4";

const APP_SHELL = [
  "/",
  "/index.html",
  "/site.webmanifest",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

function isSpeedTestRequest(request) {
  const url = new URL(request.url);

  // Upload requests must never be cached.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return true;
  }

  // Real speed-test/API traffic must bypass the Service Worker cache.
  if (url.origin === "https://speed.cloudflare.com") {
    return true;
  }

  if (url.origin === "https://ipwho.is") {
    return true;
  }

  const path = url.pathname + url.search;

  return /__down|__up|speed|download|upload|ping|jitter/i.test(path);
}

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  /*
   * IMPORTANT:
   * Speed-test traffic goes directly to the network.
   * The Service Worker does not cache or modify measurements.
   */
  if (isSpeedTestRequest(request)) {
    event.respondWith(
      fetch(request, {
        cache: "no-store"
      })
    );
    return;
  }

  /*
   * Only handle Fasqoo Lite's own files.
   */
  if (url.origin !== self.location.origin) {
    return;
  }

  /*
   * HTML pages:
   * Always try the newest online version first.
   */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, {
        cache: "no-store"
      })
        .then(response => {

          if (response && response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then(cache => {
              cache.put("/index.html", copy);
            });
          }

          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => {
              return cached ||
                     caches.match("/index.html") ||
                     caches.match("/");
            });
        })
    );

    return;
  }

  /*
   * Static files:
   * Use cache first, then update cache from network.
   */
  if (request.method === "GET") {
    event.respondWith(
      caches.match(request).then(cached => {

        const networkRequest = fetch(request)
          .then(response => {

            if (response && response.ok) {
              const copy = response.clone();

              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, copy);
              });
            }

            return response;
          })
          .catch(() => cached);

        return cached || networkRequest;
      })
    );
  }
});
