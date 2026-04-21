// src/hooks/useAlerts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/types/alerts';
import { useToastStore } from '@/components/ui/Toast';

interface UseAlertsOptions {
  enabled?: boolean;
}

export function useAlerts({ enabled = true }: UseAlertsOptions = {}) {
  const client   = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  // ── Query ──────────────────────────────────────────────────────────────────
  // Alerts API not available yet — returns empty array until endpoint is ready.
  const alertsQuery = useQuery<Alert[]>({
    queryKey: ['alerts'],
    enabled,
    queryFn:  async (): Promise<Alert[]> => [],
    staleTime: 60 * 1000,
  });

  // ── Mark read ──────────────────────────────────────────────────────────────
  const markReadMutation = useMutation({
    mutationFn: async (_id: string): Promise<void> => {
      // API not available yet — stub
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['alerts'] });
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to mark alert as read';
      addToast(message, 'error');
    },
  });

  return {
    alerts:    alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    error:     alertsQuery.error,
    markRead:  markReadMutation.mutateAsync,
  };
}
