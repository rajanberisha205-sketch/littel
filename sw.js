const CACHE_NAME = "fasqoo-lite-v3";
const CORE = ["/", "/index.html", "/site.webmanifest"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // Never cache speed-test or IP-measurement traffic.
  if (
    req.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.hostname === "speed.cloudflare.com" ||
    url.hostname === "ipwho.is"
  ) return;

  event.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(() => {});
      }
      return res;
    }).catch(() => caches.match(req).then(cached => cached || caches.match("/")))
  );
});
