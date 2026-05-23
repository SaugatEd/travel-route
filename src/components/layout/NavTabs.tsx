import { Link } from '@tanstack/react-router';
import type { CSSProperties } from 'react';

interface TabDef {
  to: string;
  label: string;
  icon: string;
}

// Every section is one click from the nav. URLs are the source of truth.
const TABS: TabDef[] = [
  { to: '/',            label: 'Home',       icon: '🏠' },
  { to: '/itinerary',   label: 'Itinerary',  icon: '📋' },
  { to: '/map',         label: 'Map',        icon: '📍' },
  { to: '/calendar',    label: 'Calendar',   icon: '🗓' },
  { to: '/flights',     label: 'Flights',    icon: '✈️' },
  { to: '/trains',      label: 'Trains',     icon: '🚄' },
  { to: '/book',        label: 'Book',       icon: '🔖' },
  { to: '/guides',      label: 'Guides',     icon: '📖' },
  { to: '/timeline',    label: 'Timeline',   icon: '⏳' },
  { to: '/money',       label: 'Money',      icon: '💶' },
  { to: '/transport',   label: 'Transport',  icon: '🚆' },
  { to: '/scams',       label: 'Scams',      icon: '⚠️' },
];

const linkStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-muted)',
  textDecoration: 'none',
  borderRadius: 999,
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
};

const activeStyle: CSSProperties = {
  background: 'var(--bg-raised)',
  color: 'var(--accent)',
  boxShadow: '0 0 0 1px var(--accent-translucent, rgba(184,134,11,0.18)) inset',
};

export function NavTabs() {
  return (
    <nav
      style={{
        display: 'flex',
        gap: 4,
        padding: '6px 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg)',
        overflowX: 'auto',
        justifyContent: 'center',
      }}
    >
      {TABS.map((t) => (
        <Link
          key={t.to}
          to={t.to}
          style={linkStyle}
          activeProps={{ style: { ...linkStyle, ...activeStyle } }}
          activeOptions={{ exact: t.to === '/' }}
        >
          <span aria-hidden>{t.icon}</span>
          <span>{t.label}</span>
        </Link>
      ))}
    </nav>
  );
}
