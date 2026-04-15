import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { Alert } from '@/src/types/alerts';

export function useAlerts() {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ['alerts'],
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
  });

  return {
    alerts: alertsQuery.data || [],
    isLoading: alertsQuery.isLoading,
    error: alertsQuery.error,
    markRead: markReadMutation.mutateAsync,
  };
}
