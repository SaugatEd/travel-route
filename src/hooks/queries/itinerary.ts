import { useQuery } from '@tanstack/react-query';
import { CALENDAR, STOPS } from '@/data/tripData.js';
import type { CalendarDay, Stop } from '@/types';

const KEYS = {
  calendar: ['calendar'] as const,
  calendarDay: (dayN: number) => ['calendar', 'day', dayN] as const,
  stops: ['stops'] as const,
  stop: (id: string) => ['stops', id] as const,
};

async function fetchCalendar(): Promise<CalendarDay[]> {
  return CALENDAR as CalendarDay[];
}

async function fetchStops(): Promise<Stop[]> {
  return STOPS as unknown as Stop[];
}

export function useCalendar() {
  return useQuery({ queryKey: KEYS.calendar, queryFn: fetchCalendar });
}

export function useCalendarDay(dayN: number | undefined) {
  return useQuery({
    queryKey: dayN != null ? KEYS.calendarDay(dayN) : ['calendar', 'day', 'noop'],
    queryFn: async () => {
      const all = await fetchCalendar();
      return all.find((d) => d.dayN === dayN) ?? null;
    },
    enabled: dayN != null,
  });
}

export function useStops() {
  return useQuery({ queryKey: KEYS.stops, queryFn: fetchStops });
}

export function useStop(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEYS.stop(id) : ['stops', 'noop'],
    queryFn: async () => {
      const all = await fetchStops();
      return all.find((s) => s.id === id) ?? null;
    },
    enabled: Boolean(id),
  });
}

export const itineraryKeys = KEYS;
