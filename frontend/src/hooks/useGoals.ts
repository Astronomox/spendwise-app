// src/hooks/useGoals.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Goal, GoalFormValues } from '@/types/goals';
import { useToastStore } from '@/components/ui/Toast';

export function useGoals() {
  const client   = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  // ── Query ──────────────────────────────────────────────────────────────────
  // Goals API not available yet — returns empty array until endpoint is ready.
  const goalsQuery = useQuery<Goal[]>({
    queryKey: ['savings_goals'],
    queryFn:  async (): Promise<Goal[]> => [],
    staleTime: 60 * 1000,
  });

  // ── Add ────────────────────────────────────────────────────────────────────
  const addGoalMutation = useMutation({
    mutationFn: async (_values: GoalFormValues): Promise<Goal> => {
      // API not available yet — stub
      throw new Error('Goals API not available yet');
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal added successfully!', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to add goal';
      addToast(message, 'error');
    },
  });

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateGoalMutation = useMutation({
    mutationFn: async (_updates: Partial<Goal> & { id: string }): Promise<Goal> => {
      // API not available yet — stub
      throw new Error('Goals API not available yet');
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal updated successfully!', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to update goal';
      addToast(message, 'error');
    },
  });

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteGoalMutation = useMutation({
    mutationFn: async (_id: string): Promise<void> => {
      // API not available yet — stub
      throw new Error('Goals API not available yet');
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal deleted successfully!', 'success');
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : 'Failed to delete goal';
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
  };
}
