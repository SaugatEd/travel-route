import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { useMapEmbed } from './useMapEmbed';

interface LocationDialogProps {
  title: string;
  subtitle?: string;
  /** Place search string or "lat,lng" destination. */
  query: string;
  accent?: string;
  onClose: () => void;
}

/**
 * Full-screen modal showing the route map for a single place. Used by the
 * luggage page so opening a map never reflows the card grid — only one locker
 * is ever viewed at a time.
 */
export function LocationDialog({ title, subtitle, query, accent = 'var(--accent)', onClose }: LocationDialogProps) {
  const { src, status, externalUrl, providerLabel, resolve } = useMapEmbed(query);

  useEffect(() => {
    resolve();
  }, [resolve]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={title} onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        <div style={header}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={closeBtn}>✕</button>
        </div>

        <div style={{ padding: 16 }}>
          {src ? (
            <iframe
              title={`Map: ${query}`}
              src={src}
              style={{ width: '100%', height: 'min(380px, 50dvh)', border: '1px solid var(--border)', borderRadius: 10, display: 'block' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div
              style={{
                height: 'min(380px, 50dvh)',
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--bg-raised)',
                color: 'var(--text-muted)',
                fontSize: 13,
              }}
            >
              {status || 'Loading…'}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{status}</span>
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 12.5, fontWeight: 700, color: accent, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Open in {providerLabel} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
  display: 'grid',
  placeItems: 'center',
  padding: 16,
  paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
  background: 'rgba(0,0,0,0.5)',
  backdropFilter: 'blur(2px)',
};

const panel: CSSProperties = {
  width: 'min(680px, 100%)',
  maxHeight: 'min(85dvh, 640px)',
  overflow: 'auto',
  overscrollBehavior: 'contain',
  background: 'var(--bg)',
  borderRadius: 'var(--radius-xl)',
  border: '1px solid var(--border)',
  boxShadow: 'var(--shadow-xl)',
};

const header: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
  padding: '14px 16px',
  borderBottom: '1px solid var(--border)',
};

const closeBtn: CSSProperties = {
  flexShrink: 0,
  width: 40,
  height: 40,
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--bg-raised)',
  color: 'var(--text-muted)',
  fontSize: 16,
  cursor: 'pointer',
  lineHeight: 1,
};
