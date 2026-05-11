import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Cross-cutting UI state — survives reloads via localStorage.
// Anything that's "user preference" or "what was I last looking at" goes here.

type Theme = 'light' | 'dark';
export type CurrencyMode = 'native' | 'npr';

interface UiState {
  // appearance
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;

  // currency display (native EUR/CHF/CZK or converted NPR)
  currencyMode: CurrencyMode;
  setCurrencyMode: (m: CurrencyMode) => void;
  toggleCurrency: () => void;

  // navigation context
  activeStopId: string;          // for views that show a single stop
  setActiveStopId: (id: string) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

      currencyMode: 'npr',
      setCurrencyMode: (currencyMode) => set({ currencyMode }),
      toggleCurrency: () => set((s) => ({ currencyMode: s.currencyMode === 'npr' ? 'native' : 'npr' })),

      activeStopId: 'rome',
      setActiveStopId: (activeStopId) => set({ activeStopId }),

      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    { name: 'jamnata-ui' }
  )
);

// Selector hooks — preferred over reading the whole store (better re-render behaviour).
export const useTheme        = () => useUiStore((s) => s.theme);
export const useCurrencyMode = () => useUiStore((s) => s.currencyMode);
export const useActiveStopId = () => useUiStore((s) => s.activeStopId);
