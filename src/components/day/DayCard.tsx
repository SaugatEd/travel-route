import { Link } from '@tanstack/react-router';
import { DayPlanSections, hasPlanContent } from './DayPlanSections';
import { DayNotes } from './DayNotes';
import { makeGoogleMapsDirections } from '@/lib/urls';
import type { CalendarDay, CountryTint, Journey } from '@/types';

interface DayCardProps {
  day: CalendarDay;
  journeys: Journey[];
  tint: CountryTint;
  /** When set, the day's city header links to that stop's overview. */
  stopLinkId?: string | null;
  /** Hide travel legs (flights/trains/transfers) — they live in the Trains & Flights sections. */
  hideJourneys?: boolean;
  /** Country name for the "Full route" jump into the Trains section (e.g. "Italy"). */
  fullRouteCountry?: string;
  /** Fold the "Good to know" overview behind a summary so it doesn't crowd the card. */
  collapsibleNotes?: boolean;
  /** Itinerary mode — show only the ordered list of places to visit, nothing else. */
  placesOnly?: boolean;
}

/**
 * One trip day: header (date · type · city), every real travel leg as a routable
 * strip with a live Google Maps directions button, then the structured plan.
 * Shared by the global itinerary grid and each stop's overview.
 */
export function DayCard({ day, journeys, tint, stopLinkId = null, hideJourneys = false, fullRouteCountry, collapsibleNotes = false, placesOnly = false }: DayCardProps) {
  const bullets = splitSummary(day.summary);
  const dayJourneys = hideJourneys ? [] : journeys.filter((j) => j.date.startsWith(day.date));

  const cityLabel = (
    <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--serif)' }}>
      {day.flag} {day.city}
    </span>
  );

  return (
    <article
      className={stopLinkId ? 'day-card day-card--link' : 'day-card'}
      style={{
        position: 'relative',
        height: '100%',
        border: '1px solid var(--border)',
        borderRadius: 14,
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      {/* Stretched link — clicking anywhere on the card opens this stop (inner links opt out via z-index). */}
      {stopLinkId && (
        <Link
          to="/stop/$id"
          params={{ id: stopLinkId }}
          search={{ view: 'overview' }}
          aria-label={`Open ${day.city} stop`}
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        />
      )}
      <div
        style={{
          padding: '12px 16px',
          background: tint.tint,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: tint.accent,
            background: 'rgba(255,255,255,0.6)',
            padding: '3px 8px',
            borderRadius: 999,
            border: `1px solid ${tint.accent}33`,
          }}
        >
          Day {day.dayN} · {day.date}
        </div>
        <TypeBadge type={day.type} icon={day.icon} accent={tint.accent} />
        {cityLabel}
        {stopLinkId && (
          <span style={{ marginLeft: 'auto', color: tint.accent, fontWeight: 800, fontSize: 14 }} aria-hidden>
            →
          </span>
        )}
      </div>

      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {dayJourneys.length > 0 && (
          <div style={{ position: 'relative', zIndex: 2, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-raised)', overflow: 'hidden' }}>
            {dayJourneys.map((j, i) => (
              <JourneyStrip key={j.id || `${j.from}-${j.to}-${j.date}`} journey={j} divider={i > 0} />
            ))}
            {fullRouteCountry && (
              <Link
                to="/trains"
                hash={`c-${fullRouteCountry.toLowerCase()}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '8px 11px',
                  borderTop: '1px solid var(--border)',
                  fontSize: 12,
                  fontWeight: 800,
                  color: tint.accent,
                  background: `${tint.accent}0D`,
                  textDecoration: 'none',
                }}
              >
                🚄 Full route &amp; tickets →
              </Link>
            )}
          </div>
        )}

        {placesOnly ? (
          <PlacesList plan={day.plan} accent={tint.accent} />
        ) : (
          <>
            {hasPlanContent(day.plan) ? (
              <DayPlanSections plan={day.plan} accent={tint.accent} hideTransit={hideJourneys || dayJourneys.length > 0} />
            ) : (
              bullets.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {bullets.map((b, i) => (
                    <li key={i} style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text)', paddingLeft: 16, position: 'relative' }}>
                      <span aria-hidden style={{ position: 'absolute', left: 0, top: 8, width: 5, height: 5, borderRadius: 999, background: tint.accent }} />
                      {b}
                    </li>
                  ))}
                </ul>
              )
            )}

            {collapsibleNotes ? (
              <div style={{ position: 'relative', zIndex: 2 }}>
                <DayNotes dayN={day.dayN} accent={tint.accent} collapsible />
              </div>
            ) : (
              <DayNotes dayN={day.dayN} accent={tint.accent} />
            )}
          </>
        )}
      </div>
    </article>
  );
}

/* ─── Itinerary mode: just the places to visit, in order ─── */
function PlacesList({ plan, accent }: { plan: CalendarDay['plan']; accent: string }) {
  const places = plan?.visit ?? [];
  if (places.length === 0) return null;
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
      {places.map((p, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span
            style={{
              flexShrink: 0,
              width: 20,
              height: 20,
              borderRadius: 999,
              background: `${accent}18`,
              color: accent,
              fontSize: 11,
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              marginTop: 1,
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{p.title}</span>
        </li>
      ))}
    </ol>
  );
}

/* ─── Type badge (travel / explore / move / night / arrive) ─── */
function TypeBadge({ type, icon, accent }: { type: string; icon: string; accent: string }) {
  const colour = {
    travel:  '#7C3AED',
    arrive:  '#0EA5E9',
    move:    '#F59E0B',
    explore: '#10B981',
    night:   '#6366F1',
    transit: '#EF4444',
  }[type] || accent;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#fff',
        background: colour,
        padding: '3px 9px',
        borderRadius: 999,
      }}
    >
      {icon} {type}
    </span>
  );
}

/* ─── One travel leg — compact two-line row inside the legs box ──── */
function JourneyStrip({ journey: j, divider = false }: { journey: Journey; divider?: boolean }) {
  const time = j.date.match(/\d{2}:\d{2}/)?.[0];
  const isFlight = j.type === 'flight';
  const isBus = j.type === 'flixbus';
  const label = isFlight ? 'FLIGHT' : isBus ? 'NIGHT BUS' : 'TRANSPORT';
  const labelBg = isFlight ? '#7C3AED' : isBus ? '#16A34A' : '#2563EB';
  const directionsUrl = isFlight
    ? null
    // Walking/driving routes render from downloaded offline maps; transit needs a live connection.
    : makeGoogleMapsDirections({ origin: j.from, destination: j.to, mode: j.type === 'walk' ? 'walking' : 'driving' });

  return (
    <div style={{ padding: '8px 11px', borderTop: divider ? '1px solid var(--border)' : undefined }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span
          style={{
            flexShrink: 0,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.06em',
            color: '#fff',
            background: labelBg,
            padding: '2px 6px',
            borderRadius: 4,
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        {time && (
          <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)' }}>
            {time}
          </span>
        )}
        <span
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 12.5,
            fontWeight: 700,
            color: 'var(--text)',
          }}
        >
          {j.via.replace(/^🚌\s*/, '')}
        </span>
        {directionsUrl && (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noreferrer"
            style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#2563EB', textDecoration: 'none', whiteSpace: 'nowrap', padding: '8px 4px', margin: '-8px -4px' }}
          >
            Directions ↗
          </a>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>
        {j.from} → {j.to} · {j.dur} · {j.cost}
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */
function splitSummary(summary: string | undefined): string[] {
  if (!summary) return [];
  return summary
    .split(/\s+·\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

