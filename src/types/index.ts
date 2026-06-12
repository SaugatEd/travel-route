// Core domain types — derived from the shapes in src/data/tripData.js.
// When the MongoDB backend lands, these become the wire-format contracts.

export type Country =
  | 'Italy'
  | 'Switzerland'
  | 'Austria'
  | 'Czechia'
  | 'Germany'
  | 'Netherlands'
  | string;

export type BookingStatus = 'booked' | 'todo' | 'optional';

export interface DateTimeWindow {
  date: string;          // "Tue 16 Jun"
  time: string;          // "15:00"
  until?: string;        // "22:00" (optional check-in window end)
}

export interface CancelPolicy {
  date: string;
  time: string;
  refundType?: 'partial' | 'full';
}

export interface CancellationPolicyStep {
  phase: 'Before' | 'After';
  date: string;
  time: string;
  title: string;
  detail: string;
  refundType?: 'full' | 'partial' | 'none';
}

export interface BookingStayInfoItem {
  label: string;
  value: string;
  detail?: string;
}

export interface BookingStayInfo {
  checkInOut?: BookingStayInfoItem[];
  duringStay?: BookingStayInfoItem[];
  additionalRules?: string[];
}

export interface Booking {
  id: string;
  status: BookingStatus;
  name: string;
  city: string;
  country: Country;
  flag: string;
  host: string | null;
  address: string | null;
  checkIn: DateTimeWindow;
  checkOut: { date: string; time: string };
  nights: number;
  guests: number;
  /** true = self check-in (lockbox/smart lock/contactless), false = reception/host meet.
   *  undefined when the method isn't recorded yet. */
  selfCheckIn?: boolean;
  /** Short human label for the check-in method, e.g. "Smart lock", "Hotel reception". */
  checkInMethod?: string;
  cancelBy: CancelPolicy | null;
  bookingUrl: string | null;
  directionsUrl: string | null;
  /** Booking confirmation PDF under /public, e.g. "tickets/india-booking.pdf".
   *  Resolve with import.meta.env.BASE_URL at render. */
  pdfUrl?: string;
  /** Optional Google Maps "place" URL (the location pin), distinct from
   *  `directionsUrl` which is the routed walk/transit directions. */
  mapUrl?: string;
  confirmationCode?: string;
  note?: string;
  cancellationPolicy?: CancellationPolicyStep[];
  stayInfo?: BookingStayInfo;
  pricePaid?: {
    amount: number;
    currency: string;
    deductedOn?: string;
    scheduledDeductionOn?: string;
    note?: string;
  };
}

export interface AirbnbAction {
  action: 'check-in' | 'check-out' | 'stay';
  id: string;
  time?: string;
}

export interface DayPlanItem {
  title: string;
  time?: string;
  note?: string;
  booked?: boolean;
}

/** Structured breakdown of a day's freeform summary, rendered as separated zones. */
export interface DayPlan {
  transit?: string[];
  visit?: DayPlanItem[];
  eat?: DayPlanItem[];
  logistics?: string[];
}

export interface Journey {
  id?: string;
  from: string;
  to: string;
  via: string;
  date: string;
  dur: string;
  cost: string;
  /** Fare basis — advance vs walk-up, operator, source notes. Researched, optional. */
  costNote?: string;
  /** Public-bus alternative with line numbers, where a bus is relevant/better. */
  busAlt?: string;
  type: string;
  bookingUrl: string | null;
}

export interface CalendarDay {
  date: string;            // "Tue 16 Jun"
  dayN: number;
  type: 'travel' | 'arrive' | 'move' | 'explore' | 'transit' | 'night' | string;
  icon: string;
  stop: string;
  city: string;
  flag: string;
  summary: string;
  move?: boolean;
  airbnb?: AirbnbAction[];
  journeyIds?: string[];
  plan?: DayPlan;
}

// Stop shape is wide and varies per stop in tripData.js. Keep it permissive
// here; tighten field-by-field when individual stop views are migrated.
export interface Stop {
  id: string;
  city: string;
  country: Country;
  flag: string;
  story?: string;
  [key: string]: unknown;
}

export interface BookingTodo {
  priority: number;
  urgency: string;
  item: string;
  detail: string;
  url: string;
  date: string;
}

export type CountryTint = {
  tint: string;
  accent: string;
  strip: string;
};
