// Basic Service Worker for Offline Video Caching
const CACHE_NAME = 'dooh-player-v1';

// Install Event
self.addEventListener('install', (event) => {
    // Force new SW to take control immediately
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        clients.claim() // Take control of all clients
    );
});

// Helper to check if url is media
const isMedia = (url) => url.match(/\.(mp4|jpg|jpeg|png|webm)$/i);

// Fetch Event
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only cache media files and local assets
    if (isMedia(url.pathname)) {
        event.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.match(event.request).then((response) => {
                    // Return cached response if found
                    if (response) {
                        // Optional: Update cache in background
                        // fetch(event.request).then(res => cache.put(event.request, res));
                        return response;
                    }

                    // Otherwise fetch and cache
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse.ok) {
                            cache.put(event.request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        // Offline fallback?
                        return new Response('', { status: 408 });
                    });
                });
            })
        );
    }
    // For other requests, just use network, falling back to cache if strictly PWA mode needed
    // But for APIs (POST), we shouldn't cache.
});
