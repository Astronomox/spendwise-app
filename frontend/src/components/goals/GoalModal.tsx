// src/components/goals/GoalModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input  from '@/components/ui/Input';
import { CATEGORIES } from '@/lib/categories';
import type { Goal, GoalFormValues } from '@/types/goals';

interface GoalModalProps {
  goal:    Goal | null;
  isOpen:  boolean;
  onClose: () => void;
  onSave:  (values: GoalFormValues) => Promise<void>;
}

export function GoalModal({ goal, isOpen, onClose, onSave }: GoalModalProps): React.JSX.Element {
  const [name,         setName]         = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline,     setDeadline]     = useState('');
  const [icon,         setIcon]         = useState('savings');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // Default deadline: 3 months from now
  const defaultDeadline = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (goal && isOpen) {
      setName(goal.name);
      setTargetAmount(goal.targetAmount.toString());
      setDeadline(goal.deadline.split('T')[0]);
      setIcon(goal.icon);
    } else if (isOpen) {
      setName('');
      setTargetAmount('');
      setDeadline(defaultDeadline());
      setIcon('savings');
    }
    setError(null);
  }, [goal, isOpen]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Give your goal a name.');
      return;
    }
    if (!targetAmount || Number(targetAmount) <= 0) {
      setError('Target amount must be greater than 0.');
      return;
    }
    if (!deadline) {
      setError('Pick a deadline.');
      return;
    }
    if (new Date(deadline) <= new Date()) {
      setError('Deadline must be in the future.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onSave({
        name:         name.trim(),
        targetAmount: Number(targetAmount),
        deadline:     new Date(deadline).toISOString(),
        icon,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save goal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compute days until deadline for preview
  const daysUntil = deadline
    ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000))
    : 0;
  const dailySave = daysUntil > 0 && Number(targetAmount) > 0
    ? Math.ceil(Number(targetAmount) / daysUntil)
    : 0;

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
                placeholder="e.g., New Laptop, Emergency Fund"
              />

              <Input
                label="Target Amount (₦)"
                type="number"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="e.g., 500000"
              />

              {/* Deadline picker */}
              <div>
                <label className="text-[12px] font-bold text-cream/40 uppercase tracking-widest block mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full h-12 px-4 rounded-2xl bg-forge-elevated border border-white/[0.06] text-cream text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-rust/30 focus:border-rust transition-all"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Icon selector */}
              <div>
                <label className="text-[12px] font-bold text-cream/40 uppercase tracking-widest block mb-3">
                  Category Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => {
                    const CatIcon = cat.Icon;
                    const selected = icon === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setIcon(cat.id)}
                        className={`h-12 flex items-center justify-center rounded-xl border transition-all ${
                          selected
                            ? 'border-rust bg-rust/15 ring-1 ring-rust/40'
                            : 'border-white/[0.06] bg-forge-elevated hover:border-white/[0.12]'
                        }`}
                        title={cat.label}
                      >
                        <CatIcon size={18} style={{ color: selected ? cat.color : `${cat.color}80` }} />
                        {selected && (
                          <Check size={10} className="absolute top-0.5 right-0.5 text-rust" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preview card */}
              {Number(targetAmount) > 0 && daysUntil > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-rust/8 border border-rust/15"
                >
                  <p className="text-[12px] text-cream/50 font-medium mb-1">
                    To hit your goal in {daysUntil} days, save
                  </p>
                  <p className="text-[20px] font-extrabold font-display text-rust-light">
                    ₦{dailySave.toLocaleString('en-NG')}<span className="text-[13px] text-cream/40 font-normal">/day</span>
                  </p>
                </motion.div>
              )}

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
