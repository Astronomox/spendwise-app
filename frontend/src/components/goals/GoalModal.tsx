// src/components/goals/GoalModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input  from '@/components/ui/Input';
import { CATEGORIES } from '@/lib/categories';
import { Goal, GoalFormValues } from '@/types/goals';

interface GoalModalProps {
  goal:    Goal | null;
  isOpen:  boolean;
  onClose: () => void;
  onSave:  (values: GoalFormValues) => Promise<void>;
}

export function GoalModal({ goal, isOpen, onClose, onSave }: GoalModalProps): React.JSX.Element {
  const [name,         setName]         = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    if (goal && isOpen) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
    } else if (isOpen) {
      setName('');
      setTargetAmount('');
    }
    setError(null);
  }, [goal, isOpen]);

  const handleSave = async () => {
    if (!name || !targetAmount) {
      setError('Please fill in all required fields.');
      return;
    }
    if (Number(targetAmount) <= 0) {
      setError('Target amount must be greater than 0.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({ name, targetAmount: Number(targetAmount) });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => { if (info.offset.y > 100) onClose(); }}
            className="fixed bottom-0 left-0 right-0 bg-forge-surface rounded-t-3xl z-50 max-h-[90vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-8 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-6 pb-4 border-b border-white/[0.06] shrink-0">
              <h2 className="text-[18px] font-bold text-cream font-display">
                {goal ? 'Edit Goal' : 'New Goal'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-cream/40 hover:text-cream transition-colors"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              <Input
                label="Goal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., New Laptop"
              />
              <Input
                label="Target Amount (₦)"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="e.g., 500000"
              />

              {/* Icon hint row */}
              <div>
                <label className="text-[12px] font-bold text-cream/40 uppercase tracking-widest block mb-3">
                  Category Icon (visual only)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.Icon;
                    return (
                      <div
                        key={cat.id}
                        className="h-11 flex items-center justify-center rounded-xl border border-white/[0.06] bg-forge-elevated"
                        title={cat.label}
                      >
                        <Icon size={18} style={{ color: cat.color }} />
                      </div>
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
                {goal ? 'Save Changes' : 'Create Goal'}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
