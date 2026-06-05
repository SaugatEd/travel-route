import { Link } from '@tanstack/react-router';
import { tintFor } from '@/lib/country';
import type { Booking } from '@/types';

/** Compact, link-only stay card used in the Home "Stays" grid and the Book list.
 *  Full booking detail (route, host, code, directions) lives on /book/$id. */
export function StayCard({ booking: b }: { booking: Booking }) {
  const tint = tintFor(b.country);
  const isTodo = b.status === 'todo';
  const isOptional = b.status === 'optional';

  const status = isTodo
    ? { icon: '📌', text: 'Not booked yet', color: '#7C2D12' }
    : isOptional
      ? { icon: '🛏', text: `Backup · ${b.host ?? b.name}`, color: 'var(--text-muted)' }
      : { icon: '✓', text: b.host ?? 'Confirmed', color: '#166534' };

  return (
    <Link
      to="/book/$id"
      params={{ id: b.id }}
      className="stay-card"
      style={{
        background: tint.tint,
        borderStyle: isTodo || isOptional ? 'dashed' : 'solid',
        borderColor: isTodo ? '#7C2D12' : isOptional ? 'var(--text-faint)' : 'var(--border)',
      }}
    >
      <span className="stay-card-edge" style={{ background: tint.strip }} aria-hidden />
      <div className="stay-card-top">
        <span className="stay-card-city" style={{ color: tint.accent }}>
          {b.flag} {b.city.replace(/\s*\(.+\)\s*$/, '')}
        </span>
        <span className="stay-card-nights" style={{ color: tint.accent, borderColor: `${tint.accent}44` }}>
          {b.nights}n
        </span>
      </div>
      <div className="stay-card-dates">
        {b.checkIn.date} → {b.checkOut.date}
      </div>
      <div className="stay-card-status" style={{ color: status.color, fontWeight: isTodo || isOptional ? 700 : 600 }}>
        <span aria-hidden>{status.icon}</span> {status.text}
      </div>
      {b.selfCheckIn !== undefined && (
        <div className="stay-card-checkin">
          <span
            className="stay-card-checkin-pill"
            style={
              b.selfCheckIn
                ? { color: '#166534', background: 'rgba(22,101,52,0.10)' }
                : { color: '#9A3412', background: 'rgba(154,52,18,0.10)' }
            }
          >
            <span aria-hidden>{b.selfCheckIn ? '🔑' : '🛎'}</span>
            {b.selfCheckIn ? 'Self check-in' : 'Reception'}
          </span>
          {b.checkInMethod && b.selfCheckIn && (
            <span className="stay-card-checkin-method">{b.checkInMethod}</span>
          )}
        </div>
      )}
    </Link>
  );
}
