import { useCallback, useRef, useState } from 'react';
import { useMapsProvider } from '@/store/useUiStore';
import { directionsLink, PROVIDER_LABEL } from '@/lib/mapsProvider';

export type MapEmbedState = 'idle' | 'locating' | 'routed' | 'place';

// Keyless Google Maps embeds (same pattern the app already uses elsewhere).
function placeEmbed(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
}
function directionsEmbed(lat: number, lng: number, query: string): string {
  return `https://maps.google.com/maps?saddr=${lat},${lng}&daddr=${encodeURIComponent(query)}&z=14&output=embed`;
}

/**
 * Resolves a Google Maps embed for `query`: asks for the device location and
 * routes from there, falling back to a plain place map if it is denied or
 * unavailable. `resolve()` runs the lookup at most once per query. Shared by the
 * inline LocationMap and the luggage LocationDialog.
 */
export function useMapEmbed(query: string) {
  const [src, setSrc] = useState<string | null>(null);
  const [state, setState] = useState<MapEmbedState>('idle');
  const resolved = useRef(false);
  const provider = useMapsProvider();

  const resolve = useCallback(() => {
    if (resolved.current) return;
    resolved.current = true;
    setState('locating');
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setSrc(placeEmbed(query));
      setState('place');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSrc(directionsEmbed(pos.coords.latitude, pos.coords.longitude, query));
        setState('routed');
      },
      () => {
        setSrc(placeEmbed(query));
        setState('place');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }, [query]);

  const externalUrl = directionsLink(provider, query);
  const status =
    state === 'locating' ? 'Getting your location…'
    : state === 'routed' ? 'Route from your current location.'
    : state === 'place' ? 'Showing the place (location unavailable).'
    : '';

  return { src, state, status, externalUrl, providerLabel: PROVIDER_LABEL[provider], resolve };
}
