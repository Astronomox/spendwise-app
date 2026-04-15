import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/utils';
import { useAppStore } from '@/src/lib/store';
import { supabase } from '@/src/lib/supabase';
import { CheckCircleIcon, SavingsCategoryIcon, NotificationIcon, HomeIcon } from '@/src/components/ui/icons';

const BANKS = ['GTBank', 'Access Bank', 'Zenith Bank', 'UBA', 'First Bank', 'Other'];
const CATEGORIES = ['Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Entertainment', 'Savings', 'Other'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();

  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [smsOptIn, setSmsOptIn] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleComplete = async () => {
    if (!user) {
      navigate('/dashboard');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          preferences: {
            bank: selectedBank,
            categories: selectedCategories,
            sms_opt_in: smsOptIn
          }
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      navigate('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to save preferences. Please try again.');
      } else {
        setError('Failed to save preferences. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full bg-white relative"
    >
      <div className="px-[24px] py-[32px] pb-[16px] shrink-0">
        <div className="flex gap-[8px] mb-[32px]">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[4px] flex-1 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: step >= i ? '100%' : '0%' }}
                className="h-full bg-[var(--color-accent)]"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-[24px] pb-[96px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-[24px]"
            >
              <div className="space-y-[8px]">
                <div className="w-[48px] h-[48px] bg-[rgba(0,135,81,0.1)] rounded-full flex items-center justify-center text-[var(--color-accent)] mb-[16px]">
                  <HomeIcon size={24} />
                </div>
                <h1 className="text-[28px] font-bold tracking-tight leading-tight font-display">Where do you bank?</h1>
                <p className="text-[var(--color-text-secondary)] text-[15px] font-[500]">Select your primary bank account.</p>
              </div>

              <div className="grid grid-cols-2 gap-[12px]">
                {BANKS.map(bank => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={cn(
                      "p-[16px] rounded-[12px] border-[1px] border-solid text-left flex justify-between items-center transition-all",
                      selectedBank === bank
                        ? "border-[var(--color-accent)] bg-[rgba(0,135,81,0.05)] ring-[1px] ring-[var(--color-accent)]"
                        : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]"
                    )}
                    )}
                  >
                    <span className={cn(
                      "font-bold text-[14px]",
                      selectedBank === bank ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"
                    )}>
                      {bank}
                    </span>
                    {selectedBank === bank && <CheckCircleIcon size={18} className="text-[var(--color-accent)]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-[24px]"
            >
              <div className="space-y-[8px]">
                <div className="w-[48px] h-[48px] bg-[rgba(0,135,81,0.1)] rounded-full flex items-center justify-center text-[var(--color-accent)] mb-[16px]">
                  <SavingsCategoryIcon size={24} />
                </div>
                <h1 className="text-[28px] font-bold tracking-tight leading-tight font-display">What do you spend on?</h1>
                <p className="text-[var(--color-text-secondary)] text-[15px] font-[500]">Select the categories you care about most.</p>
              </div>

              <div className="flex flex-wrap gap-[8px]">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "px-[16px] py-[8px] rounded-[9999px] border-[1px] border-solid font-bold text-[13px] transition-all",
                      selectedCategories.includes(cat)
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white shadow-[var(--shadow-shadow-sm)]"
                        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]"
                    )}
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-[24px]"
            >
              <div className="space-y-[8px]">
                <div className="w-[48px] h-[48px] bg-[rgba(0,135,81,0.1)] rounded-full flex items-center justify-center text-[var(--color-accent)] mb-[16px]">
                  <NotificationIcon size={24} />
                </div>
                <h1 className="text-[28px] font-bold tracking-tight leading-tight font-display">Automate your tracking</h1>
                <p className="text-[var(--color-text-secondary)] text-[15px] font-[500]">Allow SpendWise to read transaction SMS from your bank and auto-categorize your spending.</p>
              </div>

              <div
                className={cn(
                  "p-[20px] rounded-[12px] border-[1px] border-solid flex gap-[16px] transition-all cursor-pointer",
                  smsOptIn ? "border-[var(--color-accent)] bg-[rgba(0,135,81,0.05)] ring-[1px] ring-[var(--color-accent)]" : "border-[var(--color-border)]"
                )}
                onClick={() => setSmsOptIn(!smsOptIn)}
              >
                <div className="pt-[4px]">
                  <div className={cn(
                    "w-[20px] h-[20px] rounded-full border-[2px] flex items-center justify-center transition-colors",
                    smsOptIn ? "border-[var(--color-accent)] bg-[var(--color-accent)]" : "border-[var(--color-border)]"
                  )}>
                    {smsOptIn && <CheckCircleIcon size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[15px] mb-[4px] text-[var(--color-text-primary)]">Enable SMS Tracking</p>
                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">We only read messages from official bank senders. Your data never leaves your device unencrypted.</p>
                </div>
              </div>

              {error && step === 3 && (
                <p className="text-[var(--color-danger)] text-[13px] font-bold mt-[16px] animate-in fade-in">
                  {error}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-[24px] bg-gradient-to-t from-white via-white to-transparent pt-[48px]">
        <Button
          className="w-full"
          size="lg"
          onClick={nextStep}
          disabled={(step === 1 && !selectedBank) || isSubmitting}
          isLoading={isSubmitting}
        >
          {step === 3 ? "Let's go →" : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
}
