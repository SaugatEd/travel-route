import { createFileRoute } from '@tanstack/react-router';
import type { CSSProperties } from 'react';
import { CARRY_DOCS } from '@/data/carryDocs';

export const Route = createFileRoute('/documents')({
  component: DocumentsRoute,
});

function DocumentsRoute() {
  const { intro, groups } = CARRY_DOCS;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 8px 80px' }}>
      <header style={{ padding: '24px 4px 6px' }}>
        <div style={kickerStyle}>The short list</div>
        <h1 style={titleStyle}>🛂 Documents to carry</h1>
        <p style={introStyle}>{intro.body}</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 6 }}>
        {groups.map((g) => (
          <section key={g.id}>
            <div style={groupHeadStyle}>
              <h2 style={groupTitleStyle}>{g.title}</h2>
              {g.cities && <span style={groupHintStyle}>{g.cities}</span>}
            </div>
            <ul style={listStyle}>
              {g.items.map((it, i) => (
                <li key={i} style={{ ...rowStyle, borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                  <span style={rowHeadStyle}>{it.head}</span>
                  {it.detail && <span style={rowDetailStyle}>{it.detail}</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
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
  lineHeight: 1.55,
  color: 'var(--text-muted)',
  fontFamily: 'var(--sans)',
};

const groupHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  gap: 12,
  margin: '0 0 7px',
  flexWrap: 'wrap',
};

const groupTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: '0.02em',
  color: 'var(--text)',
  fontFamily: 'var(--sans)',
};

const groupHintStyle: CSSProperties = {
  fontSize: 11,
  color: 'var(--text-dim)',
  fontFamily: 'var(--sans)',
};

const listStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  border: '1px solid var(--border)',
  borderRadius: 10,
  background: 'var(--bg-raised)',
  overflow: 'hidden',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  padding: '9px 13px',
};

const rowHeadStyle: CSSProperties = {
  fontSize: 13.5,
  fontWeight: 700,
  color: 'var(--text)',
  lineHeight: 1.35,
};

const rowDetailStyle: CSSProperties = {
  fontSize: 12,
  lineHeight: 1.5,
  color: 'var(--text-muted)',
  fontFamily: 'var(--sans)',
};
