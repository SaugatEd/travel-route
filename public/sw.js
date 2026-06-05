/* Jamnata offline map tiles.
 * Caches ONLY map tile images (CARTO / OpenStreetMap) — never app HTML/JS/CSS,
 * so it can't serve a stale app. Tiles you view (or pre-download) work offline. */
const TILE_CACHE = 'jamnata-tiles-v1';
const TILE_HOST = /(^|\.)basemaps\.cartocdn\.com$|(^|\.)tile\.openstreetmap\.org$/;

// CARTO serves the same tile from subdomains a/b/c/d — normalise to one cache key
// so any subdomain (or a pre-download) hits the same entry.
function cacheKey(rawUrl) {
  return rawUrl.replace(/^https:\/\/[a-d]\.basemaps\.cartocdn\.com/, 'https://t.basemaps.cartocdn.com');
}

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (!TILE_HOST.test(url.hostname)) return; // app and all non-tile requests: untouched

  const key = cacheKey(req.url);
  event.respondWith(
    caches.open(TILE_CACHE).then(async (cache) => {
      const hit = await cache.match(key);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) cache.put(key, res.clone());
        return res;
      } catch (err) {
        const fallback = await cache.match(key);
        if (fallback) return fallback;
        throw err;
      }
    }),
  );
});
