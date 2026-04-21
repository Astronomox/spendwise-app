// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { analytics } from '@/lib/api';
import { DashboardData } from '@/types/user';

export function useDashboardSummary() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard-summary'],
    queryFn:  async (): Promise<DashboardData> => {
      const data = await analytics.summary();

      // Monthly budget is set during onboarding and persisted in localStorage
      const budgetStr    = localStorage.getItem('sw_budget');
      const monthlyBudget = budgetStr ? Number(budgetStr) : 0;

      // Days remaining in the current month (minimum 1 to avoid divide-by-zero)
      const today   = new Date();
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysLeftInMonth = Math.max(1, lastDay.getDate() - today.getDate() + 1);

      const totalSpent      = data.totalSpentNaira ?? 0;
      const budgetRemaining = monthlyBudget - totalSpent;
      const dailySafeSpend  = budgetRemaining > 0 ? budgetRemaining / daysLeftInMonth : 0;

      // weeklySpend: API doesn't expose this yet — stub as 7 zeros
      const weeklySpend: DashboardData['weeklySpend'] = [0, 0, 0, 0, 0, 0, 0];

      return {
        totalSpent,
        monthlyBudget,
        daysLeftInMonth,
        dailySafeSpend,
        weeklySpend,
        spendByCategory: data.categoryBreakdown ?? {},
      };
    },
    staleTime: 45 * 1000,
  });
}
