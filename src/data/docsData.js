export const DOCS = {
  overview: {
    visaType: "Schengen Short-Stay Visa (Type C)",
    applyAt: "Embassy of Germany, Kathmandu",
    reason: "Germany has the longest single stay (5 nights in Berlin). Apply at the embassy of the country where you spend the most nights.",
    processingTime: "15–45 calendar days. Apply 3 months before, no earlier than 6 months.",
    cost: "€80 per adult (~₨14,000). Non-refundable.",
    validity: "Single/multiple entry for exact travel dates + buffer.",
    appointmentUrl: "https://www.vfsglobal.com/germany/nepal/",
    embassyUrl: "https://kathmandu.diplo.de/np-en/service/visa",
  },
  applicantProfiles: [
    {
      type: "Working Professional (2 people)",
      description: "Both employed at the same company. Stronger financial profile.",
      specificDocs: [
        { doc: "Employment letter", detail: "Company letterhead. Must state: name, position, salary, joining date, approved leave (16 Jun–6 Jul 2026), confirmation of return. Signed by HR with stamp.", required: true },
        { doc: "6-month bank statements", detail: "Salary account. Consistent credits. Min balance NPR 3–5 lakh. Bank-stamped.", required: true },
        { doc: "Company registration", detail: "PAN/VAT registration photocopy.", required: true },
        { doc: "3-month salary slips", detail: "Or bank statement salary credits.", required: true },
        { doc: "Income tax return", detail: "Latest year from IRD.", required: true },
        { doc: "Leave approval letter", detail: "Separate from employment letter. Confirms approved dates.", required: true },
      ],
    },
    {
      type: "Parents (3 people)",
      description: "Retired or homemaker. Travelling as dependents sponsored by working children.",
      specificDocs: [
        { doc: "Sponsorship letter from children", detail: "States: 'I will bear all expenses for my parent for the trip 16 Jun–6 Jul 2026.' Signed with passport copy.", required: true },
        { doc: "Sponsor's bank statements", detail: "Same 6-month statements. Must cover all 5 travellers. Min NPR 8–12 lakh combined.", required: true },
        { doc: "Relationship proof", detail: "Birth certificate, family relation certificate from ward office, or citizenship showing parent-child link.", required: true },
        { doc: "Retirement/pension proof", detail: "If retired. Homemakers: declaration letter.", required: false },
        { doc: "Property documents", detail: "Land ownership (lalpurja). Shows ties to Nepal.", required: false },
        { doc: "Citizenship (Nagarikta)", detail: "Photocopy.", required: true },
      ],
    },
  ],
  commonDocuments: [
    { doc: "Valid passport", detail: "Valid 3+ months beyond return (until Oct 2026 minimum). 2+ blank pages. Renew at Dept of Passport, Narayanhiti if needed.", required: true, timeline: "Renew 4+ months before if needed" },
    { doc: "Passport photos (2 per person)", detail: "35×45mm, white background, biometric. No glasses. Any Kathmandu studio NPR 200–300.", required: true, timeline: "1 week before appointment" },
    { doc: "Visa application form", detail: "From vfsglobal.com/germany/nepal. Fill every field. Print and sign. 1 per person.", required: true, timeline: "1 week before" },
    { doc: "Travel insurance", detail: "Min €30,000 coverage. All Schengen countries. Full trip duration. Medical evacuation + repatriation. Buy from IME General, AXA Schengen, or SafetyWing.", required: true, timeline: "2 weeks before" },
    { doc: "Flight reservation (NOT ticket)", detail: "Do NOT buy actual ticket before visa. Use hold/dummy: onwardticket.com ($14) or travel agent. Round-trip KTM→Rome, Amsterdam→KTM.", required: true, timeline: "1 week before" },
    { doc: "Accommodation reservations", detail: "Booking.com with FREE CANCELLATION for every night. All 5 names on each booking. Do not pay in advance.", required: true, timeline: "2 weeks before" },
    { doc: "Day-by-day itinerary", detail: "Every day: date, city, activities, accommodation, transport. Print the PDF from this app!", required: true, timeline: "Print from this app" },
    { doc: "Train reservations", detail: "Confirmations for Trenitalia, OBB Sparschiene, Regiojet, Nightjet. For Swiss/regional trains, printed itinerary is sufficient.", required: true, timeline: "4–8 weeks before" },
    { doc: "Cover letter", detail: "1-page: who you are, why travelling, itinerary summary, who funds the trip, why you'll return to Nepal. 1 per person.", required: true, timeline: "1 week before" },
    { doc: "Previous travel history", detail: "Copies of all visa stamps. Prior Schengen/US/UK visas strengthen application.", required: false, timeline: "Photocopy when preparing" },
  ],
  timeline: [
    { when: "4–6 months before (Dec 2025–Feb 2026)", tasks: ["Check passports valid until Oct 2026+, renew if needed","Build bank balance: NPR 3–5 lakh per worker, 8–12 lakh combined","Research accommodation on Booking.com (free cancellation)"] },
    { when: "3 months before (Mar 2026)", tasks: ["Book VFS appointment at vfsglobal.com/germany/nepal","Slots fill fast — book earliest available","Collect employment letters, bank statements, property docs","Book Nightjet Berlin→Amsterdam (sells out)"] },
    { when: "2 months before (Apr 2026)", tasks: ["Get employment letters on company letterhead","Request stamped bank statements (6 months)","Buy travel insurance (€30k min)","Book Booking.com accommodations (free cancel)","Book Schafbergbahn, Anne Frank House, Vatican"] },
    { when: "1 month before (May 2026)", tasks: ["Get dummy flight tickets (onwardticket.com)","Book trains: OBB Sparschiene, Regiojet, Nightjet","Write cover letters for all 5","Print itinerary from this app","Prepare sponsorship letters for parents","Get relationship proof from ward office"] },
    { when: "2 weeks before appointment", tasks: ["Organize docs in order (1 folder per person)","Get passport photos (35×45mm)","Fill visa application forms","Photocopy EVERYTHING","Print all Booking.com + train confirmations"] },
    { when: "VFS appointment day", tasks: ["Arrive 30 min early","Bring all originals + copies + 2 photos per person","Fee: €80pp + VFS service (~₨2,000)","Biometrics (fingerprints) at VFS","Processing: 15–45 days, track at vfsglobal.com"] },
    { when: "After visa approval", tasks: ["BUY actual flights immediately","Confirm Booking.com reservations","Buy European SIM (Airalo eSIM or at Rome airport)","Prepare packing list","Print ALL documents in travel folder"] },
  ],
  edgeCases: [
    { scenario: "Visa denied", solution: "Appeal within 1 month. Common reasons: insufficient funds, weak ties to Nepal, incomplete docs. Re-apply with stronger documents. €80 non-refundable." },
    { scenario: "Passport expires within 6 months", solution: "Renew at Dept of Passport, Narayanhiti. 1–3 weeks. NPR 5,000 (34-page) or 10,000 (66-page)." },
    { scenario: "Parents have no bank account", solution: "Working children sponsor them. Sponsorship letter + your bank statements covering all 5. Normal for family trips." },
    { scenario: "No previous travel history", solution: "Not a dealbreaker. Strengthen with: strong bank balance, property docs, employment letter. Well-organized application compensates." },
    { scenario: "Company won't give employment letter", solution: "Get tax clearance from IRD. Freelancers: client contracts + bank income proof." },
    { scenario: "VFS appointments unavailable", solution: "Check daily at midnight Nepal time — new slots appear. Premium appointment (~₨5,000 extra) often available." },
    { scenario: "Bank balance looks inflated", solution: "Do NOT deposit lump sum before applying — embassy flags this. Need consistent 6-month salary credits." },
    { scenario: "Different surnames (parents/children)", solution: "Provide: marriage cert, birth cert, family relation cert from ward office (strongest proof, get in English)." },
    { scenario: "One person denied, others approved", solution: "Others can still travel. Denied person re-applies or stays behind. Do not cancel approved visas." },
    { scenario: "Travel dates change after visa", solution: "Minor changes (1–2 days) within validity are fine. Major changes may need new visa." },
  ],
  costs: {
    perPerson: [
      { item: "Schengen visa fee", amount: "€80 (~₨14,000)" },
      { item: "VFS service charge", amount: "~₨2,000" },
      { item: "Travel insurance (21 days)", amount: "€40–80 (~₨7,000–14,000)" },
      { item: "Passport photos (2)", amount: "₨200–300" },
      { item: "Document photocopies", amount: "₨500–1,000" },
      { item: "Dummy flight ticket", amount: "$14 (~₨2,200)" },
    ],
    totalPerPerson: "~₨26,000–33,000",
    totalForFive: "~₨1,30,000–1,65,000",
  },
  importantWarnings: [
    "Do NOT buy flights before visa approval — use dummy tickets only",
    "Do NOT deposit large sums right before applying — embassy flags this",
    "Do NOT lie on the application — Schengen database is shared across 26 countries",
    "Do NOT overstay — even 1 day = 5-year Schengen ban",
    "Apply at GERMANY (longest stay) — wrong embassy = rejection",
    "Do NOT forget to sign the form — unsigned = rejected",
    "Use COLOUR photocopies, not black-and-white",
    "Parents MUST have their own forms even if sponsored",
  ],
};

