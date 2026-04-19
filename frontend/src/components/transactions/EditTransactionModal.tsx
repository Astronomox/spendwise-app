import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { CategoryPicker, CategoryId, CATEGORIES } from '@/src/components/logger/CategoryPicker';
import { CloseIcon } from '@/src/components/ui/icons';
import { Transaction } from '@/src/types/transactions';
import { useQueryClient } from '@tanstack/react-query';
import { useToastStore } from '@/src/components/ui/Toast';

interface EditModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, isOpen, onClose }: EditModalProps) {
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.category);
      setDescription(transaction.description);
      setDate(new Date(transaction.date).toISOString().split('T')[0]);
    }
  }, [transaction]);

  const { addToast } = useToastStore();

  const handleSave = async () => {
    if (!transaction || !amount || !categoryId || !date) return;

    setIsSubmitting(true);
    setError(null);
    try {
      // Stub: in a real app you'd call a save-transaction API here
      await new Promise(resolve => setTimeout(resolve, 500));

      addToast('Transaction updates coming soon.', 'warning');
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to update transaction.');
      } else {
        setError('Failed to update transaction.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.id === categoryId);
  const CategoryIcon = selectedCategory?.Icon;

  return (
    <AnimatePresence>
      {isOpen && transaction && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[rgba(0,0,0,0.5)] backdrop-blur-[4px] z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 bg-[var(--color-bg-secondary)] rounded-t-[24px] z-50 h-[85vh] flex flex-col shadow-[var(--shadow-shadow-lg)]"
          >
            <div className="flex justify-center py-[8px] shrink-0">
              <div className="w-[30px] h-[3px] bg-[var(--color-border)] rounded-full" />
            </div>

            <div className="flex justify-between items-center px-[24px] pb-[16px] border-b border-[var(--color-border)] shrink-0">
              <h2 className="text-[18px] font-bold font-display">Edit Transaction</h2>
              <button onClick={onClose} className="p-[8px] -mr-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" aria-label="Close edit modal">
                <CloseIcon size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-[24px] py-[24px] space-y-[32px]">
              <div className="space-y-[16px]">
                <Input
                  label="Amount"
                  type="number"
                  isCurrency
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Input
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onClear={() => setDescription('')}
                />
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-[16px]">
                <label className="text-[13px] font-[500] text-[var(--color-text-secondary)] uppercase tracking-widest block">Category</label>
                <div className="p-[16px] bg-[var(--color-bg-elevated)] rounded-[16px] border border-[var(--color-border)] flex items-center gap-[12px]">
                  <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${selectedCategory?.color} 15%, transparent)` }}>
                    {CategoryIcon && <CategoryIcon size={24} style={{ color: selectedCategory?.color }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold uppercase tracking-wider" style={{ color: selectedCategory?.color }}>
                      {selectedCategory?.label}
                    </p>
                  </div>
                </div>
                <div className="pt-[16px]">
                  <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />
                </div>
              </div>

              {error && (
                <p className="text-[var(--color-danger)] text-[13px] font-[600] text-center">
                  {error}
                </p>
              )}
            </div>

            <div className="p-[24px] border-t border-[var(--color-border)] shrink-0 bg-[var(--color-bg-secondary)] pb-[40px]">
              <Button
                className="w-full"
                size="lg"
                onClick={handleSave}
                isLoading={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
