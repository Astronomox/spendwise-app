// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { analytics } from '@/lib/api';
import { DashboardData } from '@/types/user';

export function useDashboardSummary() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard-summary'],
    queryFn: async (): Promise<DashboardData> => {
      // Fetch analytics and burn rate in parallel
      const [analyticsRes, burnRateRes] = await Promise.all([
        analytics.summary(),
        analytics.burnRate().catch(() => ({
          success: false,
          data: { dailyBurnRate: 0, projectedMonthlyBurn: 0, daysAnalyzed: 0, totalExpenses: 0 },
        })),
      ]);

      const budgetStr = localStorage.getItem('sw_budget');
      const monthlyBudget = budgetStr ? Number(budgetStr) : 0;

      const today = new Date();
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysLeftInMonth = Math.max(1, lastDay.getDate() - today.getDate() + 1);

      const totalSpent = analyticsRes.data.totalExpenses ?? 0;
      const budgetRemaining = monthlyBudget - totalSpent;
      const dailySafeSpend = budgetRemaining > 0 ? budgetRemaining / daysLeftInMonth : 0;

      const weeklySpend: DashboardData['weeklySpend'] = [0, 0, 0, 0, 0, 0, 0];

      const spendByCategory: Record<string, number> = {};
      if (Array.isArray(analyticsRes.data.byCategory)) {
        analyticsRes.data.byCategory.forEach((cat) => {
          spendByCategory[cat.categoryName] = cat.totalSpent;
        });
      }

      return {
        totalSpent,
        monthlyBudget,
        daysLeftInMonth,
        dailySafeSpend,
        dailyBurnRate:        burnRateRes.data.dailyBurnRate ?? 0,
        projectedMonthlyBurn: burnRateRes.data.projectedMonthlyBurn ?? 0,
        weeklySpend,
        spendByCategory,
      };
    },
    staleTime: 45 * 1000,
  });
}