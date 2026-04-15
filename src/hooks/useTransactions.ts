import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/src/lib/supabase';
import { Transaction } from '@/src/types/transactions';

import { useToastStore } from '@/src/components/ui/Toast';

export function useTransactions() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert([newTransaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      addToast('Transaction added successfully!', 'success');
    },
    onError: (err) => {
      addToast(err.message || 'Failed to add transaction', 'error');
    }
  });

  return {
    transactions: transactionsQuery.data || [],
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    addTransaction: addTransactionMutation.mutateAsync,
    isAdding: addTransactionMutation.isPending,
  };
}
