import jsPDF from "jspdf";

/* ─── Shared Constants ─── */
const W = 190;
const LM = 15;
const RM = 205; // right margin reference
const accent = [184, 134, 11];
const dark = [26, 26, 26];
const mid = [100, 100, 100];
const light = [160, 155, 145];
const white = [255, 255, 255];
const warmBg = [252, 249, 243];
const tipBg = [255, 248, 225];
const infoBg = [245, 243, 238];
const greenAccent = [46, 125, 50];
const redAccent = [211, 47, 47];

/* ─── Helpers ─── */
function newDoc() {
  return new jsPDF({ unit: "mm", format: "a4" });
}

function pageFooter(doc, label) {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`${label} · Page ${i}/${pageCount}`, LM, 290);
    // accent line at bottom
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.3);
    doc.line(LM, 287, LM + W, 287);
  }
}

function heading(doc, text, y, opts = {}) {
  const size = opts.size || 14;
  const color = opts.color || dark;
  const needed = opts.needed || 20;
  if (y + needed > 275) { doc.addPage(); y = 20; }

  doc.setFontSize(size);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...color);
  doc.text(text.toUpperCase(), LM, y);
  y += 2;
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.line(LM, y, LM + Math.min(doc.getTextWidth(text.toUpperCase()), W), y);
  y += 8;
  return y;
}

function subheading(doc, text, y) {
  if (y + 14 > 275) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accent);
  doc.text(text, LM, y);
  y += 6;
  return y;
}

function bodyText(doc, text, y, opts = {}) {
  const maxW = opts.maxW || W;
  const indent = opts.indent || 0;
  doc.setFontSize(opts.size || 9);
  doc.setFont("helvetica", opts.style || "normal");
  doc.setTextColor(...(opts.color || mid));
  const lines = doc.splitTextToSize(text, maxW - indent);
  const needed = lines.length * 4 + 2;
  if (y + needed > 275) { doc.addPage(); y = 20; }
  doc.text(lines, LM + indent, y);
  y += lines.length * 4 + 2;
  return y;
}

function infoBox(doc, y, items, opts = {}) {
  const bg = opts.bg || infoBg;
  const h = opts.h || 18;
  if (y + h + 4 > 275) { doc.addPage(); y = 20; }
  doc.setFillColor(...bg);
  doc.roundedRect(LM, y, W, h, 2, 2, "F");

  const colW = W / items.length;
  items.forEach((item, i) => {
    const x = LM + colW * i + 6;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mid);
    doc.text(item.label, x, y + 5);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(item.value, x, y + 10);
    if (item.sub) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...accent);
      doc.text(item.sub, x, y + 14);
    }
  });
  y += h + 6;
  return y;
}

function tipBox(doc, text, y) {
  const lines = doc.splitTextToSize(text, W - 14);
  const h = lines.length * 4 + 8;
  if (y + h + 4 > 275) { doc.addPage(); y = 20; }

  doc.setFillColor(...tipBg);
  doc.roundedRect(LM, y, W, h, 2, 2, "F");
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.5);
  doc.line(LM, y, LM, y + h);

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accent);
  doc.text("TIP", LM + 5, y + 4);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(139, 105, 20);
  doc.text(lines, LM + 5, y + 8);
  y += h + 6;
  return y;
}

function checkPage(doc, y, needed = 20) {
  if (y + needed > 275) { doc.addPage(); y = 20; }
  return y;
}

function accentBar(doc, y, h = 6) {
  doc.setFillColor(...accent);
  doc.rect(LM, y, W, h, "F");
  return y + h;
}

function separator(doc, y) {
  y = checkPage(doc, y, 6);
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.2);
  doc.line(LM, y, LM + W, y);
  return y + 4;
}

/* ═══════════════════════════════════════════════════
   SINGLE STOP PDF
   ═══════════════════════════════════════════════════ */
