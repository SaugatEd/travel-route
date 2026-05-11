import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useMemo, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

import { STOP_COORDS, TRIP_ROUTE, minutesBetween, formatGap, type RouteStop } from '@/data/stopCoords';

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

  // Find the "current" stop: the latest one whose arriveOn ≤ today and where
  // today is within (arriveOn + nights). If none active, the next upcoming is "next".
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
        color:#fff;
        font-size:${Math.round(s.size * 0.45)}px;
        font-weight:800;
        line-height:1;
      ">${stop.flag}</div>
    `,
  });
}

function FitBounds({ stops }: { stops: ResolvedStop[] }) {
  const map = useMap();
  useEffect(() => {
    if (!stops.length) return;
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
  }, [stops, map]);
  return null;
}

function MapPage() {
  const today = new Date(); // real today; trip starts 2026-06-16 so date drives state automatically
  const stops = useMemo(() => classifyStops(today), [today]);
  const navigate = useNavigate();

  const polyline: [number, number][] = stops.map((s) => [s.lat, s.lng]);
  const current = stops.find((s) => s.phase === 'current');
  const next    = stops.find((s) => s.phase === 'next');

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
        <MapContainer
          center={[48, 11]}
          zoom={5}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Polyline
            positions={polyline}
            pathOptions={{ color: 'var(--accent, #B8860B)', weight: 3, opacity: 0.7, dashArray: '6 6' }}
          />

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
              <Popup maxWidth={280}>
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
          {stop.luggage.notes && (
            <div style={{ color: '#555', marginTop: 4 }}>{stop.luggage.notes}</div>
          )}
        </div>
      )}
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
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
