import { createFileRoute } from '@tanstack/react-router';
import type { CSSProperties, ReactNode } from 'react';
import { CALENDAR, AIRBNBS } from '@/data/tripData.js';
import { LOCKERS, type LockerStop } from '@/data/lockerData';
import { tintFor } from '@/lib/country';

export const Route = createFileRoute('/luggage')({
  component: LuggagePage,
});

interface Booking {
  id: string;
  name: string;
  city: string;
  country: string;
  host?: string | null;
}
interface AirbnbAction { action: 'check-in' | 'check-out' | 'stay'; id: string; time?: string }
interface CalDay {
  date: string;
  dayN: number;
  type: string;
  city: string;
  flag: string;
  stop: string;
  airbnb?: AirbnbAction[];
  plan?: Record<string, unknown>;
}

const BOOKINGS = AIRBNBS as Booking[];
const DAYS = CALENDAR as CalDay[];
const byId = new Map(BOOKINGS.map((b) => [b.id, b]));
const lockerByDay = new Map(LOCKERS.map((l) => [l.dayN, l]));

/** Short, recognisable flat label: "Rome · Prati", "Lucerne", "Lauterach". */
function flatLabel(b?: Booking): string {
  if (!b) return '—';
  const hood = (b.city.match(/\(([^)]+)\)/) || [])[1];
  const base = b.city.replace(/\s*\(.*\)/, '');
  return hood && !/near/i.test(hood) ? `${base} · ${hood}` : base;
}

type StepTone = 'flat' | 'locker' | 'move' | 'bus';
interface Step { icon: string; tone: StepTone; label: string; sub?: string }
interface FlowRow {
  kind: 'flow';
  dayN: number;
  date: string;
  city: string;
  country: string;
  steps: Step[];
  locker?: LockerStop;
}
interface StayRow {
  kind: 'stay';
  dayN: number;
  dayNEnd: number;
  date: string;
  dateEnd: string;
  city: string;
  country: string;
  flat: string;
  daypack: boolean;
}
type Row = FlowRow | StayRow;

function buildRows(): Row[] {
  const rows: Row[] = [];
  let currentFlat: Booking | undefined;
  let openStay: StayRow | null = null;

  for (const d of DAYS) {
    const acts = d.airbnb ?? [];
    const out = acts.find((a) => a.action === 'check-out');
    const cin = acts.find((a) => a.action === 'check-in');
    const locker = lockerByDay.get(d.dayN);
    const checkoutB = out ? byId.get(out.id) : undefined;
    const checkinB = cin ? byId.get(cin.id) : undefined;
    const country = checkinB?.country ?? checkoutB?.country ?? currentFlat?.country ?? 'Italy';

    const mode = locker ? 'locker' : out && cin ? 'move' : cin ? 'arrive' : out ? 'depart' : 'stay';

    if (mode === 'stay') {
      const planText = JSON.stringify(d.plan ?? {}).toLowerCase();
      const dayTrip = /hallstatt|schafberg|day-?trip|grindelwald/.test(planText);
      if (openStay && currentFlat && openStay.flat === flatLabel(currentFlat)) {
        openStay.dayNEnd = d.dayN;
        openStay.dateEnd = d.date;
        openStay.daypack = openStay.daypack || dayTrip;
      } else {
        openStay = {
          kind: 'stay',
          dayN: d.dayN,
          dayNEnd: d.dayN,
          date: d.date,
          dateEnd: d.date,
          city: d.city,
          country,
          flat: flatLabel(currentFlat),
          daypack: dayTrip,
        };
        rows.push(openStay);
      }
      continue;
    }
    openStay = null;

    const steps: Step[] = [];
    if (checkoutB) steps.push({ icon: '🏠', tone: 'flat', label: `Check out${out?.time ? ` · ${out.time}` : ''}`, sub: flatLabel(checkoutB) });

    if (locker) {
      steps.push({ icon: '🔒', tone: 'locker', label: `Lockers · ${locker.station}`, sub: `${locker.drop} → ${locker.collect}` });
    } else if (mode === 'move') {
      steps.push({ icon: '🚆', tone: 'move', label: 'Bags ride with you', sub: `${flatLabel(checkoutB)} → ${flatLabel(checkinB)}` });
    } else if (mode === 'arrive') {
      steps.push({ icon: '🧭', tone: 'move', label: 'Arrive with your bags' });
    } else if (mode === 'depart') {
      steps.push({ icon: '✈️', tone: 'move', label: 'Off to the airport with your bags' });
    }

    if (checkinB) {
      steps.push({ icon: '🏠', tone: 'flat', label: `Check in${cin?.time ? ` · ${cin.time}` : ''}`, sub: flatLabel(checkinB) });
    } else if (!cin && locker && out) {
      steps.push({ icon: '🚌', tone: 'bus', label: 'Night bus onward', sub: 'sleep on board — no flat tonight' });
    }

    rows.push({ kind: 'flow', dayN: d.dayN, date: d.date, city: d.city, country, steps, locker });
    if (checkinB) currentFlat = checkinB;
  }
  return rows;
}

