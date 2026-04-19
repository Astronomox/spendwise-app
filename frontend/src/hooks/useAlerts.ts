import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from '@/src/types/alerts';

import { useToastStore } from '@/src/components/ui/Toast';

export function useAlerts({ enabled }: { enabled?: boolean } = { enabled: true }) {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const alertsQuery = useQuery({
    queryKey: ['alerts'],
    enabled,
    queryFn: async () => {
      // Stub: in a real app you'd call a get-alerts API here
      return [] as Alert[];
    },
    staleTime: 60 * 1000,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      // Stub: in a real app you'd call a mark-read API here
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['alerts'] }),
    onError: (err) => {
      addToast(err.message || 'Failed to mark alert as read', 'error');
    }
  });

  return {
    alerts: alertsQuery.data || [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    markRead: markReadMutation.mutateAsync,
  };
}
