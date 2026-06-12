// Luggage-locker plan — every leg where bags go into a station locker, with the
// real drop/collect window and the researched locker details (price, location,
// hours, payment). Sourced from station operators + seat61 (2025/26).

export interface LockerStop {
  dayN: number;
  date: string;        // "Wed 17 Jun"
  /** Stop id this belongs to, so the stop page can show its own locker card. */
  stopId: string;
  country: string;
  city: string;
  station: string;
  drop: string;        // when bags go in
  collect: string;     // when you must have them out
  why: string;         // one line: why bags need storing this day
  price: string;
  sizes?: string;
  hours: string;
  location: string;    // where in the station
  payment: string;
  /** Google Maps search query for the locker location. */
  mapsQuery: string;
  /** Heads-up worth flagging (coins needed, fills up, etc.). */
  warn?: string;
}

export const LOCKERS: LockerStop[] = [
  {
    dayN: 4,
    date: 'Fri 19 Jun',
    stopId: 'lucerne',
    country: 'Switzerland',
    city: 'Lucerne',
    station: 'Lucerne Hbf',
    drop: '09:40',
    collect: '14:45',
    why: 'You arrive 09:25 but the flat check-in is not until 15:00 — explore bag-free.',
    price: 'CHF 6 (small) / CHF 9 (large) per period',
    sizes: 'S 25×42×75 · M 32×62×75 · L 45×62×88 cm',
    hours: 'self-service lockers ~24/7',
    location: 'Self-service lockers in the station; staffed deposit at the SBB Travel Centre as backup',
    payment: 'card or TWINT app (up to 96 h), or coins (up to 72 h)',
    mapsQuery: 'Lucerne railway station lockers Gepäckaufbewahrung',
    warn: 'Use the card/TWINT lockers — they allow longer stays than the coin ones.',
  },
  {
    dayN: 6,
    date: 'Sun 21 Jun',
    stopId: 'lauterach',
    country: 'Austria',
    city: 'Bregenz',
    station: 'Bregenz Bahnhof',
    drop: '13:10',
    collect: '14:00',
    why: 'Short 1-hr gap before the Lauterach check-in — a lakeside café works just as well.',
    price: '€2–€6 short-term · €2.50–€12 / 24 h by size',
    sizes: 'Tamburi locker tiers S–3XL',
    hours: 'station access ~24 h',
    location: 'Tamburi multifunction lockers on the station',
    payment: 'Tamburi app / card (legacy coin units where present)',
    mapsQuery: 'Bregenz Bahnhof lockers',
    warn: 'Small station — only a short stop, so this one is optional. Radical Storage in central Bregenz is a backup at ~€5–6/bag.',
  },
  {
    dayN: 7,
    date: 'Mon 22 Jun',
    stopId: 'innsbruck',
    country: 'Austria',
    city: 'Innsbruck',
    station: 'Innsbruck Hbf',
    drop: '13:05',
    collect: '14:25',
    why: '90-minute stopover — stash the bags and dash to the Golden Roof + Markthalle lunch.',
    price: '€2.00 (S) / €2.50 (M) / €3.50 (L) / €4.50 (jumbo) per 24 h',
    sizes: 'S 45×35×85 · M 60×35×85 · L 90×35×85 · jumbo 90×50×85 cm',
    hours: 'self-service lockers ~24 h',
    location: 'Locker bank just off the main concourse / northern passageway — fastest from the platforms',
    payment: 'coins or contactless card',
    mapsQuery: 'Innsbruck Hauptbahnhof lockers',
    warn: 'Carry €2–€4.50 in coins for the older units so you do not lose time at a stopover.',
  },
  {
    dayN: 9,
    date: 'Wed 24 Jun',
    stopId: 'salzburg',
    country: 'Austria',
    city: 'Salzburg',
    station: 'Salzburg Hbf',
    drop: '07:00',
    collect: '16:30',
    why: 'Bags wait here while you do the Schafbergbahn excursion, then grab them before the 17:30 Vienna train.',
    price: '€2.00 (S) / €2.50 (M) / €3.50 (L) / €4.50 (jumbo) — one 24 h period',
    sizes: 'S 45×35×85 · M 60×35×85 · L 90×35×85 · jumbo 90×50×85 cm',
    hours: 'self-service lockers ~24/7',
    location: 'Passage under the tracks near platforms 6 & 7 (by the waiting room & toilets)',
    payment: 'coins (newer Tamburi units add card/app)',
    mapsQuery: 'Salzburg Hauptbahnhof lockers',
    warn: 'A morning drop with a ~16:30 pickup is one day’s fee. Bring coins for the older lockers.',
  },
  {
    dayN: 18,
    date: 'Fri 3 Jul',
    stopId: 'berlin',
    country: 'Germany',
    city: 'Berlin',
    station: 'Berlin Hbf',
    drop: '10:00',
    collect: '20:15',
    why: 'Free last day before the 21:45 night bus — drop the bags and roam (Tempelhof / Checkpoint Charlie).',
    price: '~€4 (small) to €6 (large) per 24 h',
    sizes: 'small 24×42×76 cm up to large-suitcase size',
    hours: 'lockers ~24/7 · staffed Gepäck Center 06:00–22:00',
    location: '250+ self-service lockers in the station; staffed Gepäck Center as fallback',
    payment: 'coins and card · max 72 h (€15 fee if exceeded)',
    mapsQuery: 'Berlin Hauptbahnhof Gepäckschließfächer lockers',
    warn: 'Lockers fill at peak times — if all taken, use the staffed Gepäck Center. Collect by 20:15 for the bus.',
  },
  {
    dayN: 19,
    date: 'Sat 4 Jul',
    stopId: 'amsterdam',
    country: 'Netherlands',
    city: 'Amsterdam',
    station: 'Amsterdam Centraal',
    drop: '07:30',
    collect: '13:30',
    why: 'FlixBus lands 07:15 — ~6 hrs bag-free in the city before the 14:00 Sprinter to Alkmaar.',
    price: 'Small €11 / large €16 / XL €26 for the first 24 h',
    sizes: 'small 90×45×40 · large 90×60×40 cm, plus XL',
    hours: '~07:00–00:30 (no staff overnight)',
    location: 'Western end of the station, near the Cuyperspassage tunnel entrance',
    payment: 'card only — no cash (V-Pay, Maestro, Visa, Mastercard)',
    mapsQuery: 'Amsterdam Centraal luggage lockers bagagekluizen',
    warn: 'Pricey and often full, and opening the door cancels the rest of the paid time. Cheaper backup: Lockerpoint (~€7) or Radical Storage (~€5/bag).',
  },
];
