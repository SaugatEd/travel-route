import type { CSSProperties, ReactNode, MouseEventHandler } from 'react';
import type { CountryTint } from '@/types';

export type TicketState = 'ok' | 'soon' | 'urgent' | 'passed' | 'todo';

interface TicketProps {
  /** Visual state (border/halo). */
  state: TicketState;
  /** Country palette — accent colour, tint, flag stripe. */
  tint: CountryTint;
  /** Top-row content (typically flag + city + nights badge). */
  header: ReactNode;
  /** Headline (listing name / stay name). */
  title: ReactNode;
  /** Optional middle band (dates, stubs). */
  middle?: ReactNode;
  /** Meta rows (host, address, code, map). */
  meta?: ReactNode;
  /** Footer (cancel-by + CTA). */
  footer?: ReactNode;
  /** Wrapping link. */
  href?: string;
  /** Disable click. */
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLDivElement>;
}

/**
 * Generic boarding-pass / receipt layout with a coloured strip on the left.
 * Knows nothing about bookings — composers (BookingTicket, etc.) supply
 * the slots.
 */
export function Ticket({
  state,
  tint,
  header,
  title,
  middle,
  meta,
  footer,
  href,
  disabled,
  className = '',
  onClick,
}: TicketProps) {
  const wrapperStyle: CSSProperties | undefined =
    state === 'todo'
      ? { borderStyle: 'dashed', opacity: 0.92 }
      : disabled
        ? { pointerEvents: 'none', opacity: 0.85 }
        : undefined;

  const inner = (
    <>
      <div className="ticket-body" style={{ background: tint.tint }}>
        <div className="ticket-head">{header}</div>
        <div className="ticket-name">{title}</div>
        {middle && <div className="ticket-dates">{middle}</div>}
        {meta && <div className="ticket-meta">{meta}</div>}
        {footer && <div className="ticket-foot">{footer}</div>}
      </div>
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        onClick={onClick as MouseEventHandler<HTMLAnchorElement>}
        className={`ticket ticket--${state} ${className}`.trim()}
        style={wrapperStyle}
      >
        {inner}
      </a>
    );
  }
  return (
    <div
      className={`ticket ticket--${state} ${className}`.trim()}
      style={wrapperStyle}
      onClick={onClick as MouseEventHandler<HTMLDivElement>}
    >
      {inner}
    </div>
  );
}
