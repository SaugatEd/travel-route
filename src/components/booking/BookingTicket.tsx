import type { Booking } from '@/types';
import { Ticket, type TicketState } from '@/components/ui/Ticket';
import { tintFor } from '@/lib/country';
import { dayOfWeek, parseCalDate, shortDate } from '@/lib/dates';
import { makeAirbnbSearch } from '@/lib/urls';
import { Link } from '@tanstack/react-router';

interface BookingTicketProps {
  booking: Booking;
  /** "Today" reference for cancel-by urgency. */
  today: Date;
  /** When set, render an internal Link to /book/$id instead of jumping to Airbnb. */
  internalLink?: boolean;
  /** Render as a static card (no wrapping anchor). Use on pages that already
   *  expose the booking link separately, to avoid nesting <a> inside <a>. */
  linkless?: boolean;
}

/** Booking-specific ticket. Composes the generic Ticket primitive. */
export function BookingTicket({ booking: b, today, internalLink = false, linkless = false }: BookingTicketProps) {
  const isTodo = b.status === 'todo';
  const isOptional = b.status === 'optional';
  const cancelDate = !isTodo && b.cancelBy ? parseCalDate(b.cancelBy.date) : null;
  const daysToCancel = cancelDate ? Math.ceil((cancelDate.getTime() - today.getTime()) / 86_400_000) : null;

  const state: TicketState = isTodo || isOptional
    ? 'todo'
    : daysToCancel == null ? 'ok'
      : daysToCancel < 0 ? 'passed'
        : daysToCancel <= 3 ? 'urgent'
          : daysToCancel <= 10 ? 'soon'
            : 'ok';

  const tint = tintFor(b.country);
  const cityHead = b.city.replace(/\s*\(.+\)\s*$/, '');
  const cityTag = (b.city.match(/\(([^)]+)\)/) || [, ''])[1];

  const cancelLabel = isTodo
    ? '📌 Not yet booked — search Airbnb'
    : isOptional
      ? b.cancelBy
        ? `🛏 Temporary · ${refundLabel(b.cancelBy.refundType)} before ${shortDate(b.cancelBy.date)} ${b.cancelBy.time}`
        : '🛏 Temporary booking'
      : !b.cancelBy
        ? ''
        : daysToCancel != null && daysToCancel < 0
          ? '🔒 Reservation locked in'
          : daysToCancel != null && daysToCancel <= 3
            ? `⚠️ Cancel by ${shortDate(b.cancelBy.date)} ${b.cancelBy.time}`
            : `Free cancel until ${shortDate(b.cancelBy.date)}`;

  const todoSearchUrl = isTodo
    ? makeAirbnbSearch({
        city: cityHead,
        checkIn: b.checkIn.date,
        checkOut: b.checkOut.date,
        guests: b.guests || 3,
      })
    : null;

  const externalHref = linkless ? undefined : (b.bookingUrl || todoSearchUrl || undefined);
  const ctaLabel = internalLink ? 'Details →' : bookingCtaLabel(b.bookingUrl, isTodo);

  const header = (
    <>
      <div className="ticket-flag">{b.flag}</div>
      <div className="ticket-titles">
        <div className="ticket-city">{cityHead}</div>
        {cityTag && <div className="ticket-cityqual">{cityTag}</div>}
      </div>
      <div className="ticket-nights" style={{ color: tint.accent, borderColor: tint.accent }}>
        <strong>{b.nights}</strong>
        <span>{b.nights === 1 ? 'night' : 'nights'}</span>
      </div>
    </>
  );

  const middle = (
    <>
      <div className="ticket-stub">
        <div className="ticket-stub-label">Check-in window</div>
        <div className="ticket-stub-day">
          {dayOfWeek(b.checkIn.date)} · {shortDate(b.checkIn.date)}
        </div>
        <div className="ticket-stub-time">
          {b.checkIn.time}
          {b.checkIn.until && <> – {b.checkIn.until}</>}
        </div>
      </div>
      <div className="ticket-arrow" aria-hidden>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="ticket-stub">
        <div className="ticket-stub-label">Check-out by</div>
        <div className="ticket-stub-day">
          {dayOfWeek(b.checkOut.date)} · {shortDate(b.checkOut.date)}
        </div>
        <div className="ticket-stub-time">{b.checkOut.time}</div>
      </div>
    </>
  );

  const meta = (
    <>
      <div className="ticket-meta-row">
        <span className="ticket-meta-key">Host</span>
        <span className="ticket-meta-val">{b.host || '— TBD —'}</span>
      </div>
      <div className="ticket-meta-row">
        <span className="ticket-meta-key">Address</span>
        <span className="ticket-meta-val">{b.address || '— TBD —'}</span>
      </div>
      {b.confirmationCode && (
        <div className="ticket-meta-row">
          <span className="ticket-meta-key">Code</span>
          <span className="ticket-meta-val ticket-mono">{b.confirmationCode}</span>
        </div>
      )}
      {b.mapUrl && (
        <div className="ticket-meta-row">
          <span className="ticket-meta-key">Map</span>
          <span className="ticket-meta-val">
            <a
              href={b.mapUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: tint.accent, textDecoration: 'underline', fontWeight: 600 }}
            >
              📍 View on Google Maps&nbsp;↗
            </a>
          </span>
        </div>
      )}
    </>
  );

  const footer = (
    <>
      <span className={`ticket-cancel ticket-cancel--${state}`}>
        {cancelLabel}
        {!isTodo && b.cancelBy?.refundType === 'partial' && ' · partial only'}
      </span>
      {isTodo
        ? <span className="ticket-cta">Search&nbsp;↗</span>
        : isOptional
          ? externalHref && <span className="ticket-cta">Temporary&nbsp;↗</span>
          : externalHref && <span className="ticket-cta">{ctaLabel}</span>}
    </>
  );

  // Internal-link mode wraps in a router Link to the detail page.
  if (internalLink) {
    return (
      <Link to="/book/$id" params={{ id: b.id }} style={{ textDecoration: 'none' }}>
        <Ticket
          state={state}
          tint={tint}
          header={header}
          title={b.name}
          middle={middle}
          meta={meta}
          footer={footer}
        />
      </Link>
    );
  }

  return (
    <Ticket
      state={state}
      tint={tint}
      header={header}
      title={b.name}
      middle={middle}
      meta={meta}
      footer={footer}
      href={externalHref}
      disabled={!linkless && !externalHref}
    />
  );
}

function bookingCtaLabel(url: string | null, isTodo: boolean): string {
  if (isTodo) return 'Search ↗';
  const lower = url?.toLowerCase() ?? '';
  if (lower.includes('/trips/') || lower.includes('reservation')) return 'Airbnb trip ↗';
  if (lower.includes('airbnb')) return 'Airbnb ↗';
  if (lower.includes('booking.com')) return 'Booking.com ↗';
  return 'Open ↗';
}

function refundLabel(refundType: NonNullable<Booking['cancelBy']>['refundType']) {
  if (refundType === 'full') return 'full refund';
  if (refundType === 'partial') return 'partial refund';
  return 'cancel';
}
