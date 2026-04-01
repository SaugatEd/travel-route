import { useState, useEffect } from "react";
import { STOPS, JOURNEYS, BOOKING, CALENDAR, TRIP_BUDGET } from "./data/tripData";
import { useRates } from "./utils/useRates";
import { generateStopPdf, generateFullTripPdf } from "./utils/generatePdf";
import "./styles/app.css";

import { CITY_IMAGES, LANDMARK_IMAGES } from "./data/imageData";
import { TIPS, PACKING_CHECKLIST } from "./data/tipsData";
import { DOCS, MUST_TRY } from "./data/docsData";
import { PRACTICAL } from "./data/practicalData";

const getCityHero = (id) => CITY_IMAGES?.[id]?.hero || null;
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
              <div className="header-subtitle">16 Jun – 6 Jul · 5 travellers · Europe 2026</div>
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
          <div className="header-actions">
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className="pill" onClick={toggleTheme} title={`Switch to ${theme === "light" ? "dark" : "light"} mode`} style={{ padding: "8px 14px", fontSize: 15 }}>
                {theme === "light" ? "🌙" : "☀️"}
              </button>
              <button className={`pill${showNPR ? " active" : ""}`} onClick={() => setShowNPR((p) => !p)} style={{ fontSize: 12 }}>
                ₨ {showNPR ? "ON" : "OFF"}
              </button>
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border)', borderRadius: 1 }} />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {["calendar", "journeys", "bookings"].map((t) => (
                <button key={t} className={`pill${topTab === t ? " active" : ""}`} onClick={() => setTopTab((p) => (p === t ? null : t))}>
                  {t === "journeys" ? "🗺 Trains" : t === "bookings" ? "🔗 Book" : "📅 Calendar"}
                </button>
              ))}
            </div>
            <div style={{ width: 1, height: 24, background: 'var(--border)', borderRadius: 1 }} />
            <button className="pdf-btn" onClick={() => generateFullTripPdf(STOPS, CALENDAR, { journeys: JOURNEYS, tripBudget: TRIP_BUDGET, packingChecklist: PACKING_CHECKLIST, practical: PRACTICAL })} title="Download complete trip PDF">
              📄 Full Trip PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── TOP PANELS ── */}
      {topTab === "calendar" && <CalendarPanel active={active} onClickDay={handleCalClick} />}
      {topTab === "journeys" && <JourneysPanel showNPR={showNPR} npr={npr} />}
      {topTab === "bookings" && <BookingsPanel />}

      {/* ── MAIN LAYOUT ── */}
      <div className="app-layout">
        {/* Sidebar — Day-by-day */}
        <aside className="sidebar">
          <div style={{ padding: "14px 16px 10px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--text-faint)", fontFamily: "var(--sans)" }}>
            Trip Timeline
          </div>
          {CALENDAR.map((day, i) => {
            const resolvedStop = day.stop === "imst" ? "innsbruck" : day.stop;
            const isActive = resolvedStop === active;
            const isClickable = resolvedStop && resolvedStop !== "ktm";
            const calStyle = CAL_TYPES[day.type] || CAL_TYPES.explore;
            return (
              <button
                key={i}
                className={`sidebar-btn${isActive ? " active" : ""}`}
                onClick={() => isClickable && handleCalClick(day)}
                style={{
                  opacity: isClickable ? 1 : 0.5,
                  cursor: isClickable ? "pointer" : "default",
                  borderLeft: `3px solid ${calStyle.dot}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  {/* Small city thumbnail */}
                  {getCityHero(resolvedStop) && (
                    <div style={{ width: 32, height: 32, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
                      <img src={getCityHero(resolvedStop)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Day {day.dayN} · {day.date}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? "var(--text)" : "var(--text-muted)", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {day.flag} {day.city}
                    </div>
                  </div>
                </div>
              </button>
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

            <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
              {/* Destination flow nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                {prevStop && (
                  <button className="nav-btn" onClick={() => handleStopChange(prevStop.id)} style={heroImg ? { color: "#fff", borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" } : {}}>
                    ← {prevStop.flag} {prevStop.city}
                  </button>
                )}
                <span style={{
                  fontSize: 13, fontWeight: 700,
                  color: heroImg ? "#fff" : "var(--accent)",
                  padding: "8px 24px",
                  border: `1.5px solid ${heroImg ? "rgba(255,255,255,0.4)" : "var(--accent)"}`,
                  borderRadius: 999,
                  background: heroImg ? "rgba(255,255,255,0.1)" : "var(--accent-bg)",
                  backdropFilter: heroImg ? "blur(12px)" : "none",
                  fontFamily: "var(--sans)",
                  letterSpacing: "0.02em",
                }}>
                  {stop.flag} {stop.city}
                </span>
                {nextStop && (
                  <button className="nav-btn" onClick={() => handleStopChange(nextStop.id)} style={heroImg ? { color: "#fff", borderColor: "rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" } : {}}>
                    {nextStop.flag} {nextStop.city} →
                  </button>
                )}
              </div>

              {/* Day badge */}
              {stopCalDays.length > 0 && (
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  <span style={{
                    display: "inline-block",
                    padding: "5px 16px",
                    borderRadius: 999,
                    background: heroImg ? "rgba(255,255,255,0.15)" : "var(--accent)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    backdropFilter: heroImg ? "blur(12px)" : "none",
                    fontFamily: "var(--mono)",
                  }}>
                    DAY {stopCalDays[0].dayN}{stopCalDays.length > 1 ? `–${stopCalDays[stopCalDays.length - 1].dayN}` : ""} · {stopCalDays[0].date}{stopCalDays.length > 1 ? ` – ${stopCalDays[stopCalDays.length - 1].date}` : ""}
                  </span>
                </div>
              )}

              <div className="hero-meta" style={{ justifyContent: "center" }}>
                <span style={heroImg ? { color: "rgba(255,255,255,0.75)" } : {}}>{stop.country}</span>
                <span className="dot" style={heroImg ? { color: "rgba(255,255,255,0.3)" } : {}}>·</span>
                <span style={heroImg ? { color: "rgba(255,255,255,0.75)" } : {}}>{stop.duration}</span>
              </div>
              <h1 className="hero-title" style={{
                textAlign: "center",
                ...(heroImg ? { color: "#fff", textShadow: "0 4px 24px rgba(0,0,0,0.4)" } : {}),
              }}>
                {stop.city}
              </h1>
              <p className="hero-tagline" style={{
                textAlign: "center",
                maxWidth: 560,
                margin: "0 auto 32px",
                ...(heroImg ? { color: "rgba(255,255,255,0.8)" } : {}),
              }}>
                "{stop.tagline}"
              </p>
              <div className="hero-stats" style={{ justifyContent: "center" }}>
                <div className="stat-card" style={heroImg ? { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px) saturate(1.4)" } : {}}>
                  <div className="label" style={heroImg ? { color: "rgba(255,255,255,0.6)" } : {}}>Accommodation</div>
                  <div className="val" style={heroImg ? { color: "#fff" } : {}}>{stop.budget}</div>
                  {showNPR && <div className="sub" style={{ color: heroImg ? "#F0C56E" : "var(--orange)" }}>for 5 people / night</div>}
                </div>
                <div className="stat-card" style={heroImg ? { background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px) saturate(1.4)" } : {}}>
                  <div className="label" style={heroImg ? { color: "rgba(255,255,255,0.6)" } : {}}>Weather in June</div>
                  <div className="val" style={heroImg ? { color: "#fff" } : {}}>{stop.weather.temp}</div>
                  <div className="sub" style={heroImg ? { color: "rgba(255,255,255,0.6)" } : {}}>{stop.weather.rain}</div>
                </div>
                <button className="pdf-btn" onClick={() => generateStopPdf(stop, calDay)} title={`Download ${stop.city} PDF`}>
                  ↓ Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* View Content */}
          {view === "overview" && <OverviewView stop={stop} idx={idx} stops={STOPS} journeys={JOURNEYS} onStopChange={handleStopChange} showNPR={showNPR} npr={npr} />}
          {view === "gallery" && <GalleryView stop={stop} />}
          {view === "budget" && <BudgetView stop={stop} stops={STOPS} showNPR={showNPR} npr={npr} />}
          {view === "checklist" && <ChecklistView />}
          {view === "phrasebook" && <PhrasebookView stop={stop} />}
          {view === "docs" && <DocsView />}
        </main>

        {/* Right Sidebar — Navigation */}
        <aside className="sidebar-right">
          {/* Mini destination card */}
          <div style={{
            padding: '16px 14px', margin: '0 10px 16px', borderRadius: 14,
            background: 'var(--gradient-warm)',
            border: '1px solid var(--accent-border)', textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--accent-glow)',
            }} />
            <div style={{ fontSize: 28, position: 'relative' }}>{stop.flag}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--display)', marginTop: 6, position: 'relative' }}>{stop.city}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--sans)', marginTop: 2, position: 'relative' }}>{stop.country}</div>
          </div>
          <div style={{ padding: '12px 14px 8px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-faint)', fontFamily: 'var(--sans)' }}>
            Explore
          </div>
          <div className="right-nav">
            {[
              { id: 'overview', icon: '✨', label: 'Overview' },
              { id: 'gallery', icon: '🖼', label: 'Gallery' },
              { id: 'budget', icon: '💰', label: 'Budget' },
              { id: 'checklist', icon: '✅', label: 'Checklist' },
              { id: 'phrasebook', icon: '🗣', label: 'Phrasebook' },
              { id: 'docs', icon: '📋', label: 'Visa & Docs' },
            ].map(item => (
              <button
                key={item.id}
                className={`right-nav-btn${view === item.id ? ' active' : ''}`}
                onClick={() => setView(item.id)}
              >
                <span className="right-nav-icon">{item.icon}</span>
                <span className="right-nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Info */}
          <div style={{ padding: '16px 14px', borderTop: '1px solid var(--border)', marginTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-faint)', marginBottom: 12, fontFamily: 'var(--sans)' }}>
              Quick Info
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Currency', value: stop.currency },
                { label: 'Weather', value: stop.weather.temp },
                { label: 'Budget', value: stop.budget },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 12, fontFamily: 'var(--sans)',
                  padding: '6px 10px', borderRadius: 8,
                  background: 'var(--bg-hover)',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════ */


function HiddenGemsContent({ stop }) {
  if (!stop.hiddenGems?.length) return null;
  return (
    <div className="gems-grid">
      {stop.hiddenGems.map((gem, i) => (
        <div key={i} className="gem-card">
          <div className="gem-header">
            <h4 className="gem-title">{gem.title}</h4>
            <span className="gem-cost">{gem.cost}</span>
          </div>
          <p className="gem-desc">{gem.desc}</p>
          {gem.tip && <div className="gem-tip">&#128161; {gem.tip}</div>}
        </div>
      ))}
    </div>
  );
}

function WorkspacesContent({ stop }) {
  if (!stop.workspaces?.length) return null;

  const typeStyles = {
    Library: { bg: 'var(--green-bg)', border: 'var(--green-border)', color: 'var(--green)', icon: '📚' },
    Cafe: { bg: 'var(--orange-bg)', border: 'var(--orange-border)', color: 'var(--orange)', icon: '☕' },
    'Cafe/Bookshop': { bg: 'var(--orange-bg)', border: 'var(--orange-border)', color: 'var(--orange)', icon: '📖' },
    'Cafe/Coworking': { bg: 'var(--accent-bg)', border: 'var(--accent-border)', color: 'var(--accent)', icon: '💻' },
    Coworking: { bg: 'var(--accent-bg)', border: 'var(--accent-border)', color: 'var(--accent)', icon: '💻' },
    'Traditional Coffeehouse': { bg: 'var(--orange-bg)', border: 'var(--orange-border)', color: 'var(--orange)', icon: '🫖' },
    'Beer Garden': { bg: 'var(--orange-bg)', border: 'var(--orange-border)', color: 'var(--orange)', icon: '🍺' },
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
      {stop.workspaces.map((ws, i) => {
        const style = typeStyles[ws.type] || typeStyles.Cafe;
        return (
          <div key={i} style={{
            padding: '18px 20px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{style.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--sans)' }}>{ws.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--sans)', marginTop: 1 }}>{ws.area}</div>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                background: style.bg, color: style.color, border: `1px solid ${style.border}`,
                whiteSpace: 'nowrap', fontFamily: 'var(--sans)',
              }}>
                {ws.type}
              </span>
            </div>

            {/* Details row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'var(--sans)' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>💰</span>
                <span style={{ fontWeight: 600, color: ws.cost === 'Free' ? 'var(--green)' : 'var(--text)' }}>{ws.cost}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'var(--sans)' }}>
                <span>📶</span>
                <span style={{ color: 'var(--text-muted)' }}>{ws.wifi}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'var(--sans)' }}>
                <span>{ws.power ? '🔌' : '🔋'}</span>
                <span style={{ color: ws.power ? 'var(--green)' : 'var(--text-dim)' }}>{ws.power ? 'Outlets' : 'No outlets'}</span>
              </div>
            </div>

            {/* Hours */}
            <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--sans)', marginBottom: 8 }}>
              🕐 {ws.hours}
            </div>

            {/* Note */}
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--sans)', lineHeight: 1.6 }}>
              {ws.note}
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

function GalleryView({ stop }) {
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

function OverviewView({ stop, idx, stops, journeys, onStopChange, showNPR, npr }) {
  const [section, setSection] = useState("highlights");

  const gallery = getCityGallery(stop.id);
  const highlights = CITY_IMAGES?.[stop.id]?.highlights || [];

  const chips = [
    { id: "highlights", label: "Highlights", icon: "✨" },
    { id: "itinerary", label: "Itinerary", icon: "📅" },
    { id: "gems", label: "Hidden Gems", icon: "💎" },
    { id: "work", label: "Work & Rest", icon: "💻" },
    { id: "activities", label: "Activities", icon: "🎯" },
    { id: "transport", label: "Getting Here", icon: "🚄" },
    { id: "stay", label: "Stay & Eat", icon: "🏠" },
    { id: "compare", label: "Train vs Flight", icon: "📊" },
    { id: "tips", label: "Tips", icon: "💡" },
    { id: "musttry", label: "Food & Shopping", icon: "🍽" },
    { id: "weather", label: "Weather", icon: "🌡" },
    { id: "route", label: "Route", icon: "🗺" },
    { id: "videos", label: "Videos", icon: "▶" },
  ];

  return (
    <div className="panel" style={{ padding: 0 }}>

      {/* Quick Facts Strip */}
      <div style={{ padding: '0 24px' }}>
        <div className="quick-facts">
          {[
            { icon: "📍", label: "Duration", value: stop.duration.split('·')[0].trim() },
            { icon: "🌡", label: "Weather", value: stop.weather.temp },
            { icon: "💰", label: "Budget", value: stop.budget },
            { icon: "💵", label: "Currency", value: stop.currency },
          ].map((f, i) => (
            <div key={i} className="quick-fact">
              <span className="quick-fact__icon">{f.icon}</span>
              <div>
                <div className="quick-fact__label">{f.label}</div>
                <div className="quick-fact__value">{f.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photo Grid — always visible */}
      {gallery.length >= 3 && (
        <div style={{ padding: '0 24px', marginBottom: 24 }}>
          <div className="photo-grid">
            {gallery.slice(0, 3).map((img, i) => (
              <div key={i} className="photo-grid__item">
                <img src={typeof img === 'string' ? img : img.url} alt={typeof img === 'object' ? img.alt : `${stop.city} ${i+1}`} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
                {i === 2 && gallery.length > 3 && (
                  <div className="photo-grid__more">+{gallery.length - 3} more photos</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Chips — click to switch content below */}
      <div className="chip-nav chip-nav--section">
        {chips.map(chip => (
          <button
            key={chip.id}
            className={`chip${section === chip.id ? ' active' : ''}`}
            onClick={() => setSection(chip.id)}
          >
            <span>{chip.icon}</span>
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* === SECTION CONTENT — only the active section renders === */}
      <div key={section} style={{ padding: 24 }} className="panel">

        {section === "highlights" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Top Picks in {stop.city}</h2>
            </div>
            {highlights.length > 0 ? (
              <div className="highlights-carousel">
                {highlights.map((h, i) => (
                  <div key={i} className="highlight-card">
                    <img src={h.url} alt={h.title} loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = IMG_FALLBACK; }} />
                    <div className="highlight-card__overlay">
                      <div className="highlight-card__category">{h.category}</div>
                      <div className="highlight-card__title">{h.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="must-do-strip">
                {stop.must?.map((m, i) => (
                  <div key={i} className="must-do-item">
                    <span className="must-do-num">{i + 1}</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--sans)', marginBottom: 12 }}>The Story</h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-muted)', fontFamily: 'var(--sans)', marginBottom: 20 }}>{stop.story}</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--sans)', marginBottom: 12 }}>History</h3>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-muted)', fontFamily: 'var(--sans)', marginBottom: 20 }}>{stop.history}</p>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--sans)', marginBottom: 12 }}>Must Do</h3>
              <div className="must-do-strip">
                {stop.must?.map((m, i) => (
                  <div key={i} className="must-do-item">
                    <span className="must-do-num">{i + 1}</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {section === "itinerary" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Day by Day</h2>
            </div>
            <ItineraryContent stop={stop} />
          </>
        )}

        {section === "gems" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Hidden Gems & Local Tips</h2>
            </div>
            {stop.hiddenGems?.length > 0 ? <HiddenGemsContent stop={stop} /> : (
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>No hidden gems data for this stop yet.</p>
            )}
          </>
        )}

        {section === "work" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Work & Rest Spots</h2>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
                Libraries, cafes & coworking for laptop work
              </span>
            </div>
            {stop.workspaces?.length > 0 ? <WorkspacesContent stop={stop} /> : (
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>No workspace data for this transit stop.</p>
            )}
          </>
        )}

        {section === "transport" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Getting to {stop.city}</h2>
            </div>
            <TransportContent stop={stop} />
          </>
        )}

        {section === "stay" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Where to Stay & Eat</h2>
            </div>
            <StayEatContent stop={stop} />
          </>
        )}

        {section === "compare" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Train vs Flight</h2>
            </div>
            <CompareContent stop={stop} />
          </>
        )}

        {section === "tips" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Tips & Tricks</h2>
            </div>
            <TipsContent stop={stop} />
          </>
        )}

        {section === "musttry" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Must Try Food & Shopping</h2>
            </div>
            <MustTryContent stop={stop} />
          </>
        )}

        {section === "weather" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Weather Details</h2>
            </div>
            <WeatherContent stop={stop} />
          </>
        )}

        {section === "route" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Route Overview</h2>
            </div>
            <RouteContent stop={stop} idx={idx} stops={stops} journeys={journeys} onStopChange={onStopChange} />
          </>
        )}

        {section === "activities" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Activities & Experiences</h2>
            </div>
            {stop.activities?.length > 0 ? <ActivitiesContent stop={stop} /> : (
              <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>No activities data for this transit stop.</p>
            )}
          </>
        )}

        {section === "videos" && (
          <>
            <div className="section-header">
              <h2 className="section-title">Watch on YouTube</h2>
              <span style={{ fontSize: 12, color: 'var(--text-dim)', fontFamily: 'var(--sans)' }}>
                Opens YouTube search results
              </span>
            </div>
            <VideosContent stop={stop} />
          </>
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

      {/* Route Map — Google Maps */}
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
      <p className="itin-desc">Everything planned. Every timing verified. Tips from experience.</p>
      {stop.itinerary.map((item, i) => (
        <div key={i} className="itin-item">
          <div className={`itin-line${i === 0 ? " first" : i === stop.itinerary.length - 1 ? " last" : ""}`}>
            <div className="itin-dot" />
          </div>
          <div className="itin-content">
            <div className="itin-time">{item.time}</div>
            <div className="itin-header">
              <span className="itin-icon">{item.icon}</span>
              <h3 className="itin-title">{item.title}</h3>
            </div>
            <p className="itin-desc-text">{item.desc}</p>
            <div className="itin-tip">{item.tip}</div>
          </div>
        </div>
      ))}

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
                  🔗 Compare & Book (€50–200/night for 5)
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

function DocsView() {
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
        Complete guide for 5 Nepali passport holders · 2 working professionals + 3 parents
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
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)", marginTop: 4 }}>Total for 5: {DOCS.costs?.totalForFive}</div>
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
function BudgetView({ stop, stops, showNPR, npr }) {
  const allStops = stops.filter(s => s.budgetBreakdown && s.budgetBreakdown.days > 0);
  const currentBb = stop?.budgetBreakdown;

  return (
    <div className="panel">
      <h2 className="story-title">Trip Budget</h2>
      <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--sans)", marginBottom: 24, lineHeight: 1.7 }}>
        Estimated costs for 5 travellers · All prices approximate · June 2026
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
              <div style={{ fontSize: 13, opacity: 0.8 }}>group total (5 ppl)</div>
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
              { label: "Schengen Visa", total: TRIP_BUDGET.visa.perPerson * 5, pp: TRIP_BUDGET.visa.perPerson, currency: "€", note: TRIP_BUDGET.visa.note },
              { label: "Travel Insurance", total: TRIP_BUDGET.insurance.perPerson * 5, pp: TRIP_BUDGET.insurance.perPerson, currency: "€", note: TRIP_BUDGET.insurance.note },
              { label: "Train Journeys (16 total)", total: TRIP_BUDGET.trainTotal.total, pp: TRIP_BUDGET.trainTotal.perPerson, currency: "€", note: TRIP_BUDGET.trainTotal.note },
              { label: `Accommodation (${TRIP_BUDGET.accommodationTotal.totalNights} nights)`, total: TRIP_BUDGET.accommodationTotal.perNight * TRIP_BUDGET.accommodationTotal.totalNights, pp: Math.round(TRIP_BUDGET.accommodationTotal.perNight * TRIP_BUDGET.accommodationTotal.totalNights / 5), currency: "€", note: TRIP_BUDGET.accommodationTotal.note },
              { label: "Food (21 days)", total: TRIP_BUDGET.foodDaily.perPerson * 21 * 5, pp: TRIP_BUDGET.foodDaily.perPerson * 21, currency: "€", note: TRIP_BUDGET.foodDaily.note },
              { label: "Activities & Attractions", total: TRIP_BUDGET.activitiesTotal.perPerson * 5, pp: TRIP_BUDGET.activitiesTotal.perPerson, currency: "€", note: TRIP_BUDGET.activitiesTotal.note },
              { label: "Misc (souvenirs, tips)", total: TRIP_BUDGET.miscDaily.perPerson * 21 * 5, pp: TRIP_BUDGET.miscDaily.perPerson * 21, currency: "€", note: TRIP_BUDGET.miscDaily.note },
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
function ChecklistView() {
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
        21 days · 7 countries · 5 people · Check items as you pack
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
function PhrasebookView({ stop }) {
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
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, fontFamily: "var(--sans)" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>English</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>Local</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", color: "var(--text-dim)", fontSize: 11, textTransform: "uppercase", fontWeight: 600 }}>Pronunciation</th>
                  </tr>
                </thead>
                <tbody>
                  {info.phrases.map((p, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 1 ? "var(--bg-hover)" : "transparent" }}>
                      <td style={{ padding: "8px 16px", color: "var(--text)" }}>{p.en}</td>
                      <td style={{ padding: "8px 16px", fontWeight: 600, color: "var(--accent)" }}>{p.local}</td>
                      <td style={{ padding: "8px 16px", fontStyle: "italic", color: "var(--text-muted)" }}>{p.pronunciation}</td>
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

/* ── TOP PANELS ── */

function CalendarPanel({ active, onClickDay }) {
  const legends = [
    ["explore", "#4CAF50", "Explore"],
    ["move", "#FF9800", "Travel Day"],
    ["arrive", "#64B5F6", "Arrive"],
    ["night", "#9575CD", "Night Train"],
    ["travel", "#F06292", "Flight"],
  ];

  // Group by country for visual separators
  let lastCountry = "";

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          <div>
            <h2>21 Days · June 16 – July 6, 2026</h2>
            <p className="subtitle" style={{ margin: '4px 0 0' }}>5 travellers · Kathmandu → Kathmandu · 6 countries · 14 cities</p>
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

        {/* Stats strip at top */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { n: "21", label: "Days", icon: "\u{1F4C5}" },
            { n: "6", label: "Countries", icon: "\u{1F30D}" },
            { n: "14", label: "Cities", icon: "\u{1F3D9}" },
            { n: "16", label: "Trains", icon: "\u{1F684}" },
            { n: "18", label: "Nights", icon: "\u{1F319}" },
            { n: "5", label: "Travellers", icon: "\u{1F465}" },
          ].map(s => (
            <div key={s.label} style={{
              padding: '10px 16px', borderRadius: 10,
              background: 'var(--bg-raised)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--sans)' }}>{s.n}</div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="cal-grid">
          {CALENDAR.map((day, i) => {
            const s = CAL_TYPES[day.type] || CAL_TYPES.explore;
            const resolvedStop = day.stop === "imst" ? "innsbruck" : day.stop;
            const isActive = active === resolvedStop;
            const cityImg = getCityHero(resolvedStop);

            // Country divider
            const stopData = STOPS.find(st => st.id === resolvedStop);
            const country = stopData?.country || "";
            const showCountryDivider = country && country !== lastCountry;
            if (country) lastCountry = country;

            return (
              <div key={i}>
                {showCountryDivider && (
                  <div style={{
                    gridColumn: '1 / -1', padding: '8px 0 4px',
                    fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                    fontFamily: 'var(--sans)', textTransform: 'uppercase',
                    letterSpacing: '0.1em', borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                    marginTop: i > 0 ? 8 : 0, paddingTop: i > 0 ? 12 : 8,
                  }}>
                    {stopData?.flag} {country}
                  </div>
                )}
                <div
                  className={`cal-card${isActive ? " active" : ""}`}
                  onClick={() => onClickDay(day)}
                  style={{
                    borderLeftColor: s.dot,
                    borderColor: isActive ? "var(--accent)" : s.border,
                    background: s.glow,
                    cursor: resolvedStop !== "ktm" ? "pointer" : "default",
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Tiny city thumbnail */}
                  {cityImg && (
                    <div style={{
                      position: 'absolute', top: 0, right: 0, bottom: 0, width: 80,
                      opacity: 0.15, overflow: 'hidden',
                    }}>
                      <img src={cityImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                  )}
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="cal-header">
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{day.icon}</span>
                        <div>
                          <div className="cal-meta">DAY {day.dayN} · {day.date.toUpperCase()}</div>
                          <div className="cal-city">
                            {day.flag} {day.city}
                          </div>
                        </div>
                      </div>
                      {day.move && (
                        <span className="travel-badge" style={{ color: s.text, background: "rgba(255,255,255,0.04)", border: `1px solid ${s.border}` }}>
                          TRAVEL DAY
                        </span>
                      )}
                    </div>
                    <p className="cal-summary">{day.summary}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function JourneysPanel({ showNPR, npr }) {
  // Calculate totals
  const totalDuration = JOURNEYS.reduce((acc, j) => {
    const match = j.dur?.match(/(\d+)\s*h(?:rs?)?/);
    const minMatch = j.dur?.match(/(\d+)\s*min/);
    return acc + (match ? parseInt(match[1]) * 60 : 0) + (minMatch ? parseInt(minMatch[1]) : 0);
  }, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMins = totalDuration % 60;

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <h2>All {JOURNEYS.length} Journeys</h2>
        <p className="subtitle">In chronological order · book in advance for best prices</p>

        {/* Journey Stats */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Journeys', value: JOURNEYS.length, icon: '\u{1F684}' },
            { label: 'Total Travel Time', value: `${totalHours}h ${totalMins}m`, icon: '\u23F1' },
            { label: 'Countries', value: '6', icon: '\u{1F30D}' },
            { label: 'Longest', value: JOURNEYS.reduce((max, j) => {
              const h = parseInt(j.dur?.match(/(\d+)\s*h/)?.[1] || 0);
              return h > max.h ? { h, name: `${j.from}\u2192${j.to}` } : max;
            }, { h: 0, name: '' }).name, icon: '\u{1F4CF}' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '12px 18px', borderRadius: 10,
              background: 'var(--bg-raised)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 180px',
            }}>
              <span style={{ fontSize: 20 }}>{stat.icon}</span>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--sans)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{stat.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--sans)' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Journey Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {JOURNEYS.map((j, i) => {
            const typeColor = TYPE_COLORS[j.type] || "#666";
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "40px 44px 1fr auto auto auto",
                alignItems: "center", gap: 14,
                padding: "14px 18px",
                background: "var(--bg-raised)", border: "1px solid var(--border-light)",
                borderLeft: `4px solid ${typeColor}`,
                borderRadius: "var(--radius)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-raised)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {/* Step number */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: typeColor + "18", border: `2px solid ${typeColor}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: typeColor, flexShrink: 0,
                }}>
                  {i + 1}
                </div>

                {/* Icon + Type badge */}
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 22 }}>{TYPE_ICONS[j.type] || "\u{1F684}"}</span>
                  <div style={{ fontSize: 9, fontWeight: 700, color: typeColor, fontFamily: 'var(--sans)', textTransform: 'uppercase', marginTop: 2 }}>
                    {j.type}
                  </div>
                </div>

                {/* Route + details */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>
                    {j.from} \u2192 {j.to}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "var(--sans)", marginTop: 3, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span>{j.via}</span>
                    <span style={{ color: 'var(--border-light)' }}>|</span>
                    <span style={{ fontWeight: 600 }}>{j.date}</span>
                  </div>
                </div>

                {/* Duration */}
                <div style={{ textAlign: "center", flexShrink: 0, minWidth: 70, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-hover)' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", fontFamily: "var(--sans)" }}>{j.dur}</div>
                </div>

                {/* Cost */}
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 90 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--accent)", fontFamily: "var(--sans)" }}>
                    {j.cost}
                  </div>
                  {showNPR && j.type !== "flight" && (
                    <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
                      ~{npr(parseFloat(j.cost.replace(/[^0-9.]/g, "") || 0), j.cost.includes("CHF") ? "CHF" : "EUR")}
                    </div>
                  )}
                </div>

                {/* Book button */}
                {j.bookingUrl ? (
                  <a href={j.bookingUrl} target="_blank" rel="noreferrer" style={{
                    fontSize: 12, padding: "8px 14px", borderRadius: 8,
                    background: "var(--accent)", color: "#fff", fontWeight: 700,
                    fontFamily: "var(--sans)", textDecoration: "none", whiteSpace: "nowrap",
                    flexShrink: 0, textAlign: 'center', transition: 'all 0.15s',
                  }}>Book Now</a>
                ) : (
                  <div style={{ width: 70 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Booking Tips */}
        <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'var(--sans)' }}>
            Booking Tips
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8, fontSize: 13, fontFamily: 'var(--sans)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div>Book Italian trains (Trenitalia/Italo) 60+ days ahead for cheapest fares</div>
            <div>Austrian OBB Sparschiene from \u20AC9.90 \u2014 limited quantity, book early</div>
            <div>Berlin\u2192Amsterdam Nightjet saves a hotel night \u2014 book at europeansleeper.eu</div>
            <div>RegioJet Vienna\u2192Prague is cheap even last-minute and refundable</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingsPanel() {
  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <h2>Book Everything — In Priority Order</h2>
        <p className="subtitle">Start from #1 and work down. The first 5 are genuinely urgent.</p>
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
