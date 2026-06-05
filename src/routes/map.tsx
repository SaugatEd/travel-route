import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import 'leaflet/dist/leaflet.css';

import { STOP_COORDS, TRIP_ROUTE, DAY_TRIPS, minutesBetween, formatGap, type RouteStop, type DayTrip, type StopCoord } from '@/data/stopCoords';
import { LOCKERS } from '@/data/lockerData';
import { OfflineMapControl } from '@/components/map/OfflineMapControl';
import { useMapsProvider, useUiStore } from '@/store/useUiStore';
import { directionsLink, PROVIDER_LABEL } from '@/lib/mapsProvider';

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

function RouteLines({ stops }: { stops: ResolvedStop[] }) {
  const segments = useModeSegments(stops);
  return (
    <>
      {segments.map((seg, i) => (
        <Polyline
          key={`${seg.from.id}-${seg.to.id}-${i}`}
          positions={seg.path}
          pathOptions={{
            color: MODE_STYLE[seg.mode].color,
            weight: seg.routed ? 4 : 3,
            opacity: 0.85,
            dashArray: seg.mode === 'bus' ? '10 7' : seg.routed ? undefined : '6 6',
          }}
        />
      ))}
    </>
  );
}

/* ── Live location + destination navigation ──────────────────── */
interface Place {
  id: string;
  label: string;
  lat: number;
  lng: number;
  query: string;
}

const DEST_GROUPS: { group: string; items: Place[] }[] = [
  {
    group: 'Train stations',
    items: Object.values(STOP_COORDS).map((s: StopCoord) => ({
      id: `st-${s.id}`, label: `${s.flag} ${s.name} station`, lat: s.lat, lng: s.lng, query: `${s.name} train station`,
    })),
  },
  {
    group: 'Luggage lockers',
    items: LOCKERS.map((l) => {
      const c = STOP_COORDS[l.stopId];
      return { id: `lk-${l.stopId}`, label: `🧳 ${l.station}`, lat: c?.lat ?? 0, lng: c?.lng ?? 0, query: l.mapsQuery };
    }).filter((p) => p.lat !== 0),
  },
  {
    group: 'Day trips',
    items: DAY_TRIPS.map((d) => ({ id: `dt-${d.id}`, label: `${d.flag} ${d.name}`, lat: d.lat, lng: d.lng, query: d.name })),
  },
];
const ALL_DESTS = DEST_GROUPS.flatMap((g) => g.items);

type LatLng = { lat: number; lng: number; accuracy?: number };

function haversineKm(a: LatLng, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface RouteResult { path: [number, number][]; km: number | null; min: number | null; routed: boolean }

/** Driving route (free OSRM) from `from` to `to`; straight-line fallback when unroutable/offline. */
function useUserRoute(from: LatLng | null, to: Place | null): RouteResult | null {
  const [result, setResult] = useState<RouteResult | null>(null);
  useEffect(() => {
    if (!from || !to) { setResult(null); return; }
    setResult({ path: [[from.lat, from.lng], [to.lat, to.lng]], km: haversineKm(from, to), min: null, routed: false });
    const controller = new AbortController();
    fetch(
      `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`,
      { signal: controller.signal },
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const route = d?.routes?.[0];
        const coords = route?.geometry?.coordinates as [number, number][] | undefined;
        if (coords?.length) {
          setResult({ path: coords.map(([lng, lat]) => [lat, lng]), km: route.distance / 1000, min: route.duration / 60, routed: true });
        }
      })
      .catch(() => { /* keep straight-line */ });
    return () => controller.abort();
  }, [from?.lat, from?.lng, to?.id, to?.lat, to?.lng]);
  return result;
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    className: 'jamnata-userloc',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: '<div style="width:18px;height:18px;border-radius:50%;background:#2563EB;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,0.3);"></div>',
  });
}

const destIcon = L.divIcon({
  className: 'jamnata-dest',
  iconSize: [30, 34],
  iconAnchor: [15, 32],
  html: '<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.45));">📍</div>',
});

