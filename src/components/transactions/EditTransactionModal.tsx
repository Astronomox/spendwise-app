import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { CategoryPicker, CategoryId, CATEGORIES } from '@/src/components/logger/CategoryPicker';
import { CloseIcon } from '@/src/components/ui/icons';
import { Transaction } from '@/src/types/transactions';
import { supabase } from '@/src/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

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

  const handleSave = async () => {
    if (!transaction || !amount || !categoryId || !date) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          amount: Number(amount),
          category: categoryId,
          description: description || `Spent on ${categoryId}`,
          date: date,
        })
        .eq('id', transaction.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update transaction.');
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
            className="fixed inset-0 bg-black/40 z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-radius-xl z-50 h-[85vh] flex flex-col"
          >
            <div className="flex justify-center p-3 shrink-0">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>

            <div className="flex justify-between items-center px-6 pb-4 border-b border-gray-100 shrink-0">
              <h2 className="text-[18px] font-black">Edit Transaction</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-text-secondary">
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <Input
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="font-bold text-[24px] h-14"
                />
                <Input
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[12px] font-bold text-text-secondary uppercase tracking-widest">Category</label>
                <div className="p-4 bg-bg-elevated rounded-radius-lg border border-gray-100 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${selectedCategory?.color}15` }}>
                    {CategoryIcon && <CategoryIcon size={24} style={{ color: selectedCategory?.color }} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-bold uppercase tracking-wider" style={{ color: selectedCategory?.color }}>
                      {selectedCategory?.label}
                    </p>
                  </div>
                </div>
                <CategoryPicker selectedId={categoryId} onSelect={setCategoryId} />
              </div>

              {error && (
                <p className="text-danger text-[13px] font-bold text-center">
                  {error}
                </p>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 shrink-0 bg-white pb-10">
              <Button
                className="w-full h-14"
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
