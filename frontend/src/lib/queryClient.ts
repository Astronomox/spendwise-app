// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 60 s — default for goals / alerts
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Tighter staleness for high-frequency data
queryClient.setQueryDefaults(['transactions'], {
  staleTime: 1000 * 30, // 30 s
});

queryClient.setQueryDefaults(['dashboard-summary'], {
  staleTime: 1000 * 30, // 30 s
});
