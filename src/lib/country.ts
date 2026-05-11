import type { Country, CountryTint } from '@/types';

// Per-country flag-stripe + accent palette. Used by Ticket and other surfaces
// that want a sense of national identity.
export const COUNTRY_TINT: Record<string, CountryTint> = {
  Italy: {
    tint: '#FBFFF6',
    accent: '#0F8A4F',
    strip: 'linear-gradient(180deg, #009246 0%, #FFFFFF 50%, #CE2B37 100%)',
  },
  Switzerland: {
    tint: '#FFF6F6',
    accent: '#D8232A',
    strip: 'linear-gradient(180deg, #DA291C 0%, #FFFFFF 100%)',
  },
  Austria: {
    tint: '#FFF1F1',
    accent: '#C8102E',
    strip: 'linear-gradient(180deg, #ED2939 0%, #FFFFFF 50%, #ED2939 100%)',
  },
  Netherlands: {
    tint: '#FFF8EC',
    accent: '#C76200',
    strip: 'linear-gradient(180deg, #AE1C28 0%, #FFFFFF 33%, #21468B 100%)',
  },
  Germany: {
    tint: '#FBF7F0',
    accent: '#9A5300',
    strip: 'linear-gradient(180deg, #000 0%, #DD0000 50%, #FFCE00 100%)',
  },
  Czechia: {
    tint: '#F0F5FA',
    accent: '#11457E',
    strip: 'linear-gradient(180deg, #FFFFFF 0%, #D7141A 50%, #11457E 100%)',
  },
};

export const FALLBACK_TINT: CountryTint = {
  tint: 'var(--bg-raised)',
  accent: 'var(--accent)',
  strip: 'var(--accent)',
};

export function tintFor(country: Country | string | undefined): CountryTint {
  if (!country) return FALLBACK_TINT;
  return COUNTRY_TINT[country] ?? FALLBACK_TINT;
}
