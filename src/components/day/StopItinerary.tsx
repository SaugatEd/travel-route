import type { CSSProperties } from 'react';
import { Link } from '@tanstack/react-router';
import { tintFor } from '@/lib/country';
import { DayCard } from './DayCard';
import type { CalendarDay, Journey } from '@/types';

interface StopItineraryProps {
  city: string;
  country?: string;
  days: CalendarDay[];
  journeys: Journey[];
}

const footLinkStyle = (accent: string): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  fontWeight: 700,
  color: accent,
  fontFamily: 'var(--sans)',
  textDecoration: 'none',
});

/** This stop's own day-by-day plan, rendered on the stop overview. */
export function StopItinerary({ city, country, days, journeys }: StopItineraryProps) {
  if (days.length === 0) return null;
  const tint = tintFor(country);

  return (
    <div className="panel" style={{ padding: 24 }}>
      <div className="section-header">
        <h2 className="section-title">Itinerary in {city}</h2>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          What to see, eat &amp; sort out each day — trains &amp; tickets live in the Trains section
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {days.map((d, i) => (
          <DayCard key={`${d.date}-${i}`} day={d} journeys={journeys} tint={tint} hideJourneys />
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, marginTop: 16 }}>
        <Link to="/trains" style={footLinkStyle(tint.accent)}>
          🚄 Trains, tickets &amp; routes →
        </Link>
        <Link to="/itinerary" style={footLinkStyle(tint.accent)}>
          View full trip itinerary →
        </Link>
      </div>
    </div>
  );
}