export function generateStopPdf(stop, calendarDay, opts = {}) {
  const doc = newDoc();
  let y = 15;
  const npr = opts.npr; // optional NPR conversion function

  // ── PAGE 1: COVER ──
  y = accentBar(doc, y, 8);
  y += 6;

  // City name
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text(`${stop.flag} ${stop.city}`, LM, y + 8);
  y += 14;

  // Country & duration
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mid);
  doc.text(`${stop.country} · ${stop.duration}`, LM, y);
  y += 6;

  // Tagline
  doc.setFontSize(11);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...light);
  const tagLines = doc.splitTextToSize(`"${stop.tagline}"`, W);
  doc.text(tagLines, LM, y);
  y += tagLines.length * 5 + 4;

  // Day badge
  if (calendarDay) {
    doc.setFillColor(...accent);
    doc.roundedRect(LM, y, 80, 9, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...white);
    doc.text(`Day ${calendarDay.dayN} · ${calendarDay.date}`, LM + 4, y + 6);
    y += 15;
  }

  // Quick Info Box
  const infoItems = [
    { label: "DURATION", value: stop.duration.split("·")[0].trim() },
    { label: "ACCOMMODATION", value: stop.budget },
    { label: "WEATHER", value: stop.weather.temp, sub: stop.weather.rain },
  ];
  y = infoBox(doc, y, infoItems, { h: 20 });

  // Budget Breakdown (if available)
  if (stop.budgetBreakdown) {
    const bb = stop.budgetBreakdown;
    const sym = bb.currency === "CHF" ? "CHF " : "€";
    y = subheading(doc, "Daily Budget per Person", y);

    const budgetItems = [
      ["Accommodation (for 3)", `${sym}${bb.accommodation}/night`],
      ["Food", `${sym}${bb.food}/person/day`],
      ["Transport", `${sym}${bb.transport}/person/day`],
      ["Activities", `${sym}${bb.activities}/person/day`],
      ["Misc", `${sym}${bb.misc}/person/day`],
    ];

    doc.setFillColor(...infoBg);
    const boxH = budgetItems.length * 6 + 4;
    y = checkPage(doc, y, boxH + 4);
    doc.roundedRect(LM, y, W, boxH, 2, 2, "F");

    budgetItems.forEach((item, i) => {
      const rowY = y + 4 + i * 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mid);
      doc.text(item[0], LM + 4, rowY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(item[1], LM + W - 8, rowY, { align: "right" });
    });

    y += boxH + 4;
    if (bb.note) {
      y = bodyText(doc, bb.note, y, { size: 8, color: accent });
    }
    y += 2;
  }

  // ── Getting Here ──
  if (stop.connections) {
    y = heading(doc, "Getting Here", y);
    const c = stop.connections;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    y = checkPage(doc, y, 10);
    doc.text(`${c.from} → ${stop.city}`, LM, y);
    y += 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mid);
    doc.text(`${c.changes === 0 ? "Direct — no changes" : c.changes + " change(s)"}`, LM, y);
    y += 6;

    c.legs.forEach((leg) => {
      y = checkPage(doc, y, 28);
      doc.setFillColor(...infoBg);
      doc.roundedRect(LM, y, W, 22, 2, 2, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(leg.train, LM + 4, y + 6);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mid);
      doc.text(`${leg.dep} → ${leg.arr}`, LM + 4, y + 12);
      doc.text(`Duration: ${leg.dur}`, LM + 4, y + 18);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accent);
      doc.text(leg.cost, LM + W - 8, y + 6, { align: "right" });

      y += 28;
    });

    if (c.tip) {
      y = tipBox(doc, c.tip, y);
    }
  }

  // ── Station Guide ──
  if (stop.stationGuide) {
    y = heading(doc, `Station Guide — ${stop.stationGuide.stationName}`, y);
    stop.stationGuide.arrivalSteps.forEach((s) => {
      y = checkPage(doc, y, 18);
      doc.setFillColor(...infoBg);
      doc.roundedRect(LM, y, W, 14, 2, 2, "F");

      // Step number circle
      doc.setFillColor(...accent);
      doc.circle(LM + 7, y + 7, 4, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      doc.text(String(s.step), LM + 5.5, y + 8.5);

      // Action + detail
      doc.setTextColor(...dark);
      doc.text(`${s.icon} ${s.action}`, LM + 14, y + 6);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mid);
      const detailLines = doc.splitTextToSize(s.detail, W - 20);
      doc.text(detailLines[0], LM + 14, y + 11);
      y += 16;
    });

    if (stop.stationGuide.exitInfo) {
      y = bodyText(doc, `Exit: ${stop.stationGuide.exitInfo}`, y, { size: 8, color: accent });
    }
  }

  // ── Bag Storage ──
  if (stop.bagStorage) {
    y = checkPage(doc, y, 20);
    y = subheading(doc, "Bag Storage", y);
    y = bodyText(doc, `Location: ${stop.bagStorage.location}`, y);
    y = bodyText(doc, `Cost: ${stop.bagStorage.cost} · Hours: ${stop.bagStorage.hours} · Payment: ${stop.bagStorage.payment}`, y);
    if (stop.bagStorage.tip) {
      y = tipBox(doc, stop.bagStorage.tip, y);
    }
  }

  // ── NEW PAGE: ITINERARY ──
  doc.addPage();
  y = 20;
  y = heading(doc, "Itinerary", y, { size: 16 });

  stop.itinerary.forEach((item) => {
    y = checkPage(doc, y, 40);

    // Time badge
    doc.setFillColor(...accent);
    const timeW = doc.getTextWidth(item.time) * 0.5 + 10;
    doc.roundedRect(LM, y - 2, Math.max(timeW, 25), 7, 1.5, 1.5, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...white);
    doc.text(item.time, LM + 3, y + 3);
    y += 9;

    // Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    const titleText = `${item.icon} ${item.title}`;
    const titleLines = doc.splitTextToSize(titleText, W);
    doc.text(titleLines, LM, y);
    y += titleLines.length * 5 + 2;

    // Cost & hours (if available)
    if (item.cost || item.hours) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accent);
      const meta = [item.cost, item.hours].filter(Boolean).join(" · ");
      doc.text(meta, LM, y);
      y += 4;
    }

    // Description
    y = bodyText(doc, item.desc, y, { indent: 2 });

    // Tip
    if (item.tip) {
      y = tipBox(doc, item.tip, y);
    }

    y += 2;
  });

  // ── MUST DO ──
  y = heading(doc, "Must Do", y);
  stop.must.forEach((m, i) => {
    y = checkPage(doc, y, 14);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(String(i + 1).padStart(2, "0"), LM, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const mLines = doc.splitTextToSize(m, W - 14);
    doc.text(mLines, LM + 12, y);
    y += mLines.length * 4.5 + 4;
  });

  // ── NEW PAGE: PRACTICAL ──
  doc.addPage();
  y = 20;

  // Where to Eat
  y = heading(doc, "Where to Eat", y);
  stop.eat.forEach((e) => {
    y = checkPage(doc, y, 18);
    doc.setFillColor(...infoBg);
    doc.roundedRect(LM, y, W, 14, 2, 2, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(e.name, LM + 4, y + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...accent);
    const dishW = doc.getTextWidth(e.dish);
    doc.text(e.dish, LM + W - dishW - 4, y + 5);

    doc.setFontSize(8);
    doc.setTextColor(...mid);
    doc.text(`${e.type} — ${e.note}`, LM + 4, y + 11);
    y += 18;
  });

  // Where to Stay
  y = heading(doc, "Where to Stay", y);
  y = bodyText(doc, `Area: ${stop.stay.area}`, y, { style: "bold", color: dark });
  y = bodyText(doc, stop.stay.why, y);
  y = bodyText(doc, `Budget: ${stop.stay.budget}`, y, { color: accent });

  if (stop.stay.picks.length > 0) {
    y = subheading(doc, "Best Areas", y);
    stop.stay.picks.forEach((p) => {
      y = checkPage(doc, y, 8);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      doc.text(`→ ${p}`, LM + 4, y);
      y += 5;
    });
    y += 2;
  }

  // Local Transport
  if (stop.localTransport && stop.localTransport.length > 0) {
    y = heading(doc, "Local Transport", y);
    stop.localTransport.forEach((t) => {
      y = checkPage(doc, y, 16);
      doc.setFillColor(...infoBg);
      doc.roundedRect(LM, y, W, 14, 2, 2, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(`${t.icon} ${t.name}`, LM + 4, y + 5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accent);
      doc.text(t.cost, LM + W - doc.getTextWidth(t.cost) - 4, y + 5);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mid);
      const detLines = doc.splitTextToSize(t.detail, W - 12);
      doc.text(detLines[0], LM + 4, y + 11);
      y += 18;
    });
  }

  // Risks & Warnings
  if (stop.risks && stop.risks.length > 0) {
    y = heading(doc, "Risks & Warnings", y, { color: redAccent });
    stop.risks.forEach((r) => {
      y = checkPage(doc, y, 18);
      doc.setFillColor(255, 245, 245);
      doc.roundedRect(LM, y, W, 14, 2, 2, "F");
      doc.setDrawColor(...redAccent);
      doc.setLineWidth(0.4);
      doc.line(LM, y, LM, y + 14);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(r.risk, LM + 4, y + 5);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...greenAccent);
      const solLines = doc.splitTextToSize(`Solution: ${r.solution}`, W - 12);
      doc.text(solLines[0], LM + 4, y + 11);
      y += 18;
    });
  }

  // Weather
  y = heading(doc, "Weather", y);
  y = infoBox(doc, y, [
    { label: "TEMPERATURE", value: stop.weather.temp },
    { label: "RAINFALL", value: stop.weather.rain },
    { label: "BEST TIME", value: stop.weather.best },
  ], { h: 16 });
  if (stop.weather.tip) {
    y = tipBox(doc, stop.weather.tip, y);
  }

  // ── Footer ──
  pageFooter(doc, `Europe 2026 · ${stop.city}`);

  const filename = calendarDay
    ? `Day${calendarDay.dayN}_${stop.city.replace(/[^a-zA-Z]/g, "")}.pdf`
    : `${stop.city.replace(/[^a-zA-Z]/g, "")}_Itinerary.pdf`;

  doc.save(filename);
}

