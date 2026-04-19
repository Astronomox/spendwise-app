import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SavingsGoal } from '@/src/types/goals';

import { useToastStore } from '@/src/components/ui/Toast';

export function useGoals() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const goalsQuery = useQuery({
    queryKey: ['savings_goals'],
    queryFn: async () => {
      // API not available yet
      return [] as SavingsGoal[];
    },
    staleTime: 60 * 1000,
  });

  const addGoalMutation = useMutation({
    mutationFn: async (newGoal: Omit<SavingsGoal, 'id' | 'created_at' | 'current_amount'>) => {
      // API not available yet
      return {} as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal added successfully!', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to add goal', 'error');
    }
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavingsGoal> & { id: string }) => {
      // API not available yet
      return {} as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal updated successfully!', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to update goal', 'error');
    }
  });

  const deleteGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      // API not available yet
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings_goals'] });
      addToast('Goal deleted successfully!', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to delete goal', 'error');
    }
  });

  return {
    goals: goalsQuery.data || [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    addGoal: addGoalMutation.mutateAsync,
    updateGoal: updateGoalMutation.mutateAsync,
    deleteGoal: deleteGoalMutation.mutateAsync,
  };
}
