import { createFileRoute, Link } from '@tanstack/react-router';
import { useStops, useCalendar } from '@/hooks/queries/itinerary';
import { useBookings } from '@/hooks/queries/bookings';
import { useActiveStopId } from '@/store/useUiStore';
import { Resource } from '@/components/ui/Resource';
import { tintFor } from '@/lib/country';
import { parseCalDate } from '@/lib/dates';
import type { Stop, CalendarDay, Booking } from '@/types';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const stops = useStops();
  const calendar = useCalendar();
  const bookings = useBookings();
  const activeStopId = useActiveStopId();

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      <Hero />

      <Resource query={calendar}>
        {(days) => (
          <Resource query={bookings}>
            {(stays) => <NextUpRow days={days} stays={stays} stops={(stops.data ?? []) as Stop[]} />}
          </Resource>
        )}
      </Resource>

      <Resource query={calendar}>
        {(days) => (
          <Resource query={bookings}>
            {(stays) => <TripStats days={days} stays={stays} />}
          </Resource>
        )}
      </Resource>

      <Resource query={stops}>
        {(allStops) => <StopsGrid stops={allStops as Stop[]} activeStopId={activeStopId} />}
      </Resource>
    </div>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section style={{ padding: '36px 0 18px', textAlign: 'center' }}>
      <div
        style={{
          display: 'inline-block',
          padding: '4px 12px',
          fontSize: 11,
          fontWeight: 800,
          color: 'var(--accent)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          border: '1.5px solid var(--accent)',
          borderRadius: 999,
          marginBottom: 14,
        }}
      >
        15 Jun – 6 Jul 2026 · 3 Travellers
      </div>
      <h1
        style={{
          margin: 0,
          fontFamily: 'var(--serif, "DM Serif Display", serif)',
          fontSize: 'clamp(36px, 6vw, 60px)',
          lineHeight: 1.05,
          color: 'var(--text)',
        }}
      >
        Europe 2026
      </h1>
      <p
        style={{
          margin: '14px auto 0',
          maxWidth: 640,
          fontSize: 15,
          color: 'var(--text-muted)',
          lineHeight: 1.55,
        }}
      >
        Italy → Switzerland → Austria → Czechia → Germany → Netherlands. 22 days, 11 cities, one ridiculous train trip.
      </p>
    </section>
  );
}

/* ─── NEXT UP — single most important card ───────────────────────── */
const TODAY = new Date(2026, 5, 5); // 2026-06-05

function NextUpRow({ days, stays, stops }: { days: CalendarDay[]; stays: Booking[]; stops: Stop[] }) {
  const upcomingDay = days
    .map((d) => ({ ...d, _date: parseCalDate(d.date) }))
    .filter((d) => d._date && d._date >= TODAY)
    .sort((a, b) => a._date!.getTime() - b._date!.getTime())[0];

  const nextStay = stays
    .filter((b) => b.status !== 'optional')
    .map((b) => ({ ...b, _date: parseCalDate(b.checkIn.date) }))
    .filter((b) => b._date && b._date >= TODAY)
    .sort((a, b) => a._date!.getTime() - b._date!.getTime())[0];

  if (!upcomingDay) return null;

  const stop = stops.find((s) => s.id === (upcomingDay.stop === 'imst' ? 'innsbruck' : upcomingDay.stop));
  const tint = tintFor(stop?.country ?? upcomingDay.flag);

  return (
    <section
      style={{
        margin: '8px 0 28px',
        padding: '18px 22px',
        background: tint.tint,
        border: `1.5px solid ${tint.accent}33`,
        borderRadius: 16,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
        alignItems: 'center',
      }}
    >
      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: tint.accent, marginBottom: 4 }}>
          Next up
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
          {upcomingDay.flag} {upcomingDay.city}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
          {upcomingDay.date} · Day {upcomingDay.dayN}
        </div>
        {nextStay && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 10 }}>
            🛏 First stay: <strong style={{ color: 'var(--text)' }}>{nextStay.name}</strong> · {nextStay.checkIn.date}
          </div>
        )}
      </div>
      {stop && (
        <Link
          to="/stop/$id"
          params={{ id: stop.id }}
          search={{ view: 'overview' }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            minHeight: 44,
            padding: '12px 20px',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            background: tint.accent,
            borderRadius: 999,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Open {stop.city} →
        </Link>
      )}
    </section>
  );
}

/* ─── TRIP STATS STRIP ───────────────────────────────────────────── */
function TripStats({ days, stays }: { days: CalendarDay[]; stays: Booking[] }) {
  const confirmed = stays.filter((b) => b.status !== 'optional');
  const booked = confirmed.filter((b) => b.status === 'booked');
  const todos = confirmed.filter((b) => b.status === 'todo');
  const totalNights = confirmed.reduce((n, b) => n + b.nights, 0);
  const countries = new Set(confirmed.map((b) => b.country)).size;

  const items = [
    { label: 'Days', value: days.length },
    { label: 'Cities', value: 11 },
    { label: 'Stays', value: `${booked.length}/${confirmed.length}` },
    { label: 'Nights', value: totalNights },
    { label: 'Countries', value: countries },
    { label: 'TODO', value: todos.length, urgent: todos.length > 0 },
  ];

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
        gap: 8,
        margin: '0 0 32px',
        padding: '14px 18px',
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 14,
      }}
    >
      {items.map((it) => (
        <div key={it.label} style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: it.urgent ? '#B45309' : 'var(--accent)',
              fontFamily: 'var(--serif)',
              lineHeight: 1.1,
            }}
          >
            {it.value}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginTop: 4,
            }}
          >
            {it.label}
          </div>
        </div>
      ))}
    </section>
  );
}

/* ─── STOPS GRID ─────────────────────────────────────────────────── */
function StopsGrid({ stops, activeStopId }: { stops: Stop[]; activeStopId: string }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={sectionHeading}>Stops</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {stops.map((s) => {
          const tint = tintFor(s.country);
          const isActive = s.id === activeStopId;
          return (
            <Link
              key={s.id}
              to="/stop/$id"
              params={{ id: s.id }}
              search={{ view: 'overview' }}
              style={{
                ...stopCardStyle,
                background: tint.tint,
                borderColor: isActive ? tint.accent : 'var(--border)',
                boxShadow: isActive ? `0 0 0 2px ${tint.accent}33` : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>{s.flag}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: tint.accent }}>{s.city as string}</span>
              </div>
              {typeof s.tagline === 'string' && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>
                  {s.tagline}
                </div>
              )}
              {typeof s.duration === 'string' && (
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 8, fontFamily: 'var(--mono)' }}>
                  {s.duration}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const sectionHeading = {
  fontFamily: 'var(--serif)',
  fontSize: 22,
  margin: '0 0 14px',
  color: 'var(--text)',
} as const;

const stopCardStyle = {
  display: 'block',
  padding: 14,
  border: '1.5px solid',
  borderRadius: 12,
  textDecoration: 'none',
  color: 'inherit',
  transition: 'transform 0.12s, box-shadow 0.12s',
} as const;
