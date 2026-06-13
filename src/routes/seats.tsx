import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { SEAT_TIPS, EITHER_SIDE, type SeatTip } from '@/data/seatData';
import { FLIGHT_BOOKING } from '@/data/flights';
import { PASS_VERDICTS, PASS_INTRO, PASS_AS_OF, type PassVerdict, type PassWorth } from '@/data/passes';

export const Route = createFileRoute('/seats')({
  component: SeatPassPage,
});

const MODE: Record<SeatTip['mode'], { icon: string; color: string; label: string }> = {
  flight: { icon: '✈️', color: '#7C3AED', label: 'Flight' },
  train: { icon: '🚆', color: '#166534', label: 'Train' },
  bus: { icon: '🚌', color: '#16A34A', label: 'Bus' },
};

type Tab = 'seats' | 'passes';

function SeatPassPage() {
  const [tab, setTab] = useState<Tab>('seats');

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 12px 72px' }}>
      <header style={{ padding: '28px 4px 12px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, margin: '0 0 6px', color: 'var(--text)' }}>
          💺 Seat &amp; Pass
        </h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)' }}>
          Which side to sit for the view — and whether a day pass beats buying tickets that day.
        </p>
      </header>

      <div role="tablist" style={{ display: 'flex', gap: 8, padding: '6px 4px 16px' }}>
        <TabButton active={tab === 'seats'} onClick={() => setTab('seats')}>🪟 Best seats</TabButton>
        <TabButton active={tab === 'passes'} onClick={() => setTab('passes')}>🎟 Day passes</TabButton>
      </div>

      {tab === 'seats' ? <SeatsPanel /> : <PassesPanel />}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        minHeight: 44,
        padding: '12px 18px',
        borderRadius: 999,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'var(--accent-bg, rgba(193,127,36,0.08))' : 'var(--bg-raised)',
        color: active ? 'var(--accent)' : 'var(--text-muted)',
        fontSize: 13,
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: 'var(--sans)',
      }}
    >
      {children}
    </button>
  );
}

/* ─── Tab 1: best seats (seat shown on the left rail of each ride) ─── */
function SeatsPanel() {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SEAT_TIPS.map((t) => (
          <SeatCard key={t.leg} t={t} />
        ))}
      </div>
      <p style={{ marginTop: 18, padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: '1px solid var(--border)', fontSize: 12.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
        🪟 {EITHER_SIDE}
      </p>
    </>
  );
}

function SeatCard({ t }: { t: SeatTip }) {
  const m = MODE[t.mode];
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        border: '1px solid var(--border)',
        borderRadius: 12,
        background: 'var(--bg-raised)',
        overflow: 'hidden',
      }}
    >
      {/* Seat — left rail */}
      <div
        style={{
          flexShrink: 0,
          width: 'clamp(78px, 24vw, 116px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 4,
          padding: '13px 6px',
          background: `${m.color}12`,
          borderRight: `1px solid ${m.color}33`,
          textAlign: 'center',
        }}
      >
        <span aria-hidden style={{ fontSize: 20 }}>{m.icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: m.color, lineHeight: 1.25 }}>💺 {t.seat}</span>
      </div>

      {/* Ride details — right */}
      <div style={{ flex: 1, minWidth: 0, padding: '11px 14px' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{t.leg}</div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>{t.service}</div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 7, lineHeight: 1.5 }}>{t.view}</div>
        {t.seatRef && <YourSeats seatRef={t.seatRef} color={m.color} />}
      </div>
    </div>
  );
}

/** Seat letter → side of the plane (A/B/C = left, D/E = middle, F/J/K = right). */
function seatSide(seat: string): { side: 'left' | 'middle' | 'right'; window: boolean } {
  const letter = seat.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (letter === 'A') return { side: 'left', window: true };
  if (letter === 'B' || letter === 'C') return { side: 'left', window: false };
  if (letter === 'D' || letter === 'E') return { side: 'middle', window: false };
  return { side: 'right', window: letter === 'F' || letter === 'K' || letter === 'J' };
}

const firstName = (n: string) => n.split(' ')[0];

