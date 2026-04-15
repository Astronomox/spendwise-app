import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CategoryPicker, CategoryId, CATEGORIES } from '@/src/components/logger/CategoryPicker';
import { AmountInput } from '@/src/components/logger/AmountInput';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { 
  ArrowLeftIcon, 
  CheckCircleIcon, 
  RefreshIcon 
} from '@/src/components/ui/icons';
import { motion, AnimatePresence } from 'motion/react';
import { useTransactions } from '@/src/hooks/useTransactions';
import { useAppStore } from '@/src/lib/store';
import { formatNaira } from '@/src/lib/utils';

export default function LoggerPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { addTransaction } = useTransactions();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [categoryId, setCategoryId] = useState<CategoryId | null>(null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCategorySelect = (id: CategoryId) => {
    setCategoryId(id);
    setStep(2);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    
    if (!categoryId || !user) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      await addTransaction({
        user_id: user.id,
        amount: Number(amount),
        category: categoryId,
        description: note || `Spent on ${categoryId}`,
        merchant: null,
        date: new Date().toISOString(),
        source: 'manual',
        status: 'confirmed',
        direction: 'debit',
      });

      setIsSubmitting(false);
      setShowSuccess(true);
      if (navigator.vibrate) navigator.vibrate(50);
      
      // Reset and navigate after success
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setIsSubmitting(false);
      setError('Failed to save transaction. Please try again.');
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.id === categoryId);
  const CategoryIcon = selectedCategory?.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full bg-[var(--color-bg-secondary)]"
    >
      {/* Header */}
      <header className="px-[24px] h-[56px] flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate(-1)}
          className="p-[8px] -ml-[8px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="text-[18px] font-bold font-display">Log Expense</h1>
        <div className="w-[40px]" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto p-[24px]">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-[32px]"
            >
              <div className="space-y-[8px]">
                <h2 className="text-[28px] font-bold font-display tracking-tight leading-tight">What did you spend on?</h2>
                <p className="text-[var(--color-text-secondary)] text-[15px] font-[500]">Select a category to continue.</p>
              </div>
              <CategoryPicker selectedId={categoryId} onSelect={handleCategorySelect} />
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-[32px] flex flex-col h-full"
            >
              <div className="flex items-center gap-[12px] p-[16px] bg-[var(--color-bg-elevated)] rounded-[16px] border border-[var(--color-border)] shadow-[var(--shadow-shadow-sm)] shrink-0">
                <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `color-mix(in srgb, ${selectedCategory?.color} 15%, transparent)` }}>
                  {CategoryIcon && <CategoryIcon size={24} style={{ color: selectedCategory?.color }} />}
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold uppercase tracking-wider" style={{ color: selectedCategory?.color }}>
                    {selectedCategory?.label}
                  </p>
                  <p className="text-[12px] text-[var(--color-text-secondary)] font-[500]">Tap to change category</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="rounded-full">Change</Button>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <AmountInput
                  value={amount}
                  onChange={(val) => {
                    setAmount(val);
                    if (error) setError(null);
                  }}
                />
              </div>

              {error && (
                <p className="text-[var(--color-danger)] text-[13px] font-[600] text-center animate-in fade-in slide-in-from-top-1 shrink-0">
                  {error}
                </p>
              )}

              <div className="space-y-[16px] shrink-0 mt-auto pt-[16px]">
                <Input 
                  label="Note (Optional)" 
                  placeholder="What was this for?" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onClear={() => setNote('')}
                />
                <Button 
                  className="w-full" 
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                  disabled={!amount || Number(amount) <= 0}
                >
                  Log Expense
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-accent flex flex-col items-center justify-center text-white p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <CheckCircleIcon size={80} strokeWidth={3} />
            </motion.div>
            <div className="mt-6 space-y-2">
              <h2 className="text-[32px] font-black">Logged!</h2>
              <p className="text-[18px] opacity-90 font-medium">
                {formatNaira(Number(amount))} added to {selectedCategory?.label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
