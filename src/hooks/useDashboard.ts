import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      // In a real app, this would be a Supabase Edge Function or a complex query
      // For now, we'll call a RPC or a specific table that stores pre-calculated summaries
      const { data, error } = await supabase
        .rpc('get_dashboard_summary'); // Assuming Semilore created this RPC

      if (error) {
        // Fallback if RPC doesn't exist yet during development
        console.warn('RPC get_dashboard_summary not found, using mock data fallback');
        return {
          total_spent: 45000,
          monthly_budget: 150000,
          budget_remaining: 105000,
          days_left_in_month: 18,
          daily_safe_spend: 5833,
          weekly_spend: [12000, 8500, 15000, 4500, 9000, 11000, 5000],
          spend_by_category: {
            food: 12300,
            transport: 4500,
            utilities: 10000,
            shopping: 8200,
            other: 10000
          },
          streak_count: 5
        };
      }
      return data;
    },
  });
}
