import { createFileRoute, Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useCalendar, useStops } from '@/hooks/queries/itinerary';
import { useBookings } from '@/hooks/queries/bookings';
import { Resource } from '@/components/ui/Resource';
import { tintFor } from '@/lib/country';
import { shortDate } from '@/lib/dates';
import type { CalendarDay, Booking, Stop } from '@/types';

export const Route = createFileRoute('/itinerary')({
  component: ItineraryPage,
});

function ItineraryPage() {
  const calendar = useCalendar();
  const bookings = useBookings();
  const stops = useStops();

  return (
    <Resource query={calendar}>
      {(days) => (
        <Resource query={bookings}>
          {(stays) => (
            <Resource query={stops}>
              {(allStops) => (
                <FullItinerary days={days} stays={stays} stops={allStops as Stop[]} />
              )}
            </Resource>
          )}
        </Resource>
      )}
    </Resource>
  );
}

/* ─── Top-level itinerary view ─────────────────────────────────── */
function FullItinerary({ days, stays, stops }: { days: CalendarDay[]; stays: Booking[]; stops: Stop[] }) {
  const totalNights = stays.filter((b) => b.status !== 'optional').reduce((n, b) => n + b.nights, 0);
  const countries = new Set(stays.filter((b) => b.status !== 'optional').map((b) => b.country)).size;
  const stopsById = useMemo(() => {
    const m = new Map<string, Stop>();
    for (const s of stops) m.set(s.id, s);
    return m;
  }, [stops]);
  const bookingsById = useMemo(() => {
    const m = new Map<string, Booking>();
    for (const b of stays) m.set(b.id, b);
    return m;
  }, [stays]);

  return (
    <div style={{ maxWidth: 880, margin: '0 auto', padding: '0 4px 80px' }}>
      <header style={{ padding: '28px 8px 12px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, margin: '0 0 6px', color: 'var(--text)' }}>
          Full itinerary
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 }}>
          Every day, end to end — Nepal → Europe → Nepal · {days.length} days · {countries} countries · {totalNights} nights
        </p>
      </header>

      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {days.map((d, i) => {
          const prevCountry = i > 0 ? countryOfStopId(days[i - 1].stop, stopsById) : null;
          const country = countryOfStopId(d.stop, stopsById);
          const isCountryBreak = country !== prevCountry;
          return (
            <li key={`${d.date}-${i}`}>
              {isCountryBreak && country && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    margin: '14px 4px 6px',
                    paddingTop: i === 0 ? 0 : 12,
                    borderTop: i === 0 ? 'none' : '1px dashed var(--border)',
                  }}
                >
                  {country}
                </div>
              )}
              <DayCard day={d} stays={stays} bookingsById={bookingsById} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function countryOfStopId(stopId: string, stopsById: Map<string, Stop>): string | null {
  if (stopId === 'ktm') return 'Transit';
  const s = stopsById.get(stopId);
  return (s?.country as string) ?? null;
}

/* ─── Single day card ──────────────────────────────────────────── */
function DayCard({
  day,
  stays,
  bookingsById,
}: {
  day: CalendarDay;
  stays: Booking[];
  bookingsById: Map<string, Booking>;
}) {
  const country = day.flag || '';
  // Try to colour the card by the booking's country if we have one for this stop.
  const sampleBooking = Array.from(bookingsById.values()).find((b) => b.flag === country);
  const tint = tintFor(sampleBooking?.country);

  const bullets = splitSummary(day.summary);
  const actions = (day.airbnb || []).map((a) => ({ ...a, booking: bookingsById.get(a.id) }));
  const planBToday = stays.filter(
    (b) => b.status === 'optional' && b.checkIn.date === day.date,
  );

  return (
    <article
      style={{
        border: '1px solid var(--border)',
        borderRadius: 14,
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      {/* Header strip — tinted by country */}
      <div
        style={{
          padding: '12px 16px',
          background: tint.tint,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: tint.accent,
            background: 'rgba(255,255,255,0.6)',
            padding: '3px 8px',
            borderRadius: 999,
            border: `1px solid ${tint.accent}33`,
          }}
        >
          Day {day.dayN} · {day.date}
        </div>
        <TypeBadge type={day.type} icon={day.icon} accent={tint.accent} />
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: 'var(--text)',
            fontFamily: 'var(--serif)',
          }}
        >
          {day.flag} {day.city}
        </div>
      </div>

      {/* Body — bullets */}
      <div style={{ padding: '14px 18px' }}>
        {bullets.length > 0 && (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {bullets.map((b, i) => (
              <li
                key={i}
                style={{
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: 'var(--text)',
                  paddingLeft: 16,
                  position: 'relative',
                }}
              >
                <span
                  aria-hidden
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 8,
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: tint.accent,
                  }}
                />
                {b}
              </li>
            ))}
          </ul>
        )}

        {/* Bookings wired to this day */}
        {actions.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {actions.map((a, i) => {
              const b = a.booking;
              if (!b) return null;
              const isOut = a.action === 'check-out';
              const label = isOut ? 'CHECK-OUT' : a.action === 'stay' ? 'STAY' : 'CHECK-IN';
              const time = a.time || (isOut ? b.checkOut.time : b.checkIn.time);
              return (
                <BookingStrip
                  key={`${b.id}-${i}`}
                  booking={b}
                  label={label}
                  time={time}
                  variant={isOut ? 'out' : 'in'}
                />
              );
            })}
          </div>
        )}

        {/* Plan B — optional bookings checking in today */}
        {planBToday.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {planBToday.map((b) => (
              <BookingStrip
                key={b.id}
                booking={b}
                label="PLAN B"
                time={b.checkIn.time}
                variant="planb"
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

/* ─── Type badge (travel / explore / move / night / arrive) ─── */
function TypeBadge({ type, icon, accent }: { type: string; icon: string; accent: string }) {
  const colour = {
    travel:  '#7C3AED',
    arrive:  '#0EA5E9',
    move:    '#F59E0B',
    explore: '#10B981',
    night:   '#6366F1',
    transit: '#EF4444',
  }[type] || accent;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#fff',
        background: colour,
        padding: '3px 9px',
        borderRadius: 999,
      }}
    >
      {icon} {type}
    </span>
  );
}

/* ─── Compact booking strip ───────────────────────────────────── */
function BookingStrip({
  booking: b,
  label,
  time,
  variant,
}: {
  booking: Booking;
  label: string;
  time?: string;
  variant: 'in' | 'out' | 'planb';
}) {
  const tint = tintFor(b.country);
  const borderStyle = variant === 'planb' ? 'dashed' : 'solid';
  const opacity = variant === 'planb' ? 0.92 : 1;
  const labelBg =
    variant === 'in' ? '#10B981' : variant === 'out' ? '#F59E0B' : '#6B7280';

  return (
    <Link
      to="/book/$id"
      params={{ id: b.id }}
      style={{
        display: 'grid',
        gridTemplateColumns: '90px 1fr auto',
        gap: 12,
        alignItems: 'center',
        padding: '10px 12px',
        borderRadius: 10,
        border: `1.5px ${borderStyle} ${variant === 'planb' ? '#9CA3AF' : 'var(--border)'}`,
        background: tint.tint,
        textDecoration: 'none',
        color: 'inherit',
        opacity,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.08em',
            color: '#fff',
            background: labelBg,
            display: 'inline-block',
            padding: '2px 7px',
            borderRadius: 4,
          }}
        >
          {label}
        </div>
        {time && (
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)', marginTop: 4 }}>
            {time}
          </div>
        )}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: tint.accent, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {b.flag} {b.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {b.host || '— TBD —'} · {b.address || '— address pending —'}
          {b.confirmationCode && <> · <span style={{ fontFamily: 'var(--mono)' }}>{b.confirmationCode}</span></>}
        </div>
        {variant === 'planb' && b.cancelBy && (
          <div style={{ fontSize: 11, color: '#B45309', marginTop: 4, fontWeight: 600 }}>
            ⚠️ Free cancel until {shortDate(b.cancelBy.date)} {b.cancelBy.time}
          </div>
        )}
      </div>
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
    </Link>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */
function splitSummary(summary: string | undefined): string[] {
  if (!summary) return [];
  return summary
    .split(/\s+·\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
