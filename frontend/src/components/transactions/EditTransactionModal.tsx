// src/components/transactions/EditTransactionModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input  from '@/components/ui/Input';
import { CATEGORIES } from '@/lib/categories';
import { Transaction } from '@/types/transactions';
import { useToastStore } from '@/components/ui/Toast';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen:      boolean;
  onClose:     () => void;
}

export function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
}: EditTransactionModalProps): React.JSX.Element {
  const addToast = useToastStore((s) => s.addToast);

  const [amount,      setAmount]      = useState('');
  const [categoryId,  setCategoryId]  = useState<string>('other');
  const [description, setDescription] = useState('');
  const [date,        setDate]        = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Sync fields when transaction changes
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
      // Stub: edit API not available yet
      await new Promise<void>((r) => setTimeout(r, 500));
      addToast('Transaction updates coming soon.', 'info');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCat = CATEGORIES.find((c) => c.id === categoryId);
  const CatIcon     = selectedCat?.Icon;

  return (
    <AnimatePresence>
      {isOpen && transaction && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-50"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => { if (info.offset.y > 100) onClose(); }}
            className="fixed bottom-0 left-0 right-0 bg-forge-surface rounded-t-3xl z-50 h-[85vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-8 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-6 pb-4 border-b border-white/[0.06] shrink-0">
              <h2 className="text-[18px] font-bold text-cream font-display">Edit Transaction</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-cream/40 hover:text-cream transition-colors"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              <div className="space-y-4">
                <Input
                  label="Amount"
                  type="number"
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

              {/* Category picker */}
              <div className="space-y-4">
                <label className="text-[12px] font-bold text-cream/40 uppercase tracking-widest block">
                  Category
                </label>

                {/* Selected preview */}
                {selectedCat && CatIcon && (
                  <div className="p-4 bg-forge-elevated rounded-2xl border border-white/[0.06] flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${selectedCat.color}22` }}
                    >
                      <CatIcon size={22} style={{ color: selectedCat.color }} />
                    </div>
                    <p className="text-[15px] font-bold uppercase tracking-wider" style={{ color: selectedCat.color }}>
                      {selectedCat.label}
                    </p>
                  </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.Icon;
                    const active = categoryId === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryId(cat.id)}
                        className={`h-14 flex flex-col items-center justify-center gap-1 rounded-xl border text-[11px] font-bold transition-all ${
                          active
                            ? 'border-rust/50 bg-rust/10 text-rust'
                            : 'border-white/[0.06] bg-forge-elevated text-cream/40 hover:text-cream/70'
                        }`}
                      >
                        <Icon size={16} style={active ? {} : { color: cat.color }} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p className="text-danger text-[13px] font-semibold text-center">{error}</p>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/[0.06] shrink-0 pb-10">
              <Button className="w-full" size="lg" onClick={handleSave} isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
