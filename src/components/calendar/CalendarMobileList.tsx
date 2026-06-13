import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { CalendarDay } from '@/types';
import './calendar.css';

interface CalendarMobileListProps {
  days: CalendarDay[];
  activeStopId?: string;
  onOpenDay: (day: CalendarDay) => void;
}

const TYPE_META: Record<string, { color: string; label: string }> = {
  explore: { color: '#2F9E44', label: 'Explore' },
  move:    { color: '#E8590C', label: 'Travel day' },
  arrive:  { color: '#1C7ED6', label: 'Arrive' },
  night:   { color: '#6741D9', label: 'Night train' },
  travel:  { color: '#E64980', label: 'Flight' },
  transit: { color: '#E03131', label: 'Transit' },
};

const ACTION_META: Record<string, { color: string; label: string }> = {
  'check-in':  { color: '#2F9E44', label: 'Check-in' },
  'check-out': { color: '#E8590C', label: 'Check-out' },
  stay:        { color: '#1C7ED6', label: 'Stay' },
};

const MONTH_NAMES: Record<string, string> = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', May: 'May', Jun: 'June',
  Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
};

const resolveStop = (id: string) => (id === 'imst' ? 'innsbruck' : id);

const monthOf = (day: CalendarDay) => day.date.split(/\s+/).find((t) => t in MONTH_NAMES);

function chipStyle(color: string): CSSProperties {
  return { color, background: `${color}16`, borderColor: `${color}3a` };
}

function summaryLine(day: CalendarDay): string | null {
  const visit = day.plan?.visit?.[0]?.title;
  if (visit) return `📸 ${visit}`;
  const transit = day.plan?.transit?.[0];
  if (transit) return `🚆 ${transit}`;
  const first = day.summary?.split(' · ')[0]?.trim();
  return first || null;
}

export function CalendarMobileList({ days, activeStopId, onOpenDay }: CalendarMobileListProps) {
  const sorted = useMemo(() => [...days].sort((a, b) => a.dayN - b.dayN), [days]);

  const firstMonth = sorted.length > 0 ? monthOf(sorted[0]) : undefined;
  const finalMonth = sorted.length > 0 ? monthOf(sorted[sorted.length - 1]) : undefined;
  const title = firstMonth && finalMonth
    ? firstMonth === finalMonth
      ? `${MONTH_NAMES[firstMonth]} 2026`
      : `${MONTH_NAMES[firstMonth]} – ${MONTH_NAMES[finalMonth]} 2026`
    : 'Trip calendar';

  let lastMonth = '';

  return (
    <div className="calm">
      <header className="calm-head">
        <h1 className="calm-title">{title}</h1>
        <p className="calm-sub">{sorted.length} days · tap any day for the full plan</p>
      </header>

      <div className="calm-list">
        {sorted.map((day) => {
          const type = TYPE_META[day.type] ?? TYPE_META.explore;
          const monthToken = day.date.split(/\s+/).find((t) => t in MONTH_NAMES);
          const showMonth = monthToken && monthToken !== lastMonth;
          if (monthToken) lastMonth = monthToken;
          const isActive = !!day.stop && resolveStop(day.stop) === activeStopId;
          const sum = summaryLine(day);

          return (
            <div key={`${day.dayN}-${day.date}`}>
              {showMonth && monthToken && (
                <div className="calm-month">{MONTH_NAMES[monthToken]} 2026</div>
              )}
              <button
                type="button"
                className={`calm-day${isActive ? ' is-active' : ''}`}
                style={{ ['--calm-accent' as string]: type.color }}
                onClick={() => onOpenDay(day)}
                aria-label={`Day ${day.dayN}, ${day.date}, ${day.city}`}
              >
                <div className="calm-day-top">
                  <span className="calm-daybadge" style={chipStyle(type.color)}>
                    DAY {day.dayN}
                  </span>
                  <span className="calm-date">{day.date}</span>
                  <span className="calm-chev" aria-hidden>›</span>
                </div>

                <div className="calm-day-title">
                  <span className="flag" aria-hidden>{day.flag}</span>
                  {day.city}
                </div>

                <div className="calm-day-meta">
                  <span className="calm-chip" style={chipStyle(type.color)}>
                    {day.icon} {type.label}
                  </span>
                  {(day.airbnb ?? []).map((a, i) => {
                    const meta = ACTION_META[a.action];
                    if (!meta) return null;
                    return (
                      <span key={`${a.id}-${i}`} className="calm-chip" style={chipStyle(meta.color)}>
                        {meta.label}{a.time ? ` · ${a.time}` : ''}
                      </span>
                    );
                  })}
                </div>

                {sum && <div className="calm-day-sum">{sum}</div>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
