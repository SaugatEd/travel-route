import { createFileRoute } from '@tanstack/react-router';
import { useBookings } from '@/hooks/queries/bookings';
import { StayCard } from '@/components/booking/StayCard';
import { LoadingState } from '@/components/ui/EmptyState';

export const Route = createFileRoute('/book/')({
  component: BookPage,
});

function BookPage() {
  const bookings = useBookings();

  if (bookings.isLoading) return <LoadingState label="Loading bookings…" />;
  const stays = bookings.data ?? [];
  // Optional (Plan-B) stays don't count toward trip nights.
  const primary = stays.filter((b) => b.status !== 'optional');
  const totalNights = primary.reduce((n, b) => n + b.nights, 0);

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
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
        </span>
      </div>
      <p className="subtitle" style={{ marginTop: 4, marginBottom: 18 }}>
        Tap any stay for full check-in details, payment and directions.
      </p>

      <div className="stay-grid">
        {primary.map((b) => (
          <StayCard key={b.id} booking={b} />
        ))}
      </div>
    </div>
  );
}
