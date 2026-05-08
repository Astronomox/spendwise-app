// src/hooks/useTransactions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactions as txApi, hasToken, RawTransaction, CreateTransactionPayload } from '@/lib/api';
import { Transaction } from '@/types/transactions';
import { useToastStore } from '@/components/ui/Toast';

// ─── Helpers ───

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

// ─── Hook ───

export function useTransactions() {
  const client   = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  // ── Query ──
  const transactionsQuery = useQuery({
    queryKey: ['transactions'],
    enabled: hasToken(),  // ← don't fire before login
    queryFn: async () => {
      const res = await txApi.list();
      // Backend wraps in { success, data, pagination }
      const rawList = Array.isArray(res) ? res : (res.data ?? []);
      return rawList.map(rawToTransaction);
    },
    staleTime: 30_000,
  });

  // ── Mutation ──
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
      const res = await txApi.create(payload);
      // Backend wraps in { success, data }
      const raw = 'data' in res ? res.data : res;
      return rawToTransaction(raw as RawTransaction);
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
      client.invalidateQueries({ queryKey: ['dashboard'] });
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
