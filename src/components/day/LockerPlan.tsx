import type { ReactNode } from 'react';
import { tintFor } from '@/lib/country';
import { LOCKERS, type LockerStop } from '@/data/lockerData';
import { LocationMap } from '@/components/ui/LocationMap';

/** Luggage-locker plan. With no stopId it renders the whole trip's bag-drop checklist;
 *  with a stopId it shows only that stop's locker card. Pure LOCKERS data. */
export function LockerPlan({ stopId }: { stopId?: string }) {
  const items = stopId ? LOCKERS.filter((l) => l.stopId === stopId) : LOCKERS;
  if (items.length === 0) return null;

  return (
    <div className="panel" style={{ padding: stopId ? 20 : 24 }}>
      <div className="section-header" style={{ marginBottom: 6 }}>
        <h2 className="section-title">🧳 {stopId ? `Bag locker in ${items[0].city}` : 'Luggage & lockers'}</h2>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          {stopId
            ? 'Where to stash the bags on this day'
            : `${items.length} bag-drop days · where, when & how much — drop and collect in order`}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        {items.map((l) => (
          <LockerCard key={l.dayN} l={l} hideDay={Boolean(stopId)} />
        ))}
      </div>
    </div>
  );
}

function LockerCard({ l, hideDay }: { l: LockerStop; hideDay: boolean }) {
  const tint = tintFor(l.country);
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${tint.accent}`,
        borderRadius: 12,
        background: 'var(--bg-raised)',
        padding: '13px 15px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--text)' }}>{l.station}</span>
        {!hideDay && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: tint.accent,
              background: `${tint.accent}14`,
              border: `1px solid ${tint.accent}33`,
              padding: '2px 8px',
              borderRadius: 999,
            }}
          >
            Day {l.dayN} · {l.date}
          </span>
        )}
        <span
          style={{
            marginLeft: 'auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--mono)',
            fontSize: 12.5,
            fontWeight: 800,
          }}
          title="Drop → collect"
        >
          <span style={{ color: tint.accent }}>{l.drop}</span>
          <span aria-hidden style={{ color: 'var(--text-dim)' }}>→</span>
          <span style={{ color: tint.accent }}>{l.collect}</span>
        </span>
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 5, lineHeight: 1.45 }}>{l.why}</div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 8,
          marginTop: 11,
        }}
      >
        <Fact label="Where">{l.location}</Fact>
        <Fact label="Price">{l.price}</Fact>
        <Fact label="Hours">{l.hours}</Fact>
        <Fact label="Pay">{l.payment}</Fact>
        {l.sizes && <Fact label="Sizes">{l.sizes}</Fact>}
      </div>

      {l.warn && (
        <div
          style={{
            marginTop: 10,
            padding: '8px 10px',
            borderRadius: 8,
            background: '#FFF8EC',
            border: '1px solid #F5D27D',
            fontSize: 12,
            lineHeight: 1.5,
            color: 'var(--text)',
          }}
        >
          ⚠️ {l.warn}
        </div>
      )}

      <div style={{ marginTop: 11 }}>
        <LocationMap query={l.mapsQuery} accent={tint.accent} label="Show location" />
      </div>
    </div>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 9px' }}>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2, lineHeight: 1.4 }}>{children}</div>
    </div>
  );
}
