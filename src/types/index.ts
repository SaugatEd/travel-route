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

export type BookingStatus = 'booked' | 'todo';

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
  cancelBy: CancelPolicy | null;
  bookingUrl: string | null;
  directionsUrl: string | null;
  confirmationCode?: string;
  note?: string;
  pricePaid?: { amount: number; currency: string };
}

export interface AirbnbAction {
  action: 'check-in' | 'check-out' | 'stay';
  id: string;
  time?: string;
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
