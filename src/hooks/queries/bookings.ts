import { useQuery } from '@tanstack/react-query';
import { AIRBNBS, BOOKING } from '@/data/tripData.js';
import type { Booking, BookingTodo } from '@/types';
import { parseCalDate } from '@/lib/dates';

// All data hooks live behind useQuery so the queryFn can be swapped to a real
// fetch (MongoDB / REST) later without touching any view.

const KEYS = {
  all: ['bookings'] as const,
  list: () => [...KEYS.all, 'list'] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
  todos: () => ['bookingTodos'] as const,
};

async function fetchBookings(): Promise<Booking[]> {
  return AIRBNBS as Booking[];
}

async function fetchBookingTodos(): Promise<BookingTodo[]> {
  return BOOKING as BookingTodo[];
}

export function useBookings() {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: fetchBookings,
    select: (rows) =>
      [...rows].sort((a, b) => {
        const da = parseCalDate(a.checkIn.date);
        const db = parseCalDate(b.checkIn.date);
        return (da?.getTime() ?? 0) - (db?.getTime() ?? 0);
      }),
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: id ? KEYS.detail(id) : ['bookings', 'detail', 'noop'],
    queryFn: async () => {
      const all = await fetchBookings();
      return all.find((b) => b.id === id) ?? null;
    },
    enabled: Boolean(id),
  });
}

export function useBookingTodos() {
  return useQuery({
    queryKey: KEYS.todos(),
    queryFn: fetchBookingTodos,
    select: (rows) => [...rows].sort((a, b) => a.priority - b.priority),
  });
}

export const bookingKeys = KEYS;
