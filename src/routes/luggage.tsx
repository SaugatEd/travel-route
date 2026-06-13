import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { LOCKERS, type LockerStop } from '@/data/lockerData';
import { tintFor } from '@/lib/country';
import { LocationDialog } from '@/components/ui/LocationDialog';

export const Route = createFileRoute('/luggage')({
  component: LuggagePage,
});

// Cheapest reliable price for a CABIN-size bag at each stop (small-locker tier,
// or a cheaper nearby provider where the station lockers are dear/unreliable).
const CABIN_PRICE: Record<string, string> = {
  lucerne: 'CHF 6 · per period (small locker)',
  lauterach: '€2–6 · short-term (Bregenz)',
  innsbruck: '€2 · per 24 h (small locker)',
  salzburg: '€2 · per 24 h (small locker)',
  berlin: '~€4 · per 24 h (small locker)',
  amsterdam: '~€5 · per bag (Radical Storage — cheaper than the €11 station lockers)',
};

const FLAG: Record<string, string> = {
  Italy: '🇮🇹',
  Switzerland: '🇨🇭',
  Austria: '🇦🇹',
  Germany: '🇩🇪',
  Netherlands: '🇳🇱',
};

function LuggagePage() {
  const [selected, setSelected] = useState<LockerStop | null>(null);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 4px 64px' }}>
      <header style={{ padding: '24px 6px 14px' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: 30, margin: '0 0 6px', color: 'var(--text)' }}>
          Luggage lockers
        </h1>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--text-muted)' }}>
          Cabin bags only — the cheapest reliable spot at each stop. Drop, explore bag-free, collect before your train.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
          gap: 12,
          alignItems: 'start',
        }}
      >
        {LOCKERS.map((l) => {
          const accent = tintFor(l.country).accent;
          const price = CABIN_PRICE[l.stopId] ?? l.price;
          return (
            <article
              key={l.stopId}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 14,
                background: 'var(--bg-raised)',
                padding: '13px 15px 14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <h2 style={{ margin: 0, fontSize: 15.5, fontWeight: 800, color: 'var(--text)' }}>
                  {FLAG[l.country] ?? '📍'} {l.station}
                </h2>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  Day {l.dayN}
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 10px' }}>
                {l.city} · {l.date}
              </div>

              <Row icon="💶" label="Price" value={price} accent={accent} />
              <Row icon="🕑" label="Hours" value={l.hours} accent={accent} />
              <Row icon="⏳" label="Window" value={`${l.drop} → ${l.collect}`} accent={accent} />
              <Row icon="📍" label="Where" value={l.location} accent={accent} />
              {l.sizes && <Row icon="📦" label="Size" value={l.sizes} accent={accent} />}
              <Row icon="💳" label="Pay" value={l.payment} accent={accent} />

              {l.warn && (
                <div style={{ display: 'flex', gap: 6, marginTop: 9, fontSize: 11.5, lineHeight: 1.45, color: 'var(--text-muted)' }}>
                  <span aria-hidden>⚠️</span>
                  <span>{l.warn}</span>
                </div>
              )}

              <div style={{ marginTop: 11 }}>
                <button
                  type="button"
                  onClick={() => setSelected(l)}
                  style={{ ...mapBtn, color: accent, borderColor: `color-mix(in srgb, ${accent} 45%, transparent)` }}
                >
                  📍 Show location
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {selected && (
        <LocationDialog
          title={`${FLAG[selected.country] ?? '📍'} ${selected.station}`}
          subtitle={`${selected.city} · ${selected.date} · ${selected.location}`}
          query={selected.mapsQuery}
          accent={tintFor(selected.country).accent}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function Row({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '18px 58px 1fr',
        gap: 8,
        alignItems: 'baseline',
        padding: '3px 0',
        fontSize: 13,
      }}
    >
      <span aria-hidden>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: accent }}>
        {label}
      </span>
      <span style={{ color: 'var(--text)', lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

const mapBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: 44,
  gap: 6,
  padding: '11px 16px',
  borderRadius: 999,
  border: '1px solid',
  background: 'var(--bg-raised)',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
};
