import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import 'leaflet/dist/leaflet.css';

import { STOP_COORDS, TRIP_ROUTE, DAY_TRIPS, minutesBetween, formatGap, type RouteStop, type DayTrip } from '@/data/stopCoords';

export const Route = createFileRoute('/map')({
  component: MapPage,
});

type Phase = 'past' | 'current' | 'next' | 'future';

interface ResolvedStop extends RouteStop {
  lat: number;
  lng: number;
  name: string;
  flag: string;
  phase: Phase;
}

function classifyStops(today: Date): ResolvedStop[] {
  const todayMs = today.getTime();

  let currentIdx = -1;
  for (let i = TRIP_ROUTE.length - 1; i >= 0; i--) {
    const s = TRIP_ROUTE[i];
    const arr = new Date(`${s.arriveOn}T00:00:00`);
    const end = new Date(arr);
    end.setDate(end.getDate() + Math.max(s.nights, 1));
    if (arr.getTime() <= todayMs && todayMs < end.getTime()) {
      currentIdx = i;
      break;
    }
  }

  let nextIdx = -1;
  if (currentIdx === -1) {
    for (let i = 0; i < TRIP_ROUTE.length; i++) {
      const arr = new Date(`${TRIP_ROUTE[i].arriveOn}T00:00:00`);
      if (arr.getTime() > todayMs) {
        nextIdx = i;
        break;
      }
    }
  } else {
    nextIdx = currentIdx + 1 < TRIP_ROUTE.length ? currentIdx + 1 : -1;
  }

  return TRIP_ROUTE.map((s, i) => {
    const c = STOP_COORDS[s.id];
    const phase: Phase =
      i === currentIdx ? 'current'
      : i === nextIdx ? 'next'
      : i < (currentIdx === -1 ? nextIdx : currentIdx) ? 'past'
      : 'future';
    return { ...s, lat: c.lat, lng: c.lng, name: c.name, flag: c.flag, phase };
  });
}

const PHASE_STYLE: Record<Phase, { fill: string; ring: string; size: number; z: number }> = {
  current: { fill: '#DC2626', ring: '#fff',    size: 44, z: 4 },
  next:    { fill: '#B45309', ring: '#FEF3C7', size: 38, z: 3 },
  past:    { fill: '#9CA3AF', ring: '#F3F4F6', size: 28, z: 1 },
  future:  { fill: '#0F8A4F', ring: '#fff',    size: 32, z: 2 },
};

function makeIcon(stop: ResolvedStop): L.DivIcon {
  const s = PHASE_STYLE[stop.phase];
  return L.divIcon({
    className: 'jamnata-marker',
    iconSize: [s.size, s.size],
    iconAnchor: [s.size / 2, s.size / 2],
    html: `
      <div style="
        width:${s.size}px;height:${s.size}px;
        background:${s.fill};
        border:3px solid ${s.ring};
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 14px rgba(0,0,0,0.25);
        font-size:${Math.round(s.size * 0.45)}px;
        line-height:1;
      ">${stop.flag}</div>
    `,
  });
}

const DAYTRIP_COLOR = '#0E7490';