function YourSeats({ seatRef, color }: { seatRef: NonNullable<SeatTip['seatRef']>; color: string }) {
  const leg = seatRef.leg === 'outbound' ? FLIGHT_BOOKING.outbound : FLIGHT_BOOKING.return;
  const seatFor = (p: (typeof FLIGHT_BOOKING.passengers)[number], si: number) => {
    const list = seatRef.leg === 'outbound' ? p.outboundSeats : p.returnSeats;
    return list.find((s) => s.segmentIndex === si)?.seat ?? '—';
  };

  const viewSeats = FLIGHT_BOOKING.passengers.map((p) => ({ name: p.name, seat: seatFor(p, seatRef.segment) }));
  const win = viewSeats.find((s) => seatSide(s.seat).window);
  const viewTo = leg.segments[seatRef.segment].to.city;

  return (
    <div style={{ marginTop: 9, padding: '8px 10px', borderRadius: 9, background: `${color}0F`, border: `1px solid ${color}33` }}>
      <div style={{ fontSize: 11, fontWeight: 800, color, marginBottom: 4 }}>🎫 Your booked seats · both hops</div>

      {leg.segments.map((seg, si) => {
        const isView = si === seatRef.segment;
        return (
          <div key={si} style={{ marginTop: si === 0 ? 4 : 9 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
              {seg.from.city} → {seg.to.city} · {seg.flightNo}
              {isView && <span style={{ color, fontWeight: 800 }}> · view side ✓</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {FLIGHT_BOOKING.passengers.map((p) => {
                const seat = seatFor(p, si);
                const showWin = isView && seatSide(seat).window;
                return (
                  <span
                    key={p.name}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'baseline',
                      gap: 5,
                      padding: '3px 9px',
                      borderRadius: 999,
                      background: 'var(--bg-raised)',
                      border: '1px solid var(--border)',
                      fontSize: 12,
                    }}
                  >
                    <strong style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{seat}</strong>
                    {showWin && <span aria-hidden>🪟</span>}
                    <span style={{ color: 'var(--text-muted)' }}>{firstName(p.name)}</span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}

      {win && (
        <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 7, lineHeight: 1.45 }}>
          The view is on the Istanbul → {viewTo} hop: {firstName(win.name)} has the left window ({win.seat}); the other two are on the same left side. The Delhi/Amsterdam → Istanbul hop is just the connection.
        </div>
      )}
    </div>
  );
}

/* ─── Tab 2: day-pass vs tickets ─── */
const WORTH: Record<PassWorth, { label: string; color: string; bg: string }> = {
  yes: { label: 'Day pass wins', color: '#0F8A4F', bg: 'rgba(15,138,79,0.10)' },
  maybe: { label: 'Worth checking', color: '#B45309', bg: 'rgba(180,83,9,0.10)' },
  no: { label: 'Buy tickets', color: 'var(--text-muted)', bg: 'var(--bg-hover)' },
};

function PassesPanel() {
  return (
    <>
      <p style={{ margin: '0 0 6px', fontSize: 13.5, lineHeight: 1.55, color: 'var(--text-muted)' }}>{PASS_INTRO}</p>
      <p style={{ margin: '0 0 14px', fontSize: 11.5, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
        Fares checked {PASS_AS_OF} · tap “Check live price” to confirm before buying.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {PASS_VERDICTS.map((v) => (
          <PassCard key={v.id} v={v} />
        ))}
      </div>
    </>
  );
}

function PassCard({ v }: { v: PassVerdict }) {
  const w = WORTH[v.worth];
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-raised)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span aria-hidden style={{ fontSize: 16, flexShrink: 0 }}>{v.flag}</span>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text)' }}>{v.scope}</span>
        <span
          style={{
            marginLeft: 'auto',
            padding: '3px 10px',
            borderRadius: 999,
            background: w.bg,
            color: w.color,
            fontSize: 11.5,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {w.label}
        </span>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>{v.normal}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 700, marginTop: 3, lineHeight: 1.5 }}>🎟 {v.pass}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 7, lineHeight: 1.5 }}>{v.reason}</div>

      <a
        href={v.checkUrl}
        target="_blank"
        rel="noreferrer"
        style={{ display: 'flex', alignItems: 'center', minHeight: 44, marginTop: 6, fontSize: 13, fontWeight: 800, color: '#2563EB', textDecoration: 'none' }}
      >
        {v.checkLabel} ↗
      </a>
    </div>
  );
}
