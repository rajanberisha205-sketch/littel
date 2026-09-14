const CACHE_NAME = "fasqoo-lite-v2";

const APP_SHELL = [
  "/",
  "/index.html",
  "/fasqoologo.png",
  "/site.webmanifest",
  "/favicon-192x192.png",
  "/favicon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Nur GET-Anfragen behandeln
  if (request.method !== "GET") {
    return;
  }

  // Externe Anfragen niemals cachen.
  // Besonders wichtig für den Cloudflare-Speed-Test.
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
