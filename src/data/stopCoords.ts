// Lat/lng for every stop. Source of truth for the map.
// Keys match STOPS[].id in src/data/tripData.js plus a few extras (bern, lauterach)
// for the booking-only stops.

export interface StopCoord {
  id: string;
  name: string;
  lat: number;
  lng: number;
  flag: string;
}

export const STOP_COORDS: Record<string, StopCoord> = {
  rome:           { id: 'rome',          name: 'Rome',          lat: 41.9028, lng: 12.4964, flag: '🇮🇹' },
  como:           { id: 'como',          name: 'Lake Como',     lat: 45.8081, lng: 9.0852,  flag: '🇮🇹' },
  lucerne:        { id: 'lucerne',       name: 'Lucerne',       lat: 47.0502, lng: 8.3093,  flag: '🇨🇭' },
  lauterbrunnen:  { id: 'lauterbrunnen', name: 'Lauterbrunnen', lat: 46.5934, lng: 7.9085,  flag: '💧' },
  interlaken:     { id: 'interlaken',    name: 'Interlaken',    lat: 46.6863, lng: 7.8632,  flag: '🇨🇭' },
  bern:           { id: 'bern',          name: 'Bern',          lat: 46.9480, lng: 7.4474,  flag: '🇨🇭' },
  zurich:         { id: 'zurich',        name: 'Zürich',        lat: 47.3769, lng: 8.5417,  flag: '🇨🇭' },
  lauterach:      { id: 'lauterach',     name: 'Lauterach',     lat: 47.4731, lng: 9.7395,  flag: '🇦🇹' },
  innsbruck:      { id: 'innsbruck',     name: 'Innsbruck',     lat: 47.2692, lng: 11.4041, flag: '🇦🇹' },
  salzburg:       { id: 'salzburg',      name: 'Salzburg',      lat: 47.8095, lng: 13.0550, flag: '🇦🇹' },
  vienna:         { id: 'vienna',        name: 'Vienna',        lat: 48.2082, lng: 16.3738, flag: '🇦🇹' },
  prague:         { id: 'prague',        name: 'Prague',        lat: 50.0755, lng: 14.4378, flag: '🇨🇿' },
  berlin:         { id: 'berlin',        name: 'Berlin',        lat: 52.5200, lng: 13.4050, flag: '🇩🇪' },
  amsterdam:      { id: 'amsterdam',     name: 'Amsterdam',     lat: 52.3676, lng: 4.9041,  flag: '🇳🇱' },
  alkmaar:        { id: 'alkmaar',       name: 'Alkmaar',       lat: 52.6324, lng: 4.7534,  flag: '🇳🇱' },
};

export interface RouteStop {
  id: string;
  arriveOn: string;        // YYYY-MM-DD
  arriveTime?: string;     // HH:MM (when you reach the city/station)
  checkInTime?: string;    // HH:MM (Airbnb earliest check-in)
  nights: number;
  label: string;
  /** Booking id from AIRBNBS that maps to this stop, if any. */
  bookingId?: string;
  /** Where to drop bags if there's a wait until check-in. */
  luggage?: {
    place: string;         // "Lucerne Hbf lockers"
    cost: string;          // "CHF 5–8 / 24h"
    notes?: string;        // extra context
  };
}