function makeDayTripIcon(dt: DayTrip): L.DivIcon {
  return L.divIcon({
    className: 'jamnata-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    html: `
      <div style="
        width:26px;height:26px;
        background:${DAYTRIP_COLOR};
        border:2px dashed #CFFAFE;
        border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        box-shadow:0 2px 8px rgba(0,0,0,0.25);
        font-size:12px;line-height:1;
        opacity:${dt.optional ? 0.82 : 1};
      ">${dt.flag}</div>
    `,
  });
}

/** Day-trip spurs (out-and-back) + their destination markers. */
function DayTripLayer({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <>
      {DAY_TRIPS.map((dt) => {
        const base = STOP_COORDS[dt.from];
        if (!base) return null;
        return (
          <Polyline
            key={`spur-${dt.id}`}
            positions={[[base.lat, base.lng], [dt.lat, dt.lng]]}
            pathOptions={{ color: DAYTRIP_COLOR, weight: 2.5, opacity: dt.optional ? 0.45 : 0.7, dashArray: '2 7' }}
          />
        );
      })}
      {DAY_TRIPS.map((dt) => (
        <Marker
          key={`dt-${dt.id}`}
          position={[dt.lat, dt.lng]}
          icon={makeDayTripIcon(dt)}
          zIndexOffset={500}
          eventHandlers={{
            click: () => navigate({ to: '/stop/$id', params: { id: dt.from }, search: { view: 'overview' } }),
          }}
        >
          <Popup maxWidth={280}>
            <DayTripPopup dt={dt} />
          </Popup>
        </Marker>
      ))}
    </>
  );
}

function DayTripPopup({ dt }: { dt: DayTrip }) {
  return (
    <div style={{ minWidth: 210, fontFamily: 'inherit' }}>
      <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{dt.flag} {dt.name}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: DAYTRIP_COLOR, textTransform: 'uppercase', letterSpacing: 0.08 }}>
        {dt.optional ? '◌ Optional day-trip' : '● Day-trip'}
      </div>
      <div style={{ fontSize: 12, color: '#444', marginTop: 6, lineHeight: 1.5 }}>{dt.label}</div>
      <div style={{ marginTop: 8, padding: '7px 9px', background: '#ECFEFF', border: '1px solid #A5F3FC', borderRadius: 8, fontSize: 12, lineHeight: 1.5 }}>
        🚆 {dt.via}
      </div>
    </div>
  );
}

/* ── Transport mode per leg ──────────────────────────────────
 * Almost every leg is rail (fastest + most scenic in Europe); the one
 * deliberate exception is the Berlin → Amsterdam overnight FlixBus, which
 * saves a hotel night. Mode is read from each stop's `arriveVia`. */
type Mode = 'train' | 'bus';

const MODE_STYLE: Record<Mode, { color: string; label: string; icon: string }> = {
  train: { color: '#2563EB', label: 'Train', icon: '🚆' },
  bus:   { color: '#16A34A', label: 'Bus',   icon: '🚌' },
};

function legMode(arriveVia?: string): Mode {
  return arriveVia && /flix|\bbus\b/i.test(arriveVia) ? 'bus' : 'train';
}

/** Why this mode is the best choice for the leg INTO each stop (by stop id). */
const LEG_WHY: Record<string, string> = {
  como: 'Frecciarossa high-speed to the lakes + a short regional — far faster than driving and cheap booked ahead.',
  lucerne: 'One scenic SBB ride over the Gotthard — no bus matches it on time or views.',
  lauterbrunnen: 'The Brünig panorama line is the sightseeing — ride it into the Alps.',
  bern: 'Direct SBB from Interlaken, ~50 min — trivially the train.',
  lauterach: 'ÖBB EuroCity via Zürich — one change, no sensible bus equivalent.',
  innsbruck: 'Railjet through the Arlberg tunnel — a fast Alpine crossing.',
  salzburg: 'Railjet Express under 2h — Austria’s trains are the spine of the trip.',
  vienna: 'Railjet Salzburg → Vienna, 2h25 — frequent and fast.',
  prague: 'RegioJet train (free coffee + snacks), 4h — comfier and cheaper than flying.',
  berlin: 'EuroCity direct Prague → Berlin, 4h30 — one seat, zero transfers.',
  amsterdam: 'Overnight FlixBus saves a hotel night and beats the pricey ~7h day train — sleep on board, arrive 07:15.',
  alkmaar: 'Sprinter from Amsterdam Centraal, 40 min — local train to your base.',
};

interface ModeSegment {
  from: ResolvedStop;
  to: ResolvedStop;
  mode: Mode;
  path: [number, number][];
  routed: boolean;
}

/** One routed polyline per leg (free OSRM, no key). Each leg keeps its own mode
 *  colour; an un-routable leg falls back to a straight connector. */
function useModeSegments(stops: ResolvedStop[]): ModeSegment[] {
  const base = useMemo<ModeSegment[]>(
    () =>
      stops.slice(0, -1).map((from, i) => {
        const to = stops[i + 1];
        return {
          from,
          to,
          mode: legMode(to.arriveVia),
          path: [[from.lat, from.lng], [to.lat, to.lng]] as [number, number][],
          routed: false,
        };
      }),
    [stops],
  );
  const [segments, setSegments] = useState<ModeSegment[]>(base);

  useEffect(() => {
    setSegments(base);
    if (base.length === 0) return;
    const controller = new AbortController();

    Promise.all(
      base.map((seg) =>
        fetch(
          `https://router.project-osrm.org/route/v1/driving/${seg.from.lng},${seg.from.lat};${seg.to.lng},${seg.to.lat}?overview=full&geometries=geojson`,
          { signal: controller.signal },
        )
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => d?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined)
          .catch(() => undefined),
      ),
    ).then((results) => {
      if (controller.signal.aborted) return;
      setSegments(
        base.map((seg, i) => {
          const coords = results[i];
          return coords?.length
            ? { ...seg, path: coords.map(([lng, lat]) => [lat, lng] as [number, number]), routed: true }
            : seg;
        }),
      );
    });

    return () => controller.abort();
  }, [base]);

  return segments;
}

