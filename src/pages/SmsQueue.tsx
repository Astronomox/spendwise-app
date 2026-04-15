import React, { useState } from 'react';
import { useTransactions } from '@/src/hooks/useTransactions';
import { Transaction } from '@/src/types/transactions';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { EditTransactionModal } from '@/src/components/transactions/EditTransactionModal';
import { supabase } from '@/src/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshIcon } from '@/src/components/ui/icons';
import { formatNaira } from '@/src/lib/utils';

export default function SmsQueuePage() {
  const queryClient = useQueryClient();
  const { transactions, isLoading } = useTransactions();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  const handleConfirm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'confirmed' })
        .eq('id', id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    } catch (e) {
      console.error('Failed to confirm transaction', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to dismiss this transaction?')) return;
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (e) {
      console.error('Failed to delete transaction', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-6">
      <h1 className="text-[24px] font-black tracking-tight text-accent mb-2">SMS Review Queue</h1>
      <p className="text-text-secondary mb-6">Review and confirm your auto-logged transactions.</p>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <RefreshIcon className="animate-spin text-accent" size={32} />
        </div>
      ) : pendingTransactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-text-secondary font-medium">No pending transactions to review.</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-y-auto pb-10">
          {pendingTransactions.map(t => (
            <Card key={t.id} className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-[16px]">{t.merchant || t.description}</p>
                  <p className="text-text-secondary text-[12px]">{new Date(t.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[16px] text-text-primary">
                    {formatNaira(t.amount)}
                  </p>
                  <p className="text-accent text-[12px] uppercase tracking-wider font-bold mt-1">{t.category}</p>
                </div>
              </div>

              {t.raw_sms && (
                <div className="bg-bg-elevated p-3 rounded-radius-sm">
                  <p className="text-[11px] text-text-secondary font-mono break-words">{t.raw_sms}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDelete(t.id)}
                >
                  Dismiss
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingTransaction(t)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleConfirm(t.id)}
                >
                  Confirm
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </div>
  );
}
