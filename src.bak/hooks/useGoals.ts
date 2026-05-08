// src/hooks/useGoals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Goal, GoalFormValues } from '@/types/goals';
import { useToastStore } from '@/components/ui/Toast';
import {
  fetchGoals,
  createGoal,
  updateGoalApi,
  deleteGoalApi,
  depositToGoal,
  getGoalById,
} from '@/lib/goalsStore';

export function useGoals() {
  const client   = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  // ── Query ──────────────────────────────────────────────
  const goalsQuery = useQuery<Goal[]>({
    queryKey: ['savings_goals'],
    queryFn:  fetchGoals,
    staleTime: 60 * 1000,
  });

  // ── Add ────────────────────────────────────────────────
  const addGoalMutation = useMutation({
    mutationFn: (values: GoalFormValues) => createGoal(values),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal created!', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to add goal';
      addToast(message, 'error');
    },
  });

  // ── Update ─────────────────────────────────────────────
  const updateGoalMutation = useMutation({
    mutationFn: (updates: Partial<GoalFormValues> & { id: string }) =>
      updateGoalApi(updates.id, updates),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal updated!', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update goal';
      addToast(message, 'error');
    },
  });

  // ── Delete ─────────────────────────────────────────────
  const deleteGoalMutation = useMutation({
    mutationFn: (id: string) => deleteGoalApi(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal deleted', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete goal';
      addToast(message, 'error');
    },
  });

  // ── Deposit ────────────────────────────────────────────
  const depositMutation = useMutation({
    mutationFn: ({ goalId, amount, note }: { goalId: string; amount: number; note?: string }) =>
      depositToGoal(goalId, amount, note),
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
    queryFn:  () => getGoalById(id),
    staleTime: 30 * 1000,
  });
}
