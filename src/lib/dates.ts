// Date helpers.
// Trip dates are stored as human strings like "Tue 16 Jun". We parse them
// against the trip year (2026) when we need a real Date.

const TRIP_YEAR = 2026;
const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

export function parseCalDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3})/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const monKey = m[2][0].toUpperCase() + m[2].slice(1, 3).toLowerCase();
  const month = MONTHS[monKey];
  if (month === undefined) return null;
  return new Date(TRIP_YEAR, month, day);
}

/** "Tue 16 Jun" → "16 Jun" */
export function shortDate(s: string): string {
  return s.replace(/^\w+ /, '');
}

/** "Tue 16 Jun" → "Tue" */
export function dayOfWeek(s: string): string {
  return (s.match(/^\w+/) || [''])[0];
}

/** "Tue 16 Jun" → "2026-06-16" (ISO date for URL params, sorting, etc.) */
export function toIsoDate(s: string): string {
  const d = parseCalDate(s);
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole-day diff (b - a) in days. */
export function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / 86_400_000);
}
