/* Jamnata offline service worker.
 *
 * Goal: the deployed app works with ZERO network after one online visit.
 *  - PRECACHE_ASSETS (the whole build — every route chunk, css, icon, font) is
 *    injected at build time by scripts/inject-sw-precache.mjs, so even sections
 *    you never opened while online still load offline.
 *  - Navigations are network-first (fresh deploys win) → cached index.html.
 *  - Same-origin assets, Google Fonts and Unsplash images are cache-first, so
 *    they keep working offline once seen.
 *
 * On localhost the worker self-destructs so it can't shadow the Vite dev server.
 */
const BUILD = '__BUILD__';
const PRECACHE_ASSETS = [];

const APP_CACHE = `jamnata-app-${BUILD}`;
const IMG_CACHE = 'jamnata-img-v1';
const FONT_CACHE = 'jamnata-fonts-v1';
const TILE_CACHE = 'jamnata-tiles-v1';
const KEEP = new Set([APP_CACHE, IMG_CACHE, FONT_CACHE, TILE_CACHE]);

const IS_DEV = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(self.location.hostname);

const SCOPE_URL = new URL('./', self.location).href;
const SCOPE_PATH = new URL('./', self.location).pathname;
const INDEX_URL = new URL('index.html', self.location).href;

// Best-effort offline copies of border-day PDFs. Missing files are skipped.
const DOC_ASSETS = [
  'tickets/turkish-airlines-tca424.pdf',
  'tickets/india-booking-le-premier.pdf',
  'guides/austria_begins.pdf',
  'guides/europe_packing_checklist.pdf',
];

const TILE_HOST = /(^|\.)basemaps\.cartocdn\.com$|(^|\.)tile\.openstreetmap\.org$/;
const FONT_HOST = /(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/;
const IMG_HOST = /(^|\.)images\.unsplash\.com$|(^|\.)upload\.wikimedia\.org$/;

function tileKey(rawUrl) {
  return rawUrl.replace(/^https:\/\/[a-d]\.basemaps\.cartocdn\.com/, 'https://t.basemaps.cartocdn.com');
}

self.addEventListener('install', (event) => {
  if (IS_DEV) {
    event.waitUntil(self.skipWaiting());
    return;
  }
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_CACHE);
      const core = [SCOPE_URL, INDEX_URL, ...PRECACHE_ASSETS.map((p) => new URL(p, self.location).href)];
      try {
        await cache.addAll([...new Set(core)]);
      } catch {
        await cache.add(INDEX_URL).catch(() => {});
      }
      await Promise.allSettled(DOC_ASSETS.map((u) => cache.add(new URL(u, self.location))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      if (IS_DEV) {
        await Promise.all(keys.map((k) => caches.delete(k)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: 'window' });
        clients.forEach((c) => c.navigate(c.url));
        return;
      }
      await Promise.all(keys.filter((k) => !KEEP.has(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const res = await fetch(request);
    cache.put(INDEX_URL, res.clone());
    return res;
  } catch {
    return (await cache.match(INDEX_URL)) || (await cache.match(SCOPE_URL)) || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === 'opaque')) cache.put(request, res.clone());
  return res;
}

async function tileStrategy(request) {
  const key = tileKey(request.url);
  const cache = await caches.open(TILE_CACHE);
  const hit = await cache.match(key);
  if (hit) return hit;
  try {
    const res = await fetch(request);
    if (res && (res.ok || res.type === 'opaque')) cache.put(key, res.clone());
    return res;
  } catch (err) {
    const fallback = await cache.match(key);
    if (fallback) return fallback;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  if (IS_DEV) return; // dev: never intercept — let Vite serve everything fresh
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  if (TILE_HOST.test(url.hostname)) {
    event.respondWith(tileStrategy(req));
    return;
  }
  if (FONT_HOST.test(url.hostname)) {
    event.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }
  if (IMG_HOST.test(url.hostname)) {
    event.respondWith(cacheFirst(req, IMG_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return; // other cross-origin: untouched

  if (req.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(req));
    return;
  }

  if (url.pathname.startsWith(SCOPE_PATH)) {
    event.respondWith(cacheFirst(req, APP_CACHE));
  }
});
