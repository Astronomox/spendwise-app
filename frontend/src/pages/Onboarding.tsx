// src/pages/Onboarding.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, PiggyBank, Bell, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const BANKS = ['GTBank', 'Access Bank', 'Zenith Bank', 'UBA', 'First Bank', 'Other'];
const SPEND_CATS = ['Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Entertainment', 'Savings', 'Other'];

const STEPS = [
  { label: 'Bank',       Icon: Home      },
  { label: 'Categories', Icon: PiggyBank },
  { label: 'SMS',        Icon: Bell      },
] as const;

export default function OnboardingPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [step,               setStep]               = useState(1);
  const [selectedBank,       setSelectedBank]       = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [smsOptIn,           setSmsOptIn]           = useState(true);
  const [isSubmitting,       setIsSubmitting]       = useState(false);
  const [error,              setError]              = useState<string | null>(null);

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await new Promise<void>((r) => setTimeout(r, 500));
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
    else handleComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col h-screen bg-forge-bg relative overflow-hidden"
    >
      {/* Progress bar */}
      <div className="px-6 pt-8 pb-4 shrink-0">
        <div className="flex gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-forge-elevated rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: step > i ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="h-full bg-rust"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          {/* Step 1 — Bank */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="space-y-6"
            >
              <div>
                <div className="w-12 h-12 bg-rust/15 rounded-full flex items-center justify-center text-rust mb-4">
                  <Home size={22} />
                </div>
                <h1 className="text-[28px] font-black font-display text-cream tracking-tight leading-tight">
                  Where do you bank?
                </h1>
                <p className="text-cream/50 text-[15px] font-medium mt-1">
                  Select your primary bank account.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {BANKS.map((bank) => {
                  const active = selectedBank === bank;
                  return (
                    <button
                      key={bank}
                      onClick={() => setSelectedBank(bank)}
                      className={cn(
                        'p-4 rounded-2xl border text-left flex justify-between items-center transition-all',
                        active
                          ? 'border-rust/60 bg-rust/10 ring-1 ring-rust/40'
                          : 'border-white/[0.08] bg-forge-elevated hover:border-white/20'
                      )}
                    >
                      <span className={cn('font-bold text-[14px]', active ? 'text-rust' : 'text-cream/70')}>
                        {bank}
                      </span>
                      {active && <CheckCircle size={16} className="text-rust shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Categories */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="space-y-6"
            >
              <div>
                <div className="w-12 h-12 bg-rust/15 rounded-full flex items-center justify-center text-rust mb-4">
                  <PiggyBank size={22} />
                </div>
                <h1 className="text-[28px] font-black font-display text-cream tracking-tight leading-tight">
                  What do you spend on?
                </h1>
                <p className="text-cream/50 text-[15px] font-medium mt-1">
                  Select the categories you care about most.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {SPEND_CATS.map((cat) => {
                  const active = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        'px-4 py-2 rounded-full border font-bold text-[13px] transition-all',
                        active
                          ? 'border-rust bg-rust text-white shadow-rust'
                          : 'border-white/[0.08] text-cream/50 hover:border-white/25'
                      )}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Step 3 — SMS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="space-y-6"
            >
              <div>
                <div className="w-12 h-12 bg-rust/15 rounded-full flex items-center justify-center text-rust mb-4">
                  <Bell size={22} />
                </div>
                <h1 className="text-[28px] font-black font-display text-cream tracking-tight leading-tight">
                  Automate your tracking
                </h1>
                <p className="text-cream/50 text-[15px] font-medium mt-1">
                  Allow SpendWise to read transaction SMS and auto-categorize your spending.
                </p>
              </div>

              <button
                onClick={() => setSmsOptIn(!smsOptIn)}
                className={cn(
                  'w-full p-5 rounded-2xl border text-left flex gap-4 transition-all',
                  smsOptIn
                    ? 'border-rust/60 bg-rust/10 ring-1 ring-rust/40'
                    : 'border-white/[0.08] bg-forge-elevated'
                )}
              >
                <div className={cn(
                  'mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  smsOptIn ? 'border-rust bg-rust' : 'border-white/20'
                )}>
                  {smsOptIn && <CheckCircle size={11} className="text-white" strokeWidth={3} />}
                </div>
                <div>
                  <p className="font-bold text-[15px] text-cream mb-1">Enable SMS Tracking</p>
                  <p className="text-[13px] text-cream/50 leading-relaxed">
                    We only read messages from official bank senders. Your data never leaves your device unencrypted.
                  </p>
                </div>
              </button>

              {error && (
                <p className="text-danger text-[13px] font-semibold">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-forge-bg via-forge-bg/95 to-transparent pt-12">
        <Button
          className="w-full"
          size="lg"
          onClick={nextStep}
          disabled={(step === 1 && !selectedBank) || isSubmitting}
          isLoading={isSubmitting}
        >
          {step === 3 ? "Let's go →" : 'Continue'}
        </Button>
      </div>
    </motion.div>
  );
}
