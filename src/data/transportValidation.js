// Transport "when do I tap?" — exact entry / validation / exit by mode
// Voice: a friend who has actually been fined for the wrong move.

export const TRANSPORT_VALIDATION = {
  intro: {
    headline: "Buying the ticket isn't enough. Validating it is.",
    body: "Most European transit runs on the honour system — no gate, no turnstile. Inspectors board in plain clothes. An unvalidated ticket = a fine, even if you paid. Tap once, in the right place, before you sit down.",
  },

  groups: [
    {
      id: "metro",
      title: "Metro / Underground",
      cities: "Rome, Vienna, Prague, Berlin, Amsterdam",
      items: [
        {
          head: "Rome (Metro A/B/C, ATAC) — paper ticket, validate at orange box, then through gate.",
          detail: "Buy €1.50 ticket from machine. Insert ticket into orange/yellow validator at the gate (arrow up, magnetic stripe down). Machine prints date/time on ticket. Then push through turnstile. Keep the stamped ticket — inspectors check on the train. Better: tap a contactless card / phone directly on the gate reader (Wise card works). Tap-out not required.",
        },
        {
          head: "Vienna (U-Bahn, Wiener Linien) — validate paper once, contactless tap NOT supported.",
          detail: "Buy ticket from machine or app (€2.40 single, €17.10/day). If paper, stamp at the blue box at station entry. No turnstile — system is honour-based but inspectors are aggressive. App ticket = activate before entering platform. Vienna does NOT take contactless bank cards on metro yet — get the app or paper.",
        },
        {
          head: "Prague (Metro A/B/C, DPP) — validate paper at yellow box on entry.",
          detail: "Buy ticket at machine (CZK 30 / 90min). Stamp in yellow box at top of escalator BEFORE going down to platform. App tickets activate themselves. No gate. Inspectors plain-clothes, badge appears only after they ask for ticket — fine on the spot or escort to ATM.",
        },
        {
          head: "Berlin (U-Bahn, BVG) — buy ticket, validate red box, no gate.",
          detail: "Single €3.80 (AB zones) from machine on platform. Red/blue stamping box on platform — insert ticket, stamp prints time. App tickets (BVG app) auto-activate. No turnstiles anywhere. Fine = €60 cash on the spot, no excuses (Berlin inspectors are famously merciless to tourists).",
        },
        {
          head: "Amsterdam (Metro, GVB) — tap in AND tap out on the OV gate.",
          detail: "Different system: tap-in/tap-out required. Use OV-chipkaart, OVpay (contactless bank card), or GVB day ticket. Tap card on pink/grey reader entering AND leaving — fail to tap out, charged max fare (€20+). Wise card works directly via OVpay.",
        },
      ],
    },

    {
      id: "tram",
      title: "Trams",
      cities: "Vienna, Prague, Amsterdam, Zürich, Berlin",
      items: [
        {
          head: "Validate IMMEDIATELY when you board — not before, not later.",
          detail: "Trams have validators inside the carriage near the doors (yellow or red boxes). Stamp paper ticket the moment you step in. App ticket — activate before boarding. Inspectors board mid-route in plainclothes; 'I was about to validate' = €60 fine.",
        },
        {
          head: "Prague trams — validate yellow box inside; ticket also valid metro/bus same trip.",
          detail: "CZK 30 ticket = 90min unlimited transfers. One stamp covers the whole journey — don't re-stamp on the next tram.",
        },
        {
          head: "Amsterdam trams — tap pink reader on entry AND exit.",
          detail: "Forget to tap out = full max fare. Driver doesn't sell tickets in Amsterdam any more — buy in advance (OVpay / app / kiosk).",
        },
        {
          head: "Zürich trams — buy ticket BEFORE boarding (kiosk on platform).",
          detail: "No on-board ticket sales, no validation needed if bought paper just before. SBB Mobile app = best. Half-day ticket CHF 9.40. Fine for no ticket = CHF 100+.",
        },
      ],
    },

    {
      id: "citybus",
      title: "City buses",
      cities: "All cities",
      items: [
        {
          head: "Enter front door (or any with marked validator), validate immediately.",
          detail: "Bus drivers in most cities don't sell tickets any more — buy at kiosk / metro station before. If a validator is by the door, tap/stamp on board.",
        },
        {
          head: "Rome buses (ATAC) — same €1.50 ticket as metro, stamp on board.",
          detail: "Yellow box near middle door. Stamp inserts a time. Ticket valid 100 minutes from stamp on any combo of bus + tram + one metro ride.",
        },
        {
          head: "Berlin buses — tap card / show app to driver as you enter.",
          detail: "Driver glances, nods, you sit. Single AB ticket €3.80 covers 2hrs across modes. No need to re-stamp transferring to U-Bahn.",
        },
        {
          head: "Switzerland buses (PostBus/yellow) — buy via SBB Mobile app, scan QR.",
          detail: "Some rural lines accept cash from driver, most don't. App ticket is universal.",
        },
        {
          head: "Night buses — same rules, same fines.",
          detail: "Don't assume nobody checks at 2am. Berlin BVG inspectors love the N1 bus.",
        },
      ],
    },

    {
      id: "regional-train",
      title: "Local & Regional trains (R, RE, S-Bahn, regionale)",
      cities: "Italy regionale, German RE/S-Bahn, Swiss S-Bahn, Czech Os/R",
      items: [
        {
          head: "Italy 'regionale' (Trenitalia) — validate paper ticket BEFORE boarding.",
          detail: "Green/white stamp boxes on platform at every Italian regional train station. Insert ticket, machine stamps time. Without stamp = €50–€200 fine even if you paid €4 for the ticket. Digital tickets (app QR) auto-validate, no stamp needed.",
        },
        {
          head: "Germany RE / S-Bahn — buy ticket, board, no validation needed.",
          detail: "Most modern German tickets have a date/time printed when bought — no stamp. App tickets carry their own activation. Inspectors swipe across cars — show on phone or paper. Don't ride 'one stop' without a ticket: €60 fine.",
        },
        {
          head: "Swiss S-Bahn — same as ICE, ticket is your seat. No stamp.",
          detail: "Just board. SBB Mobile app or paper. Half Fare Card if you do 5+ days of trains.",
        },
        {
          head: "Czech 'Os' / 'R' trains — usually unreserved, just board.",
          detail: "Buy ticket at kiosk or from conductor (small surcharge). For long routes, book online idos.cz to lock in a low fare.",
        },
        {
          head: "Austria REX / S-Bahn (ÖBB) — paper or app, no stamp.",
          detail: "Buy via ÖBB app — ticket activates at travel time. Show conductor on board.",
        },
      ],
    },

    {
      id: "intercity-highspeed",
      title: "Intercity & high-speed trains (IC, EC, ICE, TGV, Frecciarossa, Railjet)",
      cities: "All long-distance",
      items: [
        {
          head: "Reserved seat = your ticket. Find your carriage, find your seat, sit.",
          detail: "Ticket has carriage number (Wagen / Coach 14) and seat (52). Platform display shows where each carriage stops — stand under your number sign. Conductor walks through ~10 min after departure.",
        },
        {
          head: "Italy Frecciarossa / Italo — NO validation needed (high-speed only).",
          detail: "Modern reserved tickets bypass the green stamp box. App or print = ready to board. Don't confuse with regionale (which DO need stamping).",
        },
        {
          head: "Germany ICE / IC — flexi tickets work on any train; saver tickets locked to one.",
          detail: "Buy via DB Navigator app. Saver fare ('Sparpreis') = cheap but train-specific, miss it and the ticket dies. Flexi ('Flexpreis') = expensive but board any train that day.",
        },
        {
          head: "Switzerland — most trains don't require reservation.",
          detail: "ICE / EC into Zurich + scenic lines (Glacier, Bernina) DO need reservation. SBB inter-Swiss services = walk-on, sit anywhere.",
        },
        {
          head: "Austria Railjet (ÖBB) — reservation usually optional, recommended Vienna ↔ Salzburg.",
          detail: "€3 reservation fee is worth it on weekend afternoons. Otherwise stand or hunt for empty seats.",
        },
        {
          head: "Night trains (Nightjet) — boarding 30 min before; show ticket + passport at the door.",
          detail: "Steward checks you onto your couchette / sleeper. Don't lose the wristband / ticket — needed for breakfast.",
        },
      ],
    },

    {
      id: "ferry",
      title: "Ferries & ships",
      cities: "Amalfi Coast, Lake Como, Amsterdam canals, Rhine",
      items: [
        {
          head: "Amalfi ferries (NLG / Travelmar / Alicost) — buy paper ticket at booth, board, give half to crew.",
          detail: "Ticket has a tear-off stub. Crew on the gangway tears it. Keep your half. Buy round-trip if returning same day; one-way is rarely cheaper.",
        },
        {
          head: "Como ferries (Navigazione Laghi) — same booth → board → no stamp.",
          detail: "Schedule changes seasonally; check navigazionelaghi.it the morning of. Last ferry from Bellagio back to Como is often before 8pm — don't miss it (taxi is €80+).",
        },
        {
          head: "Amsterdam GVB ferries (behind Centraal Station) — FREE, no ticket.",
          detail: "Walk on, walk off. Goes to Noord every 5 min. Bicycles allowed.",
        },
        {
          head: "Show up 20 min early in Italy / Greece — boarding is loose, departures are not.",
          detail: "If the boat says 09:30, it leaves at 09:30 — and the gangway closes 5 min before. No make-up boat for an hour.",
        },
      ],
    },

    {
      id: "taxi",
      title: "Taxis (street-hailed / official rank)",
      cities: "All cities",
      items: [
        {
          head: "Get in only at official rank or via app dispatch — never random street car.",
          detail: "Especially Rome FCO, Naples NAP, Prague airport. Random 'taxi' driver outside arrivals = scam. White cars with rooftop sign and a meter are the official ones.",
        },
        {
          head: "Confirm meter is ON before moving.",
          detail: "Driver should reset meter to base fare (varies: Rome €3, Berlin €4.30, Vienna €3.80) when you sit. If meter stays off and driver says 'fixed price' — get out unless it's an airport flat-rate (those are legitimate, e.g., Rome FCO → centre is fixed €55).",
        },
        {
          head: "Rome FCO airport: white taxis charge fixed €55 to anywhere inside Aurelian walls.",
          detail: "Look at the door — must say 'COMUNE DI ROMA' and have the rate printed. Anything else, walk away. €55 covers up to 4 passengers + bags.",
        },
        {
          head: "Pay by card if you can. Get a receipt always.",
          detail: "Many EU taxis now have terminals. Card = paper trail. Receipt has driver license number — leverage if dispute.",
        },
        {
          head: "Tip: round up to nearest euro, not 15%.",
          detail: "European taxi tipping is light. €23.40 → give €25. No tip math required.",
        },
      ],
    },

    {
      id: "ridehail",
      title: "Ride-hail apps (Uber, Bolt, FreeNow)",
      cities: "varies — check per city",
      items: [
        {
          head: "Bolt = best in Prague, Berlin, Amsterdam, Vienna.",
          detail: "Cheapest ride-hail across Eastern + Central Europe. Pay with the Wise card linked to the app. Driver rating shown — under 4.7 = cancel.",
        },
        {
          head: "FreeNow = best in Berlin, Vienna, Hamburg, Italy cities.",
          detail: "Aggregates licensed taxis (real meter) + private cars. Use 'Taxi' option in Berlin if you don't trust private hire. Pays via app.",
        },
        {
          head: "Uber works in: Amsterdam, Zürich, Vienna, Prague, Berlin, Amsterdam, Lisbon, Paris.",
          detail: "Does NOT work in: Italy (banned, tourist trap drivers in some cities pretend), Switzerland mountains. Always check before relying on it.",
        },
        {
          head: "Rome / Naples — use 'itTaxi' or 'FreeNow', not Uber.",
          detail: "Uber Italy is white-label of regulated taxis (UberWhite) — same price as a normal taxi, no advantage. itTaxi = the real local app.",
        },
        {
          head: "Add the Wise card BEFORE you fly.",
          detail: "Some apps reject foreign cards on first use; doing it from Nepal Wi-Fi gives you days to troubleshoot. Test by booking a 'phantom' ride and cancelling.",
        },
        {
          head: "Always confirm the license plate before getting in.",
          detail: "App shows plate. Match it. Driver should know your name without asking. If they ask 'what's your name?' it's not your driver.",
        },
      ],
    },
  ],
};
