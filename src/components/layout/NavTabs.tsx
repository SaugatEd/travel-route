import { useEffect, useRef, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { ThemeToggle } from './ThemeToggle';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface TabDef {
  to: string;
  label: string;
  icon: string;
}

// Every section is one click from the nav. URLs are the source of truth.
const TABS: TabDef[] = [
  { to: '/',           label: 'Home',      icon: '🏠' },
  { to: '/calendar',   label: 'Calendar',  icon: '🗓' },
  { to: '/book',       label: 'Book',      icon: '🔖' },
  { to: '/itinerary',  label: 'Itinerary', icon: '📋' },
  { to: '/luggage',    label: 'Luggage',   icon: '🧳' },
  { to: '/trains',     label: 'Trains',    icon: '🚄' },
  { to: '/flights',    label: 'Flights',   icon: '✈️' },
  { to: '/seats',      label: 'Seat & Pass', icon: '💺' },
  { to: '/documents',  label: 'Docs',      icon: '📄' },
  { to: '/day-guide',  label: 'Day Guide', icon: '📖' },
  { to: '/todo',       label: 'To-do',     icon: '✅' },
];

// Phone bottom bar: highest-frequency tabs + a More sheet for the rest.
const PRIMARY_PATHS = ['/', '/calendar', '/itinerary'];
const PRIMARY_TABS = TABS.filter((t) => PRIMARY_PATHS.includes(t.to));
const SECONDARY_TABS = TABS.filter((t) => !PRIMARY_PATHS.includes(t.to));

interface NavTabsProps {
  stuck?: boolean;
}

export function NavTabs({ stuck = false }: NavTabsProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabsRef = useRef<HTMLDivElement>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const isPhone = useMediaQuery('(max-width: 560px)');

  useEffect(() => {
    if (!isPhone) setMoreOpen(false);
  }, [isPhone]);

  useEffect(() => {
    setMoreOpen(false);
    tabsRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [moreOpen]);

  const moreActive = SECONDARY_TABS.some((t) => pathname.startsWith(t.to));

  return (
    <>
      <nav className={`app-nav${stuck ? ' is-stuck' : ''}`} aria-label="Primary">
        <Link to="/" className="app-nav-brand" tabIndex={stuck ? 0 : -1}>
          Jamnata
        </Link>

        <div className="app-tabs" ref={tabsRef}>
          {TABS.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="app-tab"
              activeProps={{ className: 'app-tab is-active', 'aria-current': 'page' }}
              activeOptions={{ exact: t.to === '/' }}
            >
              <span className="app-tab-icon" aria-hidden>{t.icon}</span>
              <span>{t.label}</span>
            </Link>
          ))}
        </div>

        <div className="app-nav-actions">
          <ThemeToggle />
        </div>
      </nav>

      <nav className="app-bottomnav" aria-label="Primary">
        {PRIMARY_TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="app-bottomtab"
            activeProps={{ className: 'app-bottomtab is-active', 'aria-current': 'page' }}
            activeOptions={{ exact: t.to === '/' }}
          >
            <span className="app-bottomtab-icon" aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </Link>
        ))}
        <button
          type="button"
          className={`app-bottomtab${moreActive ? ' is-active' : ''}`}
          aria-expanded={moreOpen}
          onClick={() => setMoreOpen((open) => !open)}
        >
          <span className="app-bottomtab-icon" aria-hidden>⋯</span>
          <span>More</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="app-sheet-overlay" onClick={() => setMoreOpen(false)}>
          <div
            className="app-sheet"
            role="dialog"
            aria-label="More sections"
            onClick={(e) => e.stopPropagation()}
          >
            {SECONDARY_TABS.map((t) => (
              <Link
                key={t.to}
                to={t.to}
                className="app-sheet-link"
                activeProps={{ className: 'app-sheet-link is-active', 'aria-current': 'page' }}
                onClick={() => setMoreOpen(false)}
              >
                <span className="app-sheet-icon" aria-hidden>{t.icon}</span>
                <span>{t.label}</span>
              </Link>
            ))}
            <div className="app-sheet-row">
              <span>Theme</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
