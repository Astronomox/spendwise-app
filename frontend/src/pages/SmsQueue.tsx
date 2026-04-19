import React, { useState } from 'react';
import { useTransactions } from '@/src/hooks/useTransactions';
import { Transaction } from '@/src/types/transactions';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { EditTransactionModal } from '@/src/components/transactions/EditTransactionModal';
import { supabase } from '@/src/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshIcon, CheckCircleIcon } from '@/src/components/ui/icons';
import { formatNaira } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full bg-[var(--color-bg-secondary)]"
    >
      <div className="px-[24px] pt-[32px] pb-[16px] border-b border-[var(--color-border)] shrink-0">
        <h1 className="text-[28px] font-bold font-display tracking-tight leading-tight">SMS Review Queue</h1>
        <p className="text-[var(--color-text-secondary)] text-[15px] font-[500]">Review and confirm your auto-logged transactions.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 p-[16px] space-y-[16px]">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-[150px] skeleton rounded-[16px]"></div>
          ))}
        </div>
      ) : pendingTransactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-[16px] p-[24px]">
          <div className="w-[64px] h-[64px] bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center text-[var(--color-success)]">
            <CheckCircleIcon size={32} strokeWidth={3} />
          </div>
          <div className="space-y-[4px]">
            <h3 className="font-bold text-[20px] font-display text-[var(--color-text-primary)]">You're all caught up</h3>
            <p className="text-[15px] font-[500] text-[var(--color-text-secondary)]">No new transactions to review.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-[24px] space-y-[16px] pb-[96px]">
          <AnimatePresence>
            {pendingTransactions.map(t => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-[20px] space-y-[16px] border-[var(--color-border)]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[16px] text-[var(--color-text-primary)]">{t.merchant || t.description}</p>
                      <p className="text-[var(--color-text-secondary)] text-[13px] font-[500]">{new Date(t.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[16px] text-[var(--color-text-primary)]">
                        {formatNaira(t.amount)}
                      </p>
                      <div className="inline-block mt-[4px] px-[8px] py-[2px] bg-[rgba(0,135,81,0.1)] text-[var(--color-accent)] rounded-[4px] text-[11px] uppercase tracking-wider font-bold">
                        {t.category}
                      </div>
                    </div>
                  </div>

                  {t.raw_sms && (
                    <div className="bg-[var(--color-bg-elevated)] p-[12px] rounded-[8px] border border-[var(--color-border)]">
                      <p className="text-[12px] text-[var(--color-text-muted)] font-mono break-words leading-relaxed">{t.raw_sms}</p>
                    </div>
                  )}

                  <div className="flex gap-[8px] pt-[8px]">
                    <Button
                      variant="tertiary"
                      size="sm"
                      className="flex-1 text-[var(--color-danger)] hover:bg-[rgba(225,29,72,0.05)] border-[var(--color-border)]"
                      onClick={() => handleDelete(t.id)}
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => setEditingTransaction(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleConfirm(t.id)}
                    >
                      Confirm
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </motion.div>
  );
}
