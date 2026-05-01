// Risk awareness — scams, fines, and what going right looks like.
// Voice: friend who has watched two tourists each lose €60 in one day.

export const SCAMS = {
  intro: {
    headline: "Most 'Europe is safe' is true. Tourists still lose €100s every day to the same five plays.",
    body: "Pickpockets and scammers don't pick random victims — they pick the ones who LOOK lost. Walking briskly, phone in front pocket only briefly, and saying 'no' without breaking stride beats 95% of attempts.",
  },

  groups: [
    {
      id: "scams",
      title: "Top 10 scams to spot in 2 seconds",
      items: [
        {
          head: "🪢 The bracelet / friendship band (Rome, Paris).",
          detail: "Man in front of Vatican / Trevi Fountain ties a 'free' bracelet on your wrist mid-conversation, then demands €20. Cross your arms when approached. Don't make eye contact. Say 'No, grazie' and keep walking. If tied — pull it off, walk away. They won't chase.",
        },
        {
          head: "🕴 The fake ticket inspector (Rome metro, Prague metro).",
          detail: "Plain-clothes man flashes badge, demands fare from a Westerner only. Ask: 'Can I see your ID, please?' (slowly, in English). Real inspectors carry a laminated photo ID with their badge. Real fines are written on a printed ticket with a number. Cash demand on the spot only = scam. Walk to staffed station booth and ask.",
        },
        {
          head: "🚕 The 'broken meter' taxi (Rome FCO, Naples NAP).",
          detail: "Driver says meter broken, quotes flat fare €100+ for a €30 trip. Get out — there are 50 taxis behind. Better: only board cars at the official rank with rooftop sign. Rome FCO → centre is regulated FIXED €55, printed on door. Anything more = scam.",
        },
        {
          head: "🍷 The menu swap (Rome trattoria, Venice).",
          detail: "Tourist menu without prices. Bill arrives for €120 — '€8 cover charge each, €15 bread, €10 olives we never ordered'. Always ask for the 'menu con prezzi' (with prices). Refuse 'specials' described verbally. Ask for the receipt itemised — refusing to provide one = report to Polizia Municipale.",
        },
        {
          head: "👶 The crying baby + map distraction (Barcelona, Rome, Naples).",
          detail: "A 'lost' woman with a wailing baby pushes a map at your face. While you read, her partner empties the back pocket of your bag. Step BACK before engaging. Eyes scan for the second person. Bag in front, hand on it.",
        },
        {
          head: "💍 The 'is this your ring?' (Paris, Rome).",
          detail: "Stranger picks up a gold ring near you, offers it. The ring is brass, the play is to thank-you-take-money. Polite 'no' and walk away. Don't touch it.",
        },
        {
          head: "📱 The petition signers (every tourist square).",
          detail: "Group of girls with 'deaf petition' clipboard surround you. While you read, hands are on your bag. Strict rule: never engage with anyone holding a clipboard within 50m of a tourist landmark.",
        },
        {
          head: "💳 The 'free' WiFi at cafes (Berlin, Prague airport).",
          detail: "Open network 'Free_Airport_WiFi' — fake. Strips your bank login. Only connect to networks where the cafe staff can tell you the exact name. Use a VPN (ProtonVPN free tier) by default.",
        },
        {
          head: "🛂 The fake police 'document check' (Prague Old Town, Barcelona).",
          detail: "Two men in plain clothes flash 'police' ID, demand to see your wallet 'for counterfeit checks'. Real police never ask to handle your wallet. Refuse, ask to walk to the police station together. They evaporate.",
        },
        {
          head: "🎒 The hostel 'staff' room check at 11pm.",
          detail: "Knock on door: 'staff doing safety check'. They scan room for valuables. Real hostel staff give 24h notice. Never open after 8pm to anyone you didn't expect.",
        },
      ],
    },

    {
      id: "fines",
      title: "Fare-evasion fines — what you actually pay",
      items: [
        { head: "🇮🇹 Italy regional train, no validation: €50–€200.", detail: "Even if you bought the €4 ticket. Stamping is the law. Inspectors collect cash on board or escort to the next station ATM." },
        { head: "🇩🇪 Berlin BVG, no ticket: €60 cash, on the spot.", detail: "Inspectors are plainclothes, often work in pairs at major U-Bahn stations. 'I forgot' / 'I didn't know' → still €60. They follow you to the ATM if you don't have cash." },
        { head: "🇦🇹 Vienna Wiener Linien, no ticket: €105.", detail: "Higher than most. Tourist app users sometimes forget to ACTIVATE the ticket — counts as no ticket." },
        { head: "🇨🇿 Prague DPP, no ticket: CZK 1,500 (~€60).", detail: "Pay on the spot = CZK 1,000. Pay later by post = CZK 1,500. Argue → escorted to police station." },
        { head: "🇨🇭 Switzerland SBB, no ticket: CHF 100 first offence, CHF 140 next.", detail: "Three offences in 2 years = formal record + you're banned from buying online tickets." },
        { head: "🇳🇱 Netherlands GVB / NS, forgot to tap out: €20+ flat charge.", detail: "Tapping in but not out = max-fare auto-charge to the card. Refund possible only with proof." },
        { head: "🚭 Smoking on a platform (Italy, Germany, Switzerland): €50–€100.", detail: "Outdoor station = legally indoor. Yellow paint marks where smoking is OK." },
        { head: "🍷 Drinking in public (Switzerland Zurich after 22:00): CHF 100.", detail: "Some Swiss cantons + parts of Austria fine for open alcohol after hours. Italy / Czech / Germany — fine on the street." },
      ],
    },

    {
      id: "validation-mistakes",
      title: "Top validation mistakes that cost the most",
      items: [
        { head: "Italy regionale: paper ticket NOT stamped before boarding.", detail: "Even buying online — if printed, must be stamped at green box on platform. App tickets auto-validate." },
        { head: "Vienna: app ticket bought but not 'started'.", detail: "WienMobil app has a 2-step: 'buy' then 'start travel'. Forgetting step 2 = no ticket." },
        { head: "Amsterdam: tap-in only, no tap-out.", detail: "Card auto-charged max fare €20+. Habit: tap pink reader twice every ride." },
        { head: "Berlin: ticket date-stamp BEFORE the train arrives, not after.", detail: "Stamping on the train (where it's possible) doesn't count — must be on platform." },
        { head: "Reusing a stamped ticket on a separate journey.", detail: "Single-use tickets show stamp time + are valid 90 min from then. Re-stamping a stamped ticket = forgery, treated harshly." },
      ],
    },

    {
      id: "going-right",
      title: "What 'going right' looks like — daily checklist",
      items: [
        { head: "Phone in zipped front pocket only. Bag worn cross-body, in front in crowds.", detail: "Pickpocket teams scan for phones in back pockets and unzipped bags. They lose interest in zipped + cross-body in 1 second." },
        { head: "Walk like you know where you're going.", detail: "Even when lost. Step into a cafe to check the map, not the middle of the square. Looking lost = a mark." },
        { head: "Two cards, two locations, two cash stashes.", detail: "Wise card in wallet. Backup card in money belt. €100 cash split across two bags. Stolen wallet ≠ trip ending." },
        { head: "Keep €60 cash 'fine money' in inside jacket pocket.", detail: "If wrong about a validation, paying immediately on a real fine = lowest tier. Arguing or 'I'll send it later' = worst tier." },
        { head: "Photo of passport + visa + insurance + Wise card both sides on Google Drive.", detail: "If everything is gone, walk into any Nepali embassy / Wise login from any cafe → 90% of recovery is shorter than expected." },
        { head: "Save 112 (EU emergency) in every traveller's phone.", detail: "Works in every country, every network, even with no SIM. Police, ambulance, fire — one number." },
      ],
    },
  ],
};
