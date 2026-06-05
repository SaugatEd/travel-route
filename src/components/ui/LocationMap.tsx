import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useMapEmbed } from './useMapEmbed';

interface LocationMapProps {
  /** Destination — a place search string ("Roma Termini lockers") or "lat,lng". */
  query: string;
  /** Accent colour (hex or CSS var). */
  accent?: string;
  /** Button label when collapsed. */
  label?: string;
  /** Embedded map height in px. */
  height?: number;
}

/**
 * "Show location" → asks for the device's current location, then embeds a Google
 * Map with the route from there to `query`, inline below the trigger. Falls back
 * to a plain place map if location is denied/unavailable. Reused by day cards,
 * sightseeing spots and stations.
 */
export function LocationMap({ query, accent = 'var(--accent)', label = 'Show location', height = 280 }: LocationMapProps) {
  const [open, setOpen] = useState(false);
  const { src, status, externalUrl, providerLabel, resolve } = useMapEmbed(query);

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          if (open) return setOpen(false);
          setOpen(true);
          resolve();
        }}
        style={{ ...btnStyle, color: accent, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}
      >
        📍 {open ? 'Hide location' : label}
      </button>

      {open && (
        <div style={{ marginTop: 8 }}>
          {src ? (
            <iframe
              title={`Map: ${query}`}
              src={src}
              style={{ width: '100%', height, border: '1px solid var(--border)', borderRadius: 10, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div
              style={{
                height,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-raised)',
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              {status || 'Loading…'}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{status}</span>
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 11.5, fontWeight: 700, color: accent, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Open in {providerLabel} ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  borderRadius: 999,
  border: '1px solid',
  background: 'var(--bg-raised)',
  fontSize: 12,
  fontWeight: 800,
  cursor: 'pointer',
};
