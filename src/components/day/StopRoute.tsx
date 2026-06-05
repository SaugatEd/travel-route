import { makeGoogleMapsDirections } from '@/lib/urls';
import type { Journey } from '@/types';

interface StopRouteProps {
  stopId: string;
  city: string;
  journeys: Journey[];
  accent: string;
  /** Day-trip stops show the outbound leg as a "Getting back" return rather than "Onward". */
  isDayTrip: boolean;
}

/** Station-name keywords per stop — journeys store free-text station names
 *  ("Roma Termini", "Wien Hbf") that don't always contain the stop id/city. */
const STATION_KEYS: Record<string, string[]> = {
  rome: ['roma', 'rome', 'fco', 'fiumicino', 'termini'],
  como: ['como'],
  lucerne: ['lucerne', 'luzern'],
  lauterbrunnen: ['lauterbrunnen'],
  bern: ['bern'],
  innsbruck: ['innsbruck'],
  salzburg: ['salzburg'],
  vienna: ['wien', 'vienna'],
  prague: ['praha', 'prague'],
  berlin: ['berlin'],
  amsterdam: ['amsterdam', 'schiphol', 'ruijterkade', 'centraal'],
  alkmaar: ['alkmaar'],
};

const LEG_COLOR: Record<string, string> = {
  flight: '#7C3AED',
  highspeed: '#C2410C',
  regional: '#166534',
  scenic: '#0891B2',
  train: '#166534',
  flixbus: '#16A34A',
  walk: '#6B7280',
};

const timeOf = (date: string) => date.match(/\d{2}:\d{2}/)?.[0] ?? '';
const minutesOf = (date: string) => {
  const t = timeOf(date);
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** "Getting here & back" — the inbound train into this stop and the onward/return
 *  leg: which train, when, how long, how much. Pure JOURNEYS data. */
export function StopRoute({ stopId, city, journeys, accent, isDayTrip }: StopRouteProps) {
  const keys = STATION_KEYS[stopId] ?? [city.toLowerCase().split(' ').pop() ?? stopId];
  const has = (s: string) => {
    const t = s.toLowerCase();
    return keys.some((k) => t.includes(k));
  };

  const inbound = journeys.filter((j) => has(j.to)).sort((a, b) => minutesOf(a.date) - minutesOf(b.date));
  const outbound = journeys
    .filter((j) => has(j.from) && !has(j.to) && j.type !== 'walk')
    .sort((a, b) => minutesOf(a.date) - minutesOf(b.date));

  if (inbound.length === 0 && outbound.length === 0) return null;

  return (
    <div className="panel" style={{ padding: 20 }}>
      <div className="section-header" style={{ marginBottom: 6 }}>
        <h2 className="section-title">Getting to {city} &amp; back</h2>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          The train in, and your {isDayTrip ? 'return' : 'onward'} leg
        </span>
      </div>

      {inbound.length > 0 && <RouteGroup title="🚆 Getting here" legs={inbound} accent={accent} />}
      {outbound.length > 0 && (
        <RouteGroup
          title={isDayTrip ? '🔙 Getting back' : '🚆 Onward & day trips'}
          legs={outbound}
          accent={accent}
        />
      )}
    </div>
  );
}

function RouteGroup({ title, legs, accent }: { title: string; legs: Journey[]; accent: string }) {
  return (
    <div style={{ marginTop: 2 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          margin: '12px 0 6px',
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {legs.map((j) => (
          <RouteLeg key={`${j.from}-${j.to}-${j.date}`} j={j} accent={accent} />
        ))}
      </div>
    </div>
  );
}

function RouteLeg({ j, accent }: { j: Journey; accent: string }) {
  const color = LEG_COLOR[j.type] ?? accent;
  const time = timeOf(j.date);
  const directionsUrl =
    j.type === 'flight'
      ? null
      : makeGoogleMapsDirections({ origin: j.from, destination: j.to, mode: 'driving' });

  return (
    <div
      style={{
        borderLeft: `3px solid ${color}`,
        background: 'var(--bg-raised)',
        borderRadius: 8,
        padding: '6px 10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
        <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 800, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {j.via.replace(/^🚌\s*/, '')}
        </span>
        {time && (
          <span style={{ flexShrink: 0, fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color }}>
            {time}
          </span>
        )}
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: '#2563EB', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Directions ↗
          </a>
        )}
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1, lineHeight: 1.35 }}>
        {j.from} → {j.to} · {j.dur} · {j.cost}
      </div>
    </div>
  );
}
