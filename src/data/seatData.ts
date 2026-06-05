// Best seat for the view on every leg, in trip order. Scenic side is
// direction-aware (researched against seat61 + operator scenic-route guides).
// `scenic` cards are the ones where the side genuinely matters.

export interface SeatTip {
  mode: 'flight' | 'train' | 'bus';
  leg: string;
  service: string;
  seat: string;
  view: string;
  scenic: boolean;
  /** Flights only — which booked leg/segment holds your actual seat numbers. */
  seatRef?: { leg: 'outbound' | 'return'; segment: number };
}

export const SEAT_TIPS: SeatTip[] = [
  {
    mode: 'flight',
    leg: 'Delhi → Rome',
    service: 'Turkish Airlines via Istanbul',
    seat: 'Left window',
    view: 'Adriatic coast and the Apennines on the run into Rome — and the left side dodges the afternoon sun.',
    scenic: true,
    seatRef: { leg: 'outbound', segment: 1 },
  },
  {
    mode: 'train',
    leg: 'Como → Lucerne',
    service: 'Gotthard line (via Lugano), northbound',
    seat: 'Right-hand side',
    view: 'Lake Lugano at the Melide causeway, the Biaschina spirals, and the famous triple Wassen-church view.',
    scenic: true,
  },
  {
    mode: 'train',
    leg: 'Lucerne → Interlaken',
    service: 'Luzern–Interlaken Express (Brünig line)',
    seat: 'Right-hand side',
    view: 'Sarnersee + Lungernsee on the climb, then Brienzersee and waterfalls after Meiringen.',
    scenic: true,
  },
  {
    mode: 'train',
    leg: 'Interlaken → Bern',
    service: 'SBB InterCity along Lake Thun',
    seat: 'Left-hand side',
    view: 'Lake Thun shoreline from Spiez to Thun, the Niesen pyramid rising beyond.',
    scenic: true,
  },
  {
    mode: 'train',
    leg: 'Bern → Bregenz',
    service: 'Via Zürich → Sargans (Walensee stretch)',
    seat: 'Left-hand side',
    view: 'Zürichsee then Walensee, with the Churfirsten cliffs rising straight out of the water.',
    scenic: true,
  },
  {
    mode: 'train',
    leg: 'Bregenz → Innsbruck',
    service: 'ÖBB Railjet over the Arlberg',
    seat: 'Right-hand side',
    view: 'The Klostertal valley and Arlberg pass climbing toward the tunnel.',
    scenic: true,
  },
  {
    mode: 'bus',
    leg: 'Salzburg → St. Gilgen',
    service: 'Postbus 150 along the Wolfgangsee',
    seat: 'Window, lake side',
    view: 'The Wolfgangsee opens up as you roll down into St. Gilgen.',
    scenic: true,
  },
  {
    mode: 'train',
    leg: 'Innsbruck → Salzburg',
    service: 'ÖBB Railjet, Inn valley',
    seat: 'Left-hand side',
    view: 'Inn-valley peaks; the Hohensalzburg fortress swings into view on the right as you reach Salzburg.',
    scenic: true,
  },
  {
    mode: 'train',
    leg: 'Prague → Berlin',
    service: 'EuroCity through the Elbe valley',
    seat: 'Right-hand side',
    view: 'The Elbe gorge and Saxon Switzerland sandstone cliffs, with Střekov castle near Děčín.',
    scenic: true,
  },
  {
    mode: 'bus',
    leg: 'Berlin → Amsterdam',
    service: 'FlixBus overnight',
    seat: 'Aisle, mid-coach',
    view: 'It runs overnight — pick comfort over view: middle of the coach, away from the toilet, and sleep through it.',
    scenic: false,
  },
  {
    mode: 'flight',
    leg: 'Amsterdam → Delhi',
    service: 'Turkish Airlines via Istanbul (return)',
    seat: 'Left window',
    view: 'Zagros ridgelines and the Iranian plateau — flying east in the evening the sun is behind you, so the left stays glare-free.',
    scenic: true,
    seatRef: { leg: 'return', segment: 1 },
  },
];

/** Flat / tunnelly legs where the side doesn't matter. */
export const EITHER_SIDE = 'Rome → Milan, Milan → Como, Vienna → Prague, Amsterdam → Alkmaar, and the airport expresses — either side is fine, nothing to miss.';
