import { createFileRoute, useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  OverviewView,
  GalleryView,
  BudgetView,
  ChecklistView,
  PhrasebookView,
  SurvivalGuideView,
  DocsView,
  TripTimelineSidebar,
  CalendarDayDialog,
  getCityHero,
} from '@/App.jsx';
import { STOPS, JOURNEYS, CALENDAR } from '@/data/tripData.js';
import { useNprRate } from '@/hooks/useNprRate';
import { useCurrencyMode, useUiStore } from '@/store/useUiStore';
import { EmptyState } from '@/components/ui/EmptyState';

type SubView =
  | 'overview' | 'gallery' | 'budget' | 'checklist'
  | 'phrasebook' | 'survival' | 'docs';

const VALID_VIEWS: readonly SubView[] = [
  'overview', 'gallery', 'budget', 'checklist', 'phrasebook', 'survival', 'docs',
] as const;

interface StopSearch {
  view?: SubView;
}

export const Route = createFileRoute('/stop/$id')({
  validateSearch: (search: Record<string, unknown>): StopSearch => {
    const v = search.view;
    return {
      view: typeof v === 'string' && (VALID_VIEWS as readonly string[]).includes(v) ? (v as SubView) : 'overview',
    };
  },
  component: StopDetailPage,
});

const VIEW_TABS: { id: SubView; icon: string; label: string }[] = [
  { id: 'overview',   icon: '✨', label: 'Overview' },
  { id: 'gallery',    icon: '🖼', label: 'Gallery' },
  { id: 'budget',     icon: '💰', label: 'Budget' },
  { id: 'checklist',  icon: '✅', label: 'Checklist' },
  { id: 'phrasebook', icon: '🗣', label: 'Phrases' },
  { id: 'survival',   icon: '🧭', label: 'Survival' },
  { id: 'docs',       icon: '📋', label: 'Visa & Docs' },
];

interface StopRecord {
  id: string;
  city: string;
  country: string;
  flag: string;
  duration: string;
  tagline: string;
  color: string;
  budget: string;
  weather: { temp: string; [k: string]: unknown };
  [k: string]: unknown;
}

