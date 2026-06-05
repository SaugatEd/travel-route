// Practical "good to know" suggestions per stop — complements the must-do list
// and hidden gems with timing, crowd, money, food and common-mistake advice.
// Kept general/true (no invented prices or opening hours); specific figures live
// in each stop's `must` list and the StopRoute schedule notes.

export interface StopSuggestion {
  icon: string;
  tip: string;
}

export const STOP_SUGGESTIONS: Record<string, StopSuggestion[]> = {
  rome: [
    { icon: '☀️', tip: 'Start sights by 8am. June midday is hot and packed — rest in a café 13:00–16:00, go out again at golden hour.' },
    { icon: '🚰', tip: 'Refill at the free "nasoni" street fountains everywhere — no need to buy bottled water.' },
    { icon: '☕', tip: 'Order coffee standing at the bar ("al banco"). Sitting at a table can cost 2–3× for the same espresso.' },
    { icon: '🍝', tip: 'Eat one street back from the big piazzas. Skip anywhere with a host waving you in or photos on the menu.' },
    { icon: '⛪', tip: 'Cover shoulders and knees for St. Peter\'s and churches, or you will be turned away at the door.' },
  ],
  como: [
    { icon: '⛴', tip: 'Buy a day ferry pass and hop Varenna–Bellagio–Menaggio. The lake itself is the attraction, not one town.' },
    { icon: '🌅', tip: 'Ride the Brunate funicular before sunset for the panoramic Alps-over-lake view.' },
    { icon: '💶', tip: 'Sleep and eat in Como town — Bellagio is pretty but pricey. Eat a street back from the waterfront.' },
    { icon: '🚆', tip: 'For Milan, use Como S. Giovanni (fast main line), not Como Nord Lago (slow line into Cadorna).' },
    { icon: '🚗', tip: 'Don\'t bother with a car — parking is scarce and dear. Trains plus ferries reach everything.' },
  ],
  lucerne: [
    { icon: '🌇', tip: 'See Chapel Bridge in late afternoon — golden light hits the painted ceiling panels best.' },
    { icon: '🚢', tip: 'Grey day? A short lake paddle-steamer cruise beats paying for a clouded-in mountain.' },
    { icon: '⛰', tip: 'Pilatus or Rigi is a half-day each — decide on the morning by the actual weather, not the night before.' },
    { icon: '🍫', tip: 'Buy chocolate at Coop or Migros, not souvenir shops — same brands, a third of the price.' },
    { icon: '💳', tip: 'Tap card everywhere, but it\'s CHF only — euros are not accepted, even at small places.' },
  ],
  lauterbrunnen: [
    { icon: '🚠', tip: 'Go up to car-free Mürren or Wengen for the cliff-top valley view — the floor is only half the magic.' },
    { icon: '💦', tip: 'Trümmelbach Falls (waterfalls inside the mountain) closes mid-afternoon — do it early.' },
    { icon: '🥾', tip: 'The flat valley-floor walk past dozens of waterfalls is free and one of the best things here.' },
    { icon: '🚂', tip: 'Last train to Interlaken is ~21:31 — board the Lauterbrunnen half; the train splits at Zweilütschinen.' },
    { icon: '🧥', tip: 'Carry a rain layer — the valley catches waterfall spray and the weather flips fast.' },
  ],
  interlaken: [
    { icon: '🏔', tip: 'The Höhematte meadow gives the free Eiger–Mönch–Jungfrau view — no ticket, 5-minute walk.' },
    { icon: '🌄', tip: 'Ride Harder Kulm at dusk for the panorama over both lakes; it stays open late.' },
    { icon: '🚉', tip: 'Two stations: Ost for Jungfrau/Lauterbrunnen trains, West for the town — check which your train uses.' },
    { icon: '🪂', tip: 'If you get a clear morning, the paragliding here is world-class — book the early slot.' },
  ],
  zurich: [
    { icon: '🏊', tip: 'In summer, swim at a free riverside "badi" like Oberer Letten — that\'s what locals do.' },
    { icon: '🥪', tip: 'Zürich is expensive — picnic from Coop or Migros by the lake instead of sit-down restaurants.' },
    { icon: '🌭', tip: 'Sternen Grill bratwurst at Bellevue (no ketchup), and Sprüngli for Luxemburgerli to take home.' },
    { icon: '🚊', tip: 'The Old Town (Niederdorf) is walkable; trams cover the rest — just tap a card.' },
  ],
  innsbruck: [
    { icon: '🚠', tip: 'The Nordkette cable car goes from the centre to 2,000m+ in about 20 minutes — straight into the Alps.' },
    { icon: '🏛', tip: 'The Golden Roof and old town are compact and free to wander — leave time to just stroll.' },
    { icon: '💧', tip: 'Tap water is glacier-clean — refill bottles rather than buying.' },
    { icon: '🥨', tip: 'Old-town cafés are often cash-only — ask "Karte?" before you order.' },
  ],
  salzburg: [
    { icon: '🏰', tip: 'Walk up to Hohensalzburg fortress (or take the funicular) for the best old-town and Alps view.' },
    { icon: '🍫', tip: 'For Mozartkugeln buy the Fürst brand (blue wrapper) — the original, hand-made, not the mass-market red ones.' },
    { icon: '⛴', tip: 'Hallstatt day-trip: the last lake ferry back is ~18:15 — be at the dock by ~18:00 or you\'re stranded.' },
    { icon: '☕', tip: 'Café Tomaselli for a Melange — sitting long in a coffee house is the tradition, not a rushed stop.' },
    { icon: '🎼', tip: 'Mirabell Gardens, Getreidegasse and the Old Town are free to wander — save the paid tours for one pick.' },
  ],
  vienna: [
    { icon: '🎫', tip: 'Standing tickets at the Staatsoper cost a few euros, or watch the live opera screen outside for free.' },
    { icon: '🏰', tip: 'Do Schönbrunn early to beat the tour buses; the gardens and Gloriette viewpoint are free.' },
    { icon: '🚆', tip: 'Activate app transit tickets BEFORE boarding — "bought but not started" still counts as no ticket (€105 fine).' },
    { icon: '☕', tip: 'Linger over a Melange and Sachertorte — staying a while is the point of a Viennese café.' },
    { icon: '🛍', tip: 'Graze the Naschmarkt, but walk past the touristy first stalls to where locals actually shop.' },
  ],
  prague: [
    { icon: '🌉', tip: 'Charles Bridge at sunrise (6–7am) is empty and magical — by midday it\'s a crush.' },
    { icon: '💱', tip: 'Always pay in CZK, never "in euros" at restaurants — the in-house rate is robbery. Decline DCC on cards.' },
    { icon: '🍺', tip: 'Drink in a local pub (e.g. Lokál), not on Old Town Square — beer is cheaper than water and far better.' },
    { icon: '🏰', tip: 'Prague Castle is huge — arrive early; the grounds are free to walk even without ticketed interiors.' },
    { icon: '🚇', tip: 'Validate the tram/metro ticket in the yellow box on entry — plain-clothes inspectors fine on the spot.' },
  ],
  berlin: [
    { icon: '🧱', tip: 'A free walking tour plus the East Side Gallery covers the history fast. Book the Reichstag dome ahead (free).' },
    { icon: '🥙', tip: 'Best döner of the trip — queue at a Kreuzberg spot; currywurst at Konnopke\'s under the U2 tracks.' },
    { icon: '💶', tip: 'Carry cash — many bars, bakeries and döner shops are cash-only despite Germany being modern.' },
    { icon: '🚲', tip: 'Berlin is flat and bike-friendly; otherwise the U-/S-Bahn reaches everything — validate your ticket.' },
    { icon: '🏛', tip: 'Museum Island: pick one or two, not all five — quality over a rushed marathon.' },
  ],
  amsterdam: [
    { icon: '🚆', tip: 'You sleep in Alkmaar — Amsterdam is ~40 min by Sprinter. Buy day tickets and plan around the commute.' },
    { icon: '🎟', tip: 'Anne Frank House and Van Gogh Museum sell out — book timed-entry slots weeks ahead, not on the day.' },
    { icon: '🚲', tip: 'Never stand or walk in the red bike lane — it\'s genuinely dangerous. Look both ways before crossing one.' },
    { icon: '🧀', tip: 'Albert Cuypmarkt for a warm fresh stroopwafel and aged "oud" Gouda; a FEBO kroket for the novelty.' },
    { icon: '💳', tip: 'Many shops are card-only and want Maestro — your Wise card works; carry only a little cash.' },
  ],
};
