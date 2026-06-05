// Day-pass vs point-to-point comparison for each travel day, "working as a day-pass
// person". Fares researched June 2026 (operator pages linked per card — tap to confirm
// the live price, since day passes like SBB's are demand-priced). Normal totals are the
// per-person sum of that day's tickets from JOURNEYS.

export type PassWorth = 'yes' | 'no' | 'maybe';

export interface PassVerdict {
  id: string;
  flag: string;
  scope: string;        // when + where
  normal: string;       // what the normal tickets cost (no pass)
  pass: string;         // the day-pass option + its price
  worth: PassWorth;
  reason: string;
  checkUrl: string;     // operator page to confirm the live price
  checkLabel: string;
}

export const PASS_AS_OF = 'June 2026';

export const PASS_INTRO =
  "Day passes only win when you stack several rides in one day — or ride a city's metro all day. " +
  'Here is every travel day with the normal ticket total, the day-pass alternative, and whether it actually saves you money. Prices change, so each card links to the operator to check live.';

export const PASS_VERDICTS: PassVerdict[] = [
  {
    id: 'it-rome-como',
    flag: '🇮🇹',
    scope: 'Thu 18 Jun · Rome → Lake Como',
    normal: 'Tickets: €27 pp — Frecciarossa €22 + Trenord €5',
    pass: 'No regional day pass covers Frecciarossa',
    worth: 'no',
    reason:
      "High-speed trains aren't on any day pass. Book a Trenitalia Super Economy advance fare — it's the cheapest way and far below any pass.",
    checkUrl: 'https://www.trenitalia.com/en.html',
    checkLabel: 'Check Trenitalia fare',
  },
  {
    id: 'ch-mountain-day',
    flag: '🇨🇭',
    scope: 'Sat 20 Jun · Swiss mountain day (4 legs)',
    normal: 'Tickets: ~CHF 74 pp — Lucerne→Interlaken→Lauterbrunnen→Bern',
    pass: 'SBB Saver Day Pass from CHF 52 pp',
    worth: 'yes',
    reason:
      'Four legs in one day — one Saver Day Pass covers them all and beats buying each ticket. It is demand-priced (CHF 52 → 88), so buy it a few weeks ahead while it is cheap.',
    checkUrl: 'https://www.sbb.ch/en/offers/saver-day-pass',
    checkLabel: 'Check SBB Saver Day Pass',
  },
  {
    id: 'ch-single-legs',
    flag: '🇨🇭',
    scope: 'Fri 19 & Sun 21 Jun · single long legs',
    normal: 'Tickets: ~CHF 26 (Como→Lucerne) and ~CHF 50 (Bern→Bregenz)',
    pass: 'Saver Day Pass CHF 52 — not worth one ride',
    worth: 'no',
    reason:
      'Each of these days is a single long ride that costs less than a CHF 52 day pass. Buy the single ticket (or a Supersaver) for each day instead.',
    checkUrl: 'https://www.sbb.ch/en/tickets-offers/tickets/find-saver-offers.html',
    checkLabel: 'Check SBB Supersaver',
  },
  {
    id: 'ch-travel-pass',
    flag: '🇨🇭',
    scope: 'Whole Switzerland leg (multi-day)',
    normal: 'Tickets: ~CHF 150 pp of rail across your 3 Swiss days',
    pass: 'Swiss Travel Pass CHF 254 (3-day) / CHF 309 (4-day)',
    worth: 'no',
    reason:
      'For your fast point-to-point route the pass costs more than the tickets. It only pays off if you add lots of paid boats, cable cars and museums. Stick to single tickets + the one Saver Day Pass on the 20th.',
    checkUrl: 'https://www.sbb.ch/en/travelcards-and-tickets/tickets-for-switzerland/swiss-travel-pass.html',
    checkLabel: 'Check Swiss Travel Pass',
  },
  {
    id: 'at-railjet',
    flag: '🇦🇹',
    scope: 'Mon 22 & Wed 24 Jun · long Railjet legs',
    normal: 'Tickets: €19–39 pp per leg — Bregenz→Innsbruck→Salzburg, Salzburg→Vienna',
    pass: 'No day pass beats a pre-booked Sparschiene',
    worth: 'no',
    reason:
      'ÖBB Railjet long-distance is not on regional day passes. The cheapest is a pre-booked Sparschiene fare from €9.90 — book the moment your dates are firm.',
    checkUrl: 'https://www.oebb.at/en/',
    checkLabel: 'Check ÖBB Sparschiene',
  },
  {
    id: 'at-hallstatt',
    flag: '🇦🇹',
    scope: 'Tue 23 Jun · Salzburg ↔ Hallstatt (3 of you)',
    normal: 'Tickets: ~€90 for 3 — €30 pp regional roundtrip',
    pass: 'ÖBB Einfach-Raus-Ticket — one regional day ticket for up to 5',
    worth: 'maybe',
    reason:
      'The Hallstatt run is on regional trains, so one Einfach-Raus group ticket can cover all three of you for less than three separate roundtrips. Check today’s price before you go.',
    checkUrl: 'https://www.oebb.at/en/tickets-kundenkarten/oesterreich/einfach-raus-ticket',
    checkLabel: 'Check Einfach-Raus price',
  },
  {
    id: 'cz-prague',
    flag: '🇨🇿',
    scope: 'Sat 27 – Sun 28 Jun · Prague city transit',
    normal: 'Tickets: 30–40 CZK per ride — adds up over 2 full days',
    pass: 'PID 24h 140 CZK (app) · or one 72h ~330 CZK for the stay',
    worth: 'yes',
    reason:
      'Ride the metro/tram 3+ times a day and a 24-hour (or a single 72-hour) PID ticket beats singles. Buy in the PID Lítačka app for the lowest price. Your intercity trains in/out are separate.',
    checkUrl: 'https://pid.cz/en/tickets-and-fare/',
    checkLabel: 'Check Prague PID fares',
  },
  {
    id: 'de-berlin',
    flag: '🇩🇪',
    scope: 'Mon 29 Jun – Fri 3 Jul · Berlin week',
    normal: 'Tickets: AB single €3.80 each — ~€10/day with heavy use',
    pass: 'Berlin WelcomeCard (4–6 day) or Deutschland-Ticket €63/month',
    worth: 'yes',
    reason:
      'Over a week of U/S-Bahn the singles add up. A WelcomeCard (AB) covers the whole stay; the €63 Deutschland-Ticket wins if you also do a regional day-trip like Potsdam (buy ABC). Note: the 7-day AB card was scrapped on 1 Jan 2026.',
    checkUrl: 'https://www.berlin-welcomecard.de/en',
    checkLabel: 'Check Berlin WelcomeCard',
  },
  {
    id: 'nl-amsterdam',
    flag: '🇳🇱',
    scope: 'Sat 4 – Sun 5 Jul · Amsterdam day-trips',
    normal: 'Tickets: ~€16/day — Alkmaar ↔ Amsterdam Sprinter ~€8 each way',
    pass: 'NS Dagkaart €66.60 — far more than you would spend',
    worth: 'no',
    reason:
      'The national day ticket is €66.60, way above your ~€16/day of hops. Just tap in with a contactless card (OVpay) and pay per trip. A ~€9 Amsterdam GVB day ticket only helps if you tram around the city a lot.',
    checkUrl: 'https://www.ns.nl/en/tickets/day-ticket',
    checkLabel: 'Check NS day ticket',
  },
];
