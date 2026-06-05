// URL builders for external services.
// Centralised so we can swap providers (Apple Maps, Mapbox) without touching views.

import { toIsoDate } from './dates';

// Omitting `origin` makes Google Maps route from the user's current location.
export function makeGoogleMapsDirections(opts: {
  origin?: string;
  destination: string;
  mode?: 'walking' | 'transit' | 'driving' | 'bicycling';
}): string {
  const params = new URLSearchParams({ api: '1' });
  if (opts.origin) params.set('origin', opts.origin);
  params.set('destination', opts.destination);
  params.set('travelmode', opts.mode ?? 'transit');
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Multi-waypoint Google Maps directions ("route through several places in one"):
 * first place = origin, last = destination, the rest = ordered waypoints.
 * Returns '' for fewer than 2 places. Google's consumer URL handles ~9 waypoints,
 * so longer lists keep the first + last and evenly sample the middle.
 */
export function makeGoogleMapsRoute(
  places: string[],
  mode: 'walking' | 'transit' | 'driving' | 'bicycling' = 'walking',
): string {
  const pts = places.map((p) => p.trim()).filter(Boolean);
  if (pts.length < 2) return '';

  const MAX = 11; // origin + destination + 9 waypoints
  let route = pts;
  if (pts.length > MAX) {
    const middle = pts.slice(1, -1);
    const step = (middle.length - 1) / (MAX - 3);
    const sampled = Array.from({ length: MAX - 2 }, (_, i) => middle[Math.round(i * step)]);
    route = [pts[0], ...sampled, pts[pts.length - 1]];
  }

  const params = new URLSearchParams({
    api: '1',
    origin: route[0],
    destination: route[route.length - 1],
    travelmode: mode,
  });
  const waypoints = route.slice(1, -1);
  if (waypoints.length) params.set('waypoints', waypoints.join('|'));
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
