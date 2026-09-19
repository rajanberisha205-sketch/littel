const CACHE_NAME = "fasqoo-lite-v5";

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
      // Add each file on its own: one missing file must not stop the whole install.
      .then(cache => Promise.all(
        APP_SHELL.map(path =>
          cache.add(path).catch(err => console.warn("SW: could not cache", path, err))
        )
      ))
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

self.addEventListener("fetch", event => {
  const request = event.request;

  /*
   * Only GET requests are handled. Uploads (POST) go straight to the network.
   * Returning without respondWith() means the browser handles the request
   * natively, so the Service Worker cannot slow down or distort measurements.
   */
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /*
   * Only Fasqoo Lite's own files. Everything else
   * (speed.cloudflare.com, ipwho.is, Google Fonts, ...) is not touched.
   */
  if (url.origin !== self.location.origin) return;

  // Same-origin speed-test endpoints (if ever used) are never handled either.
  if (url.pathname.startsWith("/__")) return;

  /*
   * HTML pages:
   * Always try the newest online version first.
   */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, { cache: "no-store" })
        .then(response => {
          // Only the start page is stored as the offline copy.
          if (response && response.ok &&
              (url.pathname === "/" || url.pathname === "/index.html")) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put("/index.html", copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          return (await caches.match(request)) ||
                 (await caches.match("/index.html")) ||
                 (await caches.match("/")) ||
                 Response.error();
        })
    );
    return;
  }

  /*
   * Static files:
   * Use cache first, then update cache from network.
   */
  event.respondWith(
    caches.match(request).then(cached => {
      const networkRequest = fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(request, copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => cached || Response.error());

      return cached || networkRequest;
    })
  );
});
