import { Link } from '@tanstack/react-router';
import { tintFor } from '@/lib/country';

export interface StopPlanItem {
  time?: string;
  icon?: string;
  title?: string;
  desc?: string;
  tip?: string;
}

interface StopPlanProps {
  city: string;
  country?: string;
  itinerary?: StopPlanItem[];
}

/** Splits an itinerary `time` like "Tue 16 Jun · 14:00" into a date group + clock. */
function splitTime(t?: string): { date: string | null; clock: string } {
  if (!t) return { date: null, clock: '' };
  const m = t.match(/^((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+\d+\s+\w+)\s*·\s*(.+)$/);
  if (m) return { date: m[1], clock: m[2] };
  return { date: null, clock: t };
}

/** "Day-by-day plan" — the detailed, timed itinerary for this stop: when to go,
 *  what to see, what it is, and how it works. Pure STOPS `itinerary` data. */
export function StopPlan({ city, country, itinerary }: StopPlanProps) {
  if (!itinerary || itinerary.length === 0) return null;
  const tint = tintFor(country);

  const groups: { date: string | null; items: { clock: string; v: StopPlanItem }[] }[] = [];
  for (const v of itinerary) {
    const { date, clock } = splitTime(v.time);
    const last = groups[groups.length - 1];
    if (!last || (date && date !== last.date)) {
      groups.push({ date, items: [{ clock, v }] });
    } else {
      last.items.push({ clock, v });
    }
  }

  return (
    <div className="panel" style={{ padding: 24 }}>
      <div className="section-header">
        <h2 className="section-title">Day-by-day plan in {city}</h2>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          The timed plan at a glance — tap a step for the details
        </span>
      </div>

      {groups.map((g, gi) => (
        <div key={gi} style={{ marginTop: gi === 0 ? 6 : 18 }}>
          {g.date && (
            <div className="plan-date" style={{ color: tint.accent }}>
              {g.date}
            </div>
          )}
          <ol className="plan-timeline">
            {g.items.map(({ clock, v }, i) => (
              <li key={i} className="plan-item">
                <span className="plan-clock" style={{ color: tint.accent }}>
                  {clock || '·'}
                </span>
                <div className="plan-body">
                  {v.desc || v.tip ? (
                    <details className="plan-detail">
                      <summary className="plan-title">
                        <span>{v.icon ? `${v.icon} ` : ''}{v.title}</span>
                        <span className="plan-more" style={{ color: tint.accent }}>Details</span>
                      </summary>
                      {v.desc && <div className="plan-desc">{v.desc}</div>}
                      {v.tip && <div className="plan-tip">💡 {v.tip}</div>}
                    </details>
                  ) : (
                    <div className="plan-title">
                      {v.icon ? `${v.icon} ` : ''}
                      {v.title}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      ))}

      <div style={{ marginTop: 18 }}>
        <Link
          to="/itinerary"
          style={{ fontSize: 13, fontWeight: 700, color: tint.accent, textDecoration: 'none' }}
        >
          View the full trip itinerary →
        </Link>
      </div>
    </div>
  );
}
