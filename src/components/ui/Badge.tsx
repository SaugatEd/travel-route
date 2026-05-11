import type { CSSProperties, ReactNode } from 'react';

type Tone = 'neutral' | 'ok' | 'soon' | 'urgent' | 'passed' | 'todo' | 'accent';

const TONE: Record<Tone, CSSProperties> = {
  neutral: { color: 'var(--text-muted)', borderColor: 'var(--border)' },
  ok:      { color: '#166534', borderColor: '#86efac' },
  soon:    { color: 'var(--text-muted)', borderColor: 'var(--border)' },
  urgent:  { color: '#B45309', borderColor: '#fbbf24', fontWeight: 700 },
  passed:  { color: 'var(--text-faint)', borderColor: 'var(--border)' },
  todo:    { color: '#7C2D12', borderColor: '#7C2D12', fontWeight: 700 },
  accent:  { color: 'var(--accent)', borderColor: 'var(--accent)', fontWeight: 700 },
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  style?: CSSProperties;
}

export function Badge({ children, tone = 'neutral', style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 9px',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.04,
        border: '1.5px solid',
        borderRadius: 999,
        background: 'transparent',
        ...TONE[tone],
        ...style,
      }}
    >
      {children}
    </span>
  );
}