function StopDetailPage() {
  const { id } = useParams({ from: '/stop/$id' });
  const search = useSearch({ from: '/stop/$id' });
  const navigate = useNavigate();
  const setActiveStopId = useUiStore((s) => s.setActiveStopId);
  const mode = useCurrencyMode();
  const { data: rate } = useNprRate();
  const npr = rate?.npr ?? ((v: number, cur = 'EUR') => `${cur} ${v}`);
  const showNPR = mode === 'npr';

  // Sync active stop into Zustand so other surfaces (header, /book "← Trip", etc.) stay in sync.
  useEffect(() => { setActiveStopId(id); }, [id, setActiveStopId]);

  const [openDay, setOpenDay] = useState<unknown>(null);

  const stops = STOPS as StopRecord[];
  const stop = stops.find((s) => s.id === id);
  const idx  = stops.findIndex((s) => s.id === id);

  if (!stop) {
    return <EmptyState title="Stop not found" body={`No stop with id "${id}".`} />;
  }

  const view = search.view ?? 'overview';
  const stopCalDays = (CALENDAR as Array<{ stop: string; dayN: number; date: string }>).filter(
    (d) => (d.stop === 'imst' ? 'innsbruck' : d.stop) === id
  );
  const heroImg = getCityHero(stop.id);
  const prevStop = idx > 0 ? stops[idx - 1] : null;
  const nextStop = idx < stops.length - 1 ? stops[idx + 1] : null;

  const goToStop = (newId: string) => {
    const resolved = newId === 'imst' ? 'innsbruck' : newId;
    navigate({ to: '/stop/$id', params: { id: resolved }, search: { view: 'overview' } });
  };
  const setView = (v: SubView) => navigate({ to: '/stop/$id', params: { id }, search: { view: v } });

  return (
    <div className="app-layout">
      <TripTimelineSidebar active={id} onClickDay={(day: { stop: string }) => goToStop(day.stop)} npr={npr} />
      <main className="main">
        <div style={{ padding: '16px 20px 0' }}>
          <select
            className="mobile-stop-select"
            value={id}
            onChange={(e) => goToStop(e.target.value)}
          >
            {stops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.flag} {s.city} — {s.duration.split('·')[0].trim()}
              </option>
            ))}
          </select>
        </div>

        <div className="view-tabs">
          {VIEW_TABS.map((t) => (
            <button
              key={t.id}
              className={`view-tab${view === t.id ? ' active' : ''}`}
              onClick={() => setView(t.id)}
            >
              <span className="view-tab-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div
          className="hero"
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: heroImg ? 'none' : `linear-gradient(135deg, ${stop.color}12 0%, transparent 60%)`,
          }}
        >
          {heroImg && (
            <>
              <div
                style={{
                  position: 'absolute', inset: '-10px',
                  backgroundImage: `url(${heroImg})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: 'brightness(0.4) saturate(1.2)',
                  zIndex: 0,
                  transition: 'background-image 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s ease',
                  transform: 'scale(1.05)',
                }}
              />
              <div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.75) 100%)',
                  zIndex: 1,
                }}
              />
            </>
          )}

          {prevStop && (
            <button className="hero-arrow hero-arrow--prev" onClick={() => goToStop(prevStop.id)} title={`← ${prevStop.city}`}>
              ←
            </button>
          )}
          {nextStop && (
            <button className="hero-arrow hero-arrow--next" onClick={() => goToStop(nextStop.id)} title={`${nextStop.city} →`}>
              →
            </button>
          )}

          <div style={{ position: 'relative', zIndex: 2, width: '100%' }}>
            {stopCalDays.length > 0 && (
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <span className="hero-day-badge">
                  DAY {stopCalDays[0].dayN}
                  {stopCalDays.length > 1 ? `–${stopCalDays[stopCalDays.length - 1].dayN}` : ''} · {stopCalDays[0].date}
                  {stopCalDays.length > 1 ? ` – ${stopCalDays[stopCalDays.length - 1].date}` : ''}
                </span>
              </div>
            )}

            <div className="hero-meta" style={{ justifyContent: 'center' }}>
              <span style={heroImg ? { color: 'rgba(255,255,255,0.75)' } : {}}>{stop.flag} {stop.country}</span>
              <span className="dot" style={heroImg ? { color: 'rgba(255,255,255,0.3)' } : {}}>·</span>
              <span style={heroImg ? { color: 'rgba(255,255,255,0.75)' } : {}}>{stop.duration}</span>
            </div>
            <h1
              className="hero-title"
              style={{
                textAlign: 'center',
                ...(heroImg ? { color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.4)' } : {}),
              }}
            >
              {stop.city}
            </h1>
            <p
              className="hero-tagline"
              style={{
                textAlign: 'center',
                maxWidth: 600,
                margin: '0 auto 28px',
                ...(heroImg ? { color: 'rgba(255,255,255,0.85)' } : {}),
              }}
            >
              {stop.tagline}
            </p>
            <div className="hero-stats" style={{ justifyContent: 'center' }}>
              <div className="stat-card" style={heroImg ? heroStatStyle : undefined}>
                <div className="label" style={heroImg ? { color: 'rgba(255,255,255,0.6)' } : {}}>Stay (for 3)</div>
                <div className="val"   style={heroImg ? { color: '#fff' } : {}}>{stop.budget}</div>
              </div>
              <div className="stat-card" style={heroImg ? heroStatStyle : undefined}>
                <div className="label" style={heroImg ? { color: 'rgba(255,255,255,0.6)' } : {}}>June weather</div>
                <div className="val"   style={heroImg ? { color: '#fff' } : {}}>{stop.weather.temp}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-views */}
        {view === 'overview'   && <OverviewView   stop={stop} idx={idx} stops={stops} journeys={JOURNEYS} onStopChange={goToStop} showNPR={showNPR} npr={npr} />}
        {view === 'gallery'    && <GalleryView    stop={stop} />}
        {view === 'budget'     && <BudgetView     stop={stop} stops={stops} showNPR={showNPR} npr={npr} />}
        {view === 'checklist'  && <ChecklistView />}
        {view === 'phrasebook' && <PhrasebookView stop={stop} />}
        {view === 'survival'   && <SurvivalGuideView stop={stop} />}
        {view === 'docs'       && <DocsView />}
      </main>

      {openDay != null && (
        <CalendarDayDialog
          day={openDay}
          onClose={() => setOpenDay(null)}
          onGoToStop={(stopId: string) => {
            setOpenDay(null);
            goToStop(stopId);
          }}
        />
      )}
    </div>
  );
}

const heroStatStyle = {
  background: 'rgba(255,255,255,0.08)',
  borderColor: 'rgba(255,255,255,0.12)',
  backdropFilter: 'blur(16px) saturate(1.4)',
} as const;
