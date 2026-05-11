import { QueryClient } from '@tanstack/react-query';

// Single QueryClient for the app. Long staleTime since the trip data is static
// today; tighten when MongoDB-backed mutations arrive.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 min
      gcTime: 1000 * 60 * 30,          // 30 min
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
