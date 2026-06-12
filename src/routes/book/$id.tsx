import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { useBooking } from '@/hooks/queries/bookings';
import { BookingTicket } from '@/components/booking/BookingTicket';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { tintFor } from '@/lib/country';
import { TRIP_ROUTE, minutesBetween, formatGap, type RouteStop } from '@/data/stopCoords';
import type { Booking, BookingStayInfoItem, CancellationPolicyStep } from '@/types';

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
  const info = b.stayInfo;
  const hasDetail =
    Boolean(b.directionsUrl) ||
    Boolean(info?.checkInOut?.length || info?.duringStay?.length || info?.additionalRules?.length) ||
    Boolean(b.cancellationPolicy?.length) ||
    Boolean(route);

  return (
    <div className="book-detail">
      <Link to="/book" className="book-back">← All bookings</Link>

      <header className="book-head">
        <h1 className="book-title" style={{ color: tint.accent }}>
          {b.flag} {b.city}
        </h1>
        <p className="book-sub">{b.name}</p>
        <div className="book-meta">
          <MetaPill>{b.nights} {b.nights === 1 ? 'night' : 'nights'}</MetaPill>
          <MetaPill>{b.checkIn.date} → {b.checkOut.date}</MetaPill>
          <MetaPill>{b.guests} {b.guests === 1 ? 'guest' : 'guests'}</MetaPill>
          {b.host && <MetaPill>Host · {b.host}</MetaPill>}
          {b.selfCheckIn !== undefined && (
            <span
              className="book-meta-pill"
              style={
                b.selfCheckIn
                  ? { color: '#166534', background: 'rgba(22,101,52,0.10)', borderColor: 'rgba(22,101,52,0.28)' }
                  : { color: '#9A3412', background: 'rgba(154,52,18,0.10)', borderColor: 'rgba(154,52,18,0.28)' }
              }
            >
              {b.selfCheckIn ? '🔑 Self check-in' : '🛎 Reception'}
              {b.selfCheckIn && b.checkInMethod ? ` · ${b.checkInMethod}` : ''}
            </span>
          )}
        </div>
      </header>

      <div className={`book-grid${hasDetail ? '' : ' book-grid--single'}`}>
        <aside className="book-aside">
          <BookingTicket booking={b} today={today} linkless />
          <BookingActions booking={b} accent={tint.accent} />
        </aside>

        {hasDetail && (
          <div className="book-main">
            <ArrivalRoute booking={b} accent={tint.accent} />
            {route && <ArrivalPlan route={route} accent={tint.accent} />}
            <StayInformation booking={b} />
            <CancellationPolicy booking={b} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Reusable panel ───────────────────────────────────────────── */
function Panel({ label, action, children, wide }: { label: string; action?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`book-panel${wide ? ' book-panel--wide' : ''}`}>
      <div className="book-panel-head">
        <span className="book-panel-label">{label}</span>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetaPill({ children }: { children: ReactNode }) {
  return <span className="book-meta-pill">{children}</span>;
}

/* ─── Getting there — physical route from airport/station to the door ── */
function ArrivalRoute({ booking: b, accent }: { booking: Booking; accent: string }) {
  const origin = b.directionsUrl ? parseRouteOrigin(b.directionsUrl) : null;
  if (!origin || !b.directionsUrl) return null;

  let originRaw = '';
  let destination = '';
  try {
    const p = new URL(b.directionsUrl).searchParams;
    originRaw = p.get('origin') ?? '';
    destination = p.get('destination') ?? '';
  } catch {
    return null;
  }
  // Live route preview (classic no-key embed) + directions from the device's current location.
  const embedUrl = `https://maps.google.com/maps?saddr=${encodeURIComponent(originRaw)}&daddr=${encodeURIComponent(destination)}&output=embed`;
  const fromMeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking`;

  return (
    <Panel label="Getting there">
      <div className="route-map">
        <div className="route-stop">
          <span className="route-icon">{origin.icon}</span>
          <div className="route-text">
            <div className="route-kicker">Arrive at</div>
            <div className="route-place">{origin.label}</div>
          </div>
        </div>

        <div className="route-link">
          <span className="route-mode" style={{ color: accent, borderColor: `${accent}55` }}>
            {origin.mode.icon} {origin.mode.label}
          </span>
        </div>

        <div className="route-stop">
          <span className="route-icon route-icon--to" style={{ background: `${accent}16`, color: accent, borderColor: `${accent}44` }}>
            🏠
          </span>
          <div className="route-text">
            <div className="route-kicker">Your stay</div>
            <div className="route-place">{b.name}</div>
            {b.address && <div className="route-addr">{b.address}</div>}
          </div>
        </div>
      </div>

      {destination && (
        <iframe
          title={`Route to ${b.name}`}
          src={embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ width: '100%', height: 200, border: 0, borderRadius: 12, margin: '12px 0', display: 'block' }}
        />
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <a
          href={b.directionsUrl}
          target="_blank"
          rel="noreferrer"
          style={{ flex: '1 1 150px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 40, padding: '9px 14px', borderRadius: 10, background: accent, color: '#fff', fontSize: 13, fontWeight: 800, textDecoration: 'none' }}
        >
          Open route in Google Maps →
        </a>
        {destination && (
          <a
            href={fromMeUrl}
            target="_blank"
            rel="noreferrer"
            style={{ flex: '1 1 150px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 40, padding: '9px 14px', borderRadius: 10, background: 'var(--bg-raised)', color: accent, border: `1.5px solid ${accent}55`, fontSize: 13, fontWeight: 800, textDecoration: 'none' }}
          >
            📍 From my location →
          </a>
        )}
      </div>
    </Panel>
  );
}

/* ─── Things to know ───────────────────────────────────────────── */
function StayInformation({ booking: b }: { booking: Booking }) {
  const info = b.stayInfo;
  if (!info) return null;
  const hasDetails =
    Boolean(info.checkInOut?.length) || Boolean(info.duringStay?.length) || Boolean(info.additionalRules?.length);
  if (!hasDetails) return null;

  return (
    <Panel label="Things to know">
      <StayInfoGroup title="Checking in & out" items={info.checkInOut} />
      <StayInfoGroup title="During your stay" items={info.duringStay} />
      {info.additionalRules?.length ? (
        <div className="stay-group">
          <div className="stay-group-title">House rules</div>
          <ul className="stay-rules">
            {info.additionalRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}

function StayInfoGroup({ title, items }: { title: string; items?: BookingStayInfoItem[] }) {
  if (!items?.length) return null;
  return (
    <div className="stay-group">
      <div className="stay-group-title">{title}</div>
      <div className="stay-info-grid">
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className="stay-info-tile">
            <div className="stay-info-label">{item.label}</div>
            <div className="stay-info-value">{item.value}</div>
            {item.detail && <div className="stay-info-detail">{item.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Cancellation policy ──────────────────────────────────────── */
function CancellationPolicy({ booking: b }: { booking: Booking }) {
  const rows = b.cancellationPolicy ?? [];
  if (rows.length === 0) return null;

  return (
    <Panel label="Cancellation policy">
      <ol className="cancel-track">
        {rows.map((row) => (
          <li key={`${row.phase}-${row.date}-${row.time}-${row.title}`} className="cancel-step">
            <span className="cancel-node" style={{ background: refundColor(row.refundType) }} aria-hidden />
            <div className="cancel-when">
              <div className="cancel-phase">{row.phase}</div>
              <div className="cancel-date">
                {stripWeekday(row.date)} · {row.time}
              </div>
            </div>
            <div className="cancel-body">
              <div className="cancel-title" style={{ color: refundColor(row.refundType) }}>
                {row.title}
              </div>
              <div className="cancel-detail">{row.detail}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="cancel-foot">Times shown are based on the listing location.</div>
    </Panel>
  );
}

/* ─── Arrival plan — arrival vs check-in timing ────────────────── */
function ArrivalPlan({ route, accent }: { route: RouteStop; accent: string }) {
  const gap = minutesBetween(route.checkInTime, route.arriveTime);
  const hasGap = gap != null && gap > 30;
  const isLate = gap != null && gap < 0;
  const onTime = gap != null && gap >= 0 && gap <= 30;

  return (
    <Panel label="Arrival timing">
      <div className="arrive-strip">
        <TimeBlock label="Arrive" value={route.arriveTime ?? '—'} accent={accent} />
        <span className="arrive-arrow" aria-hidden>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <TimeBlock label="Check-in" value={route.checkInTime ?? '—'} accent={accent} />
      </div>

      {gap != null && (
        <div className={`arrive-note arrive-note--${hasGap ? 'wait' : isLate ? 'early' : 'ontime'}`}>
          {hasGap && (
            <>⏱ <strong>{formatGap(gap)} between arrival and check-in.</strong> Drop bags first, then explore.</>
          )}
          {isLate && (
            <>✓ Arriving <strong>{formatGap(-gap)} after check-in opens.</strong> Walk straight to the door.</>
          )}
          {onTime && <>✓ Arriving <strong>right around check-in.</strong> Head straight to the flat.</>}
        </div>
      )}

      {route.luggage && (
        <div className="arrive-luggage">
          <div className="arrive-luggage-head">
            <span aria-hidden>🎒</span> Where to drop bags
          </div>
          <div className="arrive-luggage-place">
            {route.luggage.place} <span>· {route.luggage.cost}</span>
          </div>
          {route.luggage.notes && <div className="arrive-luggage-note">{route.luggage.notes}</div>}
        </div>
      )}
    </Panel>
  );
}

function TimeBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="arrive-time">
      <div className="arrive-time-label">{label}</div>
      <div className="arrive-time-value" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

/* ─── Booking actions ──────────────────────────────────────────── */
type BookingActionLink = { href: string; icon: string; title: string; detail: string; primary: boolean };

function BookingActions({ booking: b, accent }: { booking: Booking; accent: string }) {
  const actions = [
    b.pdfUrl && {
      href: `${import.meta.env.BASE_URL}${b.pdfUrl}`,
      icon: '📄',
      title: 'Booking PDF',
      detail: b.confirmationCode ? `Confirmation ${b.confirmationCode}` : 'Open the saved confirmation',
      primary: true,
    },
    b.bookingUrl && {
      href: b.bookingUrl,
      icon: providerIcon(b.bookingUrl),
      title: providerTitle(b.bookingUrl),
      detail: b.confirmationCode ? `Confirmation ${b.confirmationCode}` : 'Open reservation details',
      primary: !b.pdfUrl,
    },
    b.mapUrl && {
      href: b.mapUrl,
      icon: '📍',
      title: 'Google Maps pin',
      detail: 'Open saved location',
      primary: false,
    },
  ].filter((action): action is BookingActionLink => Boolean(action));

  if (actions.length === 0) return null;

  return (
    <div className="book-actions">
      {actions.map((action) => (
        <a
          key={`${action.title}-${action.href}`}
          href={action.href}
          target="_blank"
          rel="noreferrer"
          className={`book-action${action.primary ? ' book-action--primary' : ''}`}
          style={action.primary ? { borderColor: accent, background: `${accent}10` } : undefined}
        >
          <span className="book-action-icon" aria-hidden>{action.icon}</span>
          <span className="book-action-text">
            <span className="book-action-title" style={action.primary ? { color: accent } : undefined}>
              {action.title}
            </span>
            <span className="book-action-detail">{action.detail}</span>
          </span>
          <span
            className="book-action-cta"
            style={{ background: action.primary ? accent : 'var(--bg-raised)', color: action.primary ? '#fff' : accent, borderColor: `${accent}44` }}
          >
            Open →
          </span>
        </a>
      ))}
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────────────── */
type RouteOrigin = { label: string; icon: string; mode: { icon: string; label: string } };

function parseRouteOrigin(directionsUrl: string): RouteOrigin | null {
  let origin: string | null = null;
  let travelmode = 'transit';
  try {
    const params = new URL(directionsUrl).searchParams;
    origin = params.get('origin');
    travelmode = params.get('travelmode') ?? 'transit';
  } catch {
    return null;
  }
  if (!origin) return null;
  return { label: origin, icon: originIcon(origin), mode: travelMode(travelmode) };
}

function originIcon(origin: string) {
  if (/airport|international/i.test(origin)) return '✈️';
  if (/station|bahnhof|hbf|termini|nádraží|centraal|gare/i.test(origin)) return '🚉';
  return '📍';
}

function travelMode(mode: string) {
  if (mode === 'driving') return { icon: '🚕', label: 'By cab or shuttle' };
  if (mode === 'walking') return { icon: '🚶', label: 'On foot' };
  return { icon: '🚆', label: 'By train or transit' };
}

function refundColor(refundType: CancellationPolicyStep['refundType']) {
  if (refundType === 'full') return '#166534';
  if (refundType === 'partial') return '#B45309';
  if (refundType === 'none') return '#7C2D12';
  return 'var(--text)';
}

function stripWeekday(date: string) {
  return date.replace(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+/, '');
}

function providerIcon(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes('airbnb')) return '🔗';
  if (lower.includes('booking.com')) return '🏨';
  return '↗';
}

function providerTitle(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes('airbnb')) return 'Airbnb reservation';
  if (lower.includes('booking.com')) return 'Booking.com reservation';
  return 'Reservation details';
}
