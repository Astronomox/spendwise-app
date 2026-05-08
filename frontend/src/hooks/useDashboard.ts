// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { dashboard, analytics, hasToken, RawTransaction } from '@/lib/api';
import { DashboardData } from '@/types/user';
import { Transaction } from '@/types/transactions';

/** Convert a raw backend transaction to the frontend shape */
function rawToTransaction(t: RawTransaction): Transaction {
  const amountNaira = t.amountNaira ?? (t.amountKobo ? t.amountKobo / 100 : (t.amount ?? 0));
  return {
    id:          t.id ?? t._id ?? '',
    merchant:    null,
    category:    t.categoryName ?? t.categoryId ?? t.category ?? 'other',
    amount:      amountNaira,
    direction:   t.type === 'INCOME' ? 'credit' : 'debit',
    date:        t.transactionDate ?? t.createdAt ?? t.created_at ?? new Date().toISOString(),
    source:      'manual',
    status:      'confirmed',
    description: t.description ?? '',
  };
}

/** Build weekly spend array (Mon–Sun) from transactions */
function buildWeeklySpend(transactions: Transaction[]): DashboardData['weeklySpend'] {
  const weekly: DashboardData['weeklySpend'] = [0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  const todayDay = now.getDay(); // 0=Sun
  // Find start of this week (Monday)
  const mondayOffset = todayDay === 0 ? 6 : todayDay - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - mondayOffset);
  monday.setHours(0, 0, 0, 0);

  transactions
    .filter(t => t.direction === 'debit')
    .forEach(t => {
      const d = new Date(t.date);
      if (d >= monday) {
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1; // Mon=0, Sun=6
        weekly[dayIdx] += t.amount;
      }
    });

  return weekly;
}

export function useDashboardSummary() {
  // ── Primary: single cached dashboard call ──
  const dashQuery = useQuery({
    queryKey: ['dashboard'],
    enabled: hasToken(),
    queryFn: async () => {
      const res = await dashboard.get();
      return res.data;
    },
    staleTime: 45_000,
  });

  // ── Secondary: burn rate (only fires after dashboard succeeds) ──
  const burnQuery = useQuery({
    queryKey: ['burn-rate'],
    enabled: hasToken() && !!dashQuery.data,  // ← lazy: waits for dashboard
    queryFn: async () => {
      const res = await analytics.burnRate(30);
      return res.data;
    },
    staleTime: 120_000, // 2 min — this data changes slowly
  });

  // ── Secondary: analytics for weekly chart + categories (only fires after dashboard) ──
  const analyticsQuery = useQuery({
    queryKey: ['analytics-summary'],
    enabled: hasToken() && !!dashQuery.data,  // ← lazy: waits for dashboard
    queryFn: async () => {
      const res = await analytics.summary();
      return res.data;
    },
    staleTime: 120_000,
  });

  // ── Assemble the combined result ──
  const isLoading = dashQuery.isLoading;
  const error = dashQuery.error;

  const d = dashQuery.data;
  const totalExpensesNaira = d ? d.spending.totalExpensesKobo / 100 : 0;
  const dailySafeSpend = d ? d.safeSpend.dailySafeSpendNaira : 0;

  const budgetStr = typeof window !== 'undefined' ? localStorage.getItem('sw_budget') : null;
  const monthlyBudget = budgetStr ? Number(budgetStr) : 0;

  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysLeftInMonth = Math.max(1, lastDay.getDate() - today.getDate() + 1);

  // Recent transactions from dashboard endpoint
  const recentTransactions = (d?.recentTransactions ?? []).map(rawToTransaction);

  // Weekly spend — computed from recent transactions
  const weeklySpend = buildWeeklySpend(recentTransactions);

  // Category breakdown — prefer analytics if loaded, fall back to recent transactions
  const spendByCategory: Record<string, number> = {};
  if (analyticsQuery.data?.byCategory) {
    analyticsQuery.data.byCategory.forEach(cat => {
      spendByCategory[cat.categoryName] = cat.totalSpent;
    });
  } else {
    recentTransactions
      .filter(t => t.direction === 'debit')
      .forEach(t => {
        spendByCategory[t.category] = (spendByCategory[t.category] ?? 0) + t.amount;
      });
  }

  const data: DashboardData & { recentTransactions: Transaction[] } = {
    totalSpent: totalExpensesNaira,
    monthlyBudget,
    daysLeftInMonth,
    dailySafeSpend,
    dailyBurnRate:        burnQuery.data?.dailyBurnRate ?? 0,
    projectedMonthlyBurn: burnQuery.data?.projectedMonthlyBurn ?? 0,
    weeklySpend,
    spendByCategory,
    recentTransactions,
  };

  return {
    data: d ? data : undefined,
    isLoading,
    error,
  };
}
