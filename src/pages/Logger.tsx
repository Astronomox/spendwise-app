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
      className="flex flex-col h-full bg-white"
    >
      {/* Header */}
      <header className="px-6 h-[56px] flex items-center justify-between border-b border-gray-100 shrink-0">
        <button 
          onClick={() => step === 2 ? setStep(1) : navigate(-1)}
          className="p-2 -ml-2 text-text-secondary"
        >
          <ArrowLeftIcon size={20} />
        </button>
        <h1 className="text-[16px] font-bold">Log Expense</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <h2 className="text-[24px] font-black">What did you spend on?</h2>
                <p className="text-text-secondary">Select a category to continue.</p>
              </div>
              <CategoryPicker selectedId={categoryId} onSelect={handleCategorySelect} />
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 p-4 bg-bg-elevated rounded-radius-lg border border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedCategory?.color}15` }}>
                  {CategoryIcon && <CategoryIcon size={24} style={{ color: selectedCategory?.color }} />}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-bold uppercase tracking-wider" style={{ color: selectedCategory?.color }}>
                    {selectedCategory?.label}
                  </p>
                  <p className="text-[11px] text-text-secondary">Tap to change category</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Change</Button>
              </div>

              <AmountInput 
                value={amount} 
                onChange={(val) => {
                  setAmount(val);
                  if (error) setError(null);
                }} 
              />

              {error && (
                <p className="text-danger text-[12px] font-bold text-center animate-in fade-in slide-in-from-top-1">
                  {error}
                </p>
              )}

              <div className="space-y-4">
                <Input 
                  label="Note (Optional)" 
                  placeholder="What was this for?" 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <Button 
                  className="w-full" 
                  size="lg"
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
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
