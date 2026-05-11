// Flight bookings — Turkish Airlines round-trip Delhi ↔ Europe.
// Source of truth for /flights view. PDF lives at /public/tickets/.

export interface Airport {
  code: string;       // IATA — "DEL", "IST", "FCO"
  city: string;
  country: string;
  name: string;       // full airport name
}

export interface FlightSegment {
  flightNo: string;          // "TK717"
  airline: string;
  aircraft: string;          // "Airbus A330-300 (wide-body)"
  from: Airport;
  to: Airport;
  /** ISO date in local airport time, e.g. "2026-06-16T06:30" */
  depart: string;
  arrive: string;
  durationMin: number;       // segment flight time in minutes
}

export interface FlightLayover {
  airport: Airport;
  durationMin: number;
}

export interface FlightLeg {
  /** "Outbound" / "Return" */
  label: string;
  /** Calendar date (display), e.g. "Tue 16 Jun 2026" */
  dateLabel: string;
  segments: FlightSegment[];
  layovers: FlightLayover[];
  /** Total journey duration including layovers, e.g. "11h 10m" */
  totalDuration: string;
  cabinClass: string;
}

export interface PassengerSeat {
  /** segment index in the leg */
  segmentIndex: number;
  seat: string;
}

export interface Passenger {
  name: string;
  ticketNumber: string;
  outboundSeats: PassengerSeat[];
  returnSeats: PassengerSeat[];
}

export interface FlightBooking {
  pnr: string;
  airline: string;
  contactEmail: string;
  contactPhone: string;
  totalEur: number;
  issuedOn: string;
  pdfUrl: string;
  outbound: FlightLeg;
  return: FlightLeg;
  passengers: Passenger[];
}

const DEL: Airport = { code: 'DEL', city: 'Delhi',     country: 'India',       name: 'Indira Gandhi International Airport' };
const IST: Airport = { code: 'IST', city: 'Istanbul',  country: 'Türkiye',     name: 'Istanbul Airport' };
const FCO: Airport = { code: 'FCO', city: 'Rome',      country: 'Italy',       name: 'Fiumicino – Leonardo da Vinci Airport' };
const AMS: Airport = { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam Schiphol Airport' };

export const FLIGHT_BOOKING: FlightBooking = {
  pnr: 'TCA424',
  airline: 'Turkish Airlines',
  contactEmail: 'clemens.grolman@eduneon.de',
  contactPhone: '+9779823484572',
  totalEur: 3826.59,
  issuedOn: '2026-04-10',
  pdfUrl: 'tickets/turkish-airlines-tca424.pdf',  // resolved with import.meta.env.BASE_URL at render

  outbound: {
    label: 'Outbound',
    dateLabel: 'Tue 16 Jun 2026',
    cabinClass: 'Economy (H)',
    totalDuration: '11h 10m',
    segments: [
      {
        flightNo: 'TK717',
        airline: 'Turkish Airlines',
        aircraft: 'Airbus A330-300 (wide-body)',
        from: DEL,
        to: IST,
        depart: '2026-06-16T06:30',
        arrive: '2026-06-16T10:50',
        durationMin: 6 * 60 + 50,
      },
      {
        flightNo: 'TK1865',
        airline: 'Turkish Airlines',
        aircraft: 'Airbus A321 Neo (narrow-body)',
        from: IST,
        to: FCO,
        depart: '2026-06-16T12:30',
        arrive: '2026-06-16T14:10',
        durationMin: 2 * 60 + 40,
      },
    ],
    layovers: [
      { airport: IST, durationMin: 1 * 60 + 40 },
    ],
  },

  return: {
    label: 'Return',
    dateLabel: 'Mon 6 Jul 2026',
    cabinClass: 'Economy (H)',
    totalDuration: '10h 40m',
    segments: [
      {
        flightNo: 'TK1958',
        airline: 'Turkish Airlines',
        aircraft: 'Airbus A330-300 (wide-body)',
        from: AMS,
        to: IST,
        depart: '2026-07-06T14:40',
        arrive: '2026-07-06T19:05',
        durationMin: 3 * 60 + 25,
      },
      {
        flightNo: 'TK716',
        airline: 'Turkish Airlines',
        aircraft: 'Boeing 787-9 (wide-body)',
        from: IST,
        to: DEL,
        depart: '2026-07-06T20:15',
        arrive: '2026-07-07T04:50',
        durationMin: 6 * 60 + 5,
      },
    ],
    layovers: [
      { airport: IST, durationMin: 1 * 60 + 10 },
    ],
  },

  passengers: [
    {
      name: 'Sagar Ghimire',
      ticketNumber: '2352298239682',
      outboundSeats: [
        { segmentIndex: 0, seat: '13B' }, // DEL → IST
        { segmentIndex: 1, seat: '11C' }, // IST → FCO
      ],
      returnSeats: [
        { segmentIndex: 0, seat: '18G' }, // AMS → IST
        { segmentIndex: 1, seat: '16C' }, // IST → DEL
      ],
    },
    {
      name: 'Sajan Ghimire',
      ticketNumber: '2352298239684',
      outboundSeats: [
        { segmentIndex: 0, seat: '13D' },
        { segmentIndex: 1, seat: '11A' },
      ],
      returnSeats: [
        { segmentIndex: 0, seat: '18K' },
        { segmentIndex: 1, seat: '16A' },
      ],
    },
    {
      name: 'Pratikshya Dhakal',
      ticketNumber: '2352298239686',
      outboundSeats: [
        { segmentIndex: 0, seat: '13A' },
        { segmentIndex: 1, seat: '11B' },
      ],
      returnSeats: [
        { segmentIndex: 0, seat: '18J' },
        { segmentIndex: 1, seat: '16B' },
      ],
    },
  ],
};

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTime(iso: string): string {
  return iso.split('T')[1] ?? '';
}

export function formatDate(iso: string): string {
  const d = new Date(`${iso}:00`);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