function FitBounds({ stops }: { stops: ResolvedStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (!stops.length) return;
    const points: [number, number][] = [
      ...stops.map((s) => [s.lat, s.lng] as [number, number]),
      ...DAY_TRIPS.map((d) => [d.lat, d.lng] as [number, number]),
    ];
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 7 });
  }, [stops, map]);
  return null;
}

function RouteLine({ stops }: { stops: ResolvedStop[] }) {
  const { path, routed } = useRoadRoute(stops);
  return (
    <Polyline
      positions={path}
      pathOptions={{
        color: '#B8860B',
        weight: routed ? 4 : 3,
        opacity: routed ? 0.85 : 0.6,
        dashArray: routed ? undefined : '6 6',
      }}
    />
  );
}

function MapPage() {
  const today = new Date(); // trip starts 2026-06-16 — date drives phase logic automatically
  const stops = useMemo(() => classifyStops(today), [today]);
  const navigate = useNavigate();

  const current = stops.find((s) => s.phase === 'current');
  const next = stops.find((s) => s.phase === 'next');

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 12 }}>
      <Header today={today} current={current} next={next} />

      <div
        style={{
          position: 'relative',
          height: 'calc(100vh - 280px)',
          minHeight: 480,
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
      >
        <MapContainer center={[48, 11]} zoom={5} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />

          <RouteLine stops={stops} />
          <DayTripLayer navigate={navigate} />

          {stops.map((s, i) => (
            <Marker
              key={`${s.id}-${i}`}
              position={[s.lat, s.lng]}
              icon={makeIcon(s)}
              zIndexOffset={PHASE_STYLE[s.phase].z * 1000}
              eventHandlers={{
                click: () => {
                  const target = s.id === 'lauterach' ? 'innsbruck' : s.id === 'bern' ? 'zurich' : s.id;
                  navigate({ to: '/stop/$id', params: { id: target }, search: { view: 'overview' } });
                },
              }}
            >
              <Popup maxWidth={300}>
                <StopPopup stop={s} />
              </Popup>
            </Marker>
          ))}

          <FitBounds stops={stops} />
        </MapContainer>
      </div>

      <Legend />
    </div>
  );
}

