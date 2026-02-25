// ================================================================
// SISI NDIO SIFUNA — Service Worker (Silent, Cache-First)
// Users are NEVER prompted to install. This runs invisibly.
// ================================================================

const CACHE_NAME = 'sisi-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/join.html',
    '/rallies.html',
    '/tasks.html',
    '/resources.html',
    '/about.html',
    '/main.css',
    '/app.js',
    '/iebc-data.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&display=swap'
];

// ─── Install: Cache static assets ───────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// ─── Activate: Clean old caches ─────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ─── Fetch: Cache-First for static, Network-First for API ───────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // API calls (GAS): Network-First — always try live data
    if (url.hostname.includes('script.google.com')) {
        event.respondWith(
            fetch(event.request)
                .catch(() => new Response(JSON.stringify({ volunteers: 0, visitors: 0 }),
                    { headers: { 'Content-Type': 'application/json' } }))
        );
        return;
    }

    // Font requests: Cache-First
    if (url.hostname.includes('fonts.')) {
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    return res;
                }))
        );
        return;
    }

    // Static assets: Cache-First, fallback to network
    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;
                return fetch(event.request).then(res => {
                    if (!res || res.status !== 200 || res.type === 'opaque') return res;
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    return res;
                });
            })
            .catch(() => caches.match('/index.html'))
    );
});
