import { useState } from 'react';
import type { CSSProperties } from 'react';

// Route corridor (Rome → Amsterdam) with margin. Zooms match the schematic map's range.
const BBOX = { minLon: 3, maxLon: 17, minLat: 40, maxLat: 53 };
const ZOOMS = [5, 6, 7];

const lon2x = (lon: number, z: number) => Math.floor(((lon + 180) / 360) * 2 ** z);
const lat2y = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

function routeTileUrls(): string[] {
  const urls: string[] = [];
  for (const z of ZOOMS) {
    const xs = [lon2x(BBOX.minLon, z), lon2x(BBOX.maxLon, z)];
    const ys = [lat2y(BBOX.maxLat, z), lat2y(BBOX.minLat, z)];
    for (let x = Math.min(...xs); x <= Math.max(...xs); x++) {
      for (let y = Math.min(...ys); y <= Math.max(...ys); y++) {
        urls.push(`https://a.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`);
      }
    }
  }
  return urls;
}

const KEY = 'jamnata-offline-tiles';

/** Pre-downloads the route map tiles into the service-worker cache so the schematic
 *  trip map works without a connection. (The live Google view needs a connection.) */
export function OfflineMapControl() {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [saved, setSaved] = useState<string | null>(() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  });

  const download = async () => {
    const urls = routeTileUrls();
    setBusy(true);
    setTotal(urls.length);
    setProgress(0);
    let done = 0;
    const CONC = 8;
    for (let i = 0; i < urls.length; i += CONC) {
      await Promise.all(
        urls.slice(i, i + CONC).map((u) =>
          fetch(u, { mode: 'no-cors' })
            .catch(() => undefined)
            .finally(() => {
              done += 1;
              setProgress(done);
            }),
        ),
      );
    }
    const stamp = `${urls.length} tiles`;
    try {
      localStorage.setItem(KEY, stamp);
    } catch {
      /* ignore */
    }
    setSaved(stamp);
    setBusy(false);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <button type="button" onClick={download} disabled={busy} style={{ ...btn, opacity: busy ? 0.7 : 1 }}>
        {busy ? `⬇ Saving ${progress}/${total}…` : saved ? '↻ Refresh offline map' : '⬇ Download offline map'}
      </button>
      <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>
        {busy
          ? 'Caching route tiles for offline use…'
          : saved
            ? `Saved for offline (${saved}). The route map below works without signal.`
            : 'Save the route map so it works without internet (~1–2 MB).'}
      </span>
    </div>
  );
}

const btn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '7px 13px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg-raised)',
  color: 'var(--text)',
  fontSize: 12.5,
  fontWeight: 800,
  cursor: 'pointer',
};
