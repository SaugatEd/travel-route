import { createFileRoute } from '@tanstack/react-router';
import {
  FLIGHT_BOOKING,
  formatTime,
  formatDate,
  formatDuration,
  type FlightBooking,
  type FlightLeg,
  type FlightSegment,
  type FlightLayover,
  type Passenger,
} from '@/data/flights';

export const Route = createFileRoute('/flights')({
  component: FlightsPage,
});

function FlightsPage() {
  const b = FLIGHT_BOOKING;
  const pdfHref = `${import.meta.env.BASE_URL}${b.pdfUrl}`;

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      <PageHeader booking={b} pdfHref={pdfHref} />
      <LegBlock leg={b.outbound} accent="#0B5394" />
      <LegBlock leg={b.return}   accent="#7C2D12" />
      <PassengersBlock passengers={b.passengers} outbound={b.outbound} ret={b.return} />
      <FareSummary booking={b} pdfHref={pdfHref} />
    </div>
  );
}

/* ───── Header ───── */
function PageHeader({ booking, pdfHref }: { booking: FlightBooking; pdfHref: string }) {
  return (
    <header
      style={{
        padding: '20px 22px',
        marginBottom: 22,
        background: 'linear-gradient(135deg, #C8102E 0%, #8B0000 100%)',
        color: '#fff',
        borderRadius: 16,
        boxShadow: 'var(--shadow)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.9 }}>
            ✈ {booking.airline}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 34, lineHeight: 1.05, marginTop: 4 }}>
            Round trip · Delhi ↔ Europe
          </div>
          <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
            {booking.outbound.dateLabel} → {booking.return.dateLabel} · 3 passengers · {booking.outbound.cabinClass}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <div
            style={{
              padding: '8px 14px',
              fontSize: 18,
              fontWeight: 800,
              fontFamily: 'var(--mono, monospace)',
              letterSpacing: '0.15em',
              background: 'rgba(255,255,255,0.18)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              borderRadius: 10,
            }}
          >
            {booking.pnr}
          </div>
          <a
            href={pdfHref}
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              color: '#C8102E',
              background: '#fff',
              borderRadius: 999,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
            }}
          >
            📄 Open ticket PDF
          </a>
        </div>
      </div>
    </header>
  );
}

/* ───── Leg block (outbound or return) ───── */
function LegBlock({ leg, accent }: { leg: FlightLeg; accent: string }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 24, margin: 0, color: accent }}>
          {leg.label}
        </h2>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {leg.dateLabel} · <strong>{leg.totalDuration}</strong> total
        </div>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {leg.segments.map((seg, i) => (
          <div key={seg.flightNo}>
            <SegmentCard segment={seg} accent={accent} />
            {leg.layovers[i] && <LayoverStrip layover={leg.layovers[i]} />}
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───── Single segment card ───── */
function SegmentCard({ segment, accent }: { segment: FlightSegment; accent: string }) {
  return (
    <div
      style={{
        padding: 16,
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${accent}`,
        borderRadius: 12,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <Endpoint label="Depart" airport={segment.from} time={formatTime(segment.depart)} date={formatDate(segment.depart)} accent={accent} />
        <PathStrip duration={formatDuration(segment.durationMin)} />
        <Endpoint label="Arrive" airport={segment.to}   time={formatTime(segment.arrive)} date={formatDate(segment.arrive)} accent={accent} align="right" />
      </div>

      <div
        style={{
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px dashed var(--border)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
          fontSize: 12,
        }}
      >
        <Meta label="Flight" value={segment.flightNo} mono />
        <Meta label="Aircraft" value={segment.aircraft} />
        <Meta label="Airline" value={segment.airline} />
      </div>
    </div>
  );
}

function Endpoint({
  label, airport, time, date, accent, align = 'left',
}: {
  label: string;
  airport: { code: string; city: string; name: string };
  time: string;
  date: string;
  accent: string;
  align?: 'left' | 'right';
}) {
  return (
    <div style={{ textAlign: align, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--mono, monospace)', color: accent, lineHeight: 1.1, marginTop: 2 }}>
        {time}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
        {airport.code} · {airport.city}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {airport.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4 }}>
        {date}
      </div>
    </div>
  );
}

function PathStrip({ duration }: { duration: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: 'var(--text-muted)', minWidth: 60 }}>
      <span style={{ fontSize: 18 }}>✈</span>
      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--mono, monospace)' }}>{duration}</span>
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: mono ? 'var(--mono, monospace)' : undefined, marginTop: 2 }}>
        {value}
      </div>
    </div>
  );
}

/* ───── Layover strip ───── */
function LayoverStrip({ layover }: { layover: FlightLayover }) {
  return (
    <div
      style={{
        margin: '4px 0 0',
        padding: '8px 14px',
        fontSize: 12,
        color: 'var(--text-muted)',
        background: '#FFF8EC',
        border: '1px dashed #F5D27D',
        borderRadius: 8,
      }}
    >
      ⏱ Transfer at <strong>{layover.airport.code} · {layover.airport.city}</strong> — {formatDuration(layover.durationMin)} layover (change of flight)
    </div>
  );
}

/* ───── Passengers + seats ───── */
function PassengersBlock({ passengers, outbound, ret }: { passengers: Passenger[]; outbound: FlightLeg; ret: FlightLeg }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '0 0 12px' }}>Passengers + seats</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {passengers.map((p) => (
          <div
            key={p.ticketNumber}
            style={{
              padding: 14,
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--mono, monospace)' }}>
                Ticket {p.ticketNumber}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <SeatColumn label="Outbound" leg={outbound} seats={p.outboundSeats.map((s) => s.seat)} />
              <SeatColumn label="Return"   leg={ret}      seats={p.returnSeats.map((s) => s.seat)} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SeatColumn({ label, leg, seats }: { label: string; leg: FlightLeg; seats: string[] }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'grid', gap: 4 }}>
        {leg.segments.map((s, i) => (
          <div key={s.flightNo} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--mono, monospace)' }}>
              {s.from.code} → {s.to.code}
            </span>
            <span style={{ fontWeight: 700, fontFamily: 'var(--mono, monospace)' }}>
              {seats[i] ?? '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───── Fare summary footer ───── */
function FareSummary({ booking, pdfHref }: { booking: FlightBooking; pdfHref: string }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22, margin: '0 0 12px' }}>Booking</h2>
      <div
        style={{
          padding: 16,
          background: 'var(--bg-raised)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          fontSize: 13,
        }}
      >
        <Meta label="PNR" value={booking.pnr} mono />
        <Meta label="Airline" value={booking.airline} />
        <Meta label="Issued" value={booking.issuedOn} />
        <Meta label="Total (3 pax)" value={`€${booking.totalEur.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`} mono />
        <Meta label="Contact email" value={booking.contactEmail} />
        <Meta label="Contact phone" value={booking.contactPhone} mono />
      </div>

      <a
        href={pdfHref}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-block',
          marginTop: 14,
          padding: '12px 20px',
          fontSize: 14,
          fontWeight: 700,
          color: '#fff',
          background: 'var(--accent)',
          borderRadius: 999,
          textDecoration: 'none',
        }}
      >
        📄 Open the full Turkish Airlines PDF
      </a>
    </section>
  );
}
