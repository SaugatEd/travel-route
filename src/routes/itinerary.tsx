import { createFileRoute } from '@tanstack/react-router';
import { Fragment, useMemo } from 'react';
import { useCalendar, useJourneys, useStops } from '@/hooks/queries/itinerary';
import { useBookings } from '@/hooks/queries/bookings';
import { Resource } from '@/components/ui/Resource';
import { tintFor } from '@/lib/country';
import { DayCard } from '@/components/day/DayCard';
import type { CalendarDay, Booking, Journey, Stop } from '@/types';

export const Route = createFileRoute('/itinerary')({
  component: ItineraryPage,
});

function ItineraryPage() {
  const calendar = useCalendar();
  const bookings = useBookings();
  const journeys = useJourneys();
  const stops = useStops();

  return (
    <Resource query={calendar}>
      {(days) => (
        <Resource query={bookings}>
          {(stays) => (
            <Resource query={journeys}>
              {(allJourneys) => (
                <Resource query={stops}>
                  {(allStops) => (
                    <FullItinerary days={days} stays={stays} journeys={allJourneys} stops={allStops as Stop[]} />
                  )}
                </Resource>
              )}
            </Resource>
          )}
        </Resource>
      )}
    </Resource>
  );
}

/* ─── Top-level itinerary view ─────────────────────────────────── */
function FullItinerary({
  days,
  stays,
  journeys,
  stops,
}: {
  days: CalendarDay[];
  stays: Booking[];
  journeys: Journey[];
  stops: Stop[];
}) {
  const totalNights = stays.filter((b) => b.status !== 'optional').reduce((n, b) => n + b.nights, 0);
  const countries = new Set(stays.filter((b) => b.status !== 'optional').map((b) => b.country)).size;
  const stopsById = useMemo(() => {
    const m = new Map<string, Stop>();
    for (const s of stops) m.set(s.id, s);
    return m;
  }, [stops]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 4px 80px' }}>
      <header style={{ padding: '28px 8px 12px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, margin: '0 0 6px', color: 'var(--text)' }}>
          Full itinerary
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.5 }}>
          Every day, end to end — Nepal → Europe → Nepal · {days.length} days · {countries} countries · {totalNights} nights
        </p>
      </header>

      {/* Day cards laid out as a responsive grid — equal-size cards, transport lives in Trains. */}
      <div
        role="list"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
          gap: 16,
          alignItems: 'stretch',
        }}
      >
        {days.map((d, i) => {
          const prevCountry = i > 0 ? countryOfStopId(days[i - 1].stop, stopsById) : null;
          const country = countryOfStopId(d.stop, stopsById);
          const isCountryBreak = country !== prevCountry;
          const resolved = d.stop === 'imst' ? 'innsbruck' : d.stop;
          const stopLinkId = stopsById.has(resolved) ? resolved : null;
          return (
            <Fragment key={`${d.date}-${i}`}>
              {isCountryBreak && country && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    margin: i === 0 ? '4px 4px 0' : '12px 4px 0',
                    paddingTop: i === 0 ? 0 : 10,
                    borderTop: i === 0 ? 'none' : '1px dashed var(--border)',
                  }}
                >
                  {country}
                </div>
              )}
              <div role="listitem" style={{ height: '100%' }}>
                <DayCard
                  day={d}
                  journeys={journeys}
                  tint={tintFor(country ?? undefined)}
                  stopLinkId={stopLinkId}
                  hideJourneys
                  placesOnly
                />
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function countryOfStopId(stopId: string, stopsById: Map<string, Stop>): string | null {
  if (stopId === 'ktm') return 'Transit';
  const s = stopsById.get(stopId);
  return (s?.country as string) ?? null;
}
