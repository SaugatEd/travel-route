import { useQuery } from '@tanstack/react-query';

interface FrankfurterResponse {
  date: string;
  rates: Record<string, number>;
}

interface NprRate {
  /** rate per 1 unit of foreign currency, in NPR */
  rates: Record<string, number>;
  source: string;
  /** convert(value, currency) → "₨1,234" */
  npr: (val: number, currency?: string) => string;
}

const FALLBACK_RATES = { EUR: 173, CHF: 203, CZK: 6.9, USD: 154 };

async function fetchRates(): Promise<NprRate> {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=NPR&to=EUR,CHF,CZK,USD');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as FrankfurterResponse;
    const inverted: Record<string, number> = {};
    Object.entries(data.rates).forEach(([k, v]) => {
      inverted[k] = Math.round((1 / v) * 100) / 100;
    });
    return {
      rates: inverted,
      source: `Live · ${data.date}`,
      npr: (val, cur = 'EUR') =>
        `₨${Math.round(val * (inverted[cur] ?? FALLBACK_RATES[cur as keyof typeof FALLBACK_RATES] ?? 173)).toLocaleString()}`,
    };
  } catch {
    return {
      rates: FALLBACK_RATES,
      source: '₨173/€ (fallback)',
      npr: (val, cur = 'EUR') =>
        `₨${Math.round(val * (FALLBACK_RATES[cur as keyof typeof FALLBACK_RATES] ?? 173)).toLocaleString()}`,
    };
  }
}

export function useNprRate() {
  return useQuery({
    queryKey: ['nprRates'],
    queryFn: fetchRates,
    staleTime: 1000 * 60 * 60 * 6,   // 6 hours
    gcTime:    1000 * 60 * 60 * 24,  // 24 hours
  });
}
