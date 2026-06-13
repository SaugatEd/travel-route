import { useState, useEffect } from "react";
import { STOPS, JOURNEYS, BOOKING, CALENDAR, TRIP_BUDGET, AIRBNBS } from "./data/tripData";
import { DayPlanSections, hasPlanContent } from "./components/day/DayPlanSections";
import { makeGoogleMapsDirections } from "./lib/urls";
import { useRates } from "./utils/useRates";
import { generateStopPdf, generateFullTripPdf } from "./utils/generatePdf";
import "./styles/app.css";
import "./styles/panels-mobile.css";

import { CITY_IMAGES, LANDMARK_IMAGES } from "./data/imageData";
import { TIPS, PACKING_CHECKLIST } from "./data/tipsData";
import { DOCS, MUST_TRY } from "./data/docsData";
import { PRACTICAL } from "./data/practicalData";
import { SURVIVAL_GUIDE, SITUATION_PHRASES, DESTINATION_SURVIVAL } from "./data/survivalData";
import { MONEY } from "./data/moneyData";
import { TRANSPORT_VALIDATION } from "./data/transportValidation";
import { BOOKING_TIMELINE } from "./data/bookingTimelineData";
import { SCAMS } from "./data/scamsData";
import { ALT_ROUTES } from "./data/altRoutesData";

export const getCityHero = (id) => CITY_IMAGES?.[id]?.hero || null;
const getCityMap = (id) => CITY_IMAGES?.[id]?.mapEmbed || null;
const getCityGallery = (id) => CITY_IMAGES?.[id]?.gallery || [];

const IMG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='480' fill='%23e5e7eb'%3E%3Crect width='640' height='480'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='18' fill='%23999' text-anchor='middle' dy='.3em'%3EImage unavailable%3C/text%3E%3C/svg%3E";

const TYPE_COLORS = {
  flight: "#4338CA", highspeed: "#C2410C", regional: "#166534",
  scenic: "#0891B2", nightjet: "#1E1B4B", train: "#166534",
};
const TYPE_LABELS = {
  flight: "✈ Flight", highspeed: "⚡ High Speed", regional: "🚂 Regional",
  scenic: "🎬 Scenic", nightjet: "🌙 Nightjet", train: "🚂 Train",
};
const TYPE_ICONS = {
  flight: "✈", highspeed: "⚡", regional: "🚂",
  scenic: "🎬", nightjet: "🌙", train: "🚂",
};
const URGENCY_COLORS = { TODAY: "#DC2626", "THIS WEEK": "#D97706", SOON: "#2563EB" };

// Parse a stop's `duration` field (e.g., "2 nights · Tue 16 – Thu 18 Jun") into
// nights count + checkin/checkout date strings + sortable Date objects. Used by
// the country-grouped timeline sidebar to compute accurate per-country totals.
const MONTH_TO_NUM = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
function parseStopDuration(duration) {
  const result = { nights: 0, checkinLabel: null, checkoutLabel: null, checkinDate: null, checkoutDate: null };
  if (!duration || typeof duration !== "string") return result;
  result.nights = parseInt(duration.match(/(\d+)\s*nights?/i)?.[1] || "0", 10);

  // Collect every "DD Mon" pattern, attaching the immediate day-of-week prefix when present.
  // Matches "Tue 16 Jun", "16 Jun", or just "16" (with month inherited from the next match).
  const dateRe = /(?:([A-Z][a-z]{2})\s+)?(\d{1,2})(?:\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec))?/g;
  const candidates = [];
  let m;
  while ((m = dateRe.exec(duration)) !== null) {
    // Skip standalone numbers that aren't dates (e.g., "21:45", "150 St. Gilgen")
    if (!m[1] && !m[3]) continue;
    candidates.push({ dow: m[1] || null, day: parseInt(m[2], 10), month: m[3] || null });
  }
  if (!candidates.length) return result;

  // Forward-fill missing months from next candidate that has one (e.g., "Tue 16" inherits "Jun" from "Thu 18 Jun").
  for (let i = candidates.length - 1; i >= 0; i--) {
    if (!candidates[i].month) {
      const next = candidates.slice(i + 1).find((c) => c.month);
      if (next) candidates[i].month = next.month;
    }
  }
  // Drop any still-missing-month entries (defensive).
  const valid = candidates.filter((c) => c.month && MONTH_TO_NUM[c.month] !== undefined);
  if (!valid.length) return result;

  const first = valid[0];
  const last = valid[valid.length - 1];
  const fmt = (c) => `${c.day} ${c.month}`;
  result.checkinLabel = fmt(first);
  result.checkoutLabel = fmt(last);
  result.checkinDate = new Date(2026, MONTH_TO_NUM[first.month], first.day);
  result.checkoutDate = new Date(2026, MONTH_TO_NUM[last.month], last.day);
  return result;
}
const CAL_TYPES = {
  explore: { border: "#2E5E2E", dot: "#4CAF50", glow: "rgba(76,175,80,0.06)", text: "#A8D5A2" },
  move:    { border: "#4A3000", dot: "#FF9800", glow: "rgba(255,152,0,0.06)", text: "#FFB74D" },
  arrive:  { border: "#1A3560", dot: "#64B5F6", glow: "rgba(100,181,246,0.06)", text: "#90CAF9" },
  night:   { border: "#2A1A50", dot: "#9575CD", glow: "rgba(149,117,205,0.1)", text: "#B39DDB" },
  travel:  { border: "#3A0A30", dot: "#F06292", glow: "rgba(240,98,146,0.08)", text: "#F48FB1" },
};


