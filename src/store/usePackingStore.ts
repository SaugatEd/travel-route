import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tick-state for the pre-departure to-do checklist — survives reloads.

interface PackingState {
  done: Record<string, boolean>;
  toggle: (id: string) => void;
  reset: () => void;
}

export const usePackingStore = create<PackingState>()(
  persist(
    (set) => ({
      done: {},
      toggle: (id) => set((s) => ({ done: { ...s.done, [id]: !s.done[id] } })),
      reset: () => set({ done: {} }),
    }),
    { name: 'jamnata-packing' }
  )
);
