import { CITY_IMAGES } from '@/data/imageData';
import { makeGoogleMapsRoute } from '@/lib/urls';

interface Highlight {
  url: string;
  title: string;
  category?: string;
  description?: string;
}

interface CityImageData {
  highlights?: Highlight[];
}

interface StopSightsProps {
  stopId: string;
  city: string;
}

const placeSearchUrl = (title: string, city: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${city}`)}`;

/** Visual "places to visit" — curated sight photos, an area map, and one Google Maps
 *  walking route that strings every sight together. All assets come from imageData.js. */
export function StopSights({ stopId, city }: StopSightsProps) {
  const data = (CITY_IMAGES as Record<string, CityImageData>)[stopId];
  const highlights = data?.highlights ?? [];
  if (highlights.length === 0) return null;

  const routeUrl =
    highlights.length >= 2 ? makeGoogleMapsRoute(highlights.map((h) => `${h.title}, ${city}`)) : '';

  return (
    <div className="panel" style={{ padding: 24 }}>
      <div className="section-header">
        <h2 className="section-title">Places to visit in {city}</h2>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          Tap a place to open it in Google Maps
        </span>
      </div>

      {routeUrl && (
        <a
          href={routeUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
            padding: '9px 14px',
            borderRadius: 999,
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'var(--sans)',
            textDecoration: 'none',
          }}
        >
          🗺 Walking route through all {city} sights ↗
        </a>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 12,
        }}
      >
        {highlights.map((h, i) => (
          <a
            key={`${h.title}-${i}`}
            href={placeSearchUrl(h.title, city)}
            target="_blank"
            rel="noreferrer"
            className="sight-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-raised)',
              borderRadius: 'var(--radius, 12px)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={{ position: 'relative', height: 128, background: 'var(--bg)' }}>
              <img
                src={h.url}
                alt={h.title}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden';
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {h.category && (
                <span
                  style={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    fontSize: 9.5,
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    padding: '3px 7px',
                    borderRadius: 999,
                  }}
                >
                  {h.category}
                </span>
              )}
            </div>
            <div style={{ padding: '9px 11px 11px', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', lineHeight: 1.25 }}>
                {h.title}
              </span>
              {h.description && (
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {h.description}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>

      <iframe
        src={`https://maps.google.com/maps?q=${encodeURIComponent(`${city} tourist attractions`)}&z=12&output=embed`}
        title={`${city} map`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{
          width: '100%',
          height: 280,
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius, 12px)',
          marginTop: 16,
          display: 'block',
        }}
      />
    </div>
  );
}
