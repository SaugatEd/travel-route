import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Link } from '@tanstack/react-router';
import { parseCalDate } from '@/lib/dates';
import type { Booking, CalendarDay } from '@/types';

interface CalendarDayDialogProps {
  day: CalendarDay;
  bookings: Booking[];
  onClose: () => void;
}

const TYPE_STYLE: Record<string, { dot: string; glow: string }> = {
  explore: { dot: '#4CAF50', glow: 'rgba(76,175,80,0.10)' },
  move:    { dot: '#FF9800', glow: 'rgba(255,152,0,0.10)' },
  arrive:  { dot: '#64B5F6', glow: 'rgba(100,181,246,0.12)' },
  night:   { dot: '#9575CD', glow: 'rgba(149,117,205,0.12)' },
  travel:  { dot: '#F06292', glow: 'rgba(240,98,146,0.10)' },
  transit: { dot: '#EF4444', glow: 'rgba(239,68,68,0.10)' },
};

const ACTION_LABEL: Record<string, string> = {
  'check-in': 'CHECK-IN',
  'check-out': 'CHECK-OUT',
  stay: 'STAY',
};

const linkBtn: CSSProperties = {
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  minHeight: 44,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg-raised)',
  color: 'var(--text)',
  textDecoration: 'none',
  fontSize: 13,
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const resolveStop = (id: string) => (id === 'imst' ? 'innsbruck' : id);

export function CalendarDayDialog({ day, bookings, onClose }: CalendarDayDialogProps) {
  const s = TYPE_STYLE[day.type] ?? TYPE_STYLE.explore;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    closeRef.current?.focus();
    const y = window.scrollY;
    const { position, top, left, right, width, overflow } = document.body.style;
    Object.assign(document.body.style, {
      position: 'fixed',
      top: `-${y}px`,
      left: '0',
      right: '0',
      width: '100%',
      overflow: 'hidden',
    });
    return () => {
      Object.assign(document.body.style, { position, top, left, right, width, overflow });
      window.scrollTo({ top: y, behavior: 'instant' });
    };
  }, []);

  const bookingsById = useMemo(() => {
    const m = new Map<string, Booking>();
    for (const b of bookings) m.set(b.id, b);
    return m;
  }, [bookings]);

  const dt = parseCalDate(day.date);
  const dayNum = dt ? dt.getDate() : '';
  const monShort = dt ? dt.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '';
  const dowShort = dt ? dt.toLocaleString('en-US', { weekday: 'short' }).toUpperCase() : '';

  const actions = day.airbnb ?? [];
  const resolvedStop = day.stop ? resolveStop(day.stop) : '';
  const hasStop = !!resolvedStop && resolvedStop !== 'ktm';
  const bookingId = actions.map((a) => a.id).find((id) => bookingsById.has(id));

  return (
    <div className="caldlg-overlay" onClick={onClose}>
      <div
        className="caldlg"
        role="dialog"
        aria-modal="true"
        aria-label={`Day ${day.dayN} — ${day.city}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — date + from → to */}
        <div
          className="caldlg-head"
          style={{ background: `linear-gradient(${s.glow}, ${s.glow}), var(--bg-raised)`, borderColor: s.dot }}
        >
          <div className="caldlg-datebox" style={{ borderColor: s.dot, color: s.dot }}>
            <div className="caldlg-datebox-dow">{dowShort}</div>
            <div className="caldlg-datebox-num">{dayNum}</div>
            <div className="caldlg-datebox-mon">{monShort}</div>
          </div>
          <div className="caldlg-titles">
            <div className="caldlg-tags">
              <span className="caldlg-tag" style={{ color: s.dot, background: s.glow, borderColor: `${s.dot}55` }}>
                {day.type}
              </span>
              {day.move && <span className="caldlg-tag caldlg-tag--travel">✈ travel day</span>}
              <span className="caldlg-tag-faint">Day {day.dayN}</span>
            </div>
            <div className="caldlg-city">
              <span aria-hidden>{day.flag}</span>
              <span>{day.city}</span>
            </div>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="caldlg-close">✕</button>
        </div>

        <div className="caldlg-body">
          {/* Check-in / Check-out only */}
          <section className="caldlg-section">
            <div className="caldlg-section-title">Check-in / Check-out</div>
            {actions.length > 0 ? (
              <div className="caldlg-airbnb-list">
                {actions.map((a, i) => {
                  const b = bookingsById.get(a.id);
                  const variant = a.action === 'check-out' ? 'out' : a.action === 'stay' ? 'stay' : 'in';
                  const time = a.time ?? (b ? (a.action === 'check-out' ? b.checkOut.time : b.checkIn.time) : '');
                  const meta = b ? [b.city, b.address].filter(Boolean).join(' · ') : '';
                  return (
                    <div key={`${a.id}-${i}`} className={`caldlg-airbnb caldlg-airbnb--${variant}`}>
                      <div className="caldlg-airbnb-time">
                        <span className="caldlg-airbnb-action">{ACTION_LABEL[a.action]}</span>
                        {time && <span className="caldlg-airbnb-clock">{time}</span>}
                      </div>
                      <div className="caldlg-airbnb-info">
                        <div className="caldlg-airbnb-name">{b ? `${b.flag} ${b.name}` : a.id}</div>
                        {meta && <div className="caldlg-airbnb-meta">{meta}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                No check-in or check-out today.
              </div>
            )}
          </section>

          {/* Links */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/itinerary" style={linkBtn} onClick={onClose}>
              📋 Itinerary
            </Link>
            {bookingId ? (
              <Link to="/book/$id" params={{ id: bookingId }} style={linkBtn} onClick={onClose}>
                🔖 Book
              </Link>
            ) : (
              <Link to="/book" style={linkBtn} onClick={onClose}>
                🔖 Book
              </Link>
            )}
            {hasStop && (
              <Link
                to="/stop/$id"
                params={{ id: resolvedStop }}
                search={{ view: 'overview' }}
                style={{ ...linkBtn, color: 'var(--accent)', borderColor: 'var(--accent-border)', background: 'var(--accent-bg)' }}
                onClick={onClose}
              >
                📍 Stop
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
