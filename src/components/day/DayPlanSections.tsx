import './day.css';
import type { DayPlan, DayPlanItem } from '@/types';

interface DayPlanSectionsProps {
  plan: DayPlan;
  accent: string;
  /** Hide the transit block when the surface already renders journey strips. */
  hideTransit?: boolean;
}

export function hasPlanContent(plan: DayPlan | undefined): plan is DayPlan {
  if (!plan) return false;
  return Boolean(plan.transit?.length || plan.visit?.length || plan.logistics?.length);
}

/**
 * Renders one day's plan as cleanly separated zones — movement (Getting around),
 * See & Do, and a muted logistics line. Eat and accommodation check-in/out are
 * intentionally absent; the traveller sorts food out themselves.
 */
export function DayPlanSections({ plan, accent, hideTransit = false }: DayPlanSectionsProps) {
  const tint = `${accent}14`;

  return (
    <div className="dayplan">
      {!hideTransit && plan.transit && plan.transit.length > 0 && (
        <section className="dayplan-sec">
          <div className="dayplan-label" style={{ color: accent }}>
            <span aria-hidden>🚆</span> Getting around
          </div>
          <ul className="dayplan-transit">
            {plan.transit.map((leg, i) => (
              <li key={i}>{leg}</li>
            ))}
          </ul>
        </section>
      )}

      {plan.visit && plan.visit.length > 0 && (
        <PlanItemSection label="See & Do" icon="📸" accent={accent} tint={tint} items={plan.visit} />
      )}

      {plan.logistics && plan.logistics.length > 0 && (
        <section className="dayplan-sec">
          <div className="dayplan-label dayplan-label--muted">
            <span aria-hidden>🧳</span> Logistics
          </div>
          <ul className="dayplan-logistics">
            {plan.logistics.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PlanItemSection({
  label,
  icon,
  accent,
  tint,
  items,
}: {
  label: string;
  icon: string;
  accent: string;
  tint: string;
  items: DayPlanItem[];
}) {
  return (
    <section className="dayplan-sec">
      <div className="dayplan-label" style={{ color: accent }}>
        <span aria-hidden>{icon}</span> {label}
      </div>
      <ul className="dayplan-items">
        {items.map((item, i) => (
          <li key={i} className="dayplan-item">
            <div className="dayplan-item-head">
              {item.time && (
                <span className="dayplan-time" style={{ color: accent, background: tint }}>
                  {item.time}
                </span>
              )}
              <span className="dayplan-item-title">{item.title}</span>
              {item.booked && (
                <span className="dayplan-booked" style={{ color: accent, borderColor: `${accent}55` }}>
                  booked
                </span>
              )}
            </div>
            {item.note && <div className="dayplan-item-note">{item.note}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
