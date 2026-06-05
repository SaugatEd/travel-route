// Per-day "good to know": crowd level, what's open (shops/markets), the day's
// transit pattern, and the best working method for that day. Anchored on the real
// weekday + country norms (Sunday closures in DE/AT/CH, market days, weekend crowds).
// Keyed by CALENDAR dayN. Travel-only days (0, 21) are intentionally omitted.

export interface DayPractical {
  /** How busy it's likely to be. */
  crowd?: string;
  /** Shops / markets opening that day. */
  open?: string;
  /** Train / bus operating pattern for the day. */
  transit?: string;
  /** The better working method for this particular day. */
  tip?: string;
}

export const DAY_NOTES: Record<number, DayPractical> = {
  1: {
    crowd: 'Quiet Tuesday-evening arrival',
    open: 'Shops open; Roman dinner runs 20:00 onward',
    transit: 'Leonardo Express every 15 min from FCO',
    tip: 'Eat late — trattoria kitchens stay open past 22:00',
  },
  2: {
    crowd: 'Midweek — busy at the big sites but lighter than a weekend',
    open: 'Shops open; small ones shut 13:00–16:00 (riposo)',
    transit: 'Metro & bus on normal frequency',
    tip: 'Colosseum 09:00 + Vatican 15:00 are pre-booked — walk past the queues',
  },
  3: {
    crowd: 'Calm Thursday on the lake',
    open: 'Shops open; lake ferries run all day',
    transit: 'Frecciarossa frequent, Trenord regional hourly',
    tip: 'Ride the Brunate funicular before sunset',
  },
  4: {
    crowd: 'Lucerne fills with day-trippers by midday',
    open: 'Swiss shops open till ~18:30',
    transit: 'SBB frequent and punctual',
    tip: 'Do Chapel Bridge + Lion Monument early, before the tour buses',
  },
  5: {
    crowd: 'Saturday — Jungfrau trains pack out with weekend hikers',
    open: 'Swiss shops close early (~16:00) on Saturdays',
    transit: 'Reserve scenic-line seats; trains run busy',
    tip: 'Start at dawn to beat the Lauterbrunnen crowds',
  },
  6: {
    crowd: 'Sunday strollers along the Lake Constance promenade',
    open: '🔴 Austrian shops CLOSED Sunday — only restaurants & station kiosks',
    transit: 'Sunday timetable — buses & regional trains run less often',
    tip: 'Buy snacks Saturday or at Bregenz station; eat out today',
  },
  7: {
    crowd: 'Quiet Monday; shops reopen',
    open: 'Innsbruck Markthalle open (Mon–Sat)',
    transit: 'Railjet frequent',
    tip: 'Grab the Markthalle lunch inside your 90-min Innsbruck stop',
  },
  8: {
    crowd: 'Hallstatt mobbed by tour buses 11:00–15:00',
    open: 'Salt mine + lake ferry running (summer season)',
    transit: 'ÖBB via Attnang-Puchheim; last ferry back from the village ~18:15',
    tip: 'Be in Hallstatt before 10:00 to have it almost to yourself',
  },
  9: {
    crowd: 'Schafberg summit busy late morning',
    open: 'Schafbergbahn + Wolfgangsee ferry run daily in season',
    transit: 'Book the cog-railway ascent slot in advance',
    tip: 'Early ascent = clear views before the clouds build',
  },
  10: {
    crowd: 'Thursday — manageable at the headline sights',
    open: 'Naschmarkt open (Mon–Sat); shops till ~18:00',
    transit: 'U-Bahn every few minutes',
    tip: 'Belvedere at 09:00 beats the queue for Klimt’s Kiss',
  },
  11: {
    crowd: 'Prague Old Town livens up Friday evening',
    open: 'Czech shops open 7 days a week',
    transit: 'RegioJet frequent (free coffee on board)',
    tip: 'First Charles Bridge walk right after the 17:00 arrival',
  },
  12: {
    crowd: 'Saturday — Prague at peak; Charles Bridge & the clock get packed',
    open: 'Shops & markets open all weekend',
    transit: 'Metro & trams frequent',
    tip: 'Castle at 09:00 opening, bridge at dawn or late night for the photos',
  },
  13: {
    crowd: 'Calm Sunday morning in Prague',
    open: '🔴 Berlin shops CLOSED Sunday — Spätis & station supermarkets only',
    transit: 'Sunday timetable; the direct EuroCity still runs',
    tip: 'Stock up before leaving Prague; plan a dinner out in Berlin',
  },
  14: {
    crowd: 'Quiet Monday (work day)',
    open: 'Shops open; East Side Gallery is open-air, always free',
    transit: 'U-Bahn frequent',
    tip: 'Keep sightseeing for the evening after the work block',
  },
  15: {
    crowd: 'Midweek calm',
    open: 'Shops open',
    transit: 'Normal timetable',
    tip: 'Reichstag dome ~20:00 is booked — perfect for the July sunset',
  },
  16: {
    crowd: 'Midweek, moderate',
    open: 'Shops open; most museums open Wednesdays',
    transit: 'Normal timetable',
    tip: 'Pack tonight — Friday is the overnight bus',
  },
  17: {
    crowd: 'Museum Island quieter at the Thursday late session',
    open: 'Museum Island open till 20:00 on Thursdays',
    transit: 'Normal timetable',
    tip: 'Use the Thursday late opening to skip the daytime queues',
  },
  18: {
    crowd: 'Weekend crowds building at the sights',
    open: 'Shops open — stock up before the night bus (Sunday-proof)',
    transit: 'FlixBus departs 21:45 sharp from ZOB',
    tip: 'Buy water + snacks for the 9.5h overnight ride before boarding',
  },
  19: {
    crowd: 'Saturday — Amsterdam packed; canals & Rijksmuseum busy',
    open: 'Albert Cuyp market open (closed Sun); Alkmaar cheese market is Fridays only',
    transit: 'Sprinter to Alkmaar every ~30 min',
    tip: 'Rijksmuseum at 09:00 opening; hit the markets in the morning',
  },
  20: {
    crowd: 'Sunday — busy in the centre',
    open: 'NL shops OPEN Sunday (unlike Germany); Albert Cuyp CLOSED today',
    transit: 'Sunday timetable, still frequent',
    tip: 'Anne Frank + Van Gogh are booked — there are never walk-ins',
  },
};
