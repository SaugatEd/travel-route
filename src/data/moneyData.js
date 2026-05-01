// Money & payments — Kathmandu → Europe
// Voice: local Nepali friend who has done this. Concrete > generic.

export const MONEY = {
  intro: {
    headline: "Your brother's Wise + cash is the whole rail.",
    body: "Nepali debit/credit cards almost never work abroad reliably. Plan around Wise as the spending account, NPR cash → EUR cash for backup, and never let the merchant pick the currency.",
  },

  groups: [
    {
      id: "wise",
      title: "Wise — how three travellers share one account",
      items: [
        {
          head: "Wise has no real 'joint account' — don't waste a day on it.",
          detail: "Two people can't co-own a Wise account. What works is your brother keeps the master account, and the group spends through his card(s). Treat it like a shared family wallet, not a bank.",
        },
        {
          head: "Order one physical Wise debit card per traveller (in his name).",
          detail: "From wise.com → Cards → Order. £7 / €7 each. He can hold multiple cards on one account. Ship to Kathmandu (DHL ~7 days) before you fly. Each card has its own number; if one is lost, freeze that one in the app, the others keep working.",
        },
        {
          head: "Cheaper alternative: 1 physical card + 4 virtual cards.",
          detail: "Virtual cards are free and instant. Add them to Apple Pay / Google Pay on each phone. Tapping the phone works on all metros, shops, restaurants in Europe. Carry one physical card as the backup for places that demand a chip.",
        },
        {
          head: "Pre-load EUR, CHF, CZK before leaving Nepal.",
          detail: "Brother converts NPR → EUR/CHF/CZK inside Wise on a quiet Tuesday morning Nepal time (mid-week, mid-day = best mid-market rates). Hold the balance in the destination currency so spending doesn't trigger a live conversion every tap.",
        },
        {
          head: "Set per-card daily limits in his Wise app before you fly.",
          detail: "Cards → [card] → Spending limits. €150/day per traveller is plenty for food + transit. Big-ticket (hotel deposits, train tickets) — temporarily raise just that card for the day.",
        },
        {
          head: "He sees every transaction live, anywhere in the world.",
          detail: "Agree the rule out loud: 'each spend over €50 you ping the group.' Avoids surprise hostel deposits eating the day's budget.",
        },
        {
          head: "Top-up from Nepal: NPR → Wise via IME / eSewa is the painless path.",
          detail: "Direct NPR → Wise loading isn't supported. Brother loads from a foreign source (USD via remitter, INR from India, etc.). If he's in Nepal, easiest is: family member abroad sends USD into his Wise via wire / IME → he converts inside Wise. Don't try to convert NPR cash into Wise at a counter — there isn't one.",
        },
      ],
    },

    {
      id: "cards",
      title: "Cards available to a Nepali resident — what actually works",
      items: [
        {
          head: "NIC Asia / NIB / Nabil Visa Debit — works only sometimes.",
          detail: "NRB caps foreign currency on Nepali debit cards (USD 500/trip is common). Many merchants in Europe reject them outright. Treat as 'last-resort backup', never the primary card.",
        },
        {
          head: "Himalayan Bank / Nabil credit cards — better, still limited.",
          detail: "Higher acceptance than debit. Activate 'international transactions' at the branch a week before flying — bring passport + ticket. Inform the bank of travel dates so fraud rules don't auto-block your first European tap.",
        },
        {
          head: "Revolut / N26 / Monzo — not openable from Nepal.",
          detail: "All require an EU/UK address + national ID at signup. Skip. Wise is the only foreign fintech that opens from Nepal.",
        },
        {
          head: "Carry two different rails: Wise + 1 Nepali credit card.",
          detail: "If Wise has a fraud-block at 11pm in Salzburg, the Nabil credit card at least gets you a hotel room until morning. Keep the Nepali card hidden, use only as emergency.",
        },
      ],
    },

    {
      id: "forex",
      title: "Forex in Kathmandu — where to actually exchange",
      items: [
        {
          head: "Thamel money changers > banks > airport. In that order.",
          detail: "Licensed money changers in Thamel (around Jyatha, Mandala St) post live boards and beat NRB rates by 0.5–1%. Banks add a 'service charge' that quietly costs you the spread. KTM airport counters are 3–5% worse — never exchange there.",
        },
        {
          head: "Bring crisp, post-2013 USD / EUR notes only.",
          detail: "Old or torn notes get refused or rated lower. Ask for €50 and €20 denominations — €500 notes are useless in Europe (most shops won't accept them).",
        },
        {
          head: "Carry €300–€500 cash as the 'arrival kit'.",
          detail: "Covers the first taxi, SIM, water, a meal — before you find a working ATM. Split between two travellers' money belts.",
        },
        {
          head: "Never use airport currency counters in Europe.",
          detail: "Travelex / Forex Change at FCO, ZRH, AMS quote rates 8–12% off mid-market. They know you're trapped. Walk past them. ATM in arrivals hall = better.",
        },
        {
          head: "DCC trap: always pay in the LOCAL currency.",
          detail: "Card terminals will ask 'Pay in EUR or NPR?' Always pick EUR (or local). Picking NPR lets the merchant set the rate — silently 4–7% worse. Same on ATMs: 'continue without conversion'.",
        },
      ],
    },

    {
      id: "atm",
      title: "ATM rules of the road",
      items: [
        {
          head: "Use bank-branded ATMs only. Avoid Euronet & Cardpoint.",
          detail: "Euronet (yellow / blue) sits at every tourist spot — 5–10% markup baked into the rate, plus a flat fee. Look for: Italy = Intesa / UniCredit; Switzerland = UBS / Raiffeisen; Czech = ČSOB / Komerční; Germany = Sparkasse / Deutsche Bank; Netherlands = ING / Rabobank; Austria = Erste / BAWAG.",
        },
        {
          head: "Wise card: 2 free withdrawals/month up to £200 / €200.",
          detail: "Above that, 1.75% fee + €0.50 per pull. So: pull €200 once, not €50 four times. Plan around month boundaries — fly on the 1st of the month if possible.",
        },
        {
          head: "Always decline 'conversion' on the screen.",
          detail: "ATM offers 'we'll convert for you, NPR Rs X' — say no. Pick 'continue in EUR'. Wise / your bank converts at mid-market, much better.",
        },
        {
          head: "Daily limit is usually €400–€600.",
          detail: "Single withdrawal max varies by ATM (often €250–€400). For hotel deposits or rent, do two pulls on consecutive days, not one chunk.",
        },
        {
          head: "Never use an ATM inside an unstaffed glass cubicle on a quiet street at night.",
          detail: "Skimmers are common. Use ATMs inside bank lobbies during banking hours, or in busy stations / airports.",
        },
      ],
    },

    {
      id: "cashmix",
      title: "Cash-vs-card per country",
      items: [
        {
          head: "🇮🇹 Italy — 70% card, 30% cash.",
          detail: "Card works almost everywhere now (post-2023 law forces card acceptance). Cash for: small trattorias in Naples, taxi in Rome (some still 'broken machine'), market stalls in Amalfi, public toilets (€1 coin).",
        },
        {
          head: "🇨🇭 Switzerland — 90% card, 10% cash (CHF only).",
          detail: "Card / phone tap works everywhere — even mountain huts. CHF cash for: small mountain villages, some Lauterbrunnen guesthouses, gondola tip jars. EUR is NOT accepted — don't bring euros to spend.",
        },
        {
          head: "🇦🇹 Austria — 60% card, 40% cash.",
          detail: "Salzburg & Innsbruck old-town cafes often cash-only. Vienna is more card-friendly. Always ask 'Karte?' before ordering.",
        },
        {
          head: "🇨🇿 Czech — 50% card, 50% cash (CZK).",
          detail: "Prague tourist core takes cards; non-tourist Prague + buses + small pubs are cash. Rule: hold ~CZK 2,000 at all times. Refuse to be paid in EUR — exchange rate at restaurants is robbery.",
        },
        {
          head: "🇩🇪 Germany — 40% card, 60% cash.",
          detail: "Yes, really. Berlin bars, döner shops, bakeries, many cafes are cash-only. Always pull €200 cash on arrival. ATMs of Sparkasse / DKB / Postbank don't charge.",
        },
        {
          head: "🇳🇱 Netherlands — 95% card / phone tap.",
          detail: "Cash is almost dead. Some shops are even card-only. Many supermarkets reject Visa / Mastercard — they want Maestro / V-Pay. Wise card has Mastercard logo and works fine. Carry €50 cash for one emergency.",
        },
      ],
    },

    {
      id: "rules",
      title: "Five rules that will save you €200+",
      items: [
        { head: "Always pay in local currency on the terminal. Always.", detail: "DCC = silent 4–7% loss. The merchant gets a kickback for tricking you." },
        { head: "Never exchange at airport counters or hotel front desks.", detail: "Both quote rates 5–10% off mid-market. ATM in arrivals = mid-market." },
        { head: "Tap-to-pay with phone wherever possible.", detail: "Faster, no card to forget on a tray, and Apple/Google Pay tokenises the card — if you lose the phone, freeze remotely, no card replacement needed." },
        { head: "Keep €100 hidden in a separate bag.", detail: "Money belt + a sock in a backup bag. If pickpocketed, you still have a cab fare home." },
        { head: "Photograph passport + Wise card both sides + emergency numbers; store on Google Drive.", detail: "If everything is lost, you can still log into Wise from any internet cafe and freeze cards, get a virtual replacement in 60 seconds." },
      ],
    },
  ],
};
