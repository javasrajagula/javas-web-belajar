const CACHE_NAME = 'academy-os-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/subjects',
  '/brain',
  '/tutor',
  '/rpg',
  '/analytics',
  '/galaxy',
  '/planner',
  '/exams',
  '/profile',
  '/settings',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache and precaching assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Failed to precache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip chrome extensions, API requests, nextauth routes
  if (
    url.protocol.startsWith('chrome-extension') || 
    url.pathname.startsWith('/api') || 
    url.pathname.includes('/api/auth') ||
    url.pathname.startsWith('/_next/webpack')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Serve cached and fetch in background (Stale-While-Revalidate)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse && 
            networkResponse.status === 200 && 
            networkResponse.type === 'basic' &&
            !url.pathname.startsWith('/_next') // Don't cache hot reload files
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Navigation fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/dashboard') || caches.match('/');
          }
        });
    })
  );
});