function LuggagePage() {
  const rows = buildRows();
  const flatChanges = DAYS.reduce((n, d) => n + (d.airbnb ?? []).filter((a) => a.action === 'check-in').length, 0);

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: '0 12px 80px' }}>
      <header style={{ padding: '28px 4px 8px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, margin: '0 0 6px', color: 'var(--text)' }}>
          🧳 Luggage & lockers
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 }}>
          Where the bags go every day — check-out, locker or carry, check-in. You change flats {flatChanges} times,
          so this is the day-by-day bag route.
        </p>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14 }}>
          <Stat value={flatChanges} label="flat check-ins" />
          <Stat value={LOCKERS.length} label="locker days" />
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
        {rows.map((r) => (r.kind === 'stay' ? <StayCard key={`s${r.dayN}`} r={r} /> : <FlowCard key={`f${r.dayN}`} r={r} />))}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--serif)', color: 'var(--accent)' }}>{value}</span>
      <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

const toneColor: Record<StepTone, string> = {
  flat: '#7C3AED',
  locker: '#B45309',
  move: '#2563EB',
  bus: '#16A34A',
};

function StayCard({ r }: { r: StayRow }) {
  const tint = tintFor(r.country);
  const range = r.dayN === r.dayNEnd ? `Day ${r.dayN}` : `Days ${r.dayN}–${r.dayNEnd}`;
  return (
    <div
      style={{
        border: '1px dashed var(--border)',
        borderLeft: `4px solid ${tint.accent}`,
        borderRadius: 12,
        background: 'var(--bg)',
        padding: '11px 15px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 16 }} aria-hidden>🛏</span>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)' }}>
          {range} · Bags stay put
        </span>
        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>at {r.flat}</span>
      </div>
      {r.daypack && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.45 }}>
          🎒 Day-trip on one of these days — daypacks only, big bags stay locked in the flat.
        </div>
      )}
    </div>
  );
}

function FlowCard({ r }: { r: FlowRow }) {
  const tint = tintFor(r.country);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 14, background: 'var(--bg-raised)', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '11px 15px',
          background: tint.tint,
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: tint.accent,
            background: 'rgba(255,255,255,0.6)',
            border: `1px solid ${tint.accent}33`,
            padding: '3px 8px',
            borderRadius: 999,
          }}
        >
          Day {r.dayN} · {r.date}
        </span>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--serif)' }}>{r.city}</span>
      </div>

      <div style={{ padding: '12px 15px' }}>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span aria-hidden style={{ position: 'absolute', left: 13, top: 6, bottom: 6, width: 2, borderLeft: '2px dashed var(--border)' }} />
          {r.steps.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '28px minmax(0,1fr)', gap: 10, alignItems: 'center', position: 'relative' }}>
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  background: 'var(--bg-raised)',
                  border: `2px solid ${toneColor[s.tone]}`,
                  zIndex: 1,
                }}
              >
                {s.icon}
              </span>
              <span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.label}</span>
                {s.sub && <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}> · {s.sub}</span>}
              </span>
            </div>
          ))}
        </div>

        {r.locker && <LockerDetail l={r.locker} accent={tint.accent} />}
      </div>
    </div>
  );
}

function LockerDetail({ l, accent }: { l: LockerStop; accent: string }) {
  return (
    <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: 10 }}>{l.why}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
        <Fact label="Where">{l.location}</Fact>
        <Fact label="Price">{l.price}</Fact>
        <Fact label="Hours">{l.hours}</Fact>
        <Fact label="Pay">{l.payment}</Fact>
        {l.sizes && <Fact label="Sizes">{l.sizes}</Fact>}
      </div>
      {l.warn && (
        <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: '#FFF8EC', border: '1px solid #F5D27D', fontSize: 12, lineHeight: 1.5, color: 'var(--text)' }}>
          ⚠️ {l.warn}
        </div>
      )}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.mapsQuery)}`}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 11, fontSize: 12, fontWeight: 700, color: accent, textDecoration: 'none' }}
      >
        🗺 Find the lockers ↗
      </a>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  const cell: CSSProperties = { background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px' };
  return (
    <div style={cell}>
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2, lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}
