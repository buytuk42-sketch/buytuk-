/* BuyTuk service worker — policy:
   - GET only; POST/other methods are never touched and never cached
   - /api/* is NEVER cached (always network)
   - /_next/static/* : stale-while-revalidate
   - navigations      : network-first, falling back to the offline page
   - versioned caches; old versions deleted on activate */
const VERSION = 'buytuk-v1';
const STATIC = `buytuk-static-${VERSION}`;
const PAGES = `buytuk-pages-${VERSION}`;
const KEEP = [STATIC, PAGES];
const OFFLINE_URLS = ['/ar/offline', '/en/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(PAGES);
    await Promise.allSettled(OFFLINE_URLS.map((u) => cache.add(new Request(u, { cache: 'reload' }))));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function offlineFor(pathname) {
  return pathname.startsWith('/en') ? '/en/offline' : '/ar/offline';
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;                       // never handle POST/etc.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;         // never touch cross-origin
  if (url.pathname.startsWith('/api/')) return;            // never cache the API
  if (url.pathname === '/sw.js') return;

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith((async () => {
      const cache = await caches.open(STATIC);
      const hit = await cache.match(req);
      const net = fetch(req).then((res) => { if (res && res.ok) cache.put(req, res.clone()); return res; }).catch(() => null);
      return hit || (await net) || new Response('', { status: 504, statusText: 'offline' });
    })());
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) { const c = await caches.open(PAGES); c.put(req, res.clone()); }
        return res;
      } catch {
        const cache = await caches.open(PAGES);
        const cached = (await cache.match(req)) || (await cache.match(offlineFor(url.pathname)));
        return cached || new Response('<h1>offline</h1>', { headers: { 'Content-Type': 'text/html; charset=utf-8' }, status: 503 });
      }
    })());
  }
});
