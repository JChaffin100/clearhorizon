const VERSION = '1.0.2';
const CACHE_NAME = `clearhorizon-v${VERSION}`;

const STATIC_ASSETS = [
  '/clearhorizon/',
  '/clearhorizon/index.html',
  '/clearhorizon/manifest.json',
];

// Pre-cache static shell on install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Take control immediately
  self.skipWaiting();
});

// Delete old caches on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
//   - API calls (Open-Meteo, RainViewer, CartoDB): network-only, no caching
//   - Everything else: cache-first with network fallback + cache update
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const isApiCall =
    url.hostname.includes('open-meteo.com') ||
    url.hostname.includes('rainviewer.com') ||
    url.hostname.includes('cartocdn.com') ||
    url.hostname.includes('tilecache.rainviewer.com');

  if (isApiCall) {
    // Network-only for all API/tile calls
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});

// Respond to version requests from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: VERSION });
  }
});
