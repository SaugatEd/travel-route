import jsPDF from "jspdf";

/**
 * Generate a clean PDF itinerary for a single day or stop.
 * Pure jsPDF — no html2canvas dependency, works reliably.
 */
export function generateStopPdf(stop, calendarDay) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 190;
  const LM = 15; // left margin
  let y = 20;

  const accent = [212, 169, 106];
  const dark = [26, 26, 26];
  const mid = [100, 100, 100];
  const light = [180, 170, 160];

  function checkPage(needed = 30) {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  }

  function heading(text) {
    checkPage(20);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(text, LM, y);
    y += 2;
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.6);
    doc.line(LM, y, LM + doc.getTextWidth(text), y);
    y += 10;
  }

  // ── Title Block ──
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text(`${stop.city}`, LM, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mid);
  doc.text(`${stop.country} · ${stop.duration}`, LM, y);
  y += 6;

  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...light);
  const tagLines = doc.splitTextToSize(`"${stop.tagline}"`, W);
  doc.text(tagLines, LM, y);
  y += tagLines.length * 5 + 4;

  if (calendarDay) {
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(LM, y, W, 10, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(`Day ${calendarDay.dayN} · ${calendarDay.date}`, LM + 4, y + 6.5);
    y += 16;
  }

  // ── Quick Info ──
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(LM, y, W, 16, 2, 2, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mid);
  doc.text(`Accommodation: ${stop.budget}`, LM + 4, y + 6);
  doc.text(`Weather: ${stop.weather.temp} · ${stop.weather.rain}`, LM + 4, y + 12);
  y += 22;

  // ── Itinerary ──
  heading("Itinerary");
  stop.itinerary.forEach((item) => {
    checkPage(40);

    // Time
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(item.time, LM, y);
    y += 5;

    // Title
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    const titleLines = doc.splitTextToSize(`${item.icon} ${item.title}`, W);
    doc.text(titleLines, LM, y);
    y += titleLines.length * 5 + 2;

    // Description
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(item.desc, W - 4);
    checkPage(descLines.length * 4 + 16);
    doc.text(descLines, LM + 2, y);
    y += descLines.length * 4 + 3;

    // Tip
    doc.setFillColor(255, 248, 225);
    const tipLines = doc.splitTextToSize(`Tip: ${item.tip}`, W - 12);
    const tipH = tipLines.length * 4 + 6;
    checkPage(tipH + 4);
    doc.roundedRect(LM, y, W, tipH, 2, 2, "F");
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.4);
    doc.line(LM, y, LM, y + tipH);
    doc.setFontSize(8);
    doc.setTextColor(139, 105, 20);
    doc.text(tipLines, LM + 4, y + 4);
    y += tipH + 8;
  });

  // ── Must Do ──
  heading("Must Do");
  stop.must.forEach((m, i) => {
    checkPage(12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(`${String(i + 1).padStart(2, "0")}`, LM, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const mLines = doc.splitTextToSize(m, W - 14);
    doc.text(mLines, LM + 12, y);
    y += mLines.length * 4.5 + 4;
  });

  // ── Where to Eat ──
  heading("Where to Eat");
  stop.eat.forEach((e) => {
    checkPage(18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(e.name, LM, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...accent);
    doc.text(e.dish, LM + doc.getTextWidth(e.name) + 4, y);
    y += 4.5;
    doc.setFontSize(8);
    doc.setTextColor(...mid);
    doc.text(`${e.type} — ${e.note}`, LM, y);
    y += 7;
  });

  // ── Getting Here ──
  if (stop.connections) {
    heading("Getting Here");
    stop.connections.legs.forEach((leg) => {
      checkPage(28);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(LM, y, W, 22, 2, 2, "F");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...dark);
      doc.text(`${leg.train}`, LM + 4, y + 6);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...mid);
      doc.text(`${leg.dep} → ${leg.arr}`, LM + 4, y + 12);
      doc.text(`Duration: ${leg.dur} · Cost: ${leg.cost}`, LM + 4, y + 18);
      y += 28;
    });

    checkPage(16);
    const tipLines = doc.splitTextToSize(`Practical tip: ${stop.connections.tip}`, W - 8);
    const tipH = tipLines.length * 4 + 6;
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(LM, y, W, tipH, 2, 2, "F");
    doc.setFontSize(8);
    doc.setTextColor(139, 105, 20);
    doc.text(tipLines, LM + 4, y + 4);
    y += tipH + 8;
  }

  // ── Weather ──
  heading("Weather");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  doc.text(`Temperature: ${stop.weather.temp}`, LM, y);
  y += 5;
  doc.text(`Rainfall: ${stop.weather.rain}`, LM, y);
  y += 5;
  doc.text(`Best: ${stop.weather.best}`, LM, y);
  y += 5;
  const weatherTipLines = doc.splitTextToSize(`Tip: ${stop.weather.tip}`, W);
  doc.text(weatherTipLines, LM, y);
  y += weatherTipLines.length * 4 + 8;

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Europe 2026 · ${stop.city} · Page ${i}/${pageCount}`, LM, 290);
  }

  const filename = calendarDay
    ? `Day${calendarDay.dayN}_${stop.city.replace(/[^a-zA-Z]/g, "")}.pdf`
    : `${stop.city.replace(/[^a-zA-Z]/g, "")}_Itinerary.pdf`;

  doc.save(filename);
}

/**
 * Generate a full trip overview PDF with all days.
 */
export function generateFullTripPdf(stops, calendar) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 190;
  const LM = 15;
  let y = 20;

  const accent = [212, 169, 106];
  const dark = [26, 26, 26];
  const mid = [100, 100, 100];

  function checkPage(needed = 20) {
    if (y + needed > 275) {
      doc.addPage();
      y = 20;
    }
  }

  // Title page
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("Europe 2026", LM, 50);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mid);
  doc.text("16 Jun – 6 Jul · 5 Travellers · Kathmandu → Kathmandu", LM, 60);
  doc.text("21 Days · 14 Cities · 7 Countries", LM, 68);

  doc.setDrawColor(...accent);
  doc.setLineWidth(1);
  doc.line(LM, 75, LM + 60, 75);

  y = 90;

  // Calendar overview
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text("Day-by-Day Overview", LM, y);
  y += 10;

  calendar.forEach((day) => {
    checkPage(14);

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...accent);
    doc.text(`DAY ${day.dayN}`, LM, y);

    doc.setTextColor(...dark);
    doc.text(`${day.date}`, LM + 16, y);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...mid);
    doc.text(`${day.flag} ${day.city}`, LM + 48, y);
    y += 4;

    doc.setFontSize(8);
    const sumLines = doc.splitTextToSize(day.summary, W - 4);
    doc.text(sumLines, LM + 2, y);
    y += sumLines.length * 3.5 + 5;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Europe 2026 · Complete Itinerary · Page ${i}/${pageCount}`, LM, 290);
  }

  doc.save("Europe_2026_Complete_Itinerary.pdf");
}
