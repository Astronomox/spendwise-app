import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactions } from '@/src/lib/api';
import { Transaction } from '@/src/types/transactions';

import { useToastStore } from '@/src/components/ui/Toast';

export function useTransactions() {
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const data = await transactions.list();

      // API returns transactions where amount is in kobo.
      // We must convert it to naira for the frontend UI.
      return data.map((t: any) => ({
        ...t,
        id: t.id || t._id, // map depending on what backend returns
        amount: (t.amount || 0) / 100, // Kobo to Naira
        category: t.categoryId || t.category || 'other', // Fallback
      })) as Transaction[];
    },
    staleTime: 30 * 1000,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (newTransaction: Omit<Transaction, 'id' | 'created_at'>) => {
      // The backend expects amount in kobo, type: 'EXPENSE' or 'INCOME', categoryId
      const amountKobo = Math.round((newTransaction.amount) * 100);

      const payload = {
        amount: amountKobo,
        type: newTransaction.direction === 'debit' ? 'EXPENSE' : 'INCOME',
        categoryId: newTransaction.category,
        description: newTransaction.description
      };

      const data = await transactions.create(payload as any);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      addToast('Transaction added successfully!', 'success');
    },
    onMutate: async (newTx) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      if (previousTransactions) {
        queryClient.setQueryData<Transaction[]>(['transactions'], old => {
          if (!old) return [];
          const optimisticTx: Transaction = {
            ...newTx,
            id: `temp-${Date.now()}`,
            created_at: new Date().toISOString(),
          };
          return [optimisticTx, ...old];
        });
      }
      return { previousTransactions };
    },
    onError: (err: unknown, _variables, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      if (err instanceof Error) {
        addToast(err.message || 'Failed to add transaction', 'error');
      } else {
        addToast('Failed to add transaction', 'error');
      }
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
