// src/pages/SmsQueue.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useToastStore }   from '@/components/ui/Toast';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';
import Button from '@/components/ui/Button';
import { Transaction } from '@/types/transactions';
import { formatNaira } from '@/lib/utils';

export default function SmsQueuePage(): React.JSX.Element {
  const { transactions, isLoading }  = useTransactions();
  const addToast                     = useToastStore((s) => s.addToast);
  const [editing, setEditing]        = useState<Transaction | null>(null);

  const pending = transactions.filter((t) => t.status === 'pending');

  const handleConfirm = (_id: string) => {
    addToast('SMS confirming coming soon.', 'info');
  };

  const handleDismiss = (id: string) => {
    if (!window.confirm('Are you sure you want to dismiss this transaction?')) return;
    addToast('SMS deletion coming soon.', 'info');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="pt-8 pb-4 border-b border-white/[0.06] shrink-0">
        <h1 className="text-[28px] font-black font-display text-cream tracking-tight">
          SMS Review Queue
        </h1>
        <p className="text-cream/50 text-[15px] font-medium mt-1">
          Review and confirm your auto-logged transactions.
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 pt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-full h-36 rounded-2xl bg-forge-elevated animate-pulse" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <CheckCircle size={32} className="text-emerald-400" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-black text-[20px] font-display text-cream">You're all caught up</h3>
            <p className="text-[15px] font-medium text-cream/50 mt-1">No new transactions to review.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pt-6 space-y-4 pb-24">
          <AnimatePresence>
            {pending.map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="p-5 bg-forge-surface rounded-2xl border border-white/[0.06] space-y-4"
              >
                {/* Row 1: merchant + amount */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-[16px] text-cream">
                      {t.merchant ?? t.description}
                    </p>
                    <p className="text-cream/40 text-[13px] font-medium">
                      {new Date(t.date).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[16px] text-cream">{formatNaira(t.amount)}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-rust/10 text-rust rounded text-[11px] uppercase tracking-wide font-bold">
                      {t.category}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="danger"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDismiss(t.id)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditing(t)}
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <EditTransactionModal
        transaction={editing}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
      />
    </motion.div>
  );
}
