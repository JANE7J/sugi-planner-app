const CACHE_NAME = 'sugi-planner-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    // External CDN/Script dependencies (CRITICAL for offline React/Firebase usage)
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/react@18/umd/react.development.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
    'https://unpkg.com/lucide@latest/dist/umd/lucide.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
    'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
    // Fonts (These are external, but can be hard to cache. We'll cache them best effort)
    'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700;1,400&display=swap',
    'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    'https://fonts.gstatic.com/s/lora/v32/0QIbMX1BYL_zH4hE6BAEw_A.woff2', // Lora woff2
    'https://fonts.gstatic.com/s/inter/v13/UuNDMp6pMNN2zFRPmN8.woff2', // Inter woff2
    // Placeholders (App Icons/Background)
    'https://placehold.co/180x180/f0abfc/7e22ce?text=👑',
    'https://placehold.co/192x192/f0abfc/7e22ce?text=👑',
    'https://placehold.co/512x512/f0abfc/7e22ce?text=👑',
    'https://placehold.co/100x100/f7e8ed/d9a9c2?text=Sugi' // Conversation background tile
];

// Install Event: Cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // We use fetch(request, { cache: 'no-cache' }) to try and prevent 
        // the default browser caching interfering with the Service Worker cache.
        const requests = urlsToCache.map(url => new Request(url, { cache: 'reload' }));
        return cache.addAll(requests).catch(err => {
             console.error('Failed to cache some assets, likely CDN issues:', err);
        });
      })
  );
});

// Fetch Event: Serve from cache first, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache match - try the network
        return fetch(event.request);
      })
      .catch(() => {
        // If both cache and network fail, or if it's a critical path like index.html
        // you can return a simple offline page here. 
        // For this app, serving the cached index.html is the goal.
        return caches.match('/index.html');
      })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});