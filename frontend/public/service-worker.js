// public/service-worker.js

self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activated');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // You can add caching strategies here if needed
  // For now, just let network requests pass through
});
