import { createFileRoute } from '@tanstack/react-router';
import { useBookings, useBookingTodos } from '@/hooks/queries/bookings';
import { BookingTicket } from '@/components/booking/BookingTicket';
import { LoadingState } from '@/components/ui/EmptyState';
import { useMemo } from 'react';

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: '#B91C1C',
  'THIS WEEK': '#B45309',
  SOON: '#0F8A4F',
};

export const Route = createFileRoute('/book/')({
  component: BookPage,
});

function BookPage() {
  const bookings = useBookings();
  const todos = useBookingTodos();

  // "Today" reference for cancel-by urgency. Centralised so it stays
  // consistent with the trip year (2026).
  const today = useMemo(() => new Date(2026, 4, 7), []);

  if (bookings.isLoading) return <LoadingState label="Loading bookings…" />;
  const stays = bookings.data ?? [];
  // Optional (Plan-B) stays don't count toward trip nights.
  const primary = stays.filter((b) => b.status !== 'optional');
  const totalNights = primary.reduce((n, b) => n + b.nights, 0);
  const optionalCount = stays.length - primary.length;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 6,
        }}
      >
        <h2 style={{ margin: 0 }}>Confirmed Airbnbs</h2>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          {primary.length} bookings · {totalNights} nights
          {optionalCount > 0 && ` · +${optionalCount} backup`}
        </span>
      </div>
      <p className="subtitle" style={{ marginTop: 4, marginBottom: 18 }}>
        Click any card to open it. Tap “Walk from station” to launch Google Maps.
      </p>

      <div className="airbnb-grid">
        {stays.map((b) => (
          <BookingTicket key={b.id} booking={b} today={today} internalLink />
        ))}
      </div>

      <h2 style={{ marginTop: 36 }}>Still to book</h2>
      <p className="subtitle">Things you haven't booked yet — work top-down.</p>
      <div className="booking-grid">
        {(todos.data ?? []).map((b) => (
          <a
            key={`${b.priority}-${b.item}`}
            href={b.url}
            target="_blank"
            rel="noreferrer"
            className="booking-card"
            style={{ borderLeftColor: URGENCY_COLORS[b.urgency] || '#444' }}
          >
            <div className="booking-num">{b.priority}</div>
            <div className="booking-body">
              <div className="booking-header">
                <span className="booking-item">{b.item}</span>
                <span className="urgency-badge" style={{ color: URGENCY_COLORS[b.urgency] }}>
                  {b.urgency}
                </span>
              </div>
              <div className="booking-detail">{b.detail}</div>
              <div className="booking-date">{b.date}</div>
            </div>
            <span className="booking-arrow">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
