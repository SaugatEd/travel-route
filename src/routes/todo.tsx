import { createFileRoute } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { PACKING, PACKING_TOTAL } from '@/data/packingData';
import { usePackingStore } from '@/store/usePackingStore';

export const Route = createFileRoute('/todo')({
  component: TodoPage,
});

function TodoPage() {
  const done = usePackingStore((s) => s.done);
  const toggle = usePackingStore((s) => s.toggle);
  const reset = usePackingStore((s) => s.reset);

  const doneCount = PACKING.reduce(
    (n, g) => n + g.items.filter((it) => done[it.id]).length,
    0
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 8px 80px' }}>
      <header style={{ padding: '24px 4px 6px' }}>
        <div style={kickerStyle}>Get ready — 3 travellers</div>
        <h1 style={titleStyle}>✅ Packing to-do</h1>
        <p style={introStyle}>
          Everything to have ready before the flight on 16 Jun. Cabin bags only — all liquids ≤100 ml.
          ×3 means one per person.
        </p>
        <div style={progressRowStyle}>
          <div style={progressTrackStyle} role="progressbar" aria-valuenow={doneCount} aria-valuemax={PACKING_TOTAL}>
            <div style={{ ...progressFillStyle, width: `${(doneCount / PACKING_TOTAL) * 100}%` }} />
          </div>
          <span style={progressTextStyle}>
            {doneCount}/{PACKING_TOTAL} ready
          </span>
          {doneCount > 0 && (
            <button type="button" onClick={reset} style={resetBtnStyle}>
              Reset
            </button>
          )}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 6 }}>
        {PACKING.map((g) => {
          const left = g.items.filter((it) => !done[it.id]).length;
          return (
            <section key={g.id}>
              <div style={groupHeadStyle}>
                <h2 style={groupTitleStyle}>{g.title}</h2>
                <span style={groupHintStyle}>{left === 0 ? 'all packed ✓' : g.hint ?? `${left} left`}</span>
              </div>
              <ul style={listStyle}>
                {g.items.map((it, i) => {
                  const checked = !!done[it.id];
                  return (
                    <li key={it.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                      <label style={{ ...rowStyle, opacity: checked ? 0.55 : 1 }}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(it.id)}
                          style={checkboxStyle}
                        />
                        <span style={{ minWidth: 0 }}>
                          <span style={{ ...rowHeadStyle, textDecoration: checked ? 'line-through' : 'none' }}>
                            {it.head}
                            {it.qty && <span style={qtyStyle}>{it.qty}</span>}
                          </span>
                          {it.detail && <span style={rowDetailStyle}>{it.detail}</span>}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

const kickerStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--accent)',
  fontFamily: 'var(--sans)',
};

const titleStyle: CSSProperties = {
  fontFamily: 'var(--serif)',
  fontSize: 26,
  margin: '4px 0 8px',
  color: 'var(--text)',
};

const introStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.5,
  color: 'var(--text-muted)',
};

const progressRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginTop: 14,
};

const progressTrackStyle: CSSProperties = {
  flex: 1,
  height: 6,
  borderRadius: 999,
  background: 'var(--border)',
  overflow: 'hidden',
};

const progressFillStyle: CSSProperties = {
  height: '100%',
  borderRadius: 999,
  background: 'var(--accent)',
  transition: 'width 0.25s ease',
};

const progressTextStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: 'var(--text-dim)',
  whiteSpace: 'nowrap',
};

const resetBtnStyle: CSSProperties = {
  padding: '9px 14px',
  minHeight: 38,
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--bg-raised)',
  fontSize: 12,
  fontWeight: 700,
  color: 'var(--text-muted)',
  cursor: 'pointer',
};

const groupHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 8,
  padding: '0 4px 8px',
};

const groupTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 800,
  color: 'var(--text)',
};

const groupHintStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-dim)',
  whiteSpace: 'nowrap',
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  border: '1px solid var(--border)',
  borderRadius: 14,
  background: 'var(--bg-raised)',
  overflow: 'hidden',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  gap: 11,
  alignItems: 'flex-start',
  padding: '11px 14px',
  cursor: 'pointer',
};

const checkboxStyle: CSSProperties = {
  width: 17,
  height: 17,
  marginTop: 2,
  flexShrink: 0,
  accentColor: 'var(--accent)',
  cursor: 'pointer',
};

const rowHeadStyle: CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 700,
  color: 'var(--text)',
  lineHeight: 1.4,
};

const qtyStyle: CSSProperties = {
  marginLeft: 8,
  fontSize: 11,
  fontWeight: 800,
  color: 'var(--accent)',
  whiteSpace: 'nowrap',
};

const rowDetailStyle: CSSProperties = {
  display: 'block',
  marginTop: 2,
  fontSize: 12.5,
  lineHeight: 1.5,
  color: 'var(--text-muted)',
};