/* ═══════════════════════════════════════════════════
   FULL TRIP PDF
   ═══════════════════════════════════════════════════ */
export function generateFullTripPdf(stops, calendar, opts = {}) {
  const doc = newDoc();
  const journeys = opts.journeys || [];
  const tripBudget = opts.tripBudget || null;
  const packingChecklist = opts.packingChecklist || null;
  const practical = opts.practical || null;
  let y = 15;

  // Track pages for TOC
  const tocEntries = [];

  // ═══ PAGE 1: TITLE ═══
  y = accentBar(doc, y, 10);
  y += 15;

  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("Europe 2026", LM, y);
  y += 12;

  doc.setDrawColor(...accent);
  doc.setLineWidth(1.2);
  doc.line(LM, y, LM + 80, y);
  y += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mid);
  doc.text("16 Jun – 6 Jul · 5 Travellers", LM, y);
  y += 7;
  doc.text("Kathmandu → Europe → Kathmandu", LM, y);
  y += 14;

  // Trip Stats
  y = infoBox(doc, y, [
    { label: "DAYS", value: "21" },
    { label: "CITIES", value: "14" },
    { label: "COUNTRIES", value: "7" },
    { label: "TRAINS", value: "16" },
  ], { h: 18 });

  y += 4;
  y = infoBox(doc, y, [
    { label: "FLIGHTS", value: "2 legs" },
    { label: "NIGHTJET", value: "1 sleeper" },
    { label: "TRAVELLERS", value: "5" },
    { label: "FROM", value: "Kathmandu" },
  ], { h: 18 });

  // Budget Summary on title page
  if (tripBudget) {
    y += 8;
    doc.setFillColor(...accent);
    doc.roundedRect(LM, y, W, 28, 3, 3, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...white);
    doc.text("ESTIMATED TOTAL BUDGET", LM + 6, y + 7);

    doc.setFontSize(16);
    doc.text(`€${tripBudget.summary.perPersonTotal.toLocaleString()} per person`, LM + 6, y + 16);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`₨${tripBudget.summary.perPersonNPR.toLocaleString()} · Group total: €${tripBudget.summary.groupTotal.toLocaleString()}`, LM + 6, y + 23);
    y += 36;
  }

  // Route list on title page
  y += 4;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("ROUTE", LM, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mid);
  const routeText = stops.filter(s => s.id !== "ktm").map(s => `${s.flag} ${s.city}`).join("  →  ");
  const routeLines = doc.splitTextToSize(routeText, W);
  doc.text(routeLines, LM, y);
  y += routeLines.length * 4 + 8;

  // ═══ PAGE 2: TABLE OF CONTENTS ═══
  doc.addPage();
  y = 20;
  y = heading(doc, "Contents", y, { size: 18 });

  const tocItems = [
    "Day-by-Day Overview",
    "Journey Schedule — All 16 Trains & Flights",
  ];
  if (tripBudget) tocItems.push("Budget Summary");
  if (packingChecklist) tocItems.push("Packing Checklist");
  tocItems.push("Emergency Information");
  if (practical) tocItems.push("Country Phrasebook");
  tocItems.push("City Quick Reference");

  tocItems.forEach((item, i) => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(item, LM + 4, y);

    // dotted line
    doc.setTextColor(...light);
    const dots = ".".repeat(60);
    const itemW = doc.getTextWidth(item);
    doc.setFontSize(10);
    doc.text(dots, LM + 8 + itemW, y);

    y += 8;
  });

  y += 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...light);
  doc.text("Page numbers are approximate — print this PDF for best results.", LM, y);

  // ═══ DAY-BY-DAY OVERVIEW ═══
  doc.addPage();
  y = 20;
  y = heading(doc, "Day-by-Day Overview", y, { size: 16 });

  calendar.forEach((day) => {
    y = checkPage(doc, y, 18);

    // Day number badge
    doc.setFillColor(...accent);
    doc.roundedRect(LM, y - 2, 18, 7, 1.5, 1.5, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...white);
    doc.text(`DAY ${day.dayN}`, LM + 2, y + 3);

    // Date
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(day.date, LM + 22, y + 3);

    // City
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mid);
    doc.text(`${day.flag} ${day.city}`, LM + 55, y + 3);

    y += 8;

    // Summary
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const sumLines = doc.splitTextToSize(day.summary, W - 8);
    doc.text(sumLines, LM + 4, y);
    y += sumLines.length * 3.5 + 5;
  });

  // ═══ JOURNEY SCHEDULE ═══
  doc.addPage();
  y = 20;
  y = heading(doc, "Journey Schedule", y, { size: 16 });

  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...mid);
  doc.text("All 16 journeys in chronological order. Book in advance on operator websites.", LM, y);
  y += 8;

  // Table header
  y = checkPage(doc, y, 12);
  doc.setFillColor(...accent);
  doc.rect(LM, y, W, 8, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...white);
  doc.text("#", LM + 2, y + 5.5);
  doc.text("Route", LM + 10, y + 5.5);
  doc.text("Date", LM + 90, y + 5.5);
  doc.text("Duration", LM + 125, y + 5.5);
  doc.text("Cost", LM + 155, y + 5.5);
  doc.text("Type", LM + 175, y + 5.5);
  y += 10;

  journeys.forEach((j, i) => {
    y = checkPage(doc, y, 10);
    const bg = i % 2 === 0 ? infoBg : warmBg;
    doc.setFillColor(...bg);
    doc.rect(LM, y - 1, W, 8, "F");

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(String(i + 1), LM + 2, y + 4);

    doc.setFont("helvetica", "bold");
    const route = `${j.from} → ${j.to}`;
    const routeLines2 = doc.splitTextToSize(route, 75);
    doc.text(routeLines2[0], LM + 10, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mid);
    doc.text(j.date || "", LM + 90, y + 4);
    doc.text(j.dur || "", LM + 125, y + 4);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(j.cost || "", LM + 155, y + 4);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mid);
    doc.text(j.type || "", LM + 175, y + 4);

    y += 9;
  });

  // ═══ BUDGET SUMMARY ═══
  if (tripBudget) {
    doc.addPage();
    y = 20;
    y = heading(doc, "Budget Summary", y, { size: 16 });

    const budgetRows = [
      ["Flights (KTM↔Europe)", `$${tripBudget.flights.total}`, `$${tripBudget.flights.perPerson}/pp`],
      ["Schengen Visa", `€${tripBudget.visa.perPerson * 5}`, `€${tripBudget.visa.perPerson}/pp`],
      ["Travel Insurance", `€${tripBudget.insurance.perPerson * 5}`, `€${tripBudget.insurance.perPerson}/pp`],
      ["All Train Journeys", `€${tripBudget.trainTotal.total}`, `€${tripBudget.trainTotal.perPerson}/pp`],
      [`Accommodation (${tripBudget.accommodationTotal.totalNights} nights)`, `€${tripBudget.accommodationTotal.perNight * tripBudget.accommodationTotal.totalNights}`, `€${tripBudget.accommodationTotal.perNight}/night (5 ppl)`],
      ["Food (21 days)", `€${tripBudget.foodDaily.perPerson * 21 * 5}`, `€${tripBudget.foodDaily.perPerson}/pp/day`],
      ["Activities", `€${tripBudget.activitiesTotal.perPerson * 5}`, `€${tripBudget.activitiesTotal.perPerson}/pp total`],
      ["Misc (souvenirs, tips, etc.)", `€${tripBudget.miscDaily.perPerson * 21 * 5}`, `€${tripBudget.miscDaily.perPerson}/pp/day`],
    ];

    // Table header
    doc.setFillColor(...accent);
    doc.rect(LM, y, W, 8, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...white);
    doc.text("Category", LM + 4, y + 5.5);
    doc.text("Group Total", LM + 110, y + 5.5);
    doc.text("Per Person", LM + 155, y + 5.5);
    y += 10;

    budgetRows.forEach((row, i) => {
      y = checkPage(doc, y, 10);
      const bg = i % 2 === 0 ? infoBg : warmBg;
      doc.setFillColor(...bg);
      doc.rect(LM, y - 1, W, 8, "F");

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...dark);
      doc.text(row[0], LM + 4, y + 4);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accent);
      doc.text(row[1], LM + 110, y + 4);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mid);
      doc.text(row[2], LM + 155, y + 4);

      y += 9;
    });

    // Total row
    y += 2;
    doc.setFillColor(...accent);
    doc.roundedRect(LM, y, W, 18, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...white);
    doc.text("ESTIMATED TOTAL", LM + 6, y + 6);
    doc.setFontSize(14);
    doc.text(`€${tripBudget.summary.groupTotal.toLocaleString()} group`, LM + 6, y + 13);
    doc.setFontSize(10);
    doc.text(`€${tripBudget.summary.perPersonTotal.toLocaleString()}/person · ₨${tripBudget.summary.perPersonNPR.toLocaleString()}/person`, LM + 80, y + 13);
    y += 26;

    // Per city breakdown
    y = subheading(doc, "Per-City Cost Comparison", y);
    stops.filter(s => s.budgetBreakdown && s.budgetBreakdown.accommodation > 0).forEach((s) => {
      y = checkPage(doc, y, 10);
      const bb = s.budgetBreakdown;
      const daily = bb.food + bb.transport + bb.activities + bb.misc;
      const sym = bb.currency === "CHF" ? "CHF" : "€";

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(`${s.flag} ${s.city}`, LM, y);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mid);
      doc.text(`${bb.days} day${bb.days > 1 ? "s" : ""} · ${sym}${daily}/pp/day + ${sym}${bb.accommodation}/night accom`, LM + 50, y);
      y += 6;
    });
  }

  // ═══ PACKING CHECKLIST ═══
  if (packingChecklist) {
    doc.addPage();
    y = 20;
    y = heading(doc, "Packing Checklist", y, { size: 16 });

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...mid);
    doc.text("Print this page and check off items as you pack. 21 days, 7 countries, 3 people.", LM, y);
    y += 8;

    const categories = [
      { title: "Documents", items: packingChecklist.documents },
      { title: "Electronics", items: packingChecklist.electronics },
      { title: "Clothing", items: packingChecklist.clothing },
      { title: "Toiletries & Medicine", items: packingChecklist.toiletries },
      { title: "Miscellaneous", items: packingChecklist.misc },
    ];

    categories.forEach((cat) => {
      y = checkPage(doc, y, 16);
      y = subheading(doc, cat.title, y);

      cat.items.forEach((item) => {
        y = checkPage(doc, y, 6);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...dark);
        doc.text("☐", LM + 2, y);
        const itemLines = doc.splitTextToSize(item, W - 14);
        doc.text(itemLines, LM + 10, y);
        y += itemLines.length * 4 + 2;
      });
      y += 4;
    });
  }

  // ═══ EMERGENCY INFORMATION ═══
  doc.addPage();
  y = 20;
  y = heading(doc, "Emergency Information", y, { size: 16, color: redAccent });

  // Universal emergency number
  doc.setFillColor(255, 235, 235);
  doc.roundedRect(LM, y, W, 16, 3, 3, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...redAccent);
  doc.text("EUROPEAN EMERGENCY: 112", LM + 6, y + 7);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Works in ALL 6 countries · Police, Fire, Ambulance · English-speaking operators", LM + 6, y + 13);
  y += 22;

  if (practical) {
    const countries = [
      { key: "italy", name: "Italy", flag: "🇮🇹" },
      { key: "switzerland", name: "Switzerland", flag: "🇨🇭" },
      { key: "austria", name: "Austria", flag: "🇦🇹" },
      { key: "czech", name: "Czech Republic", flag: "🇨🇿" },
      { key: "germany", name: "Germany", flag: "🇩🇪" },
      { key: "netherlands", name: "Netherlands", flag: "🇳🇱" },
    ];

    countries.forEach((c) => {
      const info = practical[c.key];
      if (!info) return;
      y = checkPage(doc, y, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(`${c.flag} ${c.name}`, LM, y);
      y += 5;

      if (info.emergency) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...mid);
        const nums = Object.entries(info.emergency).map(([k, v]) => `${k}: ${v}`).join(" · ");
        doc.text(nums, LM + 4, y);
        y += 4;
      }
      if (info.embassy) {
        doc.setFontSize(8);
        doc.setTextColor(...accent);
        doc.text(`Nepal Embassy: ${info.embassy.name} · ${info.embassy.phone}`, LM + 4, y);
        y += 6;
      }
    });
  }

  // Medical phrases
  y += 4;
  y = subheading(doc, "Essential Medical Phrases", y);
  const medPhrases = [
    ["I need a doctor", "Ho bisogno di un medico (IT)", "Ich brauche einen Arzt (DE)", "Potřebuji lékaře (CZ)"],
    ["I need help", "Aiuto! (IT)", "Hilfe! (DE)", "Pomoc! (CZ)", "Help! (NL)"],
    ["Hospital", "Ospedale (IT)", "Krankenhaus (DE)", "Nemocnice (CZ)", "Ziekenhuis (NL)"],
    ["Pharmacy", "Farmacia (IT)", "Apotheke (DE)", "Lékárna (CZ)", "Apotheek (NL)"],
  ];

  medPhrases.forEach((row) => {
    y = checkPage(doc, y, 8);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(row[0], LM, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mid);
    doc.text(row.slice(1).join(" · "), LM + 40, y);
    y += 5;
  });

  // ═══ PHRASEBOOK ═══
  if (practical) {
    doc.addPage();
    y = 20;
    y = heading(doc, "Country Phrasebook", y, { size: 16 });

    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...mid);
    doc.text("Essential phrases for each country. Locals appreciate any attempt at their language!", LM, y);
    y += 8;

    const phrasebookCountries = [
      { key: "italy", name: "Italian", flag: "🇮🇹" },
      { key: "switzerland", name: "Swiss German/French", flag: "🇨🇭" },
      { key: "austria", name: "German (Austrian)", flag: "🇦🇹" },
      { key: "czech", name: "Czech", flag: "🇨🇿" },
      { key: "germany", name: "German", flag: "🇩🇪" },
      { key: "netherlands", name: "Dutch", flag: "🇳🇱" },
    ];

    phrasebookCountries.forEach((c) => {
      const info = practical[c.key];
      if (!info || !info.phrases) return;

      y = checkPage(doc, y, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...accent);
      doc.text(`${c.flag} ${c.name}`, LM, y);
      y += 6;

      // Table header
      doc.setFillColor(...infoBg);
      doc.rect(LM, y - 1, W, 6, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...mid);
      doc.text("English", LM + 2, y + 3);
      doc.text("Local", LM + 55, y + 3);
      doc.text("Pronunciation", LM + 120, y + 3);
      y += 7;

      info.phrases.slice(0, 10).forEach((p) => {
        y = checkPage(doc, y, 6);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...dark);
        doc.text(p.en, LM + 2, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...accent);
        doc.text(p.local, LM + 55, y);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(...mid);
        doc.text(p.pronunciation, LM + 120, y);
        y += 5;
      });
      y += 6;
    });
  }

  // ═══ CITY QUICK REFERENCE ═══
  doc.addPage();
  y = 20;
  y = heading(doc, "City Quick Reference", y, { size: 16 });

  stops.filter(s => s.id !== "ktm" && s.id !== "fco").forEach((s) => {
    y = checkPage(doc, y, 22);
    doc.setFillColor(...infoBg);
    doc.roundedRect(LM, y, W, 18, 2, 2, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(`${s.flag} ${s.city}`, LM + 4, y + 6);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mid);
    doc.text(s.duration, LM + 70, y + 6);
    doc.text(`Accom: ${s.budget}`, LM + 4, y + 12);
    doc.text(`Weather: ${s.weather.temp} · ${s.weather.rain}`, LM + 4, y + 16);

    doc.setTextColor(...accent);
    if (s.must[0]) {
      const mustText = `Must: ${s.must[0].substring(0, 70)}${s.must[0].length > 70 ? "..." : ""}`;
      doc.text(mustText, LM + 80, y + 12);
    }

    y += 22;
  });

  // ── Footer ──
  pageFooter(doc, "Europe 2026 · Complete Itinerary");

  doc.save("Europe_2026_Complete_Itinerary.pdf");
}
