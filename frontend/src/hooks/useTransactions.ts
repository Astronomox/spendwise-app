// src/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactions as txApi, RawTransaction, CreateTransactionPayload } from '@/lib/api';
import { Transaction } from '@/types/transactions';
import { useToastStore } from '@/components/ui/Toast';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rawToTransaction(t: RawTransaction): Transaction {
  return {
    id:          t.id ?? t._id ?? '',
    merchant:    null,
    category:    t.categoryId ?? t.category ?? 'other',
    amount:      (t.amount ?? 0) / 100, // kobo → naira
    direction:   t.type === 'INCOME' ? 'credit' : 'debit',
    date:        t.createdAt ?? t.created_at ?? new Date().toISOString(),
    source:      'manual',
    status:      'confirmed',
    description: t.description ?? '',
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTransactions() {
  const client     = useQueryClient();
  const addToast   = useToastStore((s) => s.addToast);

  // ── Query ──────────────────────────────────────────────────────────────────
  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    queryFn:  async () => {
      const raw = await txApi.list();
      return raw.map(rawToTransaction);
    },
    staleTime: 30 * 1000,
  });

  // ── Mutation ───────────────────────────────────────────────────────────────
  const addTransactionMutation = useMutation({
    mutationFn: async (
      newTx: Omit<Transaction, 'id'>
    ): Promise<Transaction> => {
      const payload: CreateTransactionPayload = {
        amount:      Math.round(newTx.amount * 100), // naira → kobo
        type:        newTx.direction === 'credit' ? 'INCOME' : 'EXPENSE',
        categoryId:  newTx.category,
        description: newTx.description,
      };
      const raw = await txApi.create(payload);
      return rawToTransaction(raw);
    },

    // Optimistic update
    onMutate: async (newTx) => {
      await client.cancelQueries({ queryKey: ['transactions'] });
      const previous = client.getQueryData<Transaction[]>(['transactions']);

      if (previous) {
        const optimistic: Transaction = {
          ...newTx,
          id: `temp-${Date.now()}`,
        };
        client.setQueryData<Transaction[]>(['transactions'], (old) =>
          old ? [optimistic, ...old] : [optimistic]
        );
      }
      return { previous };
    },

    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['transactions'] });
      client.invalidateQueries({ queryKey: ['dashboard-summary'] });
      addToast('Transaction added successfully!', 'success');
    },

    onError: (err: unknown, _vars, context) => {
      if (context?.previous) {
        client.setQueryData(['transactions'], context.previous);
      }
      const message = err instanceof Error ? err.message : 'Failed to add transaction';
      addToast(message, 'error');
    },
  });

  return {
    transactions: transactionsQuery.data  ?? [],
    isLoading:    transactionsQuery.isLoading,
    error:        transactionsQuery.error,
    addTransaction: addTransactionMutation.mutateAsync,
    isAdding:       addTransactionMutation.isPending,
  };
}