export default function App() {
  const { rates, src, npr } = useRates();
  const [active, setActive] = useState("rome");
  const [view, setView] = useState("overview");
  const [topTab, setTopTab] = useState(null);
  const [showNPR, setShowNPR] = useState(true);
  const [calDialogDay, setCalDialogDay] = useState(null);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const stop = STOPS.find((s) => s.id === active);
  const idx = STOPS.findIndex((s) => s.id === active);
  const calDay = CALENDAR.find((d) => d.stop === active);

  const journeyToStop = JOURNEYS.find((j) => {
    const toCityLower = (j.to || "").toLowerCase();
    const stopCityLower = (stop?.city || "").toLowerCase();
    return toCityLower.includes(stopCityLower) || stopCityLower.includes(toCityLower);
  });

  function handleStopChange(id) {
    const resolvedId = id === "imst" ? "innsbruck" : id;
    const exists = STOPS.find((s) => s.id === resolvedId);
    if (exists) {
      setActive(resolvedId);
      setView("overview");
    }
  }

  function handleCalClick(day) {
    const stopId = day.stop === "imst" ? "innsbruck" : day.stop;
    if (stopId && stopId !== "ktm") {
      setActive(stopId);
      setView("overview");
      setTopTab(null);
    }
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  const prevStop = idx > 0 ? STOPS[idx - 1] : null;
  const nextStop = idx < STOPS.length - 1 ? STOPS[idx + 1] : null;

  const stopCalDays = CALENDAR.filter((d) => {
    const resolvedStop = d.stop === "imst" ? "innsbruck" : d.stop;
    return resolvedStop === active;
  });

  const heroImg = getCityHero(stop?.id);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div className="header-title">Jamnata</div>
              <div className="header-subtitle">15 Jun – 6 Jul · 3 travellers · Europe 2026</div>
            </div>
            {/* Trip progress indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8 }}>
              <div style={{
                width: 120, height: 4, borderRadius: 4,
                background: 'var(--border)',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${((idx + 1) / STOPS.length) * 100}%`,
                  height: '100%',
                  borderRadius: 4,
                  background: 'var(--gradient-accent)',
                  backgroundSize: '200% auto',
                  transition: 'width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, color: 'var(--text-dim)',
                fontFamily: 'var(--mono)', letterSpacing: '0.05em',
              }}>
                {idx + 1}/{STOPS.length}
              </span>
            </div>
          </div>
          <div className="header-actions" />

        </div>

        {/* Sub-nav: single horizontal scroll strip, no group labels — pills speak for themselves */}
        <nav className="topnav">
          {[
            ["calendar", "📅", "Calendar"],
            ["journeys", "🚄", "Trains"],
            ["bookings", "🔗", "Book"],
            ["guide", "📖", "Guides"],
            ["timeline", "📆", "Timeline"],
            ["money", "💳", "Money"],
            ["transport", "🚇", "Transport"],
            ["scams", "⚠️", "Scams"],
            ["altroutes", "🛤", "Alt Routes"],
          ].map(([t, icon, label]) => (
            <button
              key={t}
              className={`topnav-tab${topTab === t ? " active" : ""}`}
              onClick={() => setTopTab((p) => (p === t ? null : t))}
              title={label}
            >
              <span className="topnav-tab-icon">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* ── TOP PANELS ── */}
      {topTab === "calendar" && <CalendarPanel active={active} onOpenDay={setCalDialogDay} />}
      {calDialogDay && (
        <CalendarDayDialog
          day={calDialogDay}
          onClose={() => setCalDialogDay(null)}
          onGoToStop={(stopId) => {
            setCalDialogDay(null);
            handleCalClick({ stop: stopId });
          }}
        />
      )}
      {topTab === "journeys" && <JourneysPanel showNPR={showNPR} npr={npr} />}
      {topTab === "bookings" && <BookingsPanel />}
      {topTab === "guide" && <GuidePanel />}
      {topTab === "money" && <MoneyPanel />}
      {topTab === "transport" && <TransportValidationPanel />}
      {topTab === "timeline" && <BookingTimelinePanel />}
      {topTab === "scams" && <ScamsPanel />}
      {topTab === "altroutes" && <AltRoutesPanel />}

      {/* ── MAIN LAYOUT ── */}
      <div className="app-layout">
        {/* Sidebar — Day-by-day */}
        <TripTimelineSidebar active={active} onClickDay={handleCalClick} npr={npr} />

        {/* Main */}
        <main className="main">
          {/* Mobile stop selector */}
          <div style={{ padding: "16px 20px 0" }}>
            <select className="mobile-stop-select" value={active} onChange={(e) => handleStopChange(e.target.value)}>
              {STOPS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.flag} {s.city} — {s.duration.split("·")[0].trim()}
                </option>
              ))}
            </select>
          </div>

          {/* View tabs — replaces old right-side Explore rail */}
          <div className="view-tabs">
            {[
              { id: "overview", icon: "✨", label: "Overview" },
              { id: "gallery", icon: "🖼", label: "Gallery" },
              { id: "budget", icon: "💰", label: "Budget" },
              { id: "checklist", icon: "✅", label: "Checklist" },
              { id: "phrasebook", icon: "🗣", label: "Phrases" },
              { id: "survival", icon: "🧭", label: "Survival" },
              { id: "docs", icon: "📋", label: "Visa & Docs" },
            ].map((item) => (
              <button
                key={item.id}
                className={`view-tab${view === item.id ? " active" : ""}`}
                onClick={() => setView(item.id)}
              >
                <span className="view-tab-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Hero */}
          <div
            className="hero"
            style={{
              position: "relative",
              overflow: "hidden",
              background: heroImg
                ? "none"
                : `linear-gradient(135deg, ${stop.color}12 0%, transparent 60%)`,
            }}
          >
            {/* Hero background image with parallax-like effect */}
            {heroImg && (
              <>
                <div style={{
                  position: "absolute", inset: "-10px",
                  backgroundImage: `url(${heroImg})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  filter: "brightness(0.4) saturate(1.2)",
                  zIndex: 0,
                  transition: "background-image 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s ease",
                  transform: "scale(1.05)",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.75) 100%)",
                  zIndex: 1,
                }} />
              </>
            )}

            {/* Hero arrows — corner placement, discreet */}
            {prevStop && (
              <button
                className="hero-arrow hero-arrow--prev"
                onClick={() => handleStopChange(prevStop.id)}
                title={`← ${prevStop.city}`}
              >
                ←
              </button>
            )}
            {nextStop && (
              <button
                className="hero-arrow hero-arrow--next"
                onClick={() => handleStopChange(nextStop.id)}
                title={`${nextStop.city} →`}
              >
                →
              </button>
            )}

            <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
              {/* Day badge — single contextual marker */}
              {stopCalDays.length > 0 && (
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                  <span className="hero-day-badge">
                    DAY {stopCalDays[0].dayN}{stopCalDays.length > 1 ? `–${stopCalDays[stopCalDays.length - 1].dayN}` : ""} · {stopCalDays[0].date}{stopCalDays.length > 1 ? ` – ${stopCalDays[stopCalDays.length - 1].date}` : ""}
                  </span>
                </div>
              )}

              <div className="hero-meta" style={{ justifyContent: "center" }}>
                <span style={heroImg ? { color: "rgba(255,255,255,0.75)" } : {}}>{stop.flag} {stop.country}</span>
                <span className="dot" style={heroImg ? { color: "rgba(255,255,255,0.3)" } : {}}>·</span>
                <span style={heroImg ? { color: "rgba(255,255,255,0.75)" } : {}}>{stop.duration}</span>
              </div>
              <h1
                className="hero-title"
                style={{
                  textAlign: "center",
                  ...(heroImg ? { color: "#fff", textShadow: "0 4px 24px rgba(0,0,0,0.4)" } : {}),
                }}
              >
                {stop.city}
              </h1>
              <p
                className="hero-tagline"
                style={{
                  textAlign: "center",
                  maxWidth: 600,
                  margin: "0 auto 28px",
                  ...(heroImg ? { color: "rgba(255,255,255,0.85)" } : {}),
                }}
              >
                {stop.tagline}
              </p>
              <div className="hero-stats" style={{ justifyContent: "center" }}>
                <div
                  className="stat-card"
                  style={heroImg ? { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px) saturate(1.4)" } : {}}
                >
                  <div className="label" style={heroImg ? { color: "rgba(255,255,255,0.6)" } : {}}>Stay (for 3)</div>
                  <div className="val" style={heroImg ? { color: "#fff" } : {}}>{stop.budget}</div>
                </div>
                <div
                  className="stat-card"
                  style={heroImg ? { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px) saturate(1.4)" } : {}}
                >
                  <div className="label" style={heroImg ? { color: "rgba(255,255,255,0.6)" } : {}}>June weather</div>
                  <div className="val" style={heroImg ? { color: "#fff" } : {}}>{stop.weather.temp}</div>
                </div>
              </div>
            </div>
          </div>

          {/* View Content */}
          {view === "overview" && <OverviewView stop={stop} idx={idx} stops={STOPS} journeys={JOURNEYS} onStopChange={handleStopChange} showNPR={showNPR} npr={npr} />}
          {view === "gallery" && <GalleryView stop={stop} />}
          {view === "budget" && <BudgetView stop={stop} stops={STOPS} showNPR={showNPR} npr={npr} />}
          {view === "checklist" && <ChecklistView />}
          {view === "phrasebook" && <PhrasebookView stop={stop} />}
          {view === "survival" && <SurvivalGuideView stop={stop} />}
          {view === "docs" && <DocsView />}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════ */


function HiddenGemsContent({ stop }) {
  if (!stop.hiddenGems?.length) return null;
  const items = stop.hiddenGems.map((gem) => ({
    head: (
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 12, width: '100%' }}>
        <span>💎 {gem.title}</span>
        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, whiteSpace: 'nowrap' }}>{gem.cost}</span>
      </span>
    ),
    detail: (
      <>
        <div>{gem.desc}</div>
        {gem.tip && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--sans)' }}>
            💡 {gem.tip}
          </div>
        )}
      </>
    ),
  }));
  return <DrillDown items={items} />;
}

function WorkspacesContent({ stop }) {
  const spots = stop.workspaces?.filter((ws) => ws.cost === 'Free' && ws.power) ?? [];
  if (!spots.length) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
      {spots.map((ws, i) => {
        const mapsUrl = makeGoogleMapsDirections({ destination: `${ws.name}, ${stop.city}`, mode: 'walking' });
        return (
          <div key={i} style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ fontSize: 18 }}>📚</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--sans)' }}>{ws.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--sans)', marginTop: 1 }}>{ws.area}</div>
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)',
                whiteSpace: 'nowrap', fontFamily: 'var(--sans)',
              }}>
                {ws.type}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11.5, fontFamily: 'var(--sans)', marginBottom: 8 }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>💰 Free</span>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>🔌 Outlets</span>
              <span style={{ color: 'var(--text-muted)' }}>📶 {ws.wifi}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>🕐 {ws.hours}</span>
              <a href={mapsUrl} target="_blank" rel="noreferrer" style={{
                flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: '#2563EB',
                textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: 'var(--sans)',
              }}>
                Directions ↗
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivitiesContent({ stop }) {
  if (!stop.activities?.length) return null;

  const typeColors = {
    Adventure: { bg: '#FEF3C7', color: '#92400E', border: '#FCD34D' },
    Culture: { bg: '#EDE9FE', color: '#5B21B6', border: '#C4B5FD' },
    Food: { bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5' },
    Nature: { bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7' },
    Nightlife: { bg: '#EDE9FE', color: '#4C1D95', border: '#A78BFA' },
    Tour: { bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD' },
    Relaxation: { bg: '#E0F2FE', color: '#075985', border: '#7DD3FC' },
    Shopping: { bg: '#FFF7ED', color: '#9A3412', border: '#FDBA74' },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      {stop.activities.map((act, i) => {
        const tc = typeColors[act.type] || typeColors.Tour;
        return (
          <div key={i} style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            {/* Type badge + Duration */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`,
                fontFamily: 'var(--sans)',
              }}>
                {act.type}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
                {act.duration}
              </span>
            </div>

            {/* Name */}
            <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--sans)', margin: '0 0 8px', lineHeight: 1.3 }}>
              {act.name}
            </h4>

            {/* Description */}
            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--sans)', lineHeight: 1.6, margin: '0 0 12px', flex: 1 }}>
              {act.desc}
            </p>

            {/* Cost + Booking */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', fontFamily: 'var(--sans)' }}>
                {act.cost}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--sans)', textAlign: 'right', maxWidth: '60%' }}>
                {act.book}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VideosContent({ stop }) {
  const searchQuery = encodeURIComponent(`${stop.city} ${stop.country} travel guide 2024`);
  const searchQuery2 = encodeURIComponent(`${stop.city} things to do 2024`);
  const searchQuery3 = encodeURIComponent(`${stop.city} walking tour 4K`);
  const searchQuery4 = encodeURIComponent(`${stop.city} food tour`);
  const searchQuery5 = encodeURIComponent(`${stop.city} hidden gems`);

  const videoLinks = [
    { title: `${stop.city} Travel Guide`, query: searchQuery, icon: '🎬', desc: 'Complete travel guides and tips' },
    { title: `Things to Do in ${stop.city}`, query: searchQuery2, icon: '✨', desc: 'Top attractions and activities' },
    { title: `${stop.city} Walking Tour`, query: searchQuery3, icon: '🚶', desc: '4K walking tours through the city' },
    { title: `${stop.city} Food Tour`, query: searchQuery4, icon: '🍽', desc: 'Best food and restaurants' },
    { title: `${stop.city} Hidden Gems`, query: searchQuery5, icon: '💎', desc: 'Off-the-beaten-path spots' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
      {videoLinks.map((v, i) => (
        <a
          key={i}
          href={`https://www.youtube.com/results?search_query=${v.query}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            textDecoration: 'none',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#FF0000'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#FF00001a', border: '1px solid #FF000030',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>
            {v.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--sans)', marginBottom: 2 }}>
              {v.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
              {v.desc}
            </div>
          </div>
          <div style={{ fontSize: 20, color: '#FF0000', flexShrink: 0 }}>▶</div>
        </a>
      ))}
    </div>
  );
}

export function GalleryView({ stop }) {
  const gallery = getCityGallery(stop.id);
  const highlights = CITY_IMAGES?.[stop.id]?.highlights || [];
  const heroImg = getCityHero(stop.id);
  const allImages = [];

  if (heroImg) allImages.push({ url: heroImg, title: `${stop.city} Hero`, category: "Hero" });
  highlights.forEach(h => allImages.push(h));
  gallery.forEach((img, i) => {
    const url = typeof img === 'string' ? img : img.url;
    const title = typeof img === 'object' ? (img.alt || img.caption || `${stop.city} ${i+1}`) : `${stop.city} ${i+1}`;
    if (!allImages.find(a => a.url === url)) {
      allImages.push({ url, title, category: "Gallery" });
    }
  });

  return (
    <div className="panel">
      <div className="section-header">
        <h2 className="section-title">{stop.flag} {stop.city} — Photos</h2>
        <span style={{ fontSize: 13, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
          {allImages.length} photos
        </span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
      }}>
        {allImages.map((img, i) => (
          <div key={i} style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            cursor: 'pointer',
            aspectRatio: i === 0 ? '16/10' : '4/3',
            gridColumn: i === 0 ? 'span 2' : 'auto',
          }}>
            <img
              src={img.url}
              alt={img.title}
              loading="lazy"
              onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s' }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '12px 14px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>
                {img.category}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                {img.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OverviewView({ stop }) {
  return (
    <div className="panel" style={{ padding: 0 }}>

      {/* Work & Rest — the only section kept */}
      <div style={{ padding: 24 }} className="panel">
        <div className="section-header">
          <h2 className="section-title">Work & Rest Spots</h2>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
            Libraries, cafes & coworking for laptop work
          </span>
        </div>
        {stop.workspaces?.length > 0 ? <WorkspacesContent stop={stop} /> : (
          <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>No workspace data for this stop yet.</p>
        )}
      </div>
    </div>
  );
}
function StoryContent({ stop }) {
  const landmarks = getCityGallery(stop.id);

  return (
    <>
      {/* City Image */}
      {getCityHero(stop.id) && (
        <div style={{
          position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden",
          marginBottom: 24, height: 220,
        }}>
          <img src={getCityHero(stop.id)} alt={stop.city} style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
          }} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)",
          }} />
          <div style={{
            position: "absolute", bottom: 16, left: 20,
            color: "#fff", fontSize: 20, fontWeight: 700,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          }}>
            {stop.flag} {stop.city}
          </div>
        </div>
      )}

      <div className="story-grid">
        <div>
          <h2 className="story-title">The Story</h2>
          <p className="story-text">{stop.story}</p>
          <h2 className="story-title">History</h2>
          <p className="history-text">{stop.history}</p>
          <h2 className="story-title">Must Do</h2>
          {stop.must.map((m, i) => (
            <div key={i} className="must-item">
              <span className="must-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="must-text">{m}</span>
            </div>
          ))}

          {/* Landmark Image Gallery */}
          {landmarks && Array.isArray(landmarks) && landmarks.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h2 className="story-title">Gallery</h2>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: 12,
              }}>
                {landmarks.map((img, i) => (
                  <div key={i} style={{
                    borderRadius: "var(--radius)",
                    overflow: "hidden",
                    border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
                  >
                    <img
                      src={typeof img === "string" ? img : img?.url}
                      alt={typeof img === "string" ? `${stop.city} landmark ${i + 1}` : (img?.alt || `${stop.city} landmark ${i + 1}`)}
                      style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }}
                      loading="lazy"
                    />
                    {typeof img === "object" && img?.caption && (
                      <div style={{ padding: "8px 10px", fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          {/* Google Maps — interactive, searchable */}
          <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <h3 className="card-title" style={{ margin: 0 }}>Map — {stop.city}</h3>
            </div>
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(stop.city + " tourist attractions")}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              title={`${stop.city} map`}
              style={{ width: "100%", height: 450, border: "none", display: "block" }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div style={{
              padding: "8px 16px", borderTop: "1px solid var(--border)",
              display: "flex", gap: 8, flexWrap: "wrap",
            }}>
              <a
                href={`https://www.google.com/maps/search/things+to+do+in+${encodeURIComponent(stop.city)}`}
                target="_blank" rel="noreferrer"
                style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 6,
                  background: "var(--accent)", color: "#fff", fontWeight: 600,
                  fontFamily: "var(--sans)", textDecoration: "none",
                }}
              >Open in Google Maps</a>
              <a
                href={`https://www.google.com/maps/search/restaurants+in+${encodeURIComponent(stop.city)}`}
                target="_blank" rel="noreferrer"
                style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 6,
                  background: "var(--bg-hover)", color: "var(--text)", fontWeight: 600,
                  fontFamily: "var(--sans)", textDecoration: "none", border: "1px solid var(--border)",
                }}
              >Restaurants</a>
              <a
                href={`https://www.google.com/maps/search/hotels+in+${encodeURIComponent(stop.city)}`}
                target="_blank" rel="noreferrer"
                style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 6,
                  background: "var(--bg-hover)", color: "var(--text)", fontWeight: 600,
                  fontFamily: "var(--sans)", textDecoration: "none", border: "1px solid var(--border)",
                }}
              >Hotels</a>
              <a
                href={`https://www.google.com/maps/search/train+station+in+${encodeURIComponent(stop.city)}`}
                target="_blank" rel="noreferrer"
                style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 6,
                  background: "var(--bg-hover)", color: "var(--text)", fontWeight: 600,
                  fontFamily: "var(--sans)", textDecoration: "none", border: "1px solid var(--border)",
                }}
              >Train Station</a>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Where to Eat</h3>
            {stop.eat.map((e, i) => (
              <div key={i} className="eat-item">
                <div className="eat-header">
                  <span className="eat-name">{e.name}</span>
                  <span className="eat-dish">{e.dish}</span>
                </div>
                <div className="eat-type">{e.type}</div>
                <div className="eat-note">{e.note}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <h3 className="card-title">Weather in June</h3>
            <div className="weather-temp">{stop.weather.temp}</div>
            <div className="weather-rain">{stop.weather.rain}</div>
            <div className="tip-box">{stop.weather.tip}</div>
            <div className="weather-best">✓ {stop.weather.best}</div>
          </div>
        </div>
      </div>
    </>
  );
}

// Approximate lat/lon for each stop — used by the SVG overview map.
const STOP_COORDS = {
  rome:          { lat: 41.90, lon: 12.50, label: "Rome",        flag: "🇮🇹" },
  como:          { lat: 45.81, lon:  9.08, label: "Como",        flag: "🇮🇹" },
  lucerne:       { lat: 47.05, lon:  8.31, label: "Lucerne",     flag: "🇨🇭" },
  lauterbrunnen: { lat: 46.59, lon:  7.91, label: "Lauterbr.",   flag: "🇨🇭" },
  interlaken:    { lat: 46.69, lon:  7.86, label: "Interlaken",  flag: "🇨🇭" },
  zurich:        { lat: 47.38, lon:  8.54, label: "Zürich",      flag: "🇨🇭" },
  innsbruck:     { lat: 47.27, lon: 11.40, label: "Innsbruck",   flag: "🇦🇹" },
  munich:        { lat: 48.14, lon: 11.58, label: "Munich",      flag: "🇩🇪" },
  salzburg:      { lat: 47.81, lon: 13.05, label: "Salzburg",    flag: "🇦🇹" },
  vienna:        { lat: 48.21, lon: 16.37, label: "Vienna",      flag: "🇦🇹" },
  prague:        { lat: 50.07, lon: 14.43, label: "Prague",      flag: "🇨🇿" },
  berlin:        { lat: 52.52, lon: 13.41, label: "Berlin",      flag: "🇩🇪" },
  amsterdam:     { lat: 52.37, lon:  4.90, label: "Amsterdam",   flag: "🇳🇱" },
};

function EuropeRouteMap({ stops, idx, onStopChange }) {
  const W = 700, H = 500;
  // Bounding box covering all stops with a little margin.
  const lonMin = 2,  lonMax = 18;
  const latMin = 40, latMax = 54;
  const project = (lat, lon) => {
    const x = ((lon - lonMin) / (lonMax - lonMin)) * (W - 80) + 40;
    const y = H - (((lat - latMin) / (latMax - latMin)) * (H - 80) + 40);
    return [x, y];
  };

  // Only stops that have known coords AND are still in the active route.
  const points = stops
    .map((s, i) => {
      const c = STOP_COORDS[s.id];
      if (!c) return null;
      const [x, y] = project(c.lat, c.lon);
      const nights = parseInt((s.duration || "").match(/(\d+)\s*nights?/i)?.[1] || "0", 10);
      return { ...c, id: s.id, i, x, y, nights, isCurrent: i === idx };
    })
    .filter(Boolean);

  // Sleeping stops (nights >= 1) are pinned with a label; transit stops are smaller markers.
  const sleepers = points.filter(p => p.nights >= 1);
  const transitOnly = points.filter(p => p.nights < 1);

  // Path connecting all stops in chronological order.
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  // Plane icons at start (Rome arrival) and end (Amsterdam departure).
  const first = points[0];
  const last = points[points.length - 1];

  // Country shading rectangles — very rough geographic blocks for a flat aesthetic.
  const countryBlocks = [
    { id: "italy",   d: "M 380 460 L 460 470 L 470 380 L 360 360 Z",   fill: "#FFF4F0" },
    { id: "swiss",   d: "M 270 280 L 360 290 L 360 360 L 260 350 Z",   fill: "#FFF8F0" },
    { id: "austria", d: "M 360 290 L 530 300 L 530 360 L 370 360 Z",   fill: "#FFFBEC" },
    { id: "germany", d: "M 270 100 L 460 90 L 470 290 L 270 280 Z",    fill: "#F0F4FF" },
    { id: "czech",   d: "M 460 90 L 540 100 L 540 200 L 470 200 Z",    fill: "#F8F0FF" },
    { id: "nl",      d: "M 80 70 L 180 60 L 200 130 L 90 140 Z",       fill: "#FFFEEC" },
  ];

  return (
    <div style={{
      marginBottom: 28,
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      border: "1px solid var(--border-light)",
      boxShadow: "var(--shadow-md)",
      background: "linear-gradient(180deg, #FAFCFF 0%, #F4F8FB 100%)",
      padding: "16px 16px 8px",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 8, padding: "0 4px",
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", margin: 0, fontFamily: "var(--sans)", letterSpacing: "-0.3px" }}>
          Trip Map · 10 cities · 21 days
        </h3>
        <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
          ✈️ Rome → Amsterdam ✈️
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Country fill blocks */}
        {countryBlocks.map(c => (
          <path key={c.id} d={c.d} fill={c.fill} stroke="#E2E8F0" strokeWidth="1" />
        ))}

        {/* Route line */}
        <path
          d={pathD}
          fill="none"
          stroke="#1565C0"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0"
          opacity="0.9"
        />

        {/* Plane icon at arrival (Rome) */}
        {first && (
          <g transform={`translate(${first.x - 30} ${first.y + 18})`}>
            <text fontSize="20" fill="#0277BD">✈️</text>
          </g>
        )}
        {/* Plane icon at departure (Amsterdam) */}
        {last && (
          <g transform={`translate(${last.x - 8} ${last.y - 30})`}>
            <text fontSize="20" fill="#0277BD">✈️</text>
          </g>
        )}

        {/* Transit-only markers (small dots, no labels) */}
        {transitOnly.map(p => (
          <g key={p.id} onClick={() => onStopChange(p.id)} style={{ cursor: "pointer" }}>
            <circle cx={p.x} cy={p.y} r="4" fill="#94A3B8" stroke="#fff" strokeWidth="1.5" />
          </g>
        ))}

        {/* Sleeping stop pins with night badges */}
        {sleepers.map(p => {
          const r = p.isCurrent ? 11 : 8;
          const fill = p.isCurrent ? "#C62828" : "#1565C0";
          return (
            <g key={p.id} onClick={() => onStopChange(p.id)} style={{ cursor: "pointer" }}>
              {p.isCurrent && (
                <circle cx={p.x} cy={p.y} r={r + 6} fill="#C62828" opacity="0.18">
                  <animate attributeName="r" values={`${r + 6};${r + 12};${r + 6}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.18;0.05;0.18" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke="#fff" strokeWidth="2" />
              <text x={p.x} y={p.y + 3} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="700">
                {p.nights}
              </text>
              <text x={p.x} y={p.y - r - 6} textAnchor="middle" fontSize="11" fill="var(--text)" fontWeight={p.isCurrent ? 800 : 600} fontFamily="var(--sans)">
                {p.flag} {p.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{
        display: "flex", gap: 16, justifyContent: "center",
        fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--sans)",
        padding: "4px 0 8px",
      }}>
        <span><span style={{ color: "#1565C0", fontWeight: 700 }}>●</span> overnight stop (number = nights)</span>
        <span><span style={{ color: "#94A3B8", fontWeight: 700 }}>●</span> Swiss day-tour transit</span>
        <span><span style={{ color: "#C62828", fontWeight: 700 }}>●</span> currently viewing</span>
      </div>
    </div>
  );
}

function RouteContent({ stop, idx, stops, journeys, onStopChange }) {
  const prevStop = idx > 0 ? stops[idx - 1] : null;
  const nextStop = idx < stops.length - 1 ? stops[idx + 1] : null;

  // Map each consecutive stop pair to their journey(s)
  const stopJourneyMap = {};
  let jIdx = 1; // skip first journey (KTM→FCO flight)
  for (let si = 1; si < stops.length && jIdx < journeys.length; si++) {
    const key = `${stops[si-1].id}-${stops[si].id}`;
    stopJourneyMap[key] = [];
    // Collect all journeys until we find one that seems to end near the next stop
    while (jIdx < journeys.length - 1) {
      stopJourneyMap[key].push(journeys[jIdx]);
      jIdx++;
      // Check if next journey starts from a different city than current sequence
      const nextFrom = (journeys[jIdx]?.from || "").toLowerCase();
      const curStopCity = (stops[si]?.city || "").toLowerCase();
      const curStopId = (stops[si]?.id || "").toLowerCase();
      if (nextFrom.includes(curStopId) || curStopId.includes(nextFrom.split(" ")[0].toLowerCase()) || nextFrom.includes(curStopCity.split(" ")[0].toLowerCase())) {
        break;
      }
    }
  }

  return (
    <>
      <h2 className="story-title">Route Overview</h2>

      {/* Trafalgar-style Europe overview map — SVG, lightweight */}
      <EuropeRouteMap stops={stops} idx={idx} onStopChange={onStopChange} />

      {/* Route Map — Google Maps (zoomed to current city) */}
      <div style={{ marginBottom: 28, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(stop.city)}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
          title="Trip route map"
          style={{ width: "100%", height: 400, border: "none", display: "block" }}
          loading="lazy"
          allowFullScreen
        />
      </div>

      {/* Visual Route Timeline — Vertical */}
      <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 20, fontFamily: "var(--sans)", letterSpacing: "-0.3px" }}>
        Full Route Timeline
      </h3>
      <div style={{ position: "relative", paddingLeft: 40, marginBottom: 32 }}>
        {/* Vertical line */}
        <div style={{
          position: "absolute", left: 18, top: 0, bottom: 0,
          width: 2, background: "var(--border-light)",
        }} />

        {stops.map((s, i) => {
          const isCurrent = i === idx;
          const cityImg = getCityHero(s.id);
          const prevId = i > 0 ? stops[i-1].id : null;
          const pairKey = prevId ? `${prevId}-${s.id}` : null;
          const journeysForSegment = pairKey ? (stopJourneyMap[pairKey] || []) : [];

          return (
            <div key={s.id}>
              {/* Transport connector — compact */}
              {journeysForSegment.length > 0 && (
                <div style={{ padding: "2px 0 2px 6px", marginLeft: -22 }}>
                  {journeysForSegment.map((jb, ji) => (
                    <div key={ji} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "3px 0",
                      fontSize: 11, fontFamily: "var(--sans)", color: "var(--text-dim)",
                    }}>
                      <span style={{ fontSize: 12 }}>{TYPE_ICONS[jb.type] || "🚄"}</span>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{jb.dur}</span>
                      <span>·</span>
                      <span style={{ fontWeight: 600, color: "var(--accent)" }}>{jb.cost}</span>
                      <span>·</span>
                      <span>{jb.via}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stop node */}
              <div
                onClick={() => onStopChange(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 16px", marginLeft: -22,
                  borderRadius: "var(--radius)",
                  background: isCurrent ? "var(--accent-bg)" : "transparent",
                  border: isCurrent ? "1px solid var(--accent-border)" : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = "transparent"; }}
              >
                {/* Node dot */}
                <div style={{
                  width: isCurrent ? 28 : 22, height: isCurrent ? 28 : 22,
                  borderRadius: "50%",
                  background: isCurrent ? "var(--accent)" : "var(--bg-raised)",
                  border: `2px solid ${isCurrent ? "var(--accent)" : "var(--border-light)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isCurrent ? 14 : 11,
                  flexShrink: 0, zIndex: 2,
                  boxShadow: isCurrent ? "0 0 0 4px var(--accent-bg)" : "none",
                  transition: "all 0.2s",
                }}>
                  {s.flag}
                </div>

                {/* City thumbnail */}
                {cityImg && (
                  <div style={{
                    width: 64, height: 64, borderRadius: 10, overflow: "hidden",
                    flexShrink: 0, border: "1px solid var(--border-light)",
                    boxShadow: "var(--shadow)",
                  }}>
                    <img src={cityImg} alt={s.city} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: isCurrent ? 16 : 14, fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? "var(--accent)" : "var(--text)",
                    fontFamily: "var(--sans)",
                  }}>
                    {s.flag} {s.city}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
                    {s.duration}
                  </div>
                </div>

                {/* Country badge */}
                <div style={{
                  fontSize: 10, color: "var(--text-faint)", fontFamily: "var(--sans)",
                  padding: "2px 8px", borderRadius: 20,
                  background: "var(--bg-hover)", border: "1px solid var(--border)",
                  whiteSpace: "nowrap",
                }}>
                  {s.country}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrival / Departure info */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, letterSpacing: "0.05em" }}>
            Arriving from
          </div>
          {prevStop ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                {prevStop.flag} {prevStop.city}
              </div>
              {stop.connections?.legs?.[0] && (
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  {stop.connections.legs[0].train} · {stop.connections.legs[0].dur} · {stop.connections.legs[0].cost}
                </div>
              )}
              {stop.connections?.legs?.[0]?.dep && (
                <div style={{ fontSize: 13, color: "var(--accent)", marginTop: 4 }}>
                  Departs: {stop.connections.legs[0].dep}
                </div>
              )}
              {stop.connections?.legs?.[stop.connections.legs.length - 1]?.arr && (
                <div style={{ fontSize: 13, color: "#4CAF50", marginTop: 2 }}>
                  Arrives: {stop.connections.legs[stop.connections.legs.length - 1].arr}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 14, color: "var(--text-dim)" }}>This is your first stop — you fly here from Kathmandu.</div>
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 8, letterSpacing: "0.05em" }}>
            Next Destination
          </div>
          {nextStop ? (
            <>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
                {nextStop.flag} {nextStop.city}
              </div>
              {nextStop.connections?.legs?.[0] && (
                <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  {nextStop.connections.legs[0].train} · {nextStop.connections.legs[0].dur} · {nextStop.connections.legs[0].cost}
                </div>
              )}
            </>
          ) : (
            <div style={{ fontSize: 14, color: "var(--text-dim)" }}>This is your final European stop — fly home from here.</div>
          )}
        </div>
      </div>

      {/* Quick connection summary — compact */}
      {stop.connections && (
        <div style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", color: "var(--text-dim)", letterSpacing: "0.05em", marginBottom: 10, fontFamily: "var(--sans)" }}>
              How to get here
            </div>
            {stop.connections.legs.map((leg, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "6px 0",
                borderBottom: i < stop.connections.legs.length - 1 ? "1px solid var(--border)" : "none",
                fontSize: 13, fontFamily: "var(--sans)",
              }}>
                <span style={{ color: "var(--text)" }}>🚄 {leg.train}</span>
                <span style={{ color: "var(--text-dim)" }}>{leg.dur} · <span style={{ fontWeight: 700, color: "var(--accent)" }}>{leg.cost}</span></span>
              </div>
            ))}
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
              See the "Getting Here" section above for full details, platform info & tips
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ItineraryTimeline({ items = [] }) {
  const [openIdx, setOpenIdx] = useState(null);
  if (!items.length) return null;
  return (
    <>
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="itin-item">
            <div className={`itin-line${i === 0 ? " first" : i === items.length - 1 ? " last" : ""}`}>
              <div className="itin-dot" />
            </div>
            <div className="itin-content" style={{ cursor: "pointer" }} onClick={() => setOpenIdx(isOpen ? null : i)}>
              <div className="itin-time">{item.time}</div>
              <div className="itin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span className="itin-icon">{item.icon}</span>
                  <h3 className="itin-title" style={{ margin: 0 }}>{item.title}</h3>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "var(--sans)",
                    color: "var(--text-dim)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                  }}
                >
                  {isOpen ? "▾ less" : "▸ details"}
                </span>
              </div>
              {isOpen && (
                <>
                  <p className="itin-desc-text">{item.desc}</p>
                  {item.tip && <div className="itin-tip">{item.tip}</div>}
                </>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

function ItineraryContent({ stop }) {
  const heroImg = getCityHero(stop.id);
  const mapEmbed = getCityMap(stop.id);

  return (
    <>
      {/* Destination Image Banner */}
      {heroImg && (
        <div style={{
          position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden",
          marginBottom: 24, height: 200,
        }}>
          <img src={heroImg} alt={stop.city} style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
          }} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
          }} />
          <div style={{
            position: "absolute", bottom: 16, left: 20, right: 20,
            color: "#fff", zIndex: 2,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
              {stop.flag} {stop.city} — Day by Day
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{stop.duration}</div>
          </div>
        </div>
      )}

      {/* Google Maps — interactive */}
      <div style={{
        borderRadius: "var(--radius-lg)", overflow: "hidden",
        border: "1px solid var(--border-light)", marginBottom: 24,
        boxShadow: "var(--shadow-md)",
      }}>
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(stop.city + " city center")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
          title={`${stop.city} map`}
          style={{ width: "100%", height: 300, border: "none", display: "block" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <h2 className="story-title">Day by Day</h2>
      <p className="itin-desc">Tap any row to expand details &amp; tips.</p>
      <ItineraryTimeline items={stop.itinerary} />


      {/* Station Guide */}
      {stop.stationGuide && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 16, fontFamily: "var(--sans)" }}>
            🚉 Station Quick Guide — {stop.stationGuide.stationName}
          </h3>
          <div style={{
            background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
            borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 16,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
              Step-by-step when you arrive
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {stop.stationGuide.arrivalSteps.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px", borderRadius: 10,
                  background: "var(--bg-raised)", border: "1px solid var(--border)",
                  boxShadow: "var(--shadow)",
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "var(--accent)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, fontWeight: 700, flexShrink: 0,
                  }}>
                    {s.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 16 }}>{s.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>{s.action}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.6 }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {stop.stationGuide.exitInfo && (
            <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--bg-hover)", border: "1px solid var(--border)", marginBottom: 8, fontSize: 13, fontFamily: "var(--sans)", color: "var(--text)" }}>
              <strong>🚪 Getting to your accommodation:</strong> {stop.stationGuide.exitInfo}
            </div>
          )}
          {stop.stationGuide.platformTip && (
            <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--bg-hover)", border: "1px solid var(--border)", fontSize: 13, fontFamily: "var(--sans)", color: "var(--text)" }}>
              <strong>🚂 Next train:</strong> {stop.stationGuide.platformTip}
            </div>
          )}
        </div>
      )}

      {/* Local Transport */}
      {stop.localTransport && stop.localTransport.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 16, fontFamily: "var(--sans)" }}>
            🚌 Getting Around {stop.city}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {stop.localTransport.map((t, i) => (
              <div key={i} style={{
                padding: "16px 18px", borderRadius: 12,
                background: "var(--bg-raised)", border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{t.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>{t.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)" }}>{t.cost}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.6, marginBottom: 6 }}>{t.detail}</div>
                {t.tip && <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--sans)", lineHeight: 1.5 }}>💡 {t.tip}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {stop.risks?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--red, #D32F2F)", marginBottom: 16, fontFamily: "var(--sans)" }}>
            ⚠️ What Could Go Wrong
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {stop.risks.map((r, i) => (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: 10,
                background: "var(--red-bg, rgba(244,67,54,0.06))",
                border: "1px solid var(--red-border, rgba(244,67,54,0.2))",
                borderLeft: "3px solid var(--red, #D32F2F)",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 4 }}>
                  {r.risk}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.6 }}>
                  💡 {r.solution}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CompareContent({ stop }) {
  const fc = stop?.connections?.flightComparison;
  const acc = stop?.accommodation;
  const hasFlightComparison = fc?.available;
  const hasAccommodation = acc?.airbnb || acc?.hostel || acc?.hotel;

  if (!hasFlightComparison && !hasAccommodation) {
    return (
      <div style={{ textAlign: "center", padding: "60px 48px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>&#128202;</div>
        <div style={{ fontSize: 18, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
          No comparison data available for {stop.city}.
        </div>
        <div style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 8 }}>
          This is a transit stop — no flight alternatives or accommodation comparisons needed.
        </div>
      </div>
    );
  }

  const thStyle = { padding: "12px 16px", textAlign: "center", color: "var(--text-dim)", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" };
  const tdStyle = { padding: "12px 16px", textAlign: "center" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: "var(--sans)", color: "var(--text)" };

  return (
    <>
      {/* Train vs Flight comparison */}
      {hasFlightComparison && (
        <div style={{ marginBottom: 32 }}>
          <h2 className="story-title">&#128644; Train vs &#9992; Flight — {fc.route}</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                  <th style={{ ...thStyle, textAlign: "left" }}>Criteria</th>
                  <th style={thStyle}>🚄 Train</th>
                  <th style={thStyle}>✈ Flight</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>Travel Time</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "var(--text)" }}>{fc.trainTime}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "var(--text)" }}>{fc.flightTime}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-hover)" }}>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>Cost per person</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "#4CAF50", background: "rgba(76,175,80,0.06)" }}>{fc.trainCost}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: "#E57373" }}>{fc.flightCost}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>Real door-to-door time</td>
                  <td style={{ ...tdStyle, color: "#4CAF50", background: "rgba(76,175,80,0.06)" }}>Same as above (city centre → city centre)</td>
                  <td style={tdStyle}>Add 2–3 hrs for airport transfers + check-in + security</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-hover)" }}>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>Luggage</td>
                  <td style={{ ...tdStyle, color: "#4CAF50", background: "rgba(76,175,80,0.06)" }}>Unlimited, free, no weight limits</td>
                  <td style={tdStyle}>Cabin bag only (checked bags €20–40 extra)</td>
                </tr>
                <tr>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>Scenery</td>
                  <td style={{ ...tdStyle, color: "#4CAF50", background: "rgba(76,175,80,0.06)" }}>Alpine views, cities, countryside</td>
                  <td style={tdStyle}>Clouds</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="tip-box" style={{ marginTop: 16, padding: "16px 20px", borderRadius: 10 }}>
            <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
              ✅ Verdict
            </div>
            <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>
              {fc.verdict}
            </div>
          </div>
        </div>
      )}

      {/* Accommodation comparison */}
      {hasAccommodation && (
        <div>
          <h2 className="story-title">Accommodation Comparison — {stop.city}</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
                  <th style={{ ...thStyle, textAlign: "left" }}>Type</th>
                  <th style={thStyle}>Price / Night</th>
                  <th style={thStyle}>Pros</th>
                  <th style={thStyle}>Cons</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "airbnb", label: "🏠 Airbnb", recommended: true },
                  { key: "hostel", label: "🛏 Hostel", recommended: false },
                  { key: "hotel", label: "🏨 Hotel", recommended: false },
                ].filter(({ key }) => acc[key]).map(({ key, label, recommended }, ri) => (
                  <tr key={key} style={{
                    borderBottom: "1px solid var(--border-light)",
                    background: recommended ? "rgba(76,175,80,0.06)" : ri % 2 === 1 ? "var(--bg-hover)" : "transparent",
                  }}>
                    <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>
                      {label}
                      {recommended && (
                        <span style={{
                          marginLeft: 8, fontSize: 10, fontWeight: 700,
                          padding: "2px 8px", borderRadius: 10,
                          background: "#4CAF50", color: "#fff",
                        }}>
                          BEST FOR 5
                        </span>
                      )}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{acc[key].price}</td>
                    <td style={{ ...tdStyle, color: "#4CAF50", fontSize: 13, textAlign: "left" }}>{acc[key].pros}</td>
                    <td style={{ ...tdStyle, color: "#E57373", fontSize: 13, textAlign: "left" }}>{acc[key].cons}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {acc.recommendation && (
            <div className="tip-box" style={{ marginTop: 16, padding: "16px 20px", borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                💡 Best Option
              </div>
              <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>
                {acc.recommendation}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TransportContent({ stop }) {
  if (!stop.connections) {
    return (
      <div style={{ textAlign: "center", padding: "60px 48px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>&#9992;&#65039;</div>
        <div style={{ fontSize: 18, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
          This is your first stop — you fly directly here from Kathmandu.
        </div>
      </div>
    );
  }
  const c = stop.connections;
  return (
    <>
      <h2 className="story-title">Getting to {stop.city}</h2>
      <div className="conn-header">
        <span className="conn-route">
          From: <strong>{c.from.split("→")[0].trim()}</strong>
        </span>
        <span style={{ color: "var(--border-light)" }}>→</span>
        <span className="conn-route">
          To: <strong>{stop.city}</strong>
        </span>
        <span className={`conn-badge${c.changes === 0 ? " direct" : " change"}`}>
          {c.changes === 0 ? "✓ DIRECT — no changes" : `${c.changes} change${c.changes > 1 ? "s" : ""}`}
        </span>
      </div>
      {c.legs.map((leg, i) => (
        <div key={i}>
          <div className="leg-card">
            <div>
              <div className="leg-train-name">
                <h3>{leg.train}</h3>
              </div>
              <div className="leg-times">
                <div className="leg-time-block">
                  <div className="label">Departs</div>
                  <div className="value">{leg.dep}</div>
                </div>
                <div className="leg-arrow">→</div>
                <div className="leg-time-block">
                  <div className="label">Arrives</div>
                  <div className="value">{leg.arr}</div>
                </div>
                <div className="leg-time-block">
                  <div className="label">Duration</div>
                  <div className="value accent">{leg.dur}</div>
                </div>
              </div>
              <div className="leg-notes">{leg.notes}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div className="leg-cost-label">Cost per person</div>
              <div className="leg-cost">{leg.cost}</div>
            </div>
          </div>
          {i < c.legs.length - 1 && (
            <div className="change-indicator">
              <span>→</span>
              <span>Change here — follow station signs to next platform</span>
            </div>
          )}
        </div>
      ))}
      <div className="tip-box" style={{ marginTop: 24, fontSize: 14, lineHeight: 1.85, color: "#C0B0A0", padding: "20px 24px", borderRadius: 12 }}>
        <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Practical Tip
        </div>
        {c.tip}
      </div>
      {stop.bagStorage && (
        <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 10, background: "var(--bg-hover)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--sans)", marginBottom: 8 }}>
            🧳 Bag Storage
          </div>
          <div style={{ fontSize: 13, fontFamily: "var(--sans)", lineHeight: 1.7, color: "var(--text)" }}>
            <div><strong>Location:</strong> {stop.bagStorage.location}</div>
            <div><strong>Cost:</strong> {stop.bagStorage.cost}</div>
            <div><strong>Hours:</strong> {stop.bagStorage.hours}</div>
            <div><strong>Payment:</strong> {stop.bagStorage.payment}</div>
            {stop.bagStorage.tip && <div style={{ marginTop: 6, color: "var(--accent)" }}>💡 {stop.bagStorage.tip}</div>}
          </div>
        </div>
      )}

      {/* Station Quick Guide */}
      {stop.stationGuide && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 14, fontFamily: "var(--sans)" }}>
            🚉 Station Quick Guide — {stop.stationGuide.stationName}
          </h3>
          <div style={{
            background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
            borderRadius: "var(--radius-lg)", padding: "20px 24px",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
              Arrive → Store bags → Explore → Return
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stop.stationGuide.arrivalSteps.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "10px 14px", borderRadius: 8,
                  background: "var(--bg-raised)", border: "1px solid var(--border)",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "var(--accent)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700, flexShrink: 0,
                  }}>
                    {s.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 14 }}>{s.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>{s.action}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.5 }}>{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {stop.stationGuide.exitInfo && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bg-hover)", border: "1px solid var(--border)", marginTop: 8, fontSize: 12, fontFamily: "var(--sans)", color: "var(--text)" }}>
              <strong>🚪 To accommodation:</strong> {stop.stationGuide.exitInfo}
            </div>
          )}
          {stop.stationGuide.platformTip && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bg-hover)", border: "1px solid var(--border)", marginTop: 8, fontSize: 12, fontFamily: "var(--sans)", color: "var(--text)" }}>
              <strong>🚂 Next departure:</strong> {stop.stationGuide.platformTip}
            </div>
          )}
        </div>
      )}

      {/* Local Transport Options */}
      {stop.localTransport && stop.localTransport.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 14, fontFamily: "var(--sans)" }}>
            🚌 Getting Around {stop.city}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {stop.localTransport.map((t, i) => (
              <div key={i} style={{
                padding: "14px 16px", borderRadius: 10,
                background: "var(--bg-raised)", border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18 }}>{t.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>{t.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)" }}>{t.cost}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.5, marginBottom: 4 }}>{t.detail}</div>
                {t.tip && <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--sans)", lineHeight: 1.4 }}>💡 {t.tip}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function StayEatContent({ stop }) {
  return (
    <>
      <div className="stay-eat-grid">
        <div>
          <h2 className="story-title">Where to Stay</h2>
          <div className="card">
            <div className="stay-area">{stop.stay.area}</div>
            <div className="stay-budget">{stop.stay.budget}</div>
            <p className="stay-why">{stop.stay.why}</p>
            <div className="stay-search-box">
              <div className="stay-search-label">How to Search</div>
              <div className="stay-search-text">{stop.stay.search}</div>
            </div>
            <div className="stay-picks-title">Best Areas</div>
            {stop.stay.picks.map((p, i) => (
              <div key={i} className="stay-pick">
                <span className="stay-pick-arrow">→</span>
                <span className="stay-pick-text">{p}</span>
              </div>
            ))}
            {stop.stay?.bookingLinks?.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--sans)", marginBottom: 10, fontWeight: 700 }}>
                  🔗 Compare & Book (€50–200/night for 3)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {stop.stay.bookingLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noreferrer" style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderRadius: 8,
                      background: "var(--bg-hover)", border: "1px solid var(--border)",
                      textDecoration: "none", transition: "all 0.15s",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14 }}>{link.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--sans)" }}>{link.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, fontFamily: "var(--sans)" }}>{link.price}</span>
                        <span style={{ fontSize: 11, color: "var(--text-dim)" }}>↗</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <h2 className="story-title">Where to Eat</h2>
          {stop.eat.map((e, i) => (
            <div key={i} className="eat-card-standalone">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                <div className="eat-card-name">{e.name}</div>
                <div className="eat-card-dish">{e.dish}</div>
              </div>
              <div className="eat-type">{e.type}</div>
              <div className="eat-note">{e.note}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function WeatherContent({ stop }) {
  return (
    <>
      <h2 className="story-title">June Weather in {stop.city}</h2>
      <div className="weather-grid">
        {[
          ["Temperature", stop.weather.temp, "🌡"],
          ["Rainfall", stop.weather.rain, "🌧"],
          ["Best time", stop.weather.best, "☀️"],
        ].map(([label, val, icon]) => (
          <div key={label} className="weather-card">
            <div className="weather-card-icon">{icon}</div>
            <div className="weather-card-label">{label}</div>
            <div className="weather-card-val">{val}</div>
          </div>
        ))}
      </div>
      <div className="tip-box" style={{ padding: "20px 24px", borderRadius: 12 }}>
        <div style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Local Tip
        </div>
        <div style={{ fontSize: 14, color: "#C0B0A0", lineHeight: 1.85 }}>{stop.weather.tip}</div>
      </div>
    </>
  );
}

/* ── TIPS & TRICKS TAB ── */

function TipsContent({ stop }) {
  const [openSection, setOpenSection] = useState(null);

  const tips = TIPS || {};
  const general = tips.general || [];
  const dos = tips.dos || [];
  const donts = tips.donts || [];
  const countryTips = tips.countries || {};
  const budgetHacks = tips.budgetHacks || [];
  const scamWarnings = tips.scamWarnings || [];
  const emergency = tips.emergency || null;
  const optimization = tips.optimization || [];

  const stopCountry = stop?.country || "";
  const relevantCountryTips = countryTips[stopCountry] || countryTips[stopCountry.toLowerCase()] || null;

  const hasTipsData = general.length > 0 || dos.length > 0 || donts.length > 0 || budgetHacks.length > 0;

  return (
    <>
      <h2 className="story-title">Tips & Tricks</h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--sans)", marginBottom: 28, lineHeight: 1.7 }}>
        Practical advice for making the most of your trip — from budget hacks to staying safe.
      </p>

      {!hasTipsData && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💡</div>
          <div style={{ fontSize: 16, color: "var(--text-dim)", fontFamily: "var(--sans)", marginBottom: 8 }}>
            Tips data is loading...
          </div>
          <div style={{ fontSize: 13, color: "var(--text-faint)", fontFamily: "var(--sans)" }}>
            The tips database will be populated in <code>src/data/tipsData.js</code>
          </div>
        </div>
      )}

      {/* Emergency Info Card */}
      {emergency && (
        <div style={{
          background: "rgba(220,38,38,0.06)", border: "2px solid rgba(220,38,38,0.3)",
          borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 28,
          boxShadow: "var(--shadow-md)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>🚨</span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#DC2626", fontFamily: "var(--sans)", margin: 0 }}>
              Emergency Information
            </h3>
          </div>
          {typeof emergency === "string" ? (
            <p style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, fontFamily: "var(--sans)" }}>{emergency}</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {Object.entries(emergency).map(([key, val]) => (
                <div key={key} style={{ fontSize: 13, fontFamily: "var(--sans)" }}>
                  <div style={{ fontWeight: 700, color: "#DC2626", textTransform: "uppercase", fontSize: 10, letterSpacing: "0.1em", marginBottom: 2 }}>{key}</div>
                  <div style={{ color: "var(--text)" }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* General Tips — Accordion */}
      {general.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12, fontFamily: "var(--sans)" }}>
            General Tips
          </h3>
          {general.map((section, i) => {
            const isOpen = openSection === i;
            const sectionTitle = typeof section === "string" ? section : (section.category || section.title || `Tip ${i + 1}`);
            const sectionItems = typeof section === "string" ? [] : (section.items || section.tips || []);

            return (
              <div key={i} style={{
                marginBottom: 8, borderRadius: "var(--radius)",
                border: "1px solid var(--border-light)",
                overflow: "hidden", boxShadow: "var(--shadow)",
                transition: "box-shadow 0.2s",
              }}>
                <button
                  onClick={() => setOpenSection(isOpen ? null : i)}
                  style={{
                    width: "100%", padding: "14px 18px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: isOpen ? "var(--accent-bg)" : "var(--bg-raised)",
                    border: "none", cursor: "pointer",
                    fontSize: 14, fontWeight: 600, color: "var(--text)",
                    fontFamily: "var(--sans)", transition: "background 0.2s",
                  }}
                >
                  <span>{sectionTitle}</span>
                  <span style={{ fontSize: 16, color: "var(--text-dim)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    ▾
                  </span>
                </button>
                {isOpen && sectionItems.length > 0 && (
                  <div style={{ padding: "12px 18px", background: "var(--bg-raised)" }}>
                    {sectionItems.map((item, j) => (
                      <div key={j} style={{ padding: "6px 0", fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.6, borderBottom: j < sectionItems.length - 1 ? "1px solid var(--border)" : "none" }}>
                        {typeof item === "string" ? item : (item.text || item.tip || JSON.stringify(item))}
                      </div>
                    ))}
                  </div>
                )}
                {isOpen && typeof section === "string" && (
                  <div style={{ padding: "12px 18px", background: "var(--bg-raised)", fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.6 }}>
                    {section}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Do's and Don'ts */}
      {(dos.length > 0 || donts.length > 0) && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12, fontFamily: "var(--sans)" }}>
            Do's & Don'ts
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Do's */}
            <div style={{
              background: "rgba(76,175,80,0.06)", border: "1px solid rgba(76,175,80,0.2)",
              borderRadius: "var(--radius)", padding: "18px 20px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#4CAF50", marginBottom: 12, fontFamily: "var(--sans)" }}>
                ✓ Do's
              </div>
              {dos.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, fontFamily: "var(--sans)", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  <span style={{ color: "#4CAF50", fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{typeof item === "string" ? item : (item.text || item.tip)}</span>
                </div>
              ))}
            </div>
            {/* Don'ts */}
            <div style={{
              background: "rgba(229,57,53,0.06)", border: "1px solid rgba(229,57,53,0.2)",
              borderRadius: "var(--radius)", padding: "18px 20px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#E53935", marginBottom: 12, fontFamily: "var(--sans)" }}>
                ✗ Don'ts
              </div>
              {donts.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, fontFamily: "var(--sans)", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  <span style={{ color: "#E53935", fontWeight: 700, flexShrink: 0 }}>✗</span>
                  <span>{typeof item === "string" ? item : (item.text || item.tip)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Country-Specific Tips */}
      {relevantCountryTips && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12, fontFamily: "var(--sans)" }}>
            {stop.flag} {stopCountry} — Local Tips
          </h3>
          <div className="card" style={{ padding: 20 }}>
            {Array.isArray(relevantCountryTips) ? (
              relevantCountryTips.map((tip, i) => (
                <div key={i} style={{ padding: "8px 0", fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.6, borderBottom: i < relevantCountryTips.length - 1 ? "1px solid var(--border)" : "none" }}>
                  {typeof tip === "string" ? tip : (tip.text || tip.tip || JSON.stringify(tip))}
                </div>
              ))
            ) : typeof relevantCountryTips === "object" ? (
              Object.entries(relevantCountryTips).map(([key, val]) => (
                <div key={key} style={{ padding: "8px 0", fontSize: 13, fontFamily: "var(--sans)", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{key}: </span>
                  <span style={{ color: "var(--text-muted)" }}>{typeof val === "string" ? val : JSON.stringify(val)}</span>
                </div>
              ))
            ) : (
              <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)" }}>{String(relevantCountryTips)}</p>
            )}
          </div>
        </div>
      )}

      {/* Budget Hacks */}
      {budgetHacks.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12, fontFamily: "var(--sans)" }}>
            💰 Budget Hacks
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {budgetHacks.map((hack, i) => (
              <div key={i} style={{
                background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
                borderRadius: "var(--radius)", padding: "16px 18px",
                boxShadow: "var(--shadow)",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ fontSize: 14, flexShrink: 0, color: "var(--accent)", fontWeight: 700 }}>*</span>
                  <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, fontFamily: "var(--sans)" }}>
                    {typeof hack === "string" ? hack : (hack.text || hack.tip || hack.title)}
                    {typeof hack === "object" && hack.savings && (
                      <div style={{ marginTop: 6, fontWeight: 700, color: "var(--green)", fontSize: 12 }}>
                        Saves: {hack.savings}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scam Warnings */}
      {scamWarnings.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#DC2626", marginBottom: 12, fontFamily: "var(--sans)" }}>
            ⚠ Scam Warnings
          </h3>
          {scamWarnings.map((scam, i) => (
            <div key={i} style={{
              background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.2)",
              borderRadius: "var(--radius)", padding: "14px 18px",
              marginBottom: 10, borderLeft: "4px solid #DC2626",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 13, flexShrink: 0, color: "#DC2626", fontWeight: 700 }}>!</span>
                <div>
                  {typeof scam === "string" ? (
                    <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6, fontFamily: "var(--sans)" }}>{scam}</div>
                  ) : (
                    <>
                      {scam.title && <div style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", marginBottom: 4, fontFamily: "var(--sans)" }}>{scam.title}</div>}
                      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, fontFamily: "var(--sans)" }}>
                        {scam.description || scam.text || scam.tip}
                      </div>
                      {scam.prevention && (
                        <div style={{ marginTop: 6, fontSize: 12, color: "var(--green)", fontWeight: 600, fontFamily: "var(--sans)" }}>
                          ✓ How to avoid: {scam.prevention}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trip Optimization */}
      {optimization.length > 0 && (
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 12, fontFamily: "var(--sans)" }}>
            🎯 Trip Optimization
          </h3>
          {optimization.map((opt, i) => (
            <div key={i} className="card" style={{ padding: "14px 18px", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>→</span>
                <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, fontFamily: "var(--sans)" }}>
                  {typeof opt === "string" ? opt : (opt.text || opt.tip || opt.suggestion)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function MustTryContent({ stop }) {
  // Find the country for this stop
  const countryMap = { "Italy": "italy", "Switzerland": "switzerland", "Austria": "austria", "Czech Republic": "czech", "Germany": "germany", "Netherlands": "netherlands" };
  const countryKey = countryMap[stop.country] || null;
  const countryData = countryKey ? MUST_TRY?.[countryKey] : null;

  if (!countryData) {
    return (
      <div style={{ textAlign: "center", padding: "60px 48px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>&#127869;</div>
        <div style={{ fontSize: 18, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>No food & shopping guide for this stop yet.</div>
      </div>
    );
  }

  return (
    <>
      <h2 className="story-title">{countryData.flag} Must Try in {countryData.country}</h2>
      <p style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "var(--sans)", marginBottom: 24 }}>
        {countryData.days} · Things you absolutely cannot miss
      </p>

      {/* Food */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 14 }}>Food & Drink</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12, marginBottom: 28 }}>
        {countryData.food.map((f, i) => (
          <div key={i} style={{
            padding: "16px 18px", borderRadius: 12,
            background: "var(--bg-raised)", border: "1px solid var(--border)",
            boxShadow: "var(--shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>{f.item}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)", whiteSpace: "nowrap", marginLeft: 8 }}>{f.cost}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--sans)", marginBottom: 6 }}>📍 {f.where}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.6 }}>{f.note}</div>
          </div>
        ))}
      </div>

      {/* Shopping */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 14 }}>Shopping & Souvenirs</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 12 }}>
        {countryData.shopping.map((s, i) => (
          <div key={i} style={{
            padding: "16px 18px", borderRadius: 12,
            background: "var(--bg-raised)", border: "1px solid var(--border)",
            boxShadow: "var(--shadow)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>{s.item}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)", whiteSpace: "nowrap", marginLeft: 8 }}>{s.cost}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--accent)", fontFamily: "var(--sans)", marginBottom: 6 }}>📍 {s.where}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.6 }}>{s.note}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function DocsView() {
  const [openSection, setOpenSection] = useState(null);
  const toggle = (key) => setOpenSection(prev => prev === key ? null : key);

  if (!DOCS) {
    return <div className="panel" style={{ textAlign: "center", padding: "60px" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
      <div style={{ fontSize: 18, color: "var(--text-dim)" }}>Documentation guide loading...</div>
    </div>;
  }

  const Section = ({ title, sectionKey, children }) => (
    <div style={{ marginBottom: 12, border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <button onClick={() => toggle(sectionKey)} style={{
        width: "100%", padding: "14px 18px", background: openSection === sectionKey ? "var(--accent-bg)" : "var(--bg-raised)",
        border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", textAlign: "left",
      }}>
        {title}
        <span style={{ transform: openSection === sectionKey ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
      </button>
      {openSection === sectionKey && (
        <div style={{ padding: "16px 18px", borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="panel">
      <h2 className="story-title">📋 Visa & Documentation Guide</h2>
      <p style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "var(--sans)", marginBottom: 8 }}>
        Complete guide for 3 Nepali passport holders · 2 working professionals + 3 parents
      </p>

      {/* Overview Card */}
      <div style={{
        padding: "20px 24px", borderRadius: 12, marginBottom: 24,
        background: "var(--accent-bg)", border: "1px solid var(--accent-border)",
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 8 }}>
          {DOCS.overview?.visaType}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, fontSize: 13, fontFamily: "var(--sans)", color: "var(--text-muted)" }}>
          <div><strong>Apply at:</strong> {DOCS.overview?.applyAt}</div>
          <div><strong>Processing:</strong> {DOCS.overview?.processingTime}</div>
          <div><strong>Cost:</strong> {DOCS.overview?.cost}</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--accent)", lineHeight: 1.6 }}>
          💡 {DOCS.overview?.reason}
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DOCS.overview?.appointmentUrl && <a href={DOCS.overview.appointmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, background: "var(--accent)", color: "#fff", fontWeight: 600, fontFamily: "var(--sans)", textDecoration: "none" }}>Book VFS Appointment →</a>}
          {DOCS.overview?.embassyUrl && <a href={DOCS.overview.embassyUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: "6px 14px", borderRadius: 6, background: "var(--bg-raised)", color: "var(--text)", fontWeight: 600, fontFamily: "var(--sans)", textDecoration: "none", border: "1px solid var(--border)" }}>German Embassy Info →</a>}
        </div>
      </div>

      {/* Applicant Profiles */}
      <Section title="👤 Applicant Profiles & Specific Documents" sectionKey="profiles">
        {DOCS.applicantProfiles?.map((profile, pi) => (
          <div key={pi} style={{ marginBottom: pi < DOCS.applicantProfiles.length - 1 ? 20 : 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>{profile.type}</div>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 10 }}>{profile.description}</div>
            {profile.specificDocs?.map((d, di) => (
              <div key={di} style={{ padding: "10px 14px", marginBottom: 6, borderRadius: 8, background: "var(--bg-hover)", borderLeft: `3px solid ${d.required ? "var(--accent)" : "var(--border)"}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {d.required ? "✅" : "📎"} {d.doc}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{d.detail}</div>
              </div>
            ))}
          </div>
        ))}
      </Section>

      {/* Common Documents */}
      <Section title="📄 Common Documents (All 5 Applicants)" sectionKey="common">
        {DOCS.commonDocuments?.map((d, i) => (
          <div key={i} style={{ padding: "10px 14px", marginBottom: 6, borderRadius: 8, background: "var(--bg-hover)", borderLeft: `3px solid ${d.required ? "#4CAF50" : "var(--border)"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                {d.required ? "✅" : "📎"} {d.doc}
              </div>
              {d.timeline && <span style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600, whiteSpace: "nowrap", marginLeft: 8 }}>{d.timeline}</span>}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>{d.detail}</div>
          </div>
        ))}
      </Section>

      {/* Timeline */}
      <Section title="📅 Preparation Timeline" sectionKey="timeline">
        {DOCS.timeline?.map((t, i) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 6 }}>{t.when}</div>
            {t.tasks?.map((task, ti) => (
              <div key={ti} style={{ fontSize: 12, color: "var(--text)", padding: "4px 0 4px 16px", borderLeft: "2px solid var(--border)", marginBottom: 2, lineHeight: 1.5 }}>
                ☐ {task}
              </div>
            ))}
          </div>
        ))}
      </Section>

      {/* Edge Cases */}
      <Section title="⚠️ Edge Cases & What If..." sectionKey="edge">
        {DOCS.edgeCases?.map((e, i) => (
          <div key={i} style={{ padding: "12px 14px", marginBottom: 8, borderRadius: 8, background: "rgba(244,67,54,0.04)", border: "1px solid rgba(244,67,54,0.15)", borderLeft: "3px solid #F44336" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{e.scenario}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.6 }}>💡 {e.solution}</div>
          </div>
        ))}
      </Section>

      {/* Costs */}
      <Section title="💰 Total Visa Costs" sectionKey="costs">
        <div style={{ marginBottom: 12 }}>
          {DOCS.costs?.perPerson?.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13, fontFamily: "var(--sans)" }}>
              <span style={{ color: "var(--text)" }}>{c.item}</span>
              <span style={{ fontWeight: 700, color: "var(--accent)" }}>{c.amount}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderRadius: 8, background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Per person: {DOCS.costs?.totalPerPerson}</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>Total for 3: {DOCS.costs?.totalForThree}</div>
        </div>
      </Section>

      {/* Warnings */}
      <Section title="🚫 Important Warnings" sectionKey="warnings">
        {DOCS.importantWarnings?.map((w, i) => (
          <div key={i} style={{ padding: "8px 14px", marginBottom: 4, borderRadius: 6, background: "rgba(244,67,54,0.06)", fontSize: 13, color: "var(--text)", fontFamily: "var(--sans)", borderLeft: "3px solid #F44336" }}>
            {w}
          </div>
        ))}
      </Section>
    </div>
  );
}

/* ── BUDGET VIEW ── */
export function BudgetView({ stop, stops, showNPR, npr }) {
  const allStops = stops.filter(s => s.budgetBreakdown && s.budgetBreakdown.days > 0);
  const currentBb = stop?.budgetBreakdown;

  return (
    <div className="panel">
      <h2 className="story-title">Trip Budget</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", marginBottom: 24, lineHeight: 1.7 }}>
        Estimated costs for 3 travellers · All prices approximate · June 2026
      </p>

      {/* Total Summary Card */}
      {TRIP_BUDGET && (
        <div style={{
          background: "var(--accent)", borderRadius: "var(--radius-lg)", padding: "24px 28px",
          marginBottom: 28, color: "#fff",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.8, marginBottom: 8 }}>
            Estimated Total Budget
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 800 }}>€{TRIP_BUDGET.summary.perPersonTotal.toLocaleString()}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>per person</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>₨{TRIP_BUDGET.summary.perPersonNPR.toLocaleString()}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>per person in NPR</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>€{TRIP_BUDGET.summary.groupTotal.toLocaleString()}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>group total (3 ppl)</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {TRIP_BUDGET && (
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 14 }}>
            Cost Breakdown by Category
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Flights (KTM↔Europe)", total: TRIP_BUDGET.flights.total, pp: TRIP_BUDGET.flights.perPerson, currency: "$", note: TRIP_BUDGET.flights.note },
              { label: "Schengen Visa", total: TRIP_BUDGET.visa.perPerson * 3, pp: TRIP_BUDGET.visa.perPerson, currency: "€", note: TRIP_BUDGET.visa.note },
              { label: "Travel Insurance", total: TRIP_BUDGET.insurance.perPerson * 3, pp: TRIP_BUDGET.insurance.perPerson, currency: "€", note: TRIP_BUDGET.insurance.note },
              { label: "Train Journeys (16 total)", total: TRIP_BUDGET.trainTotal.total, pp: TRIP_BUDGET.trainTotal.perPerson, currency: "€", note: TRIP_BUDGET.trainTotal.note },
              { label: `Accommodation (${TRIP_BUDGET.accommodationTotal.totalNights} nights)`, total: TRIP_BUDGET.accommodationTotal.perNight * TRIP_BUDGET.accommodationTotal.totalNights, pp: Math.round(TRIP_BUDGET.accommodationTotal.perNight * TRIP_BUDGET.accommodationTotal.totalNights / 3), currency: "€", note: TRIP_BUDGET.accommodationTotal.note },
              { label: "Food (21 days)", total: TRIP_BUDGET.foodDaily.perPerson * 21 * 3, pp: TRIP_BUDGET.foodDaily.perPerson * 21, currency: "€", note: TRIP_BUDGET.foodDaily.note },
              { label: "Activities & Attractions", total: TRIP_BUDGET.activitiesTotal.perPerson * 3, pp: TRIP_BUDGET.activitiesTotal.perPerson, currency: "€", note: TRIP_BUDGET.activitiesTotal.note },
              { label: "Misc (souvenirs, tips)", total: TRIP_BUDGET.miscDaily.perPerson * 21 * 3, pp: TRIP_BUDGET.miscDaily.perPerson * 21, currency: "€", note: TRIP_BUDGET.miscDaily.note },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 16px", borderRadius: 10,
                background: "var(--bg-raised)", border: "1px solid var(--border)",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "var(--sans)" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--sans)", marginTop: 2 }}>{item.note}</div>
                </div>
                <div style={{ textAlign: "right", minWidth: 100 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)" }}>{item.currency}{item.total.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>{item.currency}{item.pp}/pp</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per City Comparison */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 14 }}>
        Daily Cost by City (per person)
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--sans)" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-light)" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase" }}>City</th>
              <th style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>Days</th>
              <th style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>Accom</th>
              <th style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>Food</th>
              <th style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>Transport</th>
              <th style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-dim)", fontSize: 11 }}>Activities</th>
              <th style={{ padding: "10px 8px", textAlign: "right", color: "var(--accent)", fontSize: 11, fontWeight: 700 }}>Daily/pp</th>
            </tr>
          </thead>
          <tbody>
            {allStops.map((s, i) => {
              const bb = s.budgetBreakdown;
              const sym = bb.currency === "CHF" ? "CHF" : "€";
              const daily = bb.food + bb.transport + bb.activities + bb.misc;
              const isActive = s.id === stop?.id;
              return (
                <tr key={s.id} style={{
                  borderBottom: "1px solid var(--border-light)",
                  background: isActive ? "var(--accent-bg)" : i % 2 === 1 ? "var(--bg-hover)" : "transparent",
                }}>
                  <td style={{ padding: "10px 12px", fontWeight: isActive ? 700 : 400, color: "var(--text)" }}>{s.flag} {s.city}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)" }}>{bb.days}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)" }}>{sym}{bb.accommodation}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)" }}>{sym}{bb.food}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)" }}>{sym}{bb.transport}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", color: "var(--text-muted)" }}>{sym}{bb.activities}</td>
                  <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: 700, color: "var(--accent)" }}>{sym}{daily}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {currentBb && currentBb.days > 0 && (
        <div className="tip-box" style={{ marginTop: 20, padding: "16px 20px", borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
            {stop.flag} {stop.city} Budget Note
          </div>
          <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7 }}>{currentBb.note}</div>
        </div>
      )}
    </div>
  );
}

/* ── CHECKLIST VIEW ── */
export function ChecklistView() {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jamnata-checklist") || "{}"); } catch { return {}; }
  });

  const toggle = (key) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("jamnata-checklist", JSON.stringify(next));
      return next;
    });
  };

  const resetAll = () => {
    setChecked({});
    localStorage.removeItem("jamnata-checklist");
  };

  if (!PACKING_CHECKLIST) {
    return <div className="panel" style={{ textAlign: "center", padding: "60px" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
      <div style={{ fontSize: 18, color: "var(--text-dim)" }}>Checklist loading...</div>
    </div>;
  }

  const categories = [
    { key: "documents", title: "Documents", icon: "📄" },
    { key: "electronics", title: "Electronics", icon: "🔌" },
    { key: "clothing", title: "Clothing", icon: "👕" },
    { key: "toiletries", title: "Toiletries & Medicine", icon: "🧴" },
    { key: "misc", title: "Miscellaneous", icon: "🎒" },
  ];

  const allItems = categories.flatMap(c => (PACKING_CHECKLIST[c.key] || []).map((item, i) => `${c.key}-${i}`));
  const checkedCount = allItems.filter(k => checked[k]).length;
  const totalCount = allItems.length;
  const progress = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return (
    <div className="panel">
      <h2 className="story-title">Packing Checklist</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", marginBottom: 8 }}>
        21 days · 7 countries · 3 people · Check items as you pack
      </p>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>
            {checkedCount}/{totalCount} packed ({progress}%)
          </div>
          <button onClick={resetAll} style={{
            fontSize: 11, padding: "4px 12px", borderRadius: 6,
            background: "var(--bg-hover)", border: "1px solid var(--border)",
            color: "var(--text-dim)", fontFamily: "var(--sans)", cursor: "pointer",
          }}>Reset All</button>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: "var(--bg-hover)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 4,
            background: progress === 100 ? "var(--green)" : "var(--accent)",
            width: `${progress}%`, transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {categories.map((cat) => {
        const items = PACKING_CHECKLIST[cat.key] || [];
        const catChecked = items.filter((_, i) => checked[`${cat.key}-${i}`]).length;
        return (
          <div key={cat.key} style={{ marginBottom: 20 }}>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 10, padding: "8px 0",
              borderBottom: "1px solid var(--border-light)",
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>
                {cat.icon} {cat.title}
              </span>
              <span style={{ fontSize: 12, color: catChecked === items.length ? "var(--green)" : "var(--text-dim)", fontFamily: "var(--sans)", fontWeight: 600 }}>
                {catChecked}/{items.length}
              </span>
            </div>
            {items.map((item, i) => {
              const key = `${cat.key}-${i}`;
              const isChecked = checked[key];
              return (
                <label key={key} style={{
                  display: "flex", alignItems: "flex-start", gap: 10,
                  padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                  background: isChecked ? "var(--green-bg)" : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!isChecked) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={(e) => { if (!isChecked) e.currentTarget.style.background = "transparent"; }}
                >
                  <input type="checkbox" checked={isChecked || false} onChange={() => toggle(key)}
                    style={{ marginTop: 2, accentColor: "var(--accent)", width: 16, height: 16 }} />
                  <span style={{
                    fontSize: 13, fontFamily: "var(--sans)", lineHeight: 1.5,
                    color: isChecked ? "var(--text-dim)" : "var(--text)",
                    textDecoration: isChecked ? "line-through" : "none",
                  }}>{item}</span>
                </label>
              );
            })}
          </div>
        );
      })}

      {PACKING_CHECKLIST.preTripTasks && (
        <div style={{ marginTop: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 14 }}>
            Pre-Trip Tasks
          </h3>
          {PACKING_CHECKLIST.preTripTasks.map((t, i) => {
            const key = `pretask-${i}`;
            const isChecked = checked[key];
            return (
              <label key={key} style={{
                display: "flex", alignItems: "flex-start", gap: 10,
                padding: "10px 14px", borderRadius: 8, marginBottom: 6,
                background: isChecked ? "var(--green-bg)" : "var(--bg-raised)",
                border: `1px solid ${isChecked ? "var(--green-border)" : "var(--border)"}`,
                cursor: "pointer",
              }}>
                <input type="checkbox" checked={isChecked || false} onChange={() => toggle(key)}
                  style={{ marginTop: 2, accentColor: "var(--accent)", width: 16, height: 16 }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, fontFamily: "var(--sans)",
                    color: isChecked ? "var(--text-dim)" : "var(--text)",
                    textDecoration: isChecked ? "line-through" : "none",
                  }}>{t.task}</div>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--sans)", marginTop: 2 }}>
                    Deadline: {t.deadline}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── PHRASEBOOK VIEW ── */
export function PhrasebookView({ stop }) {
  const countryMap = { "Italy": "italy", "Switzerland": "switzerland", "Austria": "austria", "Czech Republic": "czech", "Germany": "germany", "Netherlands": "netherlands" };
  const activeCountryKey = countryMap[stop?.country] || null;

  const countries = [
    { key: "italy", name: "Italian", flag: "🇮🇹", country: "Italy" },
    { key: "switzerland", name: "Swiss German / French", flag: "🇨🇭", country: "Switzerland" },
    { key: "austria", name: "German (Austrian)", flag: "🇦🇹", country: "Austria" },
    { key: "czech", name: "Czech", flag: "🇨🇿", country: "Czech Republic" },
    { key: "germany", name: "German", flag: "🇩🇪", country: "Germany" },
    { key: "netherlands", name: "Dutch", flag: "🇳🇱", country: "Netherlands" },
  ];

  const sorted = [...countries].sort((a, b) => {
    if (a.key === activeCountryKey) return -1;
    if (b.key === activeCountryKey) return 1;
    return 0;
  });

  return (
    <div className="panel">
      <h2 className="story-title">Phrasebook</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", marginBottom: 24, lineHeight: 1.7 }}>
        Essential phrases for each country. Locals always appreciate any attempt at their language!
      </p>

      {sorted.map((c) => {
        const info = PRACTICAL?.[c.key];
        if (!info || !info.phrases) return null;
        const isActive = c.key === activeCountryKey;

        return (
          <div key={c.key} style={{
            marginBottom: 24, borderRadius: "var(--radius-lg)", overflow: "hidden",
            border: isActive ? "2px solid var(--accent)" : "1px solid var(--border)",
            background: "var(--bg-raised)",
          }}>
            <div style={{
              padding: "14px 20px",
              background: isActive ? "var(--accent-bg)" : "var(--bg-hover)",
              borderBottom: "1px solid var(--border)",
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>
                {c.flag} {c.name}
              </span>
              {isActive && <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, color: "var(--accent)", padding: "2px 8px", borderRadius: 10, background: "var(--accent-bg)", border: "1px solid var(--accent-border)" }}>CURRENT</span>}
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="comparison-table table-card-mobile pm-embedded">
                <thead>
                  <tr>
                    <th>English</th>
                    <th>Local</th>
                    <th>Pronunciation</th>
                  </tr>
                </thead>
                <tbody>
                  {info.phrases.map((p, i) => (
                    <tr key={i}>
                      <td data-label="English">{p.en}</td>
                      <td data-label="Local" style={{ fontWeight: 600, color: "var(--accent)" }}>{p.local}</td>
                      <td data-label="Pronunciation" style={{ fontStyle: "italic", color: "var(--text-muted)" }}>{p.pronunciation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {info.tipping && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)" }}>
                <strong style={{ color: "var(--text)" }}>Tipping:</strong> {info.tipping}
              </div>
            )}
            {info.simCard && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)" }}>
                <strong style={{ color: "var(--text)" }}>SIM Card:</strong> {info.simCard.provider} · {info.simCard.cost} · {info.simCard.data} · Buy at: {info.simCard.where}
              </div>
            )}
            {info.powerAdapter && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)" }}>
                <strong style={{ color: "var(--text)" }}>Power:</strong> {info.powerAdapter.type} · {info.powerAdapter.voltage} · {info.powerAdapter.note}
              </div>
            )}
            {info.emergency && (
              <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)" }}>
                <strong style={{ color: "var(--red, #D32F2F)" }}>Emergency:</strong> {Object.entries(info.emergency).map(([k, v]) => `${k}: ${v}`).join(" · ")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── SURVIVAL GUIDE VIEW ── */
export function SurvivalGuideView({ stop }) {
  const [guideTab, setGuideTab] = useState("destination");
  const [openSection, setOpenSection] = useState(null);
  const countryMap = { "Italy": "italy", "Switzerland": "switzerland", "Austria": "austria", "Czech Republic": "czech", "Germany": "germany", "Netherlands": "netherlands" };
  const activeCountryKey = countryMap[stop?.country] || "italy";
  const dest = DESTINATION_SURVIVAL[stop?.id] || null;
  const countryPhrases = SITUATION_PHRASES?.greetings?.phrases?.[activeCountryKey] || [];
  const guide = SURVIVAL_GUIDE;

  const tabs = [
    { id: "destination", label: stop?.city || "This Stop", icon: "📍" },
    { id: "firsttime", label: "First-Timer Basics", icon: "🧭" },
    { id: "phrases", label: "Speak Local", icon: "🗣" },
    { id: "quickref", label: "Quick Ref", icon: "📋" },
  ];

  const cardStyle = {
    borderRadius: "var(--radius-lg)", overflow: "hidden",
    border: "1px solid var(--border)", background: "var(--bg-raised)", marginBottom: 16,
  };
  const tipRow = {
    display: "flex", gap: 12, padding: "12px 16px", fontSize: 13, fontFamily: "var(--sans)",
    lineHeight: 1.7, color: "var(--text)", borderBottom: "1px solid var(--border-light)",
  };
  const tipIcon = { fontSize: 18, flexShrink: 0, marginTop: 2 };

  // ── Destination tab ──
  const renderDestination = () => {
    if (!dest) return (
      <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontFamily: "var(--sans)", fontSize: 13 }}>
        No destination-specific tips for this stop. Check the "First-Timer Basics" tab for general European travel tips.
      </div>
    );
    return (
      <>
        {/* Quick greeting banner */}
        <div style={{ padding: "16px 20px", background: "var(--accent-bg)", borderRadius: "var(--radius-lg)", border: "1px solid var(--accent-border)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", fontFamily: "var(--sans)", letterSpacing: 1 }}>Say hello in {stop?.city}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--serif)", marginTop: 2 }}>{dest.greeting}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic", fontFamily: "var(--sans)" }}>{dest.greetPronounce}</div>
          </div>
          <div style={{ fontSize: 12, fontFamily: "var(--sans)", color: "var(--text-muted)", textAlign: "right" }}>
            <div><strong style={{ color: "var(--text)" }}>Currency:</strong> {dest.currency}</div>
            <div><strong style={{ color: "var(--text)" }}>Emergency:</strong> {dest.emergencyNum}</div>
          </div>
        </div>

        {/* Survival tips */}
        <div style={cardStyle}>
          <div style={{ padding: "12px 16px", background: "var(--bg-hover)", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700, fontFamily: "var(--sans)", color: "var(--text)" }}>
            Survival Tips for {stop?.city}
          </div>
          {dest.quickSurvival.map((item, i) => (
            <div key={i} style={{ ...tipRow, borderBottom: i < dest.quickSurvival.length - 1 ? "1px solid var(--border-light)" : "none", background: i % 2 === 1 ? "var(--bg-hover)" : "transparent" }}>
              <span style={tipIcon}>{item.icon}</span>
              <span>{item.tip}</span>
            </div>
          ))}
        </div>

        {/* Quick phrases strip */}
        <div style={cardStyle}>
          <div style={{ padding: "12px 16px", background: "var(--bg-hover)", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700, fontFamily: "var(--sans)", color: "var(--text)" }}>
            Phrases You Need Here
          </div>
          {[
            { label: "Ask for water", value: dest.askForWater },
            { label: "Ask for the bill", value: dest.askForBill },
            { label: "Say thank you", value: dest.sayThankYou },
            { label: "Toilet cost", value: dest.toiletCost },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", fontSize: 13, fontFamily: "var(--sans)", background: i % 2 === 0 ? "var(--bg-hover)" : "transparent", borderBottom: i < 3 ? "1px solid var(--border-light)" : "none" }}>
              <span style={{ color: "var(--text-muted)" }}>{item.label}</span>
              <span style={{ color: "var(--accent)", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  // ── First-timer basics tab (accordion) ──
  const toggleAccordion = (key) => setOpenSection(openSection === key ? null : key);
  const allGuides = [
    { key: "arrival", ...guide.arrivalGuide },
    { key: "culture", ...guide.culturalShock },
    { key: "daily", ...guide.dailyLife },
    { key: "food", ...guide.foodSurvival },
    { key: "jetlag", ...guide.jetLagStrategy },
    { key: "etiquette", ...guide.europeanEtiquette },
    { key: "conversations", ...guide.conversationScenarios },
  ];

  const renderFirstTimer = () => (
    <>
      {allGuides.map(({ key, icon, title, sections, items, scenarios }) => {
        const isOpen = openSection === key;
        return (
          <div key={key} style={{ ...cardStyle, marginBottom: 12 }}>
            <div onClick={() => toggleAccordion(key)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: isOpen ? "var(--accent-bg)" : "transparent", borderBottom: isOpen ? "1px solid var(--border)" : "none" }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>{title}</span>
              <span style={{ fontSize: 12, color: "var(--text-muted)", transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▼</span>
            </div>
            {isOpen && (
              <div style={{ padding: "12px 16px" }}>
                {/* Sectioned content */}
                {sections && sections.map((sec, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)", marginTop: i > 0 ? 16 : 0, marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid var(--border-light)" }}>{sec.title}</div>
                    {sec.items.map((item, j) => (
                      <div key={j} style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--sans)", lineHeight: 1.7, padding: "4px 0 4px 14px", borderLeft: "2px solid var(--border-light)", marginBottom: 4 }}>{item}</div>
                    ))}
                  </div>
                ))}
                {/* Jet lag items */}
                {items && !scenarios && items.map((item, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: item.day ? "var(--accent)" : "var(--text)", fontFamily: "var(--sans)", marginBottom: 3 }}>{item.day || item.rule}</div>
                    <div style={{ fontSize: 13, color: "var(--text)", fontFamily: "var(--sans)", lineHeight: 1.7, padding: "4px 0 4px 14px", borderLeft: "2px solid var(--border-light)" }}>{item.tip || item.detail}</div>
                  </div>
                ))}
                {/* Conversation scenarios */}
                {scenarios && scenarios.map((sc, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)", marginTop: i > 0 ? 12 : 0, marginBottom: 6 }}>{sc.situation}</div>
                    {sc.exchanges.map((ex, j) => (
                      <div key={j} style={{ padding: "6px 12px", fontSize: 12, fontFamily: "var(--sans)", background: j % 2 === 0 ? "var(--bg-hover)" : "transparent", borderRadius: 4 }}>
                        {ex.officer && <div style={{ color: "var(--text-muted)" }}><strong>They:</strong> {ex.officer}</div>}
                        <div><strong style={{ color: "var(--accent)" }}>You:</strong> {ex.you}</div>
                        {ex.pronunciation && <div style={{ color: "var(--text-dim)", fontStyle: "italic", fontSize: 11 }}>{ex.pronunciation}</div>}
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--sans)", padding: "4px 12px", background: "var(--accent-bg)", borderRadius: 4, marginTop: 2 }}>{sc.tip}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  // ── Phrases tab ──
  const renderPhrases = () => (
    <>
      {countryPhrases.length > 0 && (
        <div style={cardStyle}>
          <div style={{ padding: "12px 16px", background: "var(--accent-bg)", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700, fontFamily: "var(--sans)", color: "var(--text)" }}>
            {stop?.country} Phrases with Nepali Hints
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="comparison-table table-card-mobile pm-embedded">
              <thead>
                <tr>
                  {["Situation", "Say This", "Sounds Like", "Nepali Hint"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countryPhrases.map((p, i) => (
                  <tr key={i}>
                    <td data-label="Situation" style={{ color: "var(--text-muted)" }}>{p.situation}</td>
                    <td data-label="Say This" style={{ fontWeight: 600, color: "var(--accent)" }}>{p.phrase}</td>
                    <td data-label="Sounds Like" style={{ fontStyle: "italic" }}>{p.pronunciation}</td>
                    <td data-label="Nepali Hint" style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.nepaliHint}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Numbers */}
      <div style={cardStyle}>
        <div style={{ padding: "12px 16px", background: "var(--bg-hover)", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700, fontFamily: "var(--sans)", color: "var(--text)" }}>
          Numbers for Ordering & Tickets
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="comparison-table table-card-mobile pm-embedded">
            <thead>
              <tr>
                {["#", "Italian", "German", "Czech"].map(h => (
                  <th key={h} style={h === "#" ? { textAlign: "center" } : undefined}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SITUATION_PHRASES.numbers.list.map((n, i) => (
                <tr key={i}>
                  <td data-label="#" style={{ textAlign: "center", fontWeight: 700, color: "var(--accent)" }}>{n.number}</td>
                  <td data-label="Italian">{n.italian}</td>
                  <td data-label="German">{n.german}</td>
                  <td data-label="Czech">{n.czech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // ── Quick ref tab ──
  const renderQuickRef = () => {
    const ref = guide.quickReferenceCard;
    return (
      <>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--sans)", fontStyle: "italic", marginBottom: 12 }}>
          {ref.note}
        </div>
        <div style={cardStyle}>
          {ref.items.map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", fontSize: 13, fontFamily: "var(--sans)", background: i % 2 === 0 ? "var(--bg-hover)" : "transparent", borderBottom: i < ref.items.length - 1 ? "1px solid var(--border-light)" : "none" }}>
              <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{item.label}</span>
              <span style={{ color: "var(--text)", fontWeight: 700, textAlign: "right" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="panel">
      <h2 className="story-title">Survival Guide</h2>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setGuideTab(t.id)} style={{
            padding: "11px 14px", minHeight: 44, flexShrink: 0, whiteSpace: "nowrap",
            fontSize: 12, fontWeight: 600, fontFamily: "var(--sans)",
            borderRadius: "var(--radius)", border: "1px solid",
            borderColor: guideTab === t.id ? "var(--accent)" : "var(--border)",
            background: guideTab === t.id ? "var(--accent-bg)" : "transparent",
            color: guideTab === t.id ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer", transition: "all 0.15s",
          }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {guideTab === "destination" && renderDestination()}
      {guideTab === "firsttime" && renderFirstTimer()}
      {guideTab === "phrases" && renderPhrases()}
      {guideTab === "quickref" && renderQuickRef()}
    </div>
  );
}

/* ── TOP PANELS ── */

/* Parse "DD MMM" / "D Mmm" calendar entry → Date in 2026.
   Handles "15 Jun", "5 Jul", etc. Returns null if unparseable. */
function parseCalDate(dateStr) {
  if (!dateStr) return null;
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const m = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3})/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const monKey = m[2][0].toUpperCase() + m[2].slice(1, 3).toLowerCase();
  const month = months[monKey];
  if (month === undefined) return null;
  return new Date(2026, month, day);
}

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarDayDialog({ day, onClose, onGoToStop }) {
  const s = CAL_TYPES[day.type] || CAL_TYPES.explore;
  const resolvedStop = day.stop === "imst" ? "innsbruck" : day.stop;
  const stop = STOPS.find((x) => x.id === resolvedStop);

  // Lock body scroll while open + close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  // Split summary by middle-dot for bullet rendering
  const planBullets = (day.summary || "").split(" · ").map((s) => s.trim()).filter(Boolean);
  // Parse the date for the big calendar tile
  const dt = parseCalDate(day.date);
  const dayNum = dt ? dt.getDate() : "";
  const monShort = dt ? dt.toLocaleString("en-US", { month: "short" }).toUpperCase() : "";
  const dowShort = dt ? dt.toLocaleString("en-US", { weekday: "short" }).toUpperCase() : "";

  return (
    <div className="caldlg-overlay" onClick={onClose}>
      <div className="caldlg" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="caldlg-head" style={{ background: `linear-gradient(${s.glow}, ${s.glow}), var(--bg-raised)`, borderColor: s.dot }}>
          <div className="caldlg-datebox" style={{ borderColor: s.dot, color: s.dot }}>
            <div className="caldlg-datebox-dow">{dowShort}</div>
            <div className="caldlg-datebox-num">{dayNum}</div>
            <div className="caldlg-datebox-mon">{monShort}</div>
          </div>
          <div className="caldlg-titles">
            <div className="caldlg-tags">
              <span className="caldlg-tag" style={{ color: s.dot, background: s.glow, borderColor: `${s.dot}55` }}>
                {day.type}
              </span>
              {day.move && <span className="caldlg-tag caldlg-tag--travel">✈ travel day</span>}
              <span className="caldlg-tag-faint">Day {day.dayN}</span>
            </div>
            <div className="caldlg-city">
              <span>{day.flag}</span>
              <span>{day.city}</span>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="caldlg-close">✕</button>
        </div>

        {/* Body — brief day itinerary (booking lives in the Book section) */}
        <div className="caldlg-body">
          {/* Plan — See & Do · Eat · Getting around */}
          {hasPlanContent(day.plan) ? (
            <section className="caldlg-section">
              <DayPlanSections plan={day.plan} accent={s.dot} />
            </section>
          ) : (
            planBullets.length > 0 && (
              <section className="caldlg-section">
                <div className="caldlg-section-title">Plan</div>
                <ul className="caldlg-bullets">
                  {planBullets.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </section>
            )
          )}

          {/* Action button */}
          {stop && resolvedStop !== "ktm" && (
            <button onClick={() => onGoToStop(resolvedStop)} className="caldlg-cta">
              View {stop.city} stop details →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CalendarPanel({ active, onOpenDay }) {
  const legends = [
    ["explore", "#4CAF50", "Explore"],
    ["move", "#FF9800", "Travel Day"],
    ["arrive", "#64B5F6", "Arrive"],
    ["night", "#9575CD", "Night Train"],
    ["travel", "#F06292", "Flight"],
  ];

  // Local-timezone-safe YYYY-MM-DD key (toISOString shifts in non-UTC zones)
  const localKey = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;

  // Index calendar entries by local YYYY-MM-DD
  const byDate = {};
  CALENDAR.forEach((d) => {
    const dt = parseCalDate(d.date);
    if (!dt) return;
    byDate[localKey(dt)] = d;
  });

  // Compute calendar weeks spanning all entries (Sun-aligned)
  const allKeys = Object.keys(byDate).sort();
  if (allKeys.length === 0) return null;
  const [fy, fm, fd] = allKeys[0].split("-").map(Number);
  const [ly, lm, ld] = allKeys[allKeys.length - 1].split("-").map(Number);
  const first = new Date(fy, fm - 1, fd);
  const last = new Date(ly, lm - 1, ld);
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay()); // back up to Sunday
  const gridEnd = new Date(last);
  gridEnd.setDate(gridEnd.getDate() + (6 - gridEnd.getDay())); // forward to Saturday

  const weeks = [];
  let cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      const key = localKey(cursor);
      week.push({ date: new Date(cursor), key, entry: byDate[key] || null });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2>June – July 2026</h2>
            <p className="subtitle" style={{ margin: "4px 0 0" }}>
              22 days · 3 travellers · 6 countries · 14 cities
            </p>
          </div>
          <div className="cal-legend">
            {legends.map(([t, col, label]) => (
              <div key={t} className="cal-legend-item">
                <div className="cal-legend-dot" style={{ background: col }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Day-of-week header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0,
            border: "1px solid var(--border)",
            borderBottom: "none",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            overflow: "hidden",
            background: "var(--bg-hover)",
          }}
        >
          {DOW_LABELS.map((d, i) => (
            <div
              key={d}
              style={{
                padding: "10px 12px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: i === 0 || i === 6 ? "var(--accent)" : "var(--text-dim)",
                fontFamily: "var(--sans)",
                textAlign: "center",
                borderRight: i < 6 ? "1px solid var(--border)" : "none",
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Week rows */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            overflow: "hidden",
          }}
        >
          {weeks.map((week, wi) => (
            <div
              key={wi}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                borderTop: wi > 0 ? "1px solid var(--border)" : "none",
              }}
            >
              {week.map((cell, ci) => {
                const day = cell.entry;
                const s = day ? CAL_TYPES[day.type] || CAL_TYPES.explore : null;
                const resolvedStop = day?.stop === "imst" ? "innsbruck" : day?.stop;
                const isActive = day && active === resolvedStop;
                const isClickable = !!day;
                const isWeekend = ci === 0 || ci === 6;
                const dateNum = cell.date.getDate();
                const monthChange = ci === 0 || dateNum === 1;
                const monthLabel = cell.date.toLocaleString("en-US", { month: "short" });
                const hasAirbnb = day?.airbnb && day.airbnb.length > 0;

                return (
                  <div
                    key={ci}
                    onClick={() => isClickable && onOpenDay(day)}
                    style={{
                      minHeight: 168,
                      padding: "12px 14px",
                      borderRight: ci < 6 ? "1px solid var(--border)" : "none",
                      borderLeft: isActive ? `3px solid ${s.dot}` : "none",
                      paddingLeft: isActive ? 11 : 14,
                      background: !day
                        ? "var(--bg-hover)"
                        : isActive
                        ? s.glow
                        : "var(--bg-raised)",
                      cursor: isClickable ? "pointer" : "default",
                      position: "relative",
                      overflow: "hidden",
                      transition: "background 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (isClickable) e.currentTarget.style.background = s ? s.glow : "var(--bg-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (isClickable && !isActive) e.currentTarget.style.background = "var(--bg-raised)";
                    }}
                  >
                    {/* Date number */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          fontFamily: "var(--sans)",
                          color: !day
                            ? "var(--text-faint)"
                            : isWeekend
                            ? "var(--accent)"
                            : "var(--text)",
                        }}
                      >
                        {monthChange ? `${monthLabel} ${dateNum}` : dateNum}
                      </span>
                      {day && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--text-faint)",
                            fontFamily: "var(--sans)",
                            letterSpacing: "0.05em",
                          }}
                        >
                          DAY {day.dayN}
                        </span>
                      )}
                    </div>

                    {/* Event "card" */}
                    {day && (
                      <div
                        style={{
                          padding: "6px 8px",
                          borderRadius: 6,
                          borderLeft: `3px solid ${s.dot}`,
                          background: s.glow,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--text)",
                            fontFamily: "var(--sans)",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          <span>{day.flag}</span>
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {day.city}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: s.text,
                            fontFamily: "var(--sans)",
                            marginTop: 5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.4,
                          }}
                        >
                          <span style={{ marginRight: 4 }}>{day.icon}</span>
                          {day.summary}
                        </div>
                        <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                          {day.move && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: s.text,
                                fontFamily: "var(--sans)",
                                letterSpacing: "0.05em",
                                background: "var(--bg-raised)",
                                padding: "2px 6px",
                                borderRadius: 4,
                                border: `1px solid ${s.dot}40`,
                              }}
                            >
                              ✈ TRAVEL
                            </span>
                          )}
                          {hasAirbnb && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 700,
                                color: "var(--accent)",
                                fontFamily: "var(--sans)",
                                letterSpacing: "0.05em",
                                background: "var(--accent-bg)",
                                padding: "2px 6px",
                                borderRadius: 4,
                                border: "1px solid var(--accent-border)",
                              }}
                            >
                              🏠 {day.airbnb.map(a => a.action === "check-in" ? "IN" : a.action === "check-out" ? "OUT" : "STAY").join(" / ")}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Compact stats at bottom */}
        <div
          style={{
            display: "flex",
            gap: 24,
            marginTop: 18,
            padding: "12px 18px",
            borderRadius: 10,
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {[
            { n: "22", label: "Days" },
            { n: "6", label: "Countries" },
            { n: "14", label: "Cities" },
            { n: "16", label: "Trains" },
            { n: "18", label: "Nights" },
            { n: "3", label: "Travellers" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", fontFamily: "var(--sans)" }}>
                {s.n}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--sans)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Per-type narrative — what's happening on board, what to watch for */
const TYPE_NARRATIVE = {
  flight: {
    happening: "Long-haul flight. Aisle seat for stretching; window for sleep.",
    obstacles: [
      "Check baggage allowance — Turkish Airlines = 23kg checked + 8kg carry-on per person",
      "Online check-in opens 24h before — do it from KTM Wi-Fi, not at the airport",
      "Istanbul transit: no Schengen visa needed for short layover, but customs queue is long — keep boarding pass in hand",
    ],
  },
  highspeed: {
    happening: "Reserved seat is your ticket. Find your Wagen (carriage) + seat number on the platform display before boarding.",
    obstacles: [
      "Carriage number on ticket (e.g. Wagen 14, seat 52) — match the platform indicator board",
      "Modern high-speed tickets do NOT need green-box validation — straight to your seat",
      "Conductor walks through ~10 min after departure with a handheld scanner",
      "Saver fares lock you to that exact train — miss it and the ticket dies",
    ],
  },
  regional: {
    happening: "Walk on, sit anywhere. Italian regionale REQUIRES paper-ticket validation before boarding.",
    obstacles: [
      "Italy regionale: stamp paper at the green box on platform BEFORE boarding (50–200 EUR fine if missed, even if paid)",
      "App tickets (Trenitalia / DB Navigator) self-validate — no stamp needed",
      "Regional fares are usually flat — no advantage to booking weeks early",
      "Conductor speaks limited English — show ticket on phone, smile, nod",
    ],
  },
  scenic: {
    happening: "Panoramic windows, mountain passes, slower pace. Phone camera at the ready.",
    obstacles: [
      "Mandatory seat reservation on top of any rail pass (~CHF 49)",
      "Window seats and dome cars sell first — book 60+ days ahead",
      "Sit on the right side going Lucerne to Interlaken (Brünig pass) for the lake views",
      "Pack snacks — café car is overpriced",
    ],
  },
  nightjet: {
    happening: "Sleep your way across borders. Couchette = 6-berth shared, sleeper = 2-berth private with sink.",
    obstacles: [
      "Boarding 30 min before — show ticket + passport at the door",
      "Steward takes your ticket and gives you a wristband — needed for breakfast",
      "Bring earplugs + an eye mask — couchette is loud and lit",
      "Don't lock door from inside without the chain; the bolt auto-locks and you can't unlock without the steward",
    ],
  },
  car: {
    happening: "Private minivan with driver. Bags travel with you.",
    obstacles: [
      "Confirm driver pickup point + plate via WhatsApp the night before",
      "Tolls + parking usually included; confirm before signing",
      "Tip 10% if service is good — drivers don't expect it but appreciate it",
      "Amalfi coastal road is winding — motion-sickness pills if prone",
    ],
  },
  train: {
    happening: "Standard intercity train. Reserved seat on most routes.",
    obstacles: [
      "Validate paper ticket if you bought it at the station kiosk",
      "Show app QR or printed ticket to the conductor",
      "Carriage number is on your ticket — match to the platform indicator",
    ],
  },
};

/* Extract train name from "via" — e.g., "Frecciarossa", "OBB Railjet" */
function trainNameFromVia(via, type) {
  if (!via) return TYPE_LABELS[type] || "Train";
  const cleaned = via.replace(/\([^)]*\)/g, "").trim();
  return cleaned.split(/\s+/).slice(0, 6).join(" ");
}

export function JourneysPanel({ showNPR, npr }) {
  const [openIdx, setOpenIdx] = useState(null);

  const totalDuration = JOURNEYS.reduce((acc, j) => {
    const match = j.dur?.match(/(\d+)\s*h(?:rs?)?/);
    const minMatch = j.dur?.match(/(\d+)\s*min/);
    return acc + (match ? parseInt(match[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0);
  }, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;
  const longest = JOURNEYS.reduce((max, j) => {
    const h = parseInt(j.dur?.match(/(\d+)\s*h/)?.[1] || 0);
    return h > max.h ? { h, name: `${j.from} → ${j.to}` } : max;
  }, { h: 0, name: "" }).name;

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <h2>{"\u{1F684}"} All {JOURNEYS.length} Journeys</h2>
        <p className="subtitle">Tap any ride for the train name, what's happening on board, and what to watch for.</p>

        <div
          style={{
            display: "flex",
            gap: 24,
            margin: "16px 0 24px",
            padding: "12px 18px",
            borderRadius: 10,
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "Journeys", value: JOURNEYS.length },
            { label: "Travel time", value: `${totalHours}h ${totalMins}m` },
            { label: "Countries", value: 6 },
            { label: "Longest", value: longest },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "var(--sans)" }}>
                {s.value}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--sans)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {JOURNEYS.map((j, i) => {
            const typeColor = TYPE_COLORS[j.type] || "#666";
            const isOpen = openIdx === i;
            const trainName = trainNameFromVia(j.via, j.type);
            const narrative = TYPE_NARRATIVE[j.type] || TYPE_NARRATIVE.train;

            return (
              <div
                key={i}
                style={{
                  background: isOpen ? "var(--accent-bg)" : "var(--bg-raised)",
                  border: "1px solid var(--border-light)",
                  borderLeft: `4px solid ${typeColor}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "background 0.15s",
                }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "grid",
                    gridTemplateColumns: "32px 1fr auto auto",
                    alignItems: "center",
                    gap: 14,
                    fontFamily: "var(--sans)",
                  }}
                >
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: typeColor + "18",
                      border: `2px solid ${typeColor}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800, color: typeColor,
                    }}
                  >
                    {i + 1}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 800, color: "var(--text)" }}>
                      <span style={{ fontSize: 16 }}>{TYPE_ICONS[j.type] || "\u{1F684}"}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>{trainName}</span>
                      <span
                        style={{
                          fontSize: 9, fontWeight: 700,
                          color: typeColor,
                          textTransform: "uppercase", letterSpacing: "0.06em",
                          padding: "2px 6px", borderRadius: 4,
                          background: typeColor + "12",
                          border: `1px solid ${typeColor}40`,
                        }}
                      >
                        {j.type}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {j.from} <span style={{ color: typeColor, fontWeight: 800 }}>{"→"}</span> {j.to}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 3 }}>
                      {j.date} · {j.dur}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "var(--accent)" }}>{j.cost}</div>
                    {showNPR && j.type !== "flight" && (
                      <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                        ~{npr(parseFloat(j.cost.replace(/[^0-9.]/g, "") || 0), j.cost.includes("CHF") ? "CHF" : "EUR")}
                      </div>
                    )}
                  </div>

                  <span style={{ fontSize: 12, color: "var(--text-dim)", transition: "transform 0.2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                    {"▾"}
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      padding: "14px 18px 18px",
                      borderTop: "1px solid var(--border-light)",
                      fontFamily: "var(--sans)",
                    }}
                  >
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: typeColor, marginBottom: 6 }}>
                        {"\u{1F3AC}"} What's happening
                      </div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                        {narrative.happening}
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#D97706", marginBottom: 6 }}>
                        {"⚠️"} Watch out for
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {narrative.obstacles.map((o, k) => (
                          <div key={k} style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55, paddingLeft: 16, position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, color: "#D97706", fontWeight: 800 }}>{"›"}</span>
                            {o}
                          </div>
                        ))}
                      </div>
                    </div>

                    {j.bookingUrl && (
                      <a
                        href={j.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 13, fontWeight: 700,
                          padding: "8px 14px", borderRadius: 8,
                          background: "var(--accent)", color: "#fff",
                          textDecoration: "none", fontFamily: "var(--sans)",
                        }}
                      >
                        {"\u{1F517}"} Book this ride {"→"}
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const COUNTRY_TINT = {
  Italy:        { tint: "#FFF6EE", accent: "#B8311E", strip: "linear-gradient(180deg, #008C45 0%, #F4F5F0 50%, #CD212A 100%)" },
  Switzerland:  { tint: "#FFF1F1", accent: "#C8102E", strip: "linear-gradient(180deg, #C8102E 0%, #FFFFFF 100%)" },
  Austria:      { tint: "#FFF1F1", accent: "#C8102E", strip: "linear-gradient(180deg, #ED2939 0%, #FFFFFF 50%, #ED2939 100%)" },
  Netherlands:  { tint: "#FFF8EC", accent: "#C76200", strip: "linear-gradient(180deg, #AE1C28 0%, #FFFFFF 33%, #21468B 100%)" },
  Germany:      { tint: "#FBF7F0", accent: "#9A5300", strip: "linear-gradient(180deg, #000 0%, #DD0000 50%, #FFCE00 100%)" },
  Czechia:      { tint: "#F0F5FA", accent: "#11457E", strip: "linear-gradient(180deg, #FFFFFF 0%, #D7141A 50%, #11457E 100%)" },
};

function shortDate(s) { return s.replace(/^\w+ /, ""); } // "Tue 16 Jun" → "16 Jun"
function dayOfWeek(s) { return (s.match(/^\w+/) || [""])[0]; } // "Tue 16 Jun" → "Tue"

export function BookingsPanel() {
  // Sort confirmed bookings by check-in date (chronological)
  const confirmed = [...AIRBNBS].sort((a, b) => {
    const da = parseCalDate(a.checkIn.date);
    const db = parseCalDate(b.checkIn.date);
    return (da?.getTime() || 0) - (db?.getTime() || 0);
  });

  // Today (project-time) for cancel-by urgency
  const today = new Date(2026, 4, 7); // 2026-05-07 — keep in sync with currentDate

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        {/* ── CONFIRMED AIRBNBS ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
          <h2 style={{ margin: 0 }}>Confirmed Airbnbs</h2>
          <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
            {confirmed.length} bookings · {confirmed.reduce((n, b) => n + b.nights, 0)} nights
          </span>
        </div>
        <p className="subtitle" style={{ marginTop: 4, marginBottom: 18 }}>
          Click any card to open the listing on Airbnb.
        </p>

        <div className="airbnb-grid">
          {confirmed.map((b) => {
            const isTodo = b.status === "todo";
            const isOptional = b.status === "optional";
            const cancelDate = !isTodo && b.cancelBy ? parseCalDate(b.cancelBy.date) : null;
            const daysToCancel = cancelDate ? Math.ceil((cancelDate - today) / 86400000) : null;
            const cancelState = isTodo || isOptional
              ? "todo"
              : daysToCancel == null
              ? "ok"
              : daysToCancel < 0 ? "passed"
              : daysToCancel <= 3 ? "urgent"
              : daysToCancel <= 10 ? "soon"
              : "ok";
            const cancelLabel = isTodo
              ? "📌 Not yet booked — search Airbnb"
              : isOptional
              ? (b.cancelBy
                  ? `🛏 Backup · cancel by ${shortDate(b.cancelBy.date)} ${b.cancelBy.time}`
                  : "🛏 Backup booking")
              : {
                  passed: "🔒 Reservation locked in",
                  urgent: `⚠️ Cancel by ${shortDate(b.cancelBy.date)} ${b.cancelBy.time}`,
                  soon:   `Free cancel until ${shortDate(b.cancelBy.date)}`,
                  ok:     `Free cancel until ${shortDate(b.cancelBy.date)}`,
                }[cancelState];
            const tint = COUNTRY_TINT[b.country] || { tint: "var(--bg-raised)", accent: "var(--accent)", strip: "var(--accent)" };
            // Strip the country/extra qualifier in parens for the headline
            const cityHead = b.city.replace(/\s*\(.+\)\s*$/, "");
            const cityTag = (b.city.match(/\(([^)]+)\)/) || [, ""])[1];
            // For TODO entries, link to an Airbnb search for the city/dates/3 guests
            const isoDate = (d) => {
              const dt = parseCalDate(d);
              if (!dt) return "";
              const y = dt.getFullYear();
              const m = String(dt.getMonth() + 1).padStart(2, "0");
              const day = String(dt.getDate()).padStart(2, "0");
              return `${y}-${m}-${day}`;
            };
            const todoSearchUrl = isTodo ? `https://www.airbnb.com/s/${encodeURIComponent(cityHead)}/homes?checkin=${isoDate(b.checkIn.date)}&checkout=${isoDate(b.checkOut.date)}&adults=${b.guests || 3}` : null;
            const cardHref = b.bookingUrl || todoSearchUrl || "#";

            return (
              <a
                key={b.id}
                href={cardHref}
                target="_blank"
                rel="noreferrer"
                className={`ticket ticket--${cancelState}`}
                style={isTodo ? { borderStyle: "dashed", opacity: 0.92 } : isOptional ? { borderStyle: "dashed", opacity: 0.85 } : (!b.bookingUrl ? { pointerEvents: "none", opacity: 0.85 } : undefined)}
              >
                <div className="ticket-strip" style={{ background: tint.strip }} aria-hidden="true" />
                <div className="ticket-body" style={{ background: tint.tint }}>
                  <div className="ticket-head">
                    <div className="ticket-flag">{b.flag}</div>
                    <div className="ticket-titles">
                      <div className="ticket-city">{cityHead}</div>
                      {cityTag && <div className="ticket-cityqual">{cityTag}</div>}
                    </div>
                    <div className="ticket-nights" style={{ color: tint.accent, borderColor: tint.accent }}>
                      <strong>{b.nights}</strong>
                      <span>{b.nights === 1 ? "night" : "nights"}</span>
                    </div>
                  </div>

                  <div className="ticket-name">{b.name}</div>

                  <div className="ticket-dates">
                    <div className="ticket-stub">
                      <div className="ticket-stub-label">Check-in window</div>
                      <div className="ticket-stub-day">{dayOfWeek(b.checkIn.date)} · {shortDate(b.checkIn.date)}</div>
                      <div className="ticket-stub-time">
                        {b.checkIn.time}
                        {b.checkIn.until && <> – {b.checkIn.until}</>}
                      </div>
                    </div>
                    <div className="ticket-arrow" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="ticket-stub">
                      <div className="ticket-stub-label">Check-out by</div>
                      <div className="ticket-stub-day">{dayOfWeek(b.checkOut.date)} · {shortDate(b.checkOut.date)}</div>
                      <div className="ticket-stub-time">{b.checkOut.time}</div>
                    </div>
                  </div>

                  <div className="ticket-meta">
                    <div className="ticket-meta-row">
                      <span className="ticket-meta-key">Host</span>
                      <span className="ticket-meta-val">{b.host || "— TBD —"}</span>
                    </div>
                    <div className="ticket-meta-row">
                      <span className="ticket-meta-key">Address</span>
                      <span className="ticket-meta-val">{b.address || "— TBD —"}</span>
                    </div>
                    {b.confirmationCode && (
                      <div className="ticket-meta-row">
                        <span className="ticket-meta-key">Code</span>
                        <span className="ticket-meta-val ticket-mono">{b.confirmationCode}</span>
                      </div>
                    )}
                    {b.directionsUrl && (
                      <div className="ticket-meta-row">
                        <span className="ticket-meta-key">Map</span>
                        <span className="ticket-meta-val">
                          <a
                            href={b.directionsUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: tint.accent, textDecoration: "underline", fontWeight: 600 }}
                          >
                            🗺 Walk from station&nbsp;↗
                          </a>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="ticket-foot">
                    <span className={`ticket-cancel ticket-cancel--${cancelState}`}>
                      {cancelLabel}{!isTodo && b.cancelBy?.refundType === "partial" && " · partial only"}
                    </span>
                    {isTodo
                      ? <span className="ticket-cta">Search&nbsp;↗</span>
                      : isOptional
                      ? b.bookingUrl && <span className="ticket-cta">Plan B&nbsp;↗</span>
                      : b.bookingUrl && <span className="ticket-cta">Airbnb&nbsp;↗</span>}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* ── REMAINING TODOS ── */}
        <h2 style={{ marginTop: 36 }}>Still to book</h2>
        <p className="subtitle">Things you haven't booked yet — work top-down.</p>
        <div className="booking-grid">
          {BOOKING.map((b, i) => (
            <a key={i} href={b.url} target="_blank" rel="noreferrer" className="booking-card" style={{ borderLeftColor: URGENCY_COLORS[b.urgency] || "#444" }}>
              <div className="booking-num">{b.priority}</div>
              <div className="booking-body">
                <div className="booking-header">
                  <span className="booking-item">{b.item}</span>
                  <span className="urgency-badge" style={{ color: URGENCY_COLORS[b.urgency] }}>
                    {b.urgency}
                  </span>
                </div>
                <div className="booking-detail">{b.detail}</div>
                <div className="booking-date">{b.date}</div>
              </div>
              <span className="booking-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function GuidePanel() {
  const base = import.meta.env.BASE_URL;
  const guides = [
    {
      title: "Europe Trip Packing Checklist",
      desc: "Comprehensive packing list for the 3-week trip — clothing layers, train essentials, tech, documents, weather kit, daypack split. Print before you start packing.",
      url: `${base}guides/europe_packing_checklist.pdf`,
      icon: "🎒",
      kb: 15,
    },
    {
      title: "Austria Begins — First Stops",
      desc: "Detailed guide to the Austrian leg: arrival logistics, language basics, train ticket types (Sparschiene), what to do in Bregenz/Innsbruck/Salzburg/Vienna, and a few traps to avoid.",
      url: `${base}guides/austria_begins.pdf`,
      icon: "🇦🇹",
      kb: 31,
    },
  ];

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
          <h2 style={{ margin: 0 }}>Guides</h2>
          <span style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
            {guides.length} PDFs
          </span>
        </div>
        <p className="subtitle" style={{ marginTop: 4, marginBottom: 18 }}>
          Reference docs for the trip. Open in browser or download for offline.
        </p>

        <div className="guide-grid">
          {guides.map((g) => (
            <a key={g.title} href={g.url} target="_blank" rel="noreferrer" className="guide-card">
              <div className="guide-card-icon">{g.icon}</div>
              <div className="guide-card-body">
                <div className="guide-card-title">{g.title}</div>
                <div className="guide-card-desc">{g.desc}</div>
                <div className="guide-card-meta">PDF · {g.kb} KB · <span style={{ color: "var(--accent)", fontWeight: 700 }}>View →</span></div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Trip Timeline Sidebar ─────────────────────────── */
/* Left aside — chronological list of stops (one entry per overnight or transit
   block). Each stop is collapsible and shows the calendar days inside. Stops
   are ordered by first CALENDAR appearance, so the route reads top-to-bottom in
   real travel order even when countries are revisited (Austria→Germany→Austria). */
export function TripTimelineSidebar({ active, onClickDay, npr }) {
  // Build stop-based groups in chronological order from CALENDAR.
  // Each consecutive run of CALENDAR days with the same resolved stop becomes
  // one timeline entry. This means Innsbruck (Fri+Sat) is one entry, then
  // Munich (Sun+Mon) is the next, then Salzburg (Mon-Wed), etc.
  const groups = [];
  CALENDAR.forEach((day) => {
    const resolvedStop = day.stop === "imst" ? "innsbruck" : day.stop;
    const last = groups[groups.length - 1];
    if (last && last.stopId === resolvedStop) {
      last.days.push(day);
    } else {
      const stopData = STOPS.find((s) => s.id === resolvedStop);
      groups.push({
        stopId: resolvedStop,
        title: stopData?.city || day.city || "Transit",
        country: stopData?.country || "—",
        flag: stopData?.flag || day.flag || "🌐",
        days: [day],
        stopData,
      });
    }
  });

  // Attach night count + checkin→checkout date span per group from STOPS data.
  groups.forEach((g) => {
    if (!g.stopData) {
      // Transit-only group (Mon 15 Jun Nepal→Delhi or Mon 6 Jul AMS→Delhi)
      g.totalNights = 0;
      g.firstDateLabel = g.days[0].date.replace(/^\w+\s/, "");
      g.lastDateLabel = g.days[g.days.length - 1].date.replace(/^\w+\s/, "");
      return;
    }
    const parsed = parseStopDuration(g.stopData.duration);
    g.totalNights = parsed.nights;
    g.firstDateLabel = parsed.checkinLabel || g.days[0].date.replace(/^\w+\s/, "");
    g.lastDateLabel = parsed.checkoutLabel || g.days[g.days.length - 1].date.replace(/^\w+\s/, "");
  });

  // Determine which group contains the active stop (first match in chronological order)
  const activeGroupIdx = groups.findIndex((g) => g.stopId === active);

  const [openIdx, setOpenIdx] = useState(activeGroupIdx);

  // Auto-expand active group when stop changes
  useEffect(() => {
    if (activeGroupIdx >= 0) setOpenIdx(activeGroupIdx);
  }, [activeGroupIdx]);

  // Top-of-sidebar trip stats
  const totalDays = CALENDAR.length;
  const totalNights = groups.reduce((sum, g) => sum + (g.totalNights || 0), 0);
  const totalCountries = new Set(STOPS.map((s) => s.country)).size; // includes day-trip-only countries (e.g. Switzerland)
  const totalCities = new Set(STOPS.map((s) => s.id)).size;
  const TYPE_BADGE = {
    arrive:  { label: "Arrive",  bg: "#E3F2FD", fg: "#1565C0" },
    explore: { label: "Explore", bg: "#E8F5E9", fg: "#2E7D32" },
    move:    { label: "Travel",  bg: "#FFF3E0", fg: "#E65100" },
    night:   { label: "Night",   bg: "#EDE7F6", fg: "#5E35B1" },
    travel:  { label: "Flight",  bg: "#FCE4EC", fg: "#C2185B" },
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-stats">
        <div className="sidebar-stats-row">
          <div className="sidebar-stat"><b>{totalDays}</b><span>days</span></div>
          <div className="sidebar-stat"><b>{totalNights}</b><span>nights</span></div>
          <div className="sidebar-stat"><b>{totalCountries}</b><span>countries</span></div>
          <div className="sidebar-stat"><b>{totalCities}</b><span>cities</span></div>
        </div>
      </div>
      <div className="sidebar-section-label">Trip Timeline</div>
      {groups.map((g, gi) => {
        const isOpen = openIdx === gi;
        const isActiveGroup = gi === activeGroupIdx;
        // Overnight stops show nights; transit-only entries show day count.
        const countLabel = g.totalNights > 0
          ? `${g.totalNights}n`
          : `${g.days.length}d`;
        // Strip leading day-of-week (e.g. "Tue 16 Jun" → "16 Jun") to fit narrow column.
        const stripDow = (s) => (s || "").replace(/^[A-Z][a-z]{2}\s+/, "");
        const first = stripDow(g.firstDateLabel);
        const last = stripDow(g.lastDateLabel);
        const rangeLabel = first === last ? first : `${first}–${last}`;
        return (
          <div key={`${g.stopId}-${gi}`} className="timeline-group">
            <button
              className={`timeline-group-header${isActiveGroup ? " active" : ""}`}
              onClick={() => setOpenIdx(isOpen ? -1 : gi)}
            >
              <span style={{ fontSize: 16 }}>{g.flag}</span>
              <span className="timeline-group-name">{g.title}</span>
              <span className="timeline-group-meta">
                {countLabel} · {rangeLabel}
              </span>
              <span
                className="timeline-group-caret"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                ▾
              </span>
            </button>
            {isOpen && (
              <div className="timeline-group-days">
                {g.days.map((day, i) => {
                  const resolvedStop = day.stop === "imst" ? "innsbruck" : day.stop;
                  const isActive = resolvedStop === active;
                  const isClickable = resolvedStop && resolvedStop !== "ktm";
                  const calStyle = CAL_TYPES[day.type] || CAL_TYPES.explore;
                  const badge = TYPE_BADGE[day.type] || TYPE_BADGE.explore;
                  // Pull the first 1–2 highlight phrases from the day summary as a preview.
                  const preview = (day.summary || "")
                    .split(/[·•]/)
                    .map((s) => s.trim())
                    .filter((s) => s && !/^[⭐⚠️]+$/.test(s))
                    .slice(0, 2)
                    .join(" · ");
                  return (
                    <button
                      key={i}
                      className={`timeline-day${isActive ? " active" : ""}`}
                      onClick={() => isClickable && onClickDay(day)}
                      style={{
                        opacity: isClickable ? 1 : 0.5,
                        cursor: isClickable ? "pointer" : "default",
                        borderLeftColor: calStyle.dot,
                        alignItems: "flex-start",
                      }}
                    >
                      <div className="timeline-day-num">{day.dayN}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="timeline-day-meta">
                          <span className="timeline-day-date">{day.date}</span>
                          <span
                            className="timeline-day-badge"
                            style={{ background: badge.bg, color: badge.fg }}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <div className="timeline-day-city">
                          <span style={{ fontSize: 12 }}>{day.icon}</span>
                          {day.city}
                        </div>
                        {preview && (
                          <div className="timeline-day-preview">{preview}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      <div className="sidebar-rates">
        <div className="sidebar-rates-title">NPR Rates</div>
        {[
          ["EUR", "EUR 1", 1, "EUR"],
          ["CHF", "CHF 1", 1, "CHF"],
          ["CZK", "CZK 100", 100, "CZK"],
        ].map(([c, l, v, cur]) => (
          <div key={c} className="sidebar-rate">
            <span className="label">{l}</span>
            <span className="value">{npr(v, cur)}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

/* ─────────────────────────── Reusable: DrillDown ─────────────────────────── */
/* One-line headline. Click row → expand for details. Used in left-panel
   refactor and the new top-level info panels. */
function DrillDown({ items = [], compact = false }) {
  const [openIdx, setOpenIdx] = useState(null);
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => {
        const isOpen = openIdx === i;
        return (
          <div
            key={i}
            style={{
              borderRadius: 10,
              border: "1px solid var(--border-light)",
              background: isOpen ? "var(--accent-bg)" : "var(--bg-raised)",
              overflow: "hidden",
              transition: "background 0.15s",
            }}
          >
            <button
              onClick={() => setOpenIdx(isOpen ? null : i)}
              style={{
                width: "100%",
                padding: compact ? "10px 14px" : "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "var(--sans)",
                fontSize: compact ? 13 : 14,
                fontWeight: 600,
                color: "var(--text)",
                lineHeight: 1.45,
              }}
            >
              <span>{it.head}</span>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-dim)",
                  transition: "transform 0.2s",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  flexShrink: 0,
                }}
              >
                ▾
              </span>
            </button>
            {isOpen && it.detail && (
              <div
                style={{
                  padding: compact ? "0 14px 12px" : "0 16px 14px",
                  fontSize: 13,
                  fontFamily: "var(--sans)",
                  color: "var(--text-muted)",
                  lineHeight: 1.65,
                }}
              >
                {it.detail}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Section group wrapper used by info panels (Money, Transport, Scams, etc.) */
function PanelGroup({ title, subtitle, children }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--text)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontFamily: "var(--sans)",
          margin: "0 0 4px",
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <div
          style={{
            fontSize: 12,
            color: "var(--text-dim)",
            fontFamily: "var(--sans)",
            margin: "0 0 12px",
          }}
        >
          {subtitle}
        </div>
      )}
      {!subtitle && <div style={{ height: 12 }} />}
      {children}
    </section>
  );
}

/* Common panel header used by all 5 new info panels */
function PanelHeader({ icon, title, headline, body }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      {headline && (
        <p
          className="subtitle"
          style={{ margin: "6px 0 0", fontWeight: 600, color: "var(--text)" }}
        >
          {headline}
        </p>
      )}
      {body && (
        <p
          className="subtitle"
          style={{ margin: "8px 0 0", lineHeight: 1.6 }}
        >
          {body}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────── Money panel ─────────────────────────── */
export function MoneyPanel() {
  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <PanelHeader
          icon="💳"
          title="Money & Payments"
          headline={MONEY.intro.headline}
          body={MONEY.intro.body}
        />
        {MONEY.groups.map((g) => (
          <PanelGroup key={g.id} title={g.title}>
            <DrillDown items={g.items} />
          </PanelGroup>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Transport-validation panel ─────────────────────────── */
export function TransportValidationPanel() {
  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <PanelHeader
          icon="🚇"
          title="Transport — When Do I Tap?"
          headline={TRANSPORT_VALIDATION.intro.headline}
          body={TRANSPORT_VALIDATION.intro.body}
        />
        {TRANSPORT_VALIDATION.groups.map((g) => (
          <PanelGroup key={g.id} title={g.title} subtitle={g.cities}>
            <DrillDown items={g.items} />
          </PanelGroup>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Booking-timeline panel ─────────────────────────── */
export function BookingTimelinePanel() {
  const [sortByPriority, setSortByPriority] = useState(true);
  const rows = sortByPriority
    ? [...BOOKING_TIMELINE.rows].sort((a, b) => a.priority - b.priority)
    : BOOKING_TIMELINE.rows;

  const PRIORITY_COLORS = {
    1: "#DC2626",
    2: "#D97706",
    3: "#CA8A04",
    4: "#16A34A",
  };

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <PanelHeader
          icon="📆"
          title="Booking Timeline"
          headline={BOOKING_TIMELINE.intro.headline}
          body={BOOKING_TIMELINE.intro.body}
        />

        {/* Legend + sort */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {Object.entries(BOOKING_TIMELINE.legend.priority).map(([k, v]) => (
              <div
                key={k}
                style={{
                  fontSize: 11,
                  fontFamily: "var(--sans)",
                  color: "var(--text-muted)",
                }}
              >
                {v}
              </div>
            ))}
          </div>
          <button
            className={`pill${sortByPriority ? " active" : ""}`}
            onClick={() => setSortByPriority((p) => !p)}
            style={{ fontSize: 11 }}
          >
            {sortByPriority ? "Sorted: priority" : "Sorted: original"}
          </button>
        </div>

        {/* Table */}
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {/* Header row */}
          <div
            className="bt-head"
            style={{
              padding: "10px 14px",
              background: "var(--bg-hover)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-dim)",
              fontFamily: "var(--sans)",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div>P</div>
            <div>What</div>
            <div>How far ahead</div>
            <div>Book by</div>
            <div>Where + why</div>
          </div>

          {rows.map((r, i) => (
            <details
              key={i}
              style={{
                borderBottom: i < rows.length - 1 ? "1px solid var(--border-light)" : "none",
              }}
            >
              <summary
                className="bt-row"
                style={{
                  padding: "12px 14px",
                  cursor: "pointer",
                  alignItems: "start",
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                  color: "var(--text)",
                  listStyle: "none",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: (PRIORITY_COLORS[r.priority] || "#666") + "22",
                    border: `2px solid ${PRIORITY_COLORS[r.priority] || "#666"}`,
                    color: PRIORITY_COLORS[r.priority] || "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {r.priority}
                </div>
                <div style={{ fontWeight: 600 }}>
                  {r.what}
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-dim)",
                      fontWeight: 400,
                      marginTop: 2,
                    }}
                  >
                    {r.mode}
                  </div>
                </div>
                <div>{r.window}</div>
                <div style={{ fontWeight: 600 }}>{r.bookBy}</div>
                <div style={{ color: "var(--text-muted)" }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>
                    {r.where}
                  </span>
                  <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>
                    {r.why}
                  </div>
                </div>
              </summary>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Scams panel ─────────────────────────── */
export function ScamsPanel() {
  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <PanelHeader
          icon="⚠️"
          title="Risk Awareness"
          headline={SCAMS.intro.headline}
          body={SCAMS.intro.body}
        />
        {SCAMS.groups.map((g) => (
          <PanelGroup key={g.id} title={g.title}>
            <DrillDown items={g.items} />
          </PanelGroup>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Alt-Routes panel ─────────────────────────── */
export function AltRoutesPanel() {
  const [activeRoute, setActiveRoute] = useState(ALT_ROUTES.routes[0].id);
  const route = ALT_ROUTES.routes.find((r) => r.id === activeRoute) || ALT_ROUTES.routes[0];

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <PanelHeader
          icon="🛤"
          title="Alternative Itineraries"
          headline={ALT_ROUTES.intro.headline}
          body={ALT_ROUTES.intro.body}
        />

        {/* Route switcher */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {ALT_ROUTES.routes.map((r) => (
            <button
              key={r.id}
              className={`pill${activeRoute === r.id ? " active" : ""}`}
              onClick={() => setActiveRoute(r.id)}
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              {r.tagline}
            </button>
          ))}
        </div>

        {/* Active route detail */}
        <div
          style={{
            padding: "20px 22px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--bg-raised)",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "var(--sans)", marginBottom: 6 }}>
            {route.duration} · {route.countries}
          </div>
          <div
            style={{
              fontSize: 15,
              fontFamily: "var(--sans)",
              color: "var(--text-muted)",
              lineHeight: 1.65,
              marginBottom: 16,
            }}
          >
            {route.pitch}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 18 }}>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "rgba(76,175,80,0.06)",
                border: "1px solid rgba(76,175,80,0.2)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#4CAF50", fontFamily: "var(--sans)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Why consider
              </div>
              {route.whyConsider.map((w, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.55, marginBottom: 6 }}>
                  ✓ {w}
                </div>
              ))}
            </div>
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "rgba(229,57,53,0.06)",
                border: "1px solid rgba(229,57,53,0.2)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "#E53935", fontFamily: "var(--sans)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Tradeoffs
              </div>
              {route.tradeoffs.map((w, i) => (
                <div key={i} style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", lineHeight: 1.55, marginBottom: 6 }}>
                  ✗ {w}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              fontFamily: "var(--sans)",
              color: "var(--accent)",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 10,
            }}
          >
            Day-by-day
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {route.stops.map((s, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 30px 1fr",
                  gap: 12,
                  padding: "10px 14px",
                  border: "1px solid var(--border-light)",
                  borderRadius: 10,
                  background: "var(--bg)",
                  alignItems: "start",
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                }}
              >
                <div style={{ fontWeight: 700, color: "var(--accent)" }}>Day {s.day}</div>
                <div style={{ fontSize: 16 }}>{s.flag}</div>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text)" }}>{s.city}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.5 }}>
                    {s.note}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: "10px 14px",
              borderRadius: 8,
              background: "var(--accent-bg)",
              fontSize: 13,
              fontFamily: "var(--sans)",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            Budget delta: {route.budgetDelta}
          </div>
        </div>

        {/* Decision matrix */}
        <PanelGroup title="Decide between routes — at a glance">
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              overflow: "hidden",
            }}
          >
            {ALT_ROUTES.decisionMatrix.map((d, i) => (
              <div
                key={i}
                className="altmatrix-row"
                style={{
                  padding: "10px 14px",
                  borderBottom: i < ALT_ROUTES.decisionMatrix.length - 1 ? "1px solid var(--border-light)" : "none",
                  fontFamily: "var(--sans)",
                  fontSize: 13,
                  background: i % 2 ? "var(--bg-raised)" : "var(--bg)",
                }}
              >
                <div style={{ fontWeight: 600, color: "var(--text)" }}>{d.factor}</div>
                <div style={{ fontWeight: 700, color: "var(--accent)" }}>{d.winner}</div>
                <div style={{ color: "var(--text-muted)" }}>{d.note}</div>
              </div>
            ))}
          </div>
        </PanelGroup>
      </div>
    </div>
  );
}
