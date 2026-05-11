// URL builders for external services.
// Centralised so we can swap providers (Apple Maps, Mapbox) without touching views.

import { toIsoDate } from './dates';

export function makeGoogleMapsDirections(opts: {
  origin: string;
  destination: string;
  mode?: 'walking' | 'transit' | 'driving' | 'bicycling';
}): string {
  const params = new URLSearchParams({
    api: '1',
    origin: opts.origin,
    destination: opts.destination,
    travelmode: opts.mode ?? 'transit',
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function makeAirbnbSearch(opts: {
  city: string;
  checkIn: string;     // "Tue 22 Jun" or ISO
  checkOut: string;
  guests: number;
}): string {
  const ci = opts.checkIn.includes('-') ? opts.checkIn : toIsoDate(opts.checkIn);
  const co = opts.checkOut.includes('-') ? opts.checkOut : toIsoDate(opts.checkOut);
  return `https://www.airbnb.com/s/${encodeURIComponent(opts.city)}/homes?checkin=${ci}&checkout=${co}&adults=${opts.guests}`;
}

export function makeAirbnbListing(roomId: string | number): string {
  return `https://www.airbnb.com/rooms/${roomId}`;
}
