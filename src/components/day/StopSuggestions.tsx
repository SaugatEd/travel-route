import { STOP_SUGGESTIONS } from '@/data/stopSuggestions';

interface StopSuggestionsProps {
  stopId: string;
  city: string;
  accent: string;
}

/** "Good to know" — curated, practical visiting suggestions per stop
 *  (timing, crowds, money, food, common mistakes). Complements the must-do list. */
export function StopSuggestions({ stopId, city, accent }: StopSuggestionsProps) {
  const tips = STOP_SUGGESTIONS[stopId];
  if (!tips || tips.length === 0) return null;

  return (
    <div className="panel" style={{ padding: 20 }}>
      <div className="section-header" style={{ marginBottom: 6 }}>
        <h2 className="section-title">Good to know in {city}</h2>
        <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          Quick local suggestions for your visit
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: 8,
          marginTop: 8,
          alignItems: 'start',
        }}
      >
        {tips.map((t, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 10,
              alignItems: 'start',
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg-raised)',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 26,
                height: 26,
                flexShrink: 0,
                borderRadius: 8,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                background: `${accent}14`,
                border: `1px solid ${accent}33`,
              }}
            >
              {t.icon}
            </span>
            <span style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--text)' }}>{t.tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