export const MUST_TRY = {
  italy: {
    country: "Italy", flag: "\u{1F1EE}\u{1F1F9}", days: "Jun 17–20",
    food: [
      { item: "Cornetto + cappuccino", where: "Any bar, standing at counter", cost: "\u20AC2.50", note: "Italian breakfast. Never order 'latte' (means milk). Standing at counter costs half of sitting." },
      { item: "Cacio e pepe", where: "Trastevere side street, Rome", cost: "\u20AC10–12", note: "Rome's signature pasta. Pecorino + black pepper + pasta water. Real version has NO cream." },
      { item: "Suppl\u00EC (fried rice balls)", where: "Suppl\u00EC Roma, Trastevere", cost: "\u20AC1.50", note: "Roman street food. Crispy outside, molten mozzarella inside." },
      { item: "Gelato (artisan)", where: "Gelateria dei Gracchi, near Vatican", cost: "\u20AC3", note: "Natural colours only \u2014 pistachio should be grey-green, not bright green." },
      { item: "Aperol Spritz", where: "Lake Como lakefront bar", cost: "\u20AC5", note: "Aperol + prosecco + soda. Order at golden hour on Lungo Lario." },
      { item: "Pizza al taglio", where: "Any Roman forno/bakery", cost: "\u20AC2–4", note: "By the slice. Point, they cut and weigh. Eaten standing." },
    ],
    shopping: [
      { item: "Italian leather goods", where: "Trastevere market", cost: "\u20AC30–100", note: "Belts, wallets. Negotiate at markets. Avoid tourist shops near Colosseum." },
      { item: "Limoncello", where: "Any supermarket (Coop/Conad)", cost: "\u20AC5–8", note: "Buy at supermarket \u2014 tourist shops charge 3\u00D7." },
    ],
  },
  switzerland: {
    country: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", days: "Jun 20–21",
    food: [
      { item: "Spr\u00FCngli Luxemburgerli", where: "Spr\u00FCngli, Bahnhofstrasse 21, Z\u00FCrich", cost: "CHF 15/box", note: "Best Swiss chocolate to bring home. Macaron-like biscuits. Buy the mixed box." },
      { item: "Bratwurst (Sternen Grill)", where: "Bellevueplatz, Z\u00FCrich", cost: "CHF 7", note: "Most famous bratwurst in Switzerland. In a roll with mustard. Do NOT add ketchup." },
      { item: "R\u00F6sti", where: "Any Swiss restaurant", cost: "CHF 14–18", note: "Shredded potato pancake, crispy. Swiss national comfort food." },
      { item: "Toblerone", where: "Coop or Migros supermarket", cost: "CHF 4–6", note: "Buy at supermarket, NOT airport (3\u00D7 price)." },
    ],
    shopping: [
      { item: "Swiss Army Knife (Victorinox)", where: "Victorinox store or supermarket", cost: "CHF 25–60", note: "Classic red. Put in CHECKED luggage \u2014 confiscated at security." },
      { item: "Supermarket chocolate", where: "Coop or Migros", cost: "CHF 3–10", note: "Swiss supermarket chocolate > luxury chocolate elsewhere. Cailler, Frey, Lindt." },
    ],
  },
  austria: {
    country: "Austria", flag: "\u{1F1E6}\u{1F1F9}", days: "Jun 21–27",
    food: [
      { item: "Wiener Schnitzel", where: "Weisses R\u00F6ssl (Innsbruck) or Gasthaus P\u00F6schl (Vienna)", cost: "\u20AC14–18", note: "Breaded veal, thin and crispy, with lemon and lingonberry. Must be veal, not pork." },
      { item: "Sachertorte", where: "Caf\u00E9 Landtmann or Hotel Sacher, Vienna", cost: "\u20AC6–8", note: "Chocolate cake with apricot jam. Invented 1832. Served with whipped cream." },
      { item: "Melange (coffee)", where: "Caf\u00E9 Tomaselli (Salzburg) or Landtmann (Vienna)", cost: "\u20AC4.50", note: "Viennese coffee like cappuccino with more foam. UNESCO-listed coffee house culture." },
      { item: "Apfelstrudel", where: "Any traditional caf\u00E9", cost: "\u20AC5–6", note: "Apple strudel. Warm with vanilla sauce or cream." },
      { item: "Kaiserschmarrn", where: "Any mountain hut", cost: "\u20AC10–14", note: "Shredded sweet pancake with powdered sugar. Emperor Franz Joseph's favourite." },
      { item: "Mozartkugeln", where: "Getreidegasse, Salzburg", cost: "\u20AC8–15/box", note: "Chocolate-marzipan balls. Buy F\u00FCrst brand (blue wrapper), not mass-produced Mirabell (red)." },
    ],
    shopping: [
      { item: "Manner wafers", where: "Any Austrian supermarket", cost: "\u20AC2–3", note: "Pink-packaged hazelnut wafers. Vienna icon since 1898." },
    ],
  },
  czech: {
    country: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}", days: "Jun 27–28",
    food: [
      { item: "Czech beer (Pilsner Urquell tank)", where: "Lok\u00E1l, Dlouh\u00E1 33, Prague", cost: "CZK 55 (~\u20AC2.20)", note: "Cheapest quality beer of the trip. From tanks, not bottles. Order 'velk\u00E9 pivo' (large)." },
      { item: "Sv\u00ED\u010Dkov\u00E1", where: "Lok\u00E1l, Prague", cost: "CZK 185 (~\u20AC7.50)", note: "National dish. Beef in cream sauce with bread dumplings and cranberries." },
      { item: "Trdeln\u00EDk", where: "Old Town street vendors", cost: "CZK 80–120", note: "Chimney cake. Tourist food but Instagram-worthy. Try one." },
      { item: "Kozel dark beer", where: "U Flek\u016F brewery", cost: "CZK 65", note: "Oldest brewery in Europe (1499). Dark beer brewed on-site." },
    ],
    shopping: [
      { item: "Bohemian crystal", where: "Moser or Erpet, Prague", cost: "CZK 500–3000", note: "Buy from established shops, not tourist traps near Old Town Square." },
      { item: "Becherovka", where: "Any supermarket (Albert/Billa)", cost: "CZK 200–300", note: "Herbal digestif. Tastes like Christmas. Supermarket price." },
    ],
  },
  germany: {
    country: "Germany", flag: "\u{1F1E9}\u{1F1EA}", days: "Jun 28–Jul 3",
    food: [
      { item: "Currywurst", where: "Konnopke's, Sch\u00F6nhauser Allee, Berlin", cost: "\u20AC3", note: "Berlin street food since 1930. Sliced sausage with curry-ketchup. Eaten under the U2 bridge." },
      { item: "D\u00F6ner Kebap", where: "Mustafa's Gem\u00FCse Kebap, Kreuzberg", cost: "\u20AC5", note: "Berlin has the world's best d\u00F6ner (Turkish immigrants invented it here 1970s). 30-min queue, worth it." },
      { item: "Berliner Weisse", where: "Any Kneipe, Friedrichshain", cost: "\u20AC3–4", note: "Sour wheat beer with green (woodruff) or red (raspberry) syrup. Very Berlin." },
      { item: "Brezel (pretzel)", where: "Any B\u00E4ckerei (bakery)", cost: "\u20AC1–2", note: "Soft pretzel with coarse salt. Best fresh in the morning." },
      { item: "German bread", where: "Any bakery", cost: "\u20AC2–4/loaf", note: "3,200+ types. Try dark Vollkornbrot. Dense, nutty, keeps for days." },
    ],
    shopping: [
      { item: "Ritter Sport chocolate", where: "Lidl, Aldi, or Rewe", cost: "\u20AC1–2", note: "Square bars, 20+ flavours. Marzipan and Rum Raisin are best. \u20AC1 at supermarket vs \u20AC3 at airport." },
      { item: "Ampelm\u00E4nnchen souvenirs", where: "Ampelmann shops, Berlin", cost: "\u20AC5–20", note: "East German traffic light man. Iconic Berlin symbol." },
    ],
  },
  netherlands: {
    country: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", days: "Jul 4–6",
    food: [
      { item: "Raw herring (haring)", where: "Albert Cuypmarkt fish stalls", cost: "\u20AC3", note: "Hold by tail, tip head back, eat. With raw onions. It's cured, not raw-raw." },
      { item: "Stroopwafel (fresh)", where: "Albert Cuypmarkt stand", cost: "\u20AC2", note: "Two thin waffles with caramel. MUST be fresh (warm, gooey). Packaged = 50% as good." },
      { item: "Kroket from FEBO", where: "Any FEBO automat", cost: "\u20AC2", note: "Vending machine restaurant. Insert coin, open door, take kroket. Very Dutch." },
      { item: "Gouda cheese (aged)", where: "Albert Cuypmarkt or cheese shops", cost: "\u20AC5–10", note: "Try 'oud' (aged) \u2014 sharp, crumbly, caramel-like. Nothing like supermarket Gouda." },
      { item: "Bitterballen", where: "Any brown caf\u00E9", cost: "\u20AC6–8", note: "Deep-fried meat ragout balls with mustard. The Dutch bar snack." },
    ],
    shopping: [
      { item: "Stroopwafel gift box", where: "Albert Heijn supermarket", cost: "\u20AC5–8", note: "Perfect souvenir. Supermarket price." },
      { item: "Dutch Delft pottery", where: "Royal Delft shops", cost: "\u20AC10–50", note: "Blue and white ceramics. Real ones say 'hand painted' and 'Royal Delft'." },
    ],
  },
};
