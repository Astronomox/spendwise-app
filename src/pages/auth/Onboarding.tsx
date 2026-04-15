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
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences. Please try again.');
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
      <div className="px-6 py-8 pb-4 shrink-0">
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-1 flex-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: step >= i ? '100%' : '0%' }}
                className="h-full bg-accent"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                  <HomeIcon size={24} />
                </div>
                <h1 className="text-[28px] font-black tracking-tight leading-tight">Where do you bank?</h1>
                <p className="text-text-secondary text-[15px]">Select your primary bank account.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {BANKS.map(bank => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={cn(
                      "p-4 rounded-radius-md border text-left flex justify-between items-center transition-all",
                      selectedBank === bank
                        ? "border-accent bg-accent/5 ring-1 ring-accent"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <span className={cn(
                      "font-bold text-[14px]",
                      selectedBank === bank ? "text-accent" : "text-text-primary"
                    )}>
                      {bank}
                    </span>
                    {selectedBank === bank && <CheckCircleIcon size={18} className="text-accent" />}
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
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                  <SavingsCategoryIcon size={24} />
                </div>
                <h1 className="text-[28px] font-black tracking-tight leading-tight">What do you spend on?</h1>
                <p className="text-text-secondary text-[15px]">Select the categories you care about most.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={cn(
                      "px-4 py-2 rounded-full border font-bold text-[13px] transition-all",
                      selectedCategories.includes(cat)
                        ? "border-accent bg-accent text-white shadow-sm"
                        : "border-gray-200 text-text-secondary hover:border-gray-300"
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
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center text-accent mb-4">
                  <NotificationIcon size={24} />
                </div>
                <h1 className="text-[28px] font-black tracking-tight leading-tight">Automate your tracking</h1>
                <p className="text-text-secondary text-[15px]">Allow SpendWise to read transaction SMS from your bank and auto-categorize your spending.</p>
              </div>

              <div
                className={cn(
                  "p-5 rounded-radius-md border flex gap-4 transition-all cursor-pointer",
                  smsOptIn ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-gray-200"
                )}
                onClick={() => setSmsOptIn(!smsOptIn)}
              >
                <div className="pt-1">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    smsOptIn ? "border-accent bg-accent" : "border-gray-300"
                  )}>
                    {smsOptIn && <CheckCircleIcon size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[15px] mb-1 text-text-primary">Enable SMS Tracking</p>
                  <p className="text-[13px] text-text-secondary leading-relaxed">We only read messages from official bank senders. Your data never leaves your device unencrypted.</p>
                </div>
              </div>

              {error && step === 3 && (
                <p className="text-danger text-[13px] font-bold mt-4 animate-in fade-in">
                  {error}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent pt-12">
        <Button
          className="w-full h-14 text-[16px]"
          onClick={nextStep}
          disabled={(step === 1 && !selectedBank) || isSubmitting}
          isLoading={isSubmitting}
        >
          {step === 3 ? "Complete Setup" : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
}
