import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { NavTabs } from './NavTabs';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '14px 22px 10px',
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <div
            style={{
              fontFamily: 'var(--serif, "DM Serif Display", serif)',
              fontSize: 26,
              color: 'var(--accent)',
              lineHeight: 1,
            }}
          >
            Jamnata
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              letterSpacing: 0.06,
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            15 Jun – 6 Jul · 3 Travellers · Europe 2026
          </div>
        </Link>
      </header>
      <NavTabs />
      <main style={{ flex: 1, padding: '20px 22px 60px', width: '100%' }}>
        {children}
      </main>
    </div>
  );
}
