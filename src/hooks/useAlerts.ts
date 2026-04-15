import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { Alert } from '@/src/types/alerts';

import { useToastStore } from '@/src/components/ui/Toast';

export function useAlerts(enabled: boolean = true) {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const alertsQuery = useQuery({
    queryKey: ['alerts'],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('read', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') return []; // table does not exist yet
        throw error;
      }
      return (data || []) as Alert[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
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
