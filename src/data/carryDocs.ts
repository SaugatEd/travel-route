import type { RefData } from '@/components/reference/ReferenceGuide';

// What to physically carry during the trip — NOT the visa-application pile.
// Organised by where/when you actually need each thing, so nothing extra is
// carried around every day. Dates match the locked itinerary (first Schengen
// entry Rome FCO on 16 Jun, return Amsterdam → Kathmandu on 6 Jul).
export const CARRY_DOCS: RefData = {
  intro: {
    headline: 'Carry the short list — not the whole visa folder.',
    body: 'The thick application pile is only for the embassy and your first border. Day to day you carry very little. Here is exactly what, and where to keep it.',
  },
  groups: [
    {
      id: 'on-you',
      title: 'On your person — every day, everywhere',
      cities: 'pocket / money belt',
      items: [
        {
          head: '📕 Passport with Schengen visa',
          detail:
            'The original. In Germany and Austria police can ask to see ID, and the passport is it. Keep it on you — not in the hotel safe — while moving between cities.',
        },
        {
          head: '🩺 Travel insurance card / policy number',
          detail:
            'Needed the moment you see a doctor or pharmacy. A photo on your phone works, but a printed card in your wallet is safer if the phone dies.',
        },
        {
          head: '📄 One paper copy of the passport + visa page',
          detail:
            'Kept in a different pocket from the passport. If the original is lost or stolen, this is what the police and embassy work from.',
        },
        {
          head: '💳 Wise card + about €100 cash',
          detail:
            'Not a document, but it lives in the same pocket. Keep a second card and backup cash in a separate bag.',
        },
      ],
    },
    {
      id: 'day-bag',
      title: 'In your day bag',
      cities: 'needed, not in your pocket',
      items: [
        {
          head: "🏠 Tonight's stay booking",
          detail:
            "Address + confirmation code for where you sleep tonight — for check-in, and if a host or officer asks where you're staying. Each one is in the Book tab.",
        },
        {
          head: '✈️ Return flight confirmation',
          detail:
            'Amsterdam → Kathmandu, 6 Jul. Border officers occasionally ask for proof you are leaving. A phone copy is enough.',
        },
      ],
    },
    {
      id: 'first-entry',
      title: 'First Schengen entry (Rome FCO) — show, then store',
      cities: '16 Jun only',
      items: [
        {
          head: '🗂 The full document folder',
          detail:
            'Only at your FIRST entry the officer can ask for everything: cover letter, day-by-day itinerary, every hotel booking, insurance, proof of funds / bank statement, sponsor letter (for parents), and the return ticket. Have it ready at immigration — then keep it flat in your suitcase. You do NOT carry this around each day.',
        },
      ],
    },
    {
      id: 'backups',
      title: 'Digital backups — phone + Google Drive (offline)',
      cities: 'if everything is lost',
      items: [
        {
          head: '📱 Photos of every document',
          detail:
            'Passport page, visa, insurance, return ticket and all bookings — saved offline on each phone AND in one shared Google Drive folder. With these you can freeze cards, prove identity, and rebook from any café.',
        },
        {
          head: '☎️ Emergency numbers saved',
          detail:
            '112 (EU emergency — works with no SIM), your insurer’s 24h line, and the nearest Nepali embassy. One person should also hold everyone’s passport numbers.',
        },
      ],
    },
  ],
};
