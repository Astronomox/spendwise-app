// src/hooks/useAlerts.ts
// Rewired to use real backend API endpoints
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Alert } from '@/types/alerts';
import { useToastStore } from '@/components/ui/Toast';
import { alerts as alertsApi } from '@/lib/api';

interface UseAlertsOptions {
  enabled?: boolean;
}

export function useAlerts({ enabled = true }: UseAlertsOptions = {}) {
  const client   = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const alertsQuery = useQuery<Alert[]>({
    queryKey: ['alerts'],
    enabled,
    queryFn:  async () => {
      const res = await alertsApi.list();
      return res.data ?? [];
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => alertsApi.markRead(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => alertsApi.markAllRead(),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['alerts'] });
      addToast('All alerts marked as read', 'success');
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => alertsApi.clear(),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return {
    alerts:       alertsQuery.data ?? [],
    isLoading:    alertsQuery.isLoading,
    error:        alertsQuery.error,
    markRead:     markReadMutation.mutateAsync,
    markAllRead:  markAllReadMutation.mutateAsync,
    clearAlerts:  clearMutation.mutateAsync,
  };
}
