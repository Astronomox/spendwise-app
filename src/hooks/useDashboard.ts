import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_dashboard_summary');

      if (error) {
        console.error('Failed to fetch dashboard summary:', error);
        throw error;
      }

      // Parse the returned JSON data if it's stringified
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      return parsedData;
    },
  });
}
