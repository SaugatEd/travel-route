import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { NavTabs } from './NavTabs';
import { useTheme } from '@/store/useUiStore';
import './shell.css';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const theme = useTheme();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // Activate the (already-authored) light/dark token sets on the document.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Elevate the sticky nav once the brand header has scrolled past it.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="app-root">
      <Link to="/" className="app-brand" aria-label="Jamnata — home">
        <span className="app-brand-mark">Jamnata</span>
        <span className="app-brand-sub">15 Jun – 6 Jul · 3 Travellers · Europe 2026</span>
      </Link>

      <div ref={sentinelRef} aria-hidden style={{ height: 0 }} />
      <NavTabs stuck={stuck} />

      <main className="app-main">{children}</main>

      <footer className="app-footer">
        <span className="app-footer-mark">Jamnata</span>
        <span className="app-footer-line">Nepal → Europe · 15 Jun – 6 Jul 2026 · 3 travellers · 12 stops</span>
        <span className="app-footer-line">Built for the crew — fares & details, double-check before you book.</span>
      </footer>
    </div>
  );
}
