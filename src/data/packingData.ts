// Pre-departure to-do / packing checklist — 3 travellers, cabin bags only.
// Dates match the locked itinerary: KTM → Rome FCO 16 Jun, Amsterdam → KTM 6 Jul.
// qty '×3' = one per person; '×1' = one shared between the group.

export interface PackItem {
  id: string;
  head: string;
  qty?: string;
  detail?: string;
}

export interface PackGroup {
  id: string;
  title: string;
  hint?: string;
  items: PackItem[];
}

export const PACKING: PackGroup[] = [
  {
    id: 'papers',
    title: 'Papers & money',
    hint: 'do these first',
    items: [
      {
        id: 'passport-check',
        head: '📕 Passports with Schengen visa',
        qty: '×3',
        detail:
          'Check every visa sticker now: correct name, and 16 Jun – 6 Jul falls inside the validity dates. Carried on the person, never inside the bag.',
      },
      {
        id: 'photocopies',
        head: '📄 Paper photocopy of passport + visa page',
        qty: '×3 + 1 spare set',
        detail:
          'One copy per person in a different pocket than the passport, plus a spare set in another bag. This is what police and the embassy work from if an original is lost.',
      },
      {
        id: 'pp-photos',
        head: '🖼 Passport-size photos',
        qty: '4 each',
        detail: 'Only needed if a passport is lost and the embassy issues a replacement — but they weigh nothing.',
      },
      {
        id: 'doc-folder',
        head: '🗂 Printed document folder',
        qty: '×1',
        detail: 'The full visa pile for first entry at Rome FCO. Exactly what goes in it is in the Docs tab.',
      },
      {
        id: 'insurance',
        head: '🩺 Travel insurance card / printout',
        qty: '×3',
        detail: 'Policy number in the wallet; the insurer’s 24 h line saved in each phone.',
      },
      {
        id: 'money',
        head: '💳 Wise card loaded + ~€100 cash',
        qty: '×3',
        detail: 'Backup card and spare cash travel in a different bag than the main wallet.',
      },
      {
        id: 'pen',
        head: '🖊 Pen',
        qty: '×3',
        detail: 'For forms at borders, hotels and pharmacies. Always missing when needed.',
      },
    ],
  },
  {
    id: 'toiletries',
    title: 'Toiletries',
    hint: 'liquids ≤100 ml — cabin bags only',
    items: [
      { id: 'toothbrush', head: '🪥 Toothbrush', qty: '×3' },
      {
        id: 'toothpaste',
        head: '🦷 Toothpaste',
        qty: '×1–2 small',
        detail: 'Tubes must be ≤100 ml to pass airport security. One or two small tubes shared is enough.',
      },
      {
        id: 'nailcutter',
        head: '💅 Nail cutter',
        qty: '×1',
        detail: 'Allowed in cabin bags. One shared for the group.',
      },
      { id: 'comb', head: '💇 Comb / small brush', qty: '×1–2' },
      {
        id: 'soap',
        head: '🧼 Soap + shampoo bars',
        detail: 'Solid bars beat bottles — no 100 ml limit, no leaks, last the whole trip.',
      },
      { id: 'deo', head: '🌸 Deodorant (≤100 ml)', qty: '×3' },
      { id: 'razor', head: '🪒 Disposable razor', detail: 'Disposable razors are fine in cabin bags.' },
      {
        id: 'sunscreen',
        head: '☀️ Sunscreen (≤100 ml)',
        detail: 'Late-June sun in Rome and on the lakes is far stronger than it feels.',
      },
      {
        id: 'towel',
        head: '🧻 Quick-dry towel',
        qty: '×3',
        detail: 'Some budget stays charge for towels; a thin quick-dry one packs flat.',
      },
      {
        id: 'ziplock',
        head: '🛍 1-litre clear zip bag',
        qty: '×3',
        detail: 'Security requires all liquids inside one clear bag per person. Pack it before the airport, not at it.',
      },
    ],
  },
  {
    id: 'health',
    title: 'Health',
    items: [
      {
        id: 'meds',
        head: '💊 Regular medicines + doctor’s note',
        detail:
          'Full 3-week supply in original packets, with a prescription or doctor’s letter for anything strong. Pharmacies abroad will not refill Nepali prescriptions.',
      },
      {
        id: 'firstaid',
        head: '🩹 Small first-aid pouch',
        qty: '×1',
        detail: 'Paracetamol, ORS / Jeevan Jal, band-aids, motion-sickness pills for mountain trains, and Sancho or Vicks.',
      },
    ],
  },
  {
    id: 'electronics',
    title: 'Electronics',
    items: [
      {
        id: 'adapter',
        head: '🔌 Plug adapter + small EU power strip',
        qty: '×1 each',
        detail:
          'Nepali round 2-pin (Type C) plugs fit most EU sockets including Switzerland — flat-pin and 3-pin (Type D) do not. One adapter into the wall + one power strip charges all three phones from a single socket.',
      },
      {
        id: 'powerbank',
        head: '🔋 Power bank',
        qty: '×3',
        detail: 'Cabin bag only — never in any checked or stored bag. Long train days drain phones fast with maps on.',
      },
      { id: 'sim', head: '📶 EU eSIM / data SIM', detail: 'One per person, or one big data plan + hotspot for the group.' },
      { id: 'cables', head: '🎧 Charging cables + earphones', qty: '×3' },
    ],
  },
  {
    id: 'bags',
    title: 'Bags & security',
    items: [
      {
        id: 'cabinbag',
        head: '🧳 Cabin-size bag (≈55×40×20)',
        qty: '×3',
        detail: 'The whole trip is planned around cabin bags — every locker price in the Luggage tab assumes this size.',
      },
      {
        id: 'locks',
        head: '🔒 Small padlock for bag zips',
        qty: '×3',
        detail: 'Locks the zips on trains and works on hostel lockers. TSA-style locks fit through most zip pulls.',
      },
      {
        id: 'moneybelt',
        head: '🪙 Money belt / neck pouch',
        qty: '×3',
        detail: 'Pickpockets in Rome and Amsterdam are the single biggest risk on this route — see the Scams guide.',
      },
      { id: 'daybag', head: '🎒 Foldable day bag', qty: '×1–2', detail: 'For water, snacks and the camera while the cabin bags sit in lockers.' },
      { id: 'tags', head: '🏷 Luggage tag with name + phone', qty: '×3' },
    ],
  },
  {
    id: 'clothes',
    title: 'Clothes & comfort',
    items: [
      {
        id: 'shoes',
        head: '👟 Broken-in walking shoes',
        qty: '×3',
        detail: '15–20k steps a day on cobblestones. Never bring shoes that have not been worn for at least two weeks.',
      },
      {
        id: 'rain',
        head: '☂️ Foldable umbrella or thin rain jacket',
        qty: '×3',
        detail: 'June showers come fast in Switzerland and Austria.',
      },
      {
        id: 'warm',
        head: '🧥 One warm layer',
        qty: '×3',
        detail: 'Mountain days (Rigi, Hallstatt) and night trains get cold even in June.',
      },
      {
        id: 'modest',
        head: '👕 Shoulders + knees coverable',
        detail: 'Rome’s basilicas refuse entry in shorts and sleeveless tops. A thin scarf solves it for everyone.',
      },
      { id: 'sun', head: '🕶 Sunglasses + cap', qty: '×3' },
    ],
  },
  {
    id: 'food',
    title: 'Food from home',
    items: [
      {
        id: 'noodles',
        head: '🍜 Wai Wai / dry snacks',
        detail: 'Saves real money on long travel days — hot water is easy to find, Nepali food is not.',
      },
      {
        id: 'no-meat',
        head: '🚫 NO meat or dairy items',
        detail:
          'EU customs bans meat and milk products from outside Europe — no sukuti, no ghee, no khuwa. Fines at the airport are real, so do not let relatives pack any.',
      },
      {
        id: 'achar',
        head: '🫙 Achar counts as a liquid',
        detail: 'Pickle in oil falls under the 100 ml rule in cabin bags — tiny jar or skip it.',
      },
      { id: 'tea', head: '🍵 Black tea bags', detail: 'Hotel-room tea costs nothing; café tea costs €4.' },
    ],
  },
];

export const PACKING_TOTAL = PACKING.reduce((n, g) => n + g.items.length, 0);
