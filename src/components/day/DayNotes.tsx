import { DAY_NOTES, type DayPractical } from '@/data/dayNotes';

const ROWS: { key: keyof DayPractical; icon: string }[] = [
  { key: 'crowd', icon: '👥' },
  { key: 'open', icon: '🏪' },
  { key: 'transit', icon: '🚉' },
  { key: 'tip', icon: '💡' },
];

/** Compact "good to know" block for a day: crowd, what's open, transit pattern, tip.
 *  Renders only the fields present; shows nothing on days with no note.
 *  `collapsible` folds it behind a summary so the overview stays available
 *  without crowding the front of an itinerary card. */
export function DayNotes({ dayN, accent, collapsible = false }: { dayN: number; accent: string; collapsible?: boolean }) {
  const note = DAY_NOTES[dayN];
  if (!note) return null;
  const rows = ROWS.filter((r) => note[r.key]);
  if (rows.length === 0) return null;

  const list = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {rows.map((r) => (
        <div key={r.key} style={{ display: 'flex', gap: 6, fontSize: 11.5, lineHeight: 1.4, color: 'var(--text-muted)' }}>
          <span aria-hidden style={{ flexShrink: 0 }}>{r.icon}</span>
          <span>{note[r.key]}</span>
        </div>
      ))}
    </div>
  );

  const labelStyle = { fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: accent } as const;

  if (collapsible) {
    return (
      <details style={{ padding: '7px 10px', borderRadius: 8, background: `${accent}0A`, border: `1px solid ${accent}1F` }}>
        <summary style={{ ...labelStyle, cursor: 'pointer', listStyle: 'none' }}>Good to know</summary>
        <div style={{ marginTop: 6 }}>{list}</div>
      </details>
    );
  }

  return (
    <div style={{ padding: '8px 10px', borderRadius: 8, background: `${accent}0A`, border: `1px solid ${accent}1F` }}>
      <div style={{ ...labelStyle, marginBottom: 5 }}>Good to know</div>
      {list}
    </div>
  );
}
