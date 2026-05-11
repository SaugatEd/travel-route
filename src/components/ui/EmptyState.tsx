import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        border: '1px dashed var(--border)',
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      {body && <div style={{ fontSize: 14, marginBottom: action ? 14 : 0 }}>{body}</div>}
      {action}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <EmptyState title={label} />;
}
