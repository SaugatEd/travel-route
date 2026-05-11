import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useBooking } from '@/hooks/queries/bookings';
import { BookingTicket } from '@/components/booking/BookingTicket';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { tintFor } from '@/lib/country';
import { useMemo } from 'react';
import { TRIP_ROUTE, minutesBetween, formatGap, type RouteStop } from '@/data/stopCoords';

export const Route = createFileRoute('/book/$id')({
  component: BookingDetailPage,
});

function BookingDetailPage() {
  const { id } = useParams({ from: '/book/$id' });
  const booking = useBooking(id);
  const today = useMemo(() => new Date(2026, 4, 7), []);

  if (booking.isLoading) return <LoadingState />;
  const b = booking.data;
  if (!b) {
    return (
      <EmptyState
        title="Booking not found"
        body={`No booking with id "${id}".`}
        action={<Link to="/book">← Back to all bookings</Link>}
      />
    );
  }

  const tint = tintFor(b.country);
  const route = TRIP_ROUTE.find((r) => r.bookingId === b.id);

  return (
    <div>
      <Link to="/book" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← All bookings
      </Link>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, margin: '12px 0 4px', color: tint.accent }}>
        {b.flag} {b.city}
      </h1>
      <p className="subtitle" style={{ marginTop: 0 }}>{b.name}</p>

      <div style={{ maxWidth: 540, marginTop: 18 }}>
        <BookingTicket booking={b} today={today} />
      </div>

      {route && <ArrivalPlan route={route} accent={tint.accent} />}

      {b.note && (
        <div
          style={{
            marginTop: 22,
            padding: 16,
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            fontSize: 14,
            lineHeight: 1.6,
            maxWidth: 720,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            Notes
          </div>
          {b.note}
        </div>
      )}

      <div style={{ marginTop: 22, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {b.bookingUrl && (
          <a href={b.bookingUrl} target="_blank" rel="noreferrer" className="booking-card" style={{ padding: '10px 16px' }}>
            🔗 Open on Airbnb
          </a>
        )}
        {b.directionsUrl && (
          <a href={b.directionsUrl} target="_blank" rel="noreferrer" className="booking-card" style={{ padding: '10px 16px' }}>
            🗺 Walk from central station
          </a>
        )}
      </div>
    </div>
  );
}

function ArrivalPlan({ route, accent }: { route: RouteStop; accent: string }) {
  const gap = minutesBetween(route.checkInTime, route.arriveTime);
  const hasGap = gap != null && gap > 30;
  const isLate = gap != null && gap < 0;
  const onTime = gap != null && gap >= 0 && gap <= 30;

  return (
    <section
      style={{
        maxWidth: 720,
        marginTop: 24,
        padding: 18,
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderRadius: 14,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 12 }}>
        Arrival plan
      </div>

      {/* Timeline strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 10,
          alignItems: 'center',
          padding: '12px 14px',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          marginBottom: 12,
        }}
      >
        <TimeBlock label="Arrive" value={route.arriveTime ?? '—'} accent={accent} />
        <div aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <TimeBlock label="Check-in" value={route.checkInTime ?? '—'} accent={accent} />
      </div>

      {/* Gap headline */}
      {gap != null && (
        <div
          style={{
            padding: '10px 14px',
            background: hasGap ? '#FFF8EC' : isLate ? '#F0F9F4' : '#F5F4EE',
            border: `1px solid ${hasGap ? '#F5D27D' : isLate ? '#A6E2C0' : 'var(--border)'}`,
            borderRadius: 10,
            fontSize: 13,
            color: 'var(--text)',
            marginBottom: hasGap && route.luggage ? 10 : 0,
          }}
        >
          {hasGap && (
            <>⏱ <strong>{formatGap(gap)} between arrival and check-in.</strong> Plan to drop bags first, then explore.</>
          )}
          {isLate && (
            <>✓ Arriving <strong>{formatGap(-gap)} after check-in opens.</strong> Walk straight to the door — no waiting.</>
          )}
          {onTime && (
            <>✓ Arriving <strong>right around check-in</strong>. Head straight to the flat.</>
          )}
        </div>
      )}

      {/* Luggage tip */}
      {route.luggage && (
        <div
          style={{
            padding: 14,
            background: '#FFF8EC',
            border: '1px solid #F5D27D',
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.55,
          }}
        >
          <div style={{ fontWeight: 800, color: '#7C2D12', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🎒</span> Where to drop bags
          </div>
          <div style={{ fontWeight: 700 }}>
            {route.luggage.place} <span style={{ color: '#888', fontWeight: 500 }}>· {route.luggage.cost}</span>
          </div>
          {route.luggage.notes && (
            <div style={{ color: 'var(--text-muted)', marginTop: 6 }}>{route.luggage.notes}</div>
          )}
        </div>
      )}
    </section>
  );
}

function TimeBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.08 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: accent, fontFamily: 'var(--mono, monospace)', marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}
