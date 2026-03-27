const CACHE_NAME = 'neon-feud-v1';
const ASSETS_TO_CACHE =[
  './',
  './index.html',
  './packs.json',
  './click.mp3',
  './ding.mp3',
  './buzzer.mp3',
  './chaching.mp3',
  './manifest.json'
];

// Install the service worker and cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Fetch assets from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Return from cache
        }
        return fetch(event.request); // Fallback to network
      })
  );
});