function StopPopup({ stop }: { stop: ResolvedStop }) {
  const phase = PHASE_STYLE[stop.phase];
  const gap = minutesBetween(stop.checkInTime, stop.arriveTime);
  return (
    <div style={{ minWidth: 230, fontFamily: 'inherit' }}>
      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>
        {stop.flag} {stop.name}
      </div>
      <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>{stop.label}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: phase.fill, textTransform: 'uppercase', letterSpacing: 0.08 }}>
        {stop.phase === 'current' && '● You are here'}
        {stop.phase === 'next'    && '● Up next'}
        {stop.phase === 'past'    && '✓ Visited'}
        {stop.phase === 'future'  && '◌ Upcoming'}
      </div>

      <div style={{ marginTop: 8, padding: '8px 10px', background: '#F7F4EE', borderRadius: 8, fontSize: 12, lineHeight: 1.55 }}>
        {stop.arriveVia && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
            <span style={{ color: '#666' }}>🚆 Via</span>
            <strong style={{ textAlign: 'right' }}>{stop.arriveVia}</strong>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#666' }}>📅 Arrive</span>
          <strong>{formatDate(stop.arriveOn)}{stop.arriveTime ? ` · ${stop.arriveTime}` : ''}</strong>
        </div>
        {stop.checkInTime && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: '#666' }}>🛏 Check-in</span>
            <strong>{stop.checkInTime}</strong>
          </div>
        )}
        {gap != null && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ color: '#666' }}>⏱ Wait</span>
            <strong style={{ color: gap > 60 ? '#B45309' : gap < 0 ? '#0F8A4F' : '#222' }}>
              {gap < 0 ? `Past check-in by ${formatGap(-gap)}` : gap === 0 ? 'On time' : formatGap(gap)}
            </strong>
          </div>
        )}
      </div>

      {stop.luggage && (
        <div style={{ marginTop: 8, padding: '8px 10px', background: '#FFF8EC', border: '1px solid #F5D27D', borderRadius: 8, fontSize: 12, lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: '#7C2D12', marginBottom: 4 }}>🎒 Luggage</div>
          <div>{stop.luggage.place} <span style={{ color: '#888' }}>· {stop.luggage.cost}</span></div>
          {stop.luggage.notes && <div style={{ color: '#555', marginTop: 4 }}>{stop.luggage.notes}</div>}
        </div>
      )}

      <div style={{ marginTop: 8, fontSize: 11, color: '#999' }}>Tap the pin to open the stop →</div>
    </div>
  );
}

function Header({ today, current, next }: { today: Date; current?: ResolvedStop; next?: ResolvedStop }) {
  const tripStart = new Date('2026-06-16T00:00:00');
  const beforeTrip = today.getTime() < tripStart.getTime();
  const daysToStart = Math.ceil((tripStart.getTime() - today.getTime()) / 86_400_000);

  return (
    <header style={{ textAlign: 'center', padding: '8px 0 4px' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, margin: '0 0 4px' }}>Trip Map</h1>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
        {beforeTrip
          ? <><strong>{daysToStart} {daysToStart === 1 ? 'day' : 'days'}</strong> until Rome.</>
          : current
            ? <>Currently in <strong style={{ color: '#DC2626' }}>{current.flag} {current.name}</strong>{next ? <> · next: {next.flag} {next.name}</> : null}.</>
            : next
              ? <>Up next: <strong style={{ color: '#B45309' }}>{next.flag} {next.name}</strong> on {formatDate(next.arriveOn)}.</>
              : <>Trip complete ✓</>
        }
      </p>
    </header>
  );
}

function Legend() {
  const items: { phase: Phase; label: string }[] = [
    { phase: 'current', label: 'You are here' },
    { phase: 'next',    label: 'Up next' },
    { phase: 'future',  label: 'Upcoming' },
    { phase: 'past',    label: 'Visited' },
  ];
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
        justifyContent: 'center',
        padding: '6px 0',
        fontSize: 12,
        color: 'var(--text-muted)',
      }}
    >
      {items.map((it) => (
        <div key={it.phase} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 12, height: 12, borderRadius: '50%',
              background: PHASE_STYLE[it.phase].fill,
              border: `2px solid ${PHASE_STYLE[it.phase].ring}`,
              display: 'inline-block',
            }}
          />
          {it.label}
        </div>
      ))}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 12, height: 12, borderRadius: '50%',
            background: DAYTRIP_COLOR,
            border: '2px dashed #CFFAFE',
            display: 'inline-block',
          }}
        />
        Day-trip
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
