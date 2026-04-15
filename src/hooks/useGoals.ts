import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { SavingsGoal } from '@/src/types/goals';

import { useToastStore } from '@/src/components/ui/Toast';

export function useGoals() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const goalsQuery = useQuery({
    queryKey: ['savings_goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' && import.meta.env.DEV) return []; // table does not exist yet (development)
        throw error;
      }
      return (data || []) as SavingsGoal[];
    },
  });

  const addGoalMutation = useMutation({
    mutationFn: async (newGoal: Omit<SavingsGoal, 'id' | 'created_at' | 'current_amount'>) => {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{ ...newGoal, current_amount: 0 }])
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