export const TRIP_ROUTE: RouteStop[] = [
  {
    id: 'rome',
    arriveOn: '2026-06-16',
    arriveTime: '17:00',     // FCO 14:00 → Leonardo Express → Termini ~16:00 → walk to Trastevere
    checkInTime: '15:00',
    nights: 2,
    label: 'Rome · 2 nights',
    bookingId: 'rome-villa-fiorelli',
    // No gap — arrival is after check-in window opens, head straight to flat.
  },
  {
    id: 'como',
    arriveOn: '2026-06-18',
    arriveTime: '15:00',     // Trenord arrives Como S. Giovanni 14:40
    checkInTime: '15:00',
    nights: 1,
    label: 'Lake Como · 1 night',
    bookingId: 'como-center-terra',
    // Right on time, walk straight to Via Armando Diaz.
  },
  {
    id: 'lucerne',
    arriveOn: '2026-06-19',
    arriveTime: '09:25',     // SBB IC arrives Lucerne 09:25
    checkInTime: '15:00',
    nights: 1,
    label: 'Lucerne · 1 night',
    bookingId: 'lucerne-neustadt',
    luggage: {
      place: 'Lucerne Hbf left-luggage lockers',
      cost: 'CHF 5–8 / 24h',
      notes: 'Lockers are by the SBB underpass. Drop bags, walk Chapel Bridge + Lion Monument until 15:00 check-in.',
    },
  },
  {
    id: 'lauterbrunnen',
    arriveOn: '2026-06-20',
    arriveTime: '12:55',
    nights: 0,
    label: 'Lauterbrunnen · day trip',
    luggage: {
      place: 'Bring only daypacks',
      cost: 'Free',
      notes: 'Big bags stay in the Lucerne Airbnb until check-out (11:00) then move with you to Bern via Interlaken.',
    },
  },
  {
    id: 'bern',
    arriveOn: '2026-06-20',
    arriveTime: '17:30',     // SBB IC from Interlaken arrives Bern ~17:30
    checkInTime: '15:00',
    nights: 1,
    label: 'Bern · 1 night',
    bookingId: 'bern-renovated',
    // Arrival is past check-in. ⚠️ flat is at Freiburgstrasse 511 — 4km from Hbf, take Tram 7/8.
  },
  {
    id: 'lauterach',
    arriveOn: '2026-06-21',
    arriveTime: '13:00',     // Bern → Zürich → Bregenz arrives ~13:00, then 5 min to Lauterach
    checkInTime: '14:00',
    nights: 1,
    label: 'Lauterach · 1 night',
    bookingId: 'lauterach-cosy-home',
    // 1-hour gap: short bus to Lauterach is fine, café at Bregenz Bahnhof if you arrive early.
  },
  {
    id: 'innsbruck',
    arriveOn: '2026-06-22',
    arriveTime: '13:00',     // ÖBB from Bregenz arrives Innsbruck ~13:00
    nights: 0,
    label: 'Innsbruck · 90 min stop',
    luggage: {
      place: 'Innsbruck Hbf lockers',
      cost: '€2–4 / 90 min',
      notes: '90-min stopover: lockers, lunch at Markthalle (€6–8), Maria-Theresien-Straße + Golden Roof exterior, back to Hbf for 14:30 Railjet.',
    },
  },
  {
    id: 'salzburg',
    arriveOn: '2026-06-22',
    arriveTime: '16:20',     // Railjet from Innsbruck arrives Salzburg Hbf ~16:20
    checkInTime: '15:00',
    nights: 2,
    label: 'Salzburg · 2 nights',
    bookingId: 'salzburg-boho-city',
    // Arrival is past check-in window — head straight to BOHO City Apartment (Denise, Gewerbegasse 7).
  },
  {
    id: 'vienna',
    arriveOn: '2026-06-24',
    arriveTime: '19:55',     // Railjet from Salzburg arrives Wien Hbf 19:55
    checkInTime: '14:00',
    nights: 2,
    label: 'Vienna · 2 nights',
    bookingId: 'vienna-schubert-park',
    // Late arrival. U6 to Volksoper / Währinger Straße, message Eva for late check-in.
  },
  {
    id: 'prague',
    arriveOn: '2026-06-26',
    arriveTime: '17:00',     // Regiojet 13:00 from Vienna → Praha hl.n. 17:00
    checkInTime: '15:00',
    nights: 2,
    label: 'Prague · 2 nights',
    bookingId: 'prague-yellow-garden',
    // Past check-in. Metro B 1 stop to Anděl, walk to Smíchov.
  },
  {
    id: 'berlin',
    arriveOn: '2026-06-28',
    arriveTime: '19:00',     // EuroCity Praha → Berlin Hbf ~19:00
    checkInTime: '15:00',
    nights: 5,
    label: 'Berlin · 5 nights',
    bookingId: 'berlin-visionapartments',
    // Past check-in. Pick a flat with self check-in for late arrival.
  },
  {
    id: 'amsterdam',
    arriveOn: '2026-07-04',
    arriveTime: '07:15',     // FlixBus from Berlin arrives De Ruijterkade 07:15
    nights: 0,
    label: 'Amsterdam · day visit',
    luggage: {
      place: 'Amsterdam Centraal lockers (2 min walk from FlixBus stop)',
      cost: '€6–8 / 24h',
      notes: 'FlixBus drops at De Ruijterkade behind Centraal — walk 2 min into the main hall. ~7 hours bag-free: coffee at the station, Jordaan canal walk, Albert Cuypmarkt, Rijksmuseum. Collect bags by 13:30 for the 14:00 Sprinter to Alkmaar.',
    },
  },
  {
    id: 'alkmaar',
    arriveOn: '2026-07-04',
    arriveTime: '14:40',     // Sprinter ~14:00 from Amsterdam → Alkmaar 14:40
    checkInTime: '15:00',
    nights: 2,
    label: 'Alkmaar · 2 nights',
    bookingId: 'alkmaar-red-city',
    // 20-min wait: have a coffee on the canal.
  },
];

/** Helper: minutes between two HH:MM strings. Negative if a < b reversed. */
export function minutesBetween(later: string | undefined, earlier: string | undefined): number | null {
  if (!later || !earlier) return null;
  const [h1, m1] = later.split(':').map(Number);
  const [h2, m2] = earlier.split(':').map(Number);
  return (h1 * 60 + m1) - (h2 * 60 + m2);
}

/** Format minutes as "5h 30m" or "45m". */
export function formatGap(minutes: number): string {
  const sign = minutes < 0 ? '-' : '';
  const m = Math.abs(minutes);
  if (m < 60) return `${sign}${m}m`;
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return mins ? `${sign}${h}h ${mins}m` : `${sign}${h}h`;
}
