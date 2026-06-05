import { createFileRoute, useNavigate, useParams, useSearch, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import {
  OverviewView,
  PhrasebookView,
  SurvivalGuideView,
  CalendarDayDialog,
} from '@/App.jsx';
import { STOPS, CALENDAR, JOURNEYS } from '@/data/tripData.js';
import { useUiStore } from '@/store/useUiStore';
import { EmptyState } from '@/components/ui/EmptyState';
import { StopItinerary } from '@/components/day/StopItinerary';
import { StopSights } from '@/components/day/StopSights';
import { StopSuggestions } from '@/components/day/StopSuggestions';
import { StopRoute } from '@/components/day/StopRoute';
import { LockerPlan } from '@/components/day/LockerPlan';
import { tintFor } from '@/lib/country';
import type { CalendarDay, Journey } from '@/types';

type SubView = 'overview' | 'phrasebook' | 'survival';

const VALID_VIEWS: readonly SubView[] = ['overview', 'phrasebook', 'survival'] as const;

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
  { id: 'phrasebook', icon: '🗣', label: 'Phrases' },
  { id: 'survival',   icon: '🧭', label: 'Survival' },
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
  const stopCalDays = (CALENDAR as CalendarDay[]).filter(
    (d) => (d.stop === 'imst' ? 'innsbruck' : d.stop) === id
  );
  const prevStop = idx > 0 ? stops[idx - 1] : null;
  const nextStop = idx < stops.length - 1 ? stops[idx + 1] : null;
  const nights = stop.duration.split('·')[0].trim();
  const dateRange = stopCalDays.length
    ? `${stopCalDays[0].date}${stopCalDays.length > 1 ? ` – ${stopCalDays[stopCalDays.length - 1].date}` : ''}`
    : '';

  const goToStop = (newId: string) => {
    const resolved = newId === 'imst' ? 'innsbruck' : newId;
    navigate({ to: '/stop/$id', params: { id: resolved }, search: { view: 'overview' } });
  };
  const setView = (v: SubView) => navigate({ to: '/stop/$id', params: { id }, search: { view: v } });

  return (
    <main className="stop-page">
      <div className="stop-page-bar">
        <Link to="/" className="stop-back">← All stops</Link>
        <select
          className="stop-jump"
          value={id}
          aria-label="Jump to another stop"
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

        <header style={{ padding: '16px 24px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--sans)',
                }}
              >
                <span>{stop.flag} {stop.country}</span>
                <span aria-hidden style={{ opacity: 0.5 }}>·</span>
                <span>{nights}</span>
                {dateRange && (
                  <>
                    <span aria-hidden style={{ opacity: 0.5 }}>·</span>
                    <span>{dateRange}</span>
                  </>
                )}
              </div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, lineHeight: 1.1, margin: '6px 0 4px', color: 'var(--text)' }}>
                {stop.city}
              </h1>
              <p style={{ margin: 0, maxWidth: 620, fontSize: 14, fontStyle: 'italic', lineHeight: 1.5, color: 'var(--text-muted)' }}>
                {stop.tagline}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {prevStop && (
                <button onClick={() => goToStop(prevStop.id)} title={`← ${prevStop.city}`} style={navBtnStyle} aria-label={`Previous stop: ${prevStop.city}`}>
                  ←
                </button>
              )}
              {nextStop && (
                <button onClick={() => goToStop(nextStop.id)} title={`${nextStop.city} →`} style={navBtnStyle} aria-label={`Next stop: ${nextStop.city}`}>
                  →
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Sub-views */}
        {view === 'overview' && (
          <>
            <StopRoute
              stopId={stop.id}
              city={stop.city}
              journeys={JOURNEYS as Journey[]}
              accent={tintFor(stop.country).accent}
              isDayTrip={/day[\s-]?trip/i.test(stop.duration)}
            />
            <LockerPlan stopId={stop.id} />
            <StopSights stopId={stop.id} city={stop.city} />
            <StopSuggestions stopId={stop.id} city={stop.city} accent={tintFor(stop.country).accent} />
            <StopItinerary
              city={stop.city}
              country={stop.country}
              days={stopCalDays}
              journeys={JOURNEYS as Journey[]}
            />
            <OverviewView stop={stop} />
          </>
        )}
        {view === 'phrasebook' && <PhrasebookView stop={stop} />}
        {view === 'survival'   && <SurvivalGuideView stop={stop} />}

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
    </main>
  );
}

const navBtnStyle = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: '1px solid var(--border)',
  background: 'var(--bg-raised)',
  color: 'var(--text)',
  fontSize: 16,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
} as const;
