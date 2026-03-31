import { useState, useEffect } from "react";
import { STOPS, JOURNEYS, BOOKING, CALENDAR } from "./data/tripData";
import { useRates } from "./utils/useRates";
import { generateStopPdf, generateFullTripPdf } from "./utils/generatePdf";
import "./styles/app.css";

import { CITY_IMAGES, LANDMARK_IMAGES, ROUTE_MAPS } from "./data/imageData";
import { TIPS } from "./data/tipsData";
import { DOCS, MUST_TRY } from "./data/docsData";

const getCityHero = (id) => CITY_IMAGES?.[id]?.hero || null;
const getCityMap = (id) => CITY_IMAGES?.[id]?.mapEmbed || null;
const getCityGallery = (id) => CITY_IMAGES?.[id]?.gallery || [];

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

const TAB_ORDER = ["destinations", "story", "itinerary", "must try", "compare", "getting here", "stay & eat", "weather", "tips", "docs"];

export default function App() {
  const { rates, src, npr } = useRates();
  const [active, setActive] = useState("rome");
  const [view, setView] = useState("destinations");
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
      setView("destinations");
    }
  }

  function handleCalClick(day) {
    const stopId = day.stop === "imst" ? "innsbruck" : day.stop;
    if (stopId && stopId !== "ktm") {
      setActive(stopId);
      setView("itinerary");
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
          <div>
            <div className="header-title">Europe 2026</div>
            <div className="header-subtitle">16 Jun – 6 Jul · 5 travellers · Kathmandu</div>
          </div>
          <div className="header-actions">
            <button
              className="pill"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              style={{ fontSize: 16 }}
            >
              {theme === "light" ? "🌙" : "☀️"} {theme === "light" ? "Dark" : "Light"}
            </button>
            <span className="rate-badge">{src}</span>
            <button className={`pill pill-npr${showNPR ? "" : " off"}`} onClick={() => setShowNPR((p) => !p)}>
              ₨ NPR {showNPR ? "ON" : "OFF"}
            </button>
            {["calendar", "journeys", "bookings"].map((t) => (
              <button key={t} className={`pill${topTab === t ? " active" : ""}`} onClick={() => setTopTab((p) => (p === t ? null : t))}>
                {t === "journeys" ? "🗺 Trains" : t === "bookings" ? "🔗 Book" : "📅 Calendar"}
              </button>
            ))}
            <button className="pdf-btn" onClick={() => { setView("docs"); setTopTab(null); }} title="Visa & Documentation Guide" style={{ background: "#2E7D32" }}>
              📋 Visa & Docs
            </button>
            <button className="pdf-btn" onClick={() => generateFullTripPdf(STOPS, CALENDAR)} title="Download complete trip PDF">
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
          <div style={{ padding: "12px 12px 8px", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-dim)" }}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      DAY {day.dayN} · {day.date}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{day.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{day.city}</span>
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
                : `linear-gradient(135deg, ${stop.color}18 0%, transparent 60%)`,
            }}
          >
            {/* Hero background image */}
            {heroImg && (
              <>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${heroImg})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  filter: "brightness(0.45)",
                  zIndex: 0,
                  transition: "background-image 0.4s ease",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%)",
                  zIndex: 1,
                }} />
              </>
            )}

            <div style={{ position: "relative", zIndex: 2 }}>
              {/* Destination flow nav */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 16, flexWrap: "wrap" }}>
                {prevStop ? (
                  <button className="nav-btn" onClick={() => handleStopChange(prevStop.id)} style={{ fontSize: 13, ...(heroImg ? { color: "#fff", borderColor: "rgba(255,255,255,0.4)" } : {}) }}>
                    {prevStop.flag} {prevStop.city}
                    {stop.connections?.legs?.[0]?.dur ? ` (${stop.connections.legs[0].dur})` : ""}
                  </button>
                ) : (
                  <span style={{ width: 120 }} />
                )}
                <span style={{ fontSize: 12, color: heroImg ? "rgba(255,255,255,0.7)" : "var(--text-dim)", fontWeight: 600 }}>→</span>
                <span style={{
                  fontSize: 16, fontWeight: 700,
                  color: heroImg ? "#fff" : "var(--accent)",
                  padding: "6px 16px",
                  border: `1px solid ${heroImg ? "rgba(255,255,255,0.5)" : "var(--accent)"}`,
                  borderRadius: 8,
                  background: heroImg ? "rgba(255,255,255,0.1)" : "transparent",
                }}>
                  {stop.flag} {stop.city}
                </span>
                <span style={{ fontSize: 12, color: heroImg ? "rgba(255,255,255,0.7)" : "var(--text-dim)", fontWeight: 600 }}>→</span>
                {nextStop ? (
                  <button className="nav-btn" onClick={() => handleStopChange(nextStop.id)} style={{ fontSize: 13, ...(heroImg ? { color: "#fff", borderColor: "rgba(255,255,255,0.4)" } : {}) }}>
                    {nextStop.flag} {nextStop.city}
                    {nextStop.connections?.legs?.[0]?.dur ? ` (${nextStop.connections.legs[0].dur})` : ""}
                  </button>
                ) : (
                  <span style={{ width: 120 }} />
                )}
              </div>

              {/* Day number & dates */}
              {stopCalDays.length > 0 && (
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 14px",
                    borderRadius: 20,
                    background: heroImg ? "rgba(255,255,255,0.2)" : "var(--accent)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    backdropFilter: heroImg ? "blur(8px)" : "none",
                  }}>
                    DAY {stopCalDays[0].dayN}{stopCalDays.length > 1 ? `–${stopCalDays[stopCalDays.length - 1].dayN}` : ""} · {stopCalDays[0].date}{stopCalDays.length > 1 ? ` – ${stopCalDays[stopCalDays.length - 1].date}` : ""}
                  </span>
                </div>
              )}

              {/* Mini route indicator */}
              <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {STOPS.map((s, si) => (
                  <span
                    key={s.id}
                    style={{
                      fontSize: si === idx ? 14 : 10,
                      opacity: si === idx ? 1 : 0.4,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() => handleStopChange(s.id)}
                    title={s.city}
                  >
                    {s.flag}
                  </span>
                ))}
              </div>

              <div className="hero-meta">
                <span style={heroImg ? { color: "rgba(255,255,255,0.8)" } : {}}>{stop.country}</span>
                <span className="dot" style={heroImg ? { color: "rgba(255,255,255,0.4)" } : {}}>·</span>
                <span style={heroImg ? { color: "rgba(255,255,255,0.8)" } : {}}>{stop.duration}</span>
              </div>
              <h1 className="hero-title" style={heroImg ? { color: "#fff", textShadow: "0 2px 12px rgba(0,0,0,0.5)" } : {}}>
                {stop.flag} {stop.city}
              </h1>
              <p className="hero-tagline" style={heroImg ? { color: "rgba(255,255,255,0.85)" } : {}}>"{stop.tagline}"</p>
              <div className="hero-stats">
                <div className="stat-card" style={heroImg ? { background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)" } : {}}>
                  <div className="label" style={heroImg ? { color: "rgba(255,255,255,0.7)" } : {}}>Accommodation</div>
                  <div className="val" style={heroImg ? { color: "#fff" } : {}}>{stop.budget}</div>
                  {showNPR && <div className="sub" style={{ color: heroImg ? "#FFB74D" : "#E65100" }}>for 5 people / night</div>}
                </div>
                <div className="stat-card" style={heroImg ? { background: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.2)", backdropFilter: "blur(12px)" } : {}}>
                  <div className="label" style={heroImg ? { color: "rgba(255,255,255,0.7)" } : {}}>Weather in June</div>
                  <div className="val" style={heroImg ? { color: "#fff" } : {}}>{stop.weather.temp}</div>
                  <div className="sub" style={heroImg ? { color: "rgba(255,255,255,0.7)" } : {}}>{stop.weather.rain}</div>
                </div>
                <button className="pdf-btn" onClick={() => generateStopPdf(stop, calDay)} title={`Download ${stop.city} PDF`}>
                  📄 Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {TAB_ORDER.map((t) => (
              <button key={t} className={`tab-btn${view === t ? " active" : ""}`} onClick={() => setView(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {view === "destinations" && <DestinationsView stop={stop} idx={idx} stops={STOPS} journeys={JOURNEYS} onStopChange={handleStopChange} />}
          {view === "story" && <StoryView stop={stop} />}
          {view === "itinerary" && <ItineraryView stop={stop} />}
          {view === "compare" && <CompareView stop={stop} />}
          {view === "getting here" && <ConnectionsView stop={stop} />}
          {view === "stay & eat" && <StayEatView stop={stop} />}
          {view === "weather" && <WeatherView stop={stop} />}
          {view === "tips" && <TipsView stop={stop} />}
          {view === "must try" && <MustTryView stop={stop} />}
          {view === "docs" && <DocsView />}
        </main>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════ */

function StoryView({ stop }) {
  const landmarks = getCityGallery(stop.id);

  return (
    <div className="panel">
      {/* City Image */}
      {getCityHero(stop.id) && (
        <div style={{
          position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden",
          marginBottom: 24, height: 220,
        }}>
          <img src={getCityHero(stop.id)} alt={stop.city} style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
          }} loading="lazy" />
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

      {/* City Map */}
      {getCityMap(stop.id) && (
        <div style={{
          borderRadius: "var(--radius)", overflow: "hidden",
          border: "1px solid var(--border-light)", marginBottom: 24,
          boxShadow: "var(--shadow)",
        }}>
          <iframe src={getCityMap(stop.id)} title={`${stop.city} map`}
            style={{ width: "100%", height: 180, border: "none", display: "block" }}
            loading="lazy" />
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
          <div className="card">
            <h3 className="card-title">🍽 Where to Eat</h3>
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
            <h3 className="card-title">🌤 June Weather</h3>
            <div className="weather-temp">{stop.weather.temp}</div>
            <div className="weather-rain">{stop.weather.rain}</div>
            <div className="tip-box">{stop.weather.tip}</div>
            <div className="weather-best">✓ {stop.weather.best}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DestinationsView({ stop, idx, stops, journeys, onStopChange }) {
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

  const routeMapUrl = ROUTE_MAPS?.fullRoute || null;

  return (
    <div className="panel">
      <h2 className="story-title">Route Overview</h2>

      {/* Embedded OpenStreetMap */}
      {routeMapUrl ? (
        <div style={{ marginBottom: 28, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)" }}>
          <iframe
            src={routeMapUrl}
            title="Trip route map"
            style={{ width: "100%", height: 400, border: "none", display: "block" }}
            loading="lazy"
            allowFullScreen
          />
        </div>
      ) : (
        <div style={{
          marginBottom: 28, borderRadius: "var(--radius-lg)", overflow: "hidden",
          border: "1px solid var(--border-light)", boxShadow: "var(--shadow-md)",
          height: 400, width: "100%",
        }}>
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=2.0%2C41.0%2C17.0%2C53.0&layer=mapnik"
            title="Europe trip route"
            style={{ width: "100%", height: "100%", border: "none", display: "block" }}
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}

      {/* Visual Route Timeline — Vertical */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 20, fontFamily: "var(--sans)" }}>
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
                    <img src={cityImg} alt={s.city} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
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
              See <strong>"Getting Here"</strong> tab for full details, platform info & tips
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ItineraryView({ stop }) {
  const heroImg = getCityHero(stop.id);
  const mapEmbed = getCityMap(stop.id);

  return (
    <div className="panel">
      {/* Destination Image Banner */}
      {heroImg && (
        <div style={{
          position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden",
          marginBottom: 24, height: 200,
        }}>
          <img src={heroImg} alt={stop.city} style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
          }} loading="lazy" />
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

      {/* Embedded Map */}
      {mapEmbed && (
        <div style={{
          borderRadius: "var(--radius)", overflow: "hidden",
          border: "1px solid var(--border-light)", marginBottom: 24,
          boxShadow: "var(--shadow)",
        }}>
          <iframe src={mapEmbed} title={`${stop.city} map`}
            style={{ width: "100%", height: 200, border: "none", display: "block" }}
            loading="lazy" />
        </div>
      )}

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
            <div className="itin-tip">💡 {item.tip}</div>
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
    </div>
  );
}

function CompareView({ stop }) {
  const fc = stop?.connections?.flightComparison;
  const acc = stop?.accommodation;
  const hasFlightComparison = fc?.available;
  const hasAccommodation = acc?.airbnb || acc?.hostel || acc?.hotel;

  if (!hasFlightComparison && !hasAccommodation) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "60px 48px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
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
    <div className="panel">
      {/* Train vs Flight comparison */}
      {hasFlightComparison && (
        <div style={{ marginBottom: 32 }}>
          <h2 className="story-title">🚄 Train vs ✈ Flight — {fc.route}</h2>
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
    </div>
  );
}

function ConnectionsView({ stop }) {
  if (!stop.connections) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "60px 48px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✈️</div>
        <div style={{ fontSize: 18, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
          This is your first stop — you fly directly here from Kathmandu.
        </div>
      </div>
    );
  }
  const c = stop.connections;
  return (
    <div className="panel">
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
                <span style={{ fontSize: 18 }}>🚄</span>
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
              <span>🔄</span>
              <span>Change here — follow station signs to next platform</span>
            </div>
          )}
        </div>
      ))}
      <div className="tip-box" style={{ marginTop: 24, fontSize: 14, lineHeight: 1.85, color: "#C0B0A0", padding: "20px 24px", borderRadius: 12 }}>
        <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          💡 Practical Tip
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
    </div>
  );
}

function StayEatView({ stop }) {
  return (
    <div className="panel">
      <div className="stay-eat-grid">
        <div>
          <h2 className="story-title">Where to Stay</h2>
          <div className="card">
            <div className="stay-area">📍 {stop.stay.area}</div>
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
    </div>
  );
}

function WeatherView({ stop }) {
  return (
    <div className="panel">
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
    </div>
  );
}

/* ── TIPS & TRICKS TAB ── */

function TipsView({ stop }) {
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
    <div className="panel">
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
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
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
                <span style={{ fontSize: 16, flexShrink: 0, color: "#DC2626" }}>⚠</span>
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
    </div>
  );
}

function MustTryView({ stop }) {
  // Find the country for this stop
  const countryMap = { "Italy": "italy", "Switzerland": "switzerland", "Austria": "austria", "Czech Republic": "czech", "Germany": "germany", "Netherlands": "netherlands" };
  const countryKey = countryMap[stop.country] || null;
  const countryData = countryKey ? MUST_TRY?.[countryKey] : null;

  if (!countryData) {
    return (
      <div className="panel" style={{ textAlign: "center", padding: "60px 48px" }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🍽</div>
        <div style={{ fontSize: 18, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>No food & shopping guide for this stop yet.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="story-title">{countryData.flag} Must Try in {countryData.country}</h2>
      <p style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "var(--sans)", marginBottom: 24 }}>
        {countryData.days} · Things you absolutely cannot miss
      </p>

      {/* Food */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 14 }}>🍽 Food & Drink</h3>
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
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)", marginBottom: 14 }}>🛍 Shopping & Souvenirs</h3>
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
    </div>
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

/* ── TOP PANELS ── */

function CalendarPanel({ active, onClickDay }) {
  const legends = [
    ["explore", "#4CAF50", "Stay"],
    ["move", "#FF9800", "Travel"],
    ["arrive", "#64B5F6", "Arrive"],
    ["night", "#9575CD", "Night train"],
    ["travel", "#F06292", "Flight"],
  ];

  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <h2>21 Days · June 16 – July 6, 2026</h2>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <p className="subtitle" style={{ margin: 0 }}>5 travellers · Kathmandu → Kathmandu · 14 cities</p>
          <div className="cal-legend">
            {legends.map(([t, col, label]) => (
              <div key={t} className="cal-legend-item">
                <div className="cal-legend-dot" style={{ background: col }} />
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="cal-grid">
          {CALENDAR.map((day, i) => {
            const s = CAL_TYPES[day.type] || CAL_TYPES.explore;
            const resolvedStop = day.stop === "imst" ? "innsbruck" : day.stop;
            const isActive = active === resolvedStop;
            return (
              <div
                key={i}
                className={`cal-card${isActive ? " active" : ""}`}
                onClick={() => onClickDay(day)}
                style={{
                  borderLeftColor: s.dot,
                  borderColor: isActive ? "var(--accent)" : s.border,
                  background: s.glow,
                  cursor: resolvedStop !== "ktm" ? "pointer" : "default",
                }}
              >
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
            );
          })}
        </div>
        <div className="stats-strip">
          {[
            ["21", "Total days"],
            ["14", "Cities visited"],
            ["16", "Train journeys"],
            ["3", "Countries in 1 week"],
            ["5", "Travellers"],
            ["1", "Nightjet sleep"],
            ["2", "Flight legs"],
          ].map(([n, label]) => (
            <div key={label} className="stat-box">
              <div className="num">{n}</div>
              <div className="desc">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JourneysPanel({ showNPR, npr }) {
  return (
    <div className="top-panel">
      <div className="top-panel-inner">
        <h2>All 16 Journeys</h2>
        <p className="subtitle">In chronological order · book in advance on the operator websites</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {JOURNEYS.map((j, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 16px",
              background: "var(--bg-raised)", border: "1px solid var(--border-light)",
              borderLeft: `4px solid ${TYPE_COLORS[j.type] || "#666"}`,
              borderRadius: "var(--radius)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-raised)"}
            >
              {/* Step number */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--bg-hover)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "var(--text-dim)", flexShrink: 0,
              }}>
                {i + 1}
              </div>

              {/* Icon */}
              <span style={{ fontSize: 18, flexShrink: 0 }}>{TYPE_ICONS[j.type] || "🚄"}</span>

              {/* Route */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", fontFamily: "var(--sans)" }}>
                  {j.from} → {j.to}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)", fontFamily: "var(--sans)", marginTop: 2 }}>
                  {j.via} · {j.date}
                </div>
              </div>

              {/* Duration */}
              <div style={{ textAlign: "center", flexShrink: 0, minWidth: 60 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", fontFamily: "var(--sans)" }}>{j.dur}</div>
              </div>

              {/* Cost */}
              <div style={{ textAlign: "right", flexShrink: 0, minWidth: 80 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)" }}>
                  {j.cost}
                </div>
                {showNPR && j.type !== "flight" && (
                  <div style={{ fontSize: 10, color: "var(--text-dim)", fontFamily: "var(--sans)" }}>
                    ~{npr(parseFloat(j.cost.replace(/[^0-9.]/g, "") || 0), j.cost.includes("CHF") ? "CHF" : "EUR")}
                  </div>
                )}
              </div>

              {/* Book button */}
              {j.bookingUrl && (
                <a href={j.bookingUrl} target="_blank" rel="noreferrer" style={{
                  fontSize: 11, padding: "4px 10px", borderRadius: 6,
                  background: "var(--accent)", color: "#fff", fontWeight: 600,
                  fontFamily: "var(--sans)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                }}>Book</a>
              )}
            </div>
          ))}
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
                <div className="booking-date">📅 {b.date}</div>
              </div>
              <span className="booking-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
