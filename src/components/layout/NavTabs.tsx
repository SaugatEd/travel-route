import { Link } from '@tanstack/react-router';
import { ThemeToggle } from './ThemeToggle';

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
  { to: '/map',        label: 'Map',       icon: '📍' },
  { to: '/documents',  label: 'Docs',      icon: '📄' },
];

interface NavTabsProps {
  stuck?: boolean;
}

export function NavTabs({ stuck = false }: NavTabsProps) {
  return (
    <nav className={`app-nav${stuck ? ' is-stuck' : ''}`} aria-label="Primary">
      <Link to="/" className="app-nav-brand" tabIndex={stuck ? 0 : -1}>
        Jamnata
      </Link>

      <div className="app-tabs">
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
  );
}
