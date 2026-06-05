import type { MapsProvider } from '@/store/useUiStore';

export const PROVIDER_LABEL: Record<MapsProvider, string> = {
  google: 'Google Maps',
  apple: 'Apple Maps',
};

/** Directions deep link from `origin` ("lat,lng", optional) to `query`, in the chosen app. */
export function directionsLink(provider: MapsProvider, query: string, origin?: string): string {
  const dest = encodeURIComponent(query);
  if (provider === 'apple') {
    return `https://maps.apple.com/?${origin ? `saddr=${encodeURIComponent(origin)}&` : ''}daddr=${dest}`;
  }
  return `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${encodeURIComponent(origin)}` : ''}&destination=${dest}`;
}

/** Place/search deep link in the chosen app. */
export function placeLink(provider: MapsProvider, query: string): string {
  const q = encodeURIComponent(query);
  return provider === 'apple'
    ? `https://maps.apple.com/?q=${q}`
    : `https://www.google.com/maps/search/?api=1&query=${q}`;
}
