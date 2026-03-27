const CACHE_NAME = 'neon-feud-v2';
const ASSETS_TO_CACHE =[
  './',
  './index.html',
  './styles.css',
  './script.js',
  './packs.json',
  './audio/click.mp3',
  './audio/ding.mp3',
  './audio/buzzer.mp3',
  './audio/chaching.mp3',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
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
