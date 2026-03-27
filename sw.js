const CACHE_NAME = 'neon-feud-v4';
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
