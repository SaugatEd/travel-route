/* Jamnata offline service worker.
 *
 * Two jobs:
 *  1. App shell — make the whole app load with no internet. Navigations are
 *     network-first (so a fresh deploy is picked up the moment you're online),
 *     falling back to the cached index.html; hashed build assets and same-origin
 *     files are cache-first (their content never changes for a given URL, so this
 *     can't serve a stale app). This is why bumping the build can't strand users.
 *  2. Map tiles — CARTO / OpenStreetMap tile images you've viewed keep working
 *     offline (unchanged behaviour from before).
 */
const APP_CACHE = 'jamnata-app-v1';
const TILE_CACHE = 'jamnata-tiles-v1';
const KEEP = new Set([APP_CACHE, TILE_CACHE]);

const SCOPE_URL = new URL('./', self.location).href;
const SCOPE_PATH = new URL('./', self.location).pathname;
const INDEX_URL = new URL('index.html', self.location).href;

// Best-effort offline copies of the booking/ticket PDFs travellers need at the
// border. Missing files are skipped rather than failing the whole install.
const DOC_ASSETS = [
  'tickets/turkish-airlines-tca424.pdf',
  'tickets/india-booking-le-premier.pdf',
  'guides/austria_begins.pdf',
  'guides/europe_packing_checklist.pdf',
];

const TILE_HOST = /(^|\.)basemaps\.cartocdn\.com$|(^|\.)tile\.openstreetmap\.org$/;
const FONT_HOST = /(^|\.)fonts\.googleapis\.com$|(^|\.)fonts\.gstatic\.com$/;

// CARTO serves the same tile from subdomains a/b/c/d — normalise to one cache key.
function tileKey(rawUrl) {
  return rawUrl.replace(/^https:\/\/[a-d]\.basemaps\.cartocdn\.com/, 'https://t.basemaps.cartocdn.com');
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(APP_CACHE);
      await cache.addAll([SCOPE_URL, INDEX_URL]).catch(() => {});
      await Promise.allSettled(DOC_ASSETS.map((u) => cache.add(new URL(u, self.location))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
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
    event.respondWith(cacheFirst(req, APP_CACHE));
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
