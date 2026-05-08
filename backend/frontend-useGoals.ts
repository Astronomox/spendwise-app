// src/hooks/useGoals.ts
// Rewired to use real backend API endpoints
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Goal, GoalFormValues } from '@/types/goals';
import { useToastStore } from '@/components/ui/Toast';
import { goals as goalsApi } from '@/lib/api';

// ── Transform API response to frontend Goal type ──

function toGoal(g: {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  deposits: Array<{ id: string; amount: number; date: string; note: string | null }>;
}): Goal {
  return {
    id:            g.id,
    name:          g.name,
    targetAmount:  g.targetAmount,
    currentAmount: g.currentAmount,
    deadline:      g.deadline,
    icon:          g.icon,
    userId:        g.userId,
    deposits:      g.deposits.map(d => ({
      id:     d.id,
      amount: d.amount,
      date:   d.date,
      note:   d.note ?? undefined,
    })),
  };
}

export function useGoals() {
  const client   = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  // ── Query ──
  const goalsQuery = useQuery<Goal[]>({
    queryKey: ['savings_goals'],
    queryFn:  async () => {
      const res = await goalsApi.list();
      return (res.data ?? []).map(toGoal);
    },
    staleTime: 60 * 1000,
  });

  // ── Add ──
  const addGoalMutation = useMutation({
    mutationFn: async (values: GoalFormValues) => {
      const res = await goalsApi.create(values);
      return toGoal(res.data);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal created!', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to add goal';
      addToast(message, 'error');
    },
  });

  // ── Update ──
  const updateGoalMutation = useMutation({
    mutationFn: async (updates: Partial<GoalFormValues> & { id: string }) => {
      const { id, ...data } = updates;
      const res = await goalsApi.update(id, data);
      return toGoal(res.data);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal updated!', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update goal';
      addToast(message, 'error');
    },
  });

  // ── Delete ──
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      await goalsApi.delete(id);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal deleted', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete goal';
      addToast(message, 'error');
    },
  });

  // ── Deposit ──
  const depositMutation = useMutation({
    mutationFn: async ({ goalId, amount, note }: { goalId: string; amount: number; note?: string }) => {
      const res = await goalsApi.deposit(goalId, { amount, note });
      return toGoal(res.data);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Deposit added!', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to deposit';
      addToast(message, 'error');
    },
  });

  return {
    goals:      goalsQuery.data  ?? [],
    isLoading:  goalsQuery.isLoading,
    error:      goalsQuery.error,
    addGoal:    addGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
    deposit:    depositMutation.mutateAsync,
  };
}

/** Hook for fetching a single goal by ID */
export function useGoalDetail(id: string) {
  return useQuery<Goal | null>({
    queryKey: ['savings_goals', id],
    queryFn:  async () => {
      const res = await goalsApi.get(id);
      return res.data ? toGoal(res.data) : null;
    },
    staleTime: 30 * 1000,
  });
}
