// src/components/goals/DepositModal.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input  from '@/components/ui/Input';
import { formatNaira } from '@/lib/utils';
import type { Goal } from '@/types/goals';

interface DepositModalProps {
  goal:      Goal | null;
  isOpen:    boolean;
  onClose:   () => void;
  onDeposit: (goalId: string, amount: number, note?: string) => Promise<void>;
}

export function DepositModal({ goal, isOpen, onClose, onDeposit }: DepositModalProps): React.JSX.Element {
  const [amount,       setAmount]       = useState('');
  const [note,         setNote]         = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setNote('');
      setError(null);
    }
  }, [isOpen]);

  if (!goal) return <></>;

  const remaining = goal.targetAmount - goal.currentAmount;
  const quickAmounts = [
    Math.ceil(remaining * 0.1),
    Math.ceil(remaining * 0.25),
    Math.ceil(remaining * 0.5),
    remaining,
  ].filter((v, i, arr) => v > 0 && arr.indexOf(v) === i);

  const handleDeposit = async () => {
    const val = Number(amount);
    if (!val || val <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    if (val > remaining) {
      setError(`You only need ${formatNaira(remaining)} more to complete this goal.`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onDeposit(goal.id, val, note.trim() || undefined);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deposit failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pct = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;
  const newPct = Number(amount) > 0
    ? Math.min(100, Math.round(((goal.currentAmount + Number(amount)) / goal.targetAmount) * 100))
    : pct;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-50"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, info) => { if (info.offset.y > 100) onClose(); }}
            className="fixed bottom-0 left-0 right-0 bg-forge-surface rounded-t-3xl z-50 max-h-[85vh] flex flex-col"
          >
            {/* Drag handle */}
            <div className="flex justify-center py-2 shrink-0">
              <div className="w-8 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex justify-between items-center px-6 pb-4 border-b border-white/[0.06] shrink-0">
              <div>
                <h2 className="text-[18px] font-bold text-cream font-display">
                  Add to Savings
                </h2>
                <p className="text-[13px] text-cream/40 mt-0.5">{goal.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-cream/40 hover:text-cream transition-colors"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {/* Progress preview */}
              <div className="p-4 rounded-2xl bg-forge-elevated border border-white/[0.06]">
                <div className="flex justify-between text-[12px] text-cream/50 mb-2">
                  <span>{formatNaira(goal.currentAmount)} saved</span>
                  <span>{formatNaira(goal.targetAmount)}</span>
                </div>
                <div className="h-3 rounded-full bg-forge-muted overflow-hidden relative">
                  {/* Current progress */}
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-progress-rust"
                    initial={{ width: `${pct}%` }}
                    animate={{ width: `${pct}%` }}
                  />
                  {/* Preview of new progress */}
                  {newPct > pct && (
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      initial={{ width: `${pct}%` }}
                      animate={{ width: `${newPct}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{
                        background: 'linear-gradient(90deg, #D4541A, #2DB37A)',
                        opacity: 0.6,
                      }}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[11px] text-cream/40">{pct}%</span>
                  {newPct > pct && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[11px] text-success font-bold"
                    >
                      → {newPct}%
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Amount input */}
              <Input
                label="Amount (₦)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 10000"
              />

              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map(qa => (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => setAmount(qa.toString())}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all ${
                      Number(amount) === qa
                        ? 'bg-rust/20 text-rust-light border border-rust/30'
                        : 'bg-forge-elevated text-cream/50 border border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    {qa >= remaining ? 'Complete' : formatNaira(qa)}
                  </button>
                ))}
              </div>

              {/* Note */}
              <div>
                <label className="text-[12px] font-bold text-cream/40 uppercase tracking-widest block mb-2">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Birthday money"
                  className="w-full h-12 px-4 rounded-2xl bg-forge-elevated border border-white/[0.06] text-cream text-[14px] font-medium placeholder:text-cream/20 focus:outline-none focus:ring-2 focus:ring-rust/30 focus:border-rust transition-all"
                />
              </div>

              {error && (
                <p className="text-danger text-[13px] font-semibold text-center">{error}</p>
              )}
            </div>

            <div className="p-6 border-t border-white/[0.06] shrink-0 pb-10">
              <Button className="w-full" size="lg" onClick={handleDeposit} isLoading={isSubmitting}>
                <ArrowUpRight size={16} /> Deposit {Number(amount) > 0 ? formatNaira(Number(amount)) : ''}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
