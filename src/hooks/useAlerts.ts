// src/hooks/useAlerts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Alert } from '@/types/alerts';
import { useToastStore } from '@/components/ui/Toast';
import {
  fetchAlerts,
  markAlertRead,
  markAllRead,
  clearAlerts,
} from '@/lib/alertsStore';

interface UseAlertsOptions {
  enabled?: boolean;
}

export function useAlerts({ enabled = true }: UseAlertsOptions = {}) {
  const client   = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  const alertsQuery = useQuery<Alert[]>({
    queryKey: ['alerts'],
    enabled,
    queryFn:  fetchAlerts,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // poll every minute
  });

  const markReadMutation = useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['alerts'] });
      addToast('All alerts marked as read', 'success');
    },
  });

  const clearMutation = useMutation({
    mutationFn: clearAlerts,
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