/** Imperative map moves driven by control state (fit-route, recenter, fit-all). */
function MapController({ userPos, route, recenterTick, fitAllTick, allPoints }: {
  userPos: LatLng | null;
  route: RouteResult | null;
  recenterTick: number;
  fitAllTick: number;
  allPoints: [number, number][];
}) {
  const map = useMap();
  useEffect(() => {
    if (route?.path && route.path.length > 1) {
      map.fitBounds(L.latLngBounds(route.path), { padding: [50, 50], maxZoom: 14 });
    }
  }, [route, map]);

  const rPrev = useRef(0);
  useEffect(() => {
    if (recenterTick !== rPrev.current) {
      rPrev.current = recenterTick;
      if (userPos) map.setView([userPos.lat, userPos.lng], 14, { animate: true });
    }
  }, [recenterTick, userPos, map]);

  const fPrev = useRef(0);
  useEffect(() => {
    if (fitAllTick !== fPrev.current) {
      fPrev.current = fitAllTick;
      if (allPoints.length) map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 7 });
    }
  }, [fitAllTick, allPoints, map]);

  return null;
}

function MapPage() {
  const today = useMemo(() => new Date(), []);
  const stops = useMemo(() => classifyStops(today), [today]);
  const navigate = useNavigate();
  const provider = useMapsProvider();
  const setMapsProvider = useUiStore((s) => s.setMapsProvider);

  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [dest, setDest] = useState<Place | null>(null);
  const [recenterTick, setRecenterTick] = useState(0);
  const [fitAllTick, setFitAllTick] = useState(0);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Geolocation not supported on this device.');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) => { setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }); setGeoError(null); },
      (e) => setGeoError(e.message || 'Location unavailable — enable location access.'),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const route = useUserRoute(userPos, dest);
  const allPoints = useMemo<[number, number][]>(
    () => [
      ...stops.map((s) => [s.lat, s.lng] as [number, number]),
      ...DAY_TRIPS.map((d) => [d.lat, d.lng] as [number, number]),
      ...(userPos ? [[userPos.lat, userPos.lng] as [number, number]] : []),
    ],
    [stops, userPos],
  );

  const externalUrl = dest
    ? directionsLink(provider, dest.query, userPos ? `${userPos.lat},${userPos.lng}` : undefined)
    : provider === 'apple' ? 'https://maps.apple.com' : 'https://www.google.com/maps';

  const tracking = Boolean(userPos) && !geoError;
  const distLabel = route?.routed && route.km != null
    ? `${route.km.toFixed(route.km < 10 ? 1 : 0)} km${route.min != null ? ` · ~${Math.round(route.min)} min drive` : ''}`
    : route?.km != null ? `~${route.km.toFixed(route.km < 10 ? 1 : 0)} km straight-line` : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={controlBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span aria-hidden style={{ width: 9, height: 9, borderRadius: '50%', background: tracking ? '#16A34A' : geoError ? '#DC2626' : '#D97706', boxShadow: tracking ? '0 0 0 4px rgba(22,163,74,0.18)' : 'none' }} />
          <strong style={{ fontSize: 13, color: 'var(--text)' }}>{tracking ? 'Tracking you' : geoError ? 'Location off' : 'Locating…'}</strong>
          {userPos && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
              {userPos.lat.toFixed(4)}, {userPos.lng.toFixed(4)}{userPos.accuracy ? ` · ±${Math.round(userPos.accuracy)}m` : ''}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'inline-flex', border: '1px solid var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            {(['google', 'apple'] as const).map((p) => (
              <button key={p} type="button" onClick={() => setMapsProvider(p)} aria-pressed={provider === p}
                style={{ padding: '4px 11px', fontSize: 12, fontWeight: 800, cursor: 'pointer', border: 'none', background: provider === p ? 'var(--accent)' : 'transparent', color: provider === p ? '#fff' : 'var(--text-muted)' }}>
                {p === 'google' ? '🟢 Google' : '🍎 Apple'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select aria-label="Navigate to" value={dest?.id ?? ''} onChange={(e) => setDest(ALL_DESTS.find((d) => d.id === e.target.value) ?? null)} style={selectStyle}>
            <option value="">Navigate to…</option>
            {DEST_GROUPS.map((g) => (
              <optgroup key={g.group} label={g.group}>
                {g.items.map((it) => <option key={it.id} value={it.id}>{it.label}</option>)}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={() => setRecenterTick((n) => n + 1)} disabled={!userPos} style={{ ...pillBtn, opacity: userPos ? 1 : 0.5 }}>📍 Recenter on me</button>
          <button type="button" onClick={() => setFitAllTick((n) => n + 1)} style={pillBtn}>🗺 Whole trip</button>
        </div>

        {dest && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12.5 }}>
            <span style={{ color: 'var(--text-muted)' }}>To <strong style={{ color: 'var(--text)' }}>{dest.label}</strong>{distLabel ? ` · ${distLabel}` : ''}</span>
            <a href={externalUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 800, color: 'var(--accent)', textDecoration: 'none' }}>Turn-by-turn in {PROVIDER_LABEL[provider]} ↗</a>
            <button type="button" onClick={() => setDest(null)} style={{ ...pillBtn, padding: '3px 9px' }}>✕ Clear</button>
          </div>
        )}
        {geoError && <div style={{ fontSize: 11.5, color: 'var(--text-dim)' }}>{geoError} — you can still pick a destination for directions in {PROVIDER_LABEL[provider]}.</div>}
      </div>

      <div style={{ position: 'relative', height: 'clamp(420px, 62vh, 720px)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <MapContainer center={[48, 11]} zoom={5} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
          />

          <RouteLines stops={stops} />
          <DayTripLayer navigate={navigate} />

          {stops.map((s, i) => (
            <Marker key={`${s.id}-${i}`} position={[s.lat, s.lng]} icon={makeIcon(s)} zIndexOffset={PHASE_STYLE[s.phase].z * 1000}>
              <Popup maxWidth={300}>
                <StopPopup
                  stop={s}
                  onNavigate={() => setDest({ id: `st-${s.id}`, label: `${s.flag} ${s.name}`, lat: s.lat, lng: s.lng, query: `${s.name} ${s.id === 'lauterbrunnen' ? '' : 'station'}`.trim() })}
                  onOpen={() => navigate({ to: '/stop/$id', params: { id: s.id === 'lauterach' ? 'innsbruck' : s.id === 'bern' ? 'zurich' : s.id }, search: { view: 'overview' } })}
                />
              </Popup>
            </Marker>
          ))}

          {userPos && (
            <>
              <Circle center={[userPos.lat, userPos.lng]} radius={Math.min(userPos.accuracy ?? 60, 2000)} pathOptions={{ color: '#2563EB', weight: 1, fillColor: '#2563EB', fillOpacity: 0.08 }} />
              <Marker position={[userPos.lat, userPos.lng]} icon={userIcon()} zIndexOffset={3000}>
                <Popup>You are here</Popup>
              </Marker>
            </>
          )}

          {dest && (
            <Marker position={[dest.lat, dest.lng]} icon={destIcon} zIndexOffset={2500}>
              <Popup>{dest.label}</Popup>
            </Marker>
          )}

          {route?.path && route.path.length > 1 && (
            <Polyline positions={route.path} pathOptions={{ color: '#DC2626', weight: 4, opacity: 0.9, dashArray: route.routed ? undefined : '4 9' }} />
          )}

          <FitBounds stops={stops} />
          <MapController userPos={userPos} route={route} recenterTick={recenterTick} fitAllTick={fitAllTick} allPoints={allPoints} />
        </MapContainer>
      </div>

      <OfflineMapControl />
      <Legend />
    </div>
  );
}

const controlBar: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 9,
  padding: '11px 13px',
  borderRadius: 14,
  border: '1px solid var(--border)',
  background: 'var(--bg-raised)',
};
const selectStyle: CSSProperties = {
  flex: '1 1 220px',
  minWidth: 0,
  padding: '8px 11px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: 13,
  fontFamily: 'var(--sans)',
};
const pillBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 13px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: 12.5,
  fontWeight: 800,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

function StopPopup({ stop, onNavigate, onOpen }: { stop: ResolvedStop; onNavigate: () => void; onOpen: () => void }) {
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

      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button type="button" onClick={onNavigate} style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: 'none', background: '#2563EB', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
          Navigate here
        </button>
        <button type="button" onClick={onOpen} style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', color: '#222', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
          Open stop →
        </button>
      </div>
    </div>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 18, borderTop: `3px solid ${MODE_STYLE.train.color}`, display: 'inline-block' }} />
        Train
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 18, borderTop: `3px dashed ${MODE_STYLE.bus.color}`, display: 'inline-block' }} />
        Bus
      </div>
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
