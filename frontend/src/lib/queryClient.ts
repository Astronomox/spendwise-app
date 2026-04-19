import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 60s for goals/alerts
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

queryClient.setQueryDefaults(['transactions'], {
  staleTime: 1000 * 30, // 30s
});

queryClient.setQueryDefaults(['dashboard-summary'], {
  staleTime: 1000 * 30, // 30s
});
