import { useQuery } from '@tanstack/react-query';
import { analytics } from '@/src/lib/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const data = await analytics.summary();

      // Get budget from localStorage (set during onboarding)
      const budgetStr = localStorage.getItem('sw_budget');
      const monthlyBudget = budgetStr ? Number(budgetStr) : 0;

      // Calculate days left in month
      const today = new Date();
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const daysLeft = Math.max(1, lastDay.getDate() - today.getDate() + 1);

      // Compute daily safe spend
      const budgetRemaining = monthlyBudget - (data.totalSpentNaira || 0);
      const dailySafeSpend = budgetRemaining > 0 ? budgetRemaining / daysLeft : 0;

      // Ensure spend_by_category uses the fallback colours correctly and matches the old contract
      // The API returns an object or array. We map it out.
      const spend_by_category = data.categoryBreakdown || {};

      return {
        total_spent: data.totalSpentNaira || 0,
        monthly_budget: monthlyBudget,
        budget_remaining: budgetRemaining,
        days_left_in_month: daysLeft,
        daily_safe_spend: dailySafeSpend,
        weekly_spend: [0, 0, 0, 0, 0, 0, 0], // API doesn't support this yet, stub with 0s
        spend_by_category: spend_by_category,
        streak_count: 0 // API doesn't support this yet, stub with 0
      };
    },
    staleTime: 45 * 1000,
  });
}
