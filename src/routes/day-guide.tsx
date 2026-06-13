import { createFileRoute } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { useCalendar, useStops } from '@/hooks/queries/itinerary';
import { useBookings } from '@/hooks/queries/bookings';
import { Resource } from '@/components/ui/Resource';
import { generateDayGuidePdf } from '@/utils/generatePdf';
import type { CalendarDay, Booking, Stop } from '@/types';

export const Route = createFileRoute('/day-guide')({
  component: DayGuideRoute,
});

function DayGuideRoute() {
  const calendar = useCalendar();
  const stops = useStops();
  const bookings = useBookings();

  return (
    <Resource query={calendar}>
      {(days) => (
        <Resource query={stops}>
          {(allStops) => (
            <Resource query={bookings}>
              {(stays) => <DayGuideView days={days} stops={allStops as Stop[]} stays={stays} />}
            </Resource>
          )}
        </Resource>
      )}
    </Resource>
  );
}

function DayGuideView({ days, stops, stays }: { days: CalendarDay[]; stops: Stop[]; stays: Booking[] }) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 8px 80px' }}>
      <header style={{ padding: '24px 4px 6px' }}>
        <div style={kickerStyle}>Print &amp; go</div>
        <h1 style={titleStyle}>📖 Day-by-Day Tour Guide</h1>
        <p style={introStyle}>
          One full PDF page per trip day — the schedule, where you sleep, and a written
          tour-guide walkthrough of every place you visit: what it is, why it matters,
          what it costs, and the local tricks. Made to be read offline on the train to each stop.
        </p>
        <button
          type="button"
          style={downloadStyle}
          onClick={() => generateDayGuidePdf(days, stops, stays)}
        >
          ⬇ Download the guide ({days.length} days, PDF)
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, paddingTop: 10 }}>
        <ul style={listStyle}>
          {days.map((day, i) => (
            <DayRow key={day.dayN} day={day} stop={stops.find((s) => s.id === day.stop)} first={i === 0} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function DayRow({ day, stop, first }: { day: CalendarDay; stop?: Stop; first: boolean }) {
  const plan = day.plan ?? {};
  const guideNotes = ((stop?.itinerary as { time: string }[] | undefined) ?? []).filter((it) =>
    it.time.startsWith(day.date),
  ).length;
  const parts = [
    plan.transit?.length && `${plan.transit.length} transit leg${plan.transit.length > 1 ? 's' : ''}`,
    plan.visit?.length && `${plan.visit.length} sight${plan.visit.length > 1 ? 's' : ''}`,
    plan.eat?.length && `${plan.eat.length} food stop${plan.eat.length > 1 ? 's' : ''}`,
    guideNotes && `${guideNotes} guide note${guideNotes > 1 ? 's' : ''}`,
  ].filter(Boolean);

  return (
    <li style={{ ...rowStyle, borderTop: first ? 'none' : '1px solid var(--border)' }}>
      <span style={dayBadgeStyle}>Day {day.dayN}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={rowHeadStyle}>
          {day.flag} {day.city}
        </span>
        <span style={rowDetailStyle}>
          {day.date}
          {parts.length > 0 && ` · ${parts.join(' · ')}`}
        </span>
      </span>
    </li>
  );
}

const kickerStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  fontFamily: 'var(--sans)',
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--serif)',
  fontSize: 26,
  margin: '4px 0 8px',
  color: 'var(--text)',
};

const introStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.55,
  color: 'var(--text-muted)',
  fontFamily: 'var(--sans)',
};

const downloadStyle: CSSProperties = {
  marginTop: 16,
  width: '100%',
  maxWidth: 360,
  minHeight: 46,
  padding: '13px 18px',
  fontSize: 14,
  fontWeight: 700,
  fontFamily: 'var(--sans)',
  color: '#fff',
  background: 'var(--accent)',
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  border: '1px solid var(--border)',
  borderRadius: 10,
  background: 'var(--bg-raised)',
  overflow: 'hidden',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 12,
  padding: '9px 13px',
};

const dayBadgeStyle: CSSProperties = {
  flexShrink: 0,
  marginTop: 2,
  padding: '2px 8px',
  fontSize: 11,
  fontWeight: 800,
  fontFamily: 'var(--sans)',
  color: 'var(--accent)',
  border: '1px solid var(--accent)',
  borderRadius: 999,
  whiteSpace: 'nowrap',
};

const rowHeadStyle: CSSProperties = {
  display: 'block',
  fontSize: 13.5,
  fontWeight: 700,
  color: 'var(--text)',
  lineHeight: 1.35,
};

const rowDetailStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  lineHeight: 1.5,
  color: 'var(--text-muted)',
  fontFamily: 'var(--sans)',
};
