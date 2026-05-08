// src/pages/Logger.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import type { Category } from '@/lib/categories';
import { formatNaira, cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useTransactions } from '@/hooks/useTransactions';

type Step = 1 | 2;

// ─── Numpad ──────────────────────────────────────────────────

const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'] as const;
type NumpadKey = typeof NUMPAD_KEYS[number];

interface NumpadProps {
  onPress: (key: NumpadKey) => void;
}

function Numpad({ onPress }: NumpadProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto w-full">
      {NUMPAD_KEYS.map((key, i) => (
        <motion.button
          key={i}
          type="button"
          whileTap={key !== '' ? { scale: 0.92 } : undefined}
          onClick={() => key !== '' && onPress(key)}
          className={cn(
            'h-14 rounded-2xl flex items-center justify-center text-[20px] font-bold font-display transition-colors',
            key === '⌫'
              ? 'bg-rust/10 text-rust border border-rust/20'
              : key === ''
                ? 'invisible'
                : 'bg-forge-surface border border-white/[0.07] text-cream hover:bg-forge-elevated'
          )}
        >
          {key}
        </motion.button>
      ))}
    </div>
  );
}

// ─── Category grid ───────────────────────────────────────────

interface CategoryGridProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

function CategoryGrid({ selected, onSelect }: CategoryGridProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-3 gap-3">
      {CATEGORIES.map((cat: Category) => {
        const Icon     = cat.Icon;
        const isActive = selected === cat.id;
        return (
          <motion.button
            key={cat.id}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.id)}
            className={cn(
              'flex flex-col items-center gap-2.5 py-5 rounded-2xl border transition-all duration-200',
              isActive
                ? 'border-2 scale-[1.02]'
                : 'border border-white/[0.07] bg-forge-surface hover:border-white/[0.12]'
            )}
            style={isActive ? {
              borderColor: cat.color,
              background:  `color-mix(in srgb, ${cat.color} 10%, #161210)`,
            } : undefined}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `color-mix(in srgb, ${cat.color} 15%, transparent)` }}
            >
              <Icon size={24} style={{ color: cat.color }} />
            </div>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.07em]"
              style={{ color: isActive ? cat.color : 'rgba(245,241,235,0.45)' }}
            >
              {cat.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Logger page ─────────────────────────────────────────────

export default function Logger(): React.JSX.Element {
  const navigate = useNavigate();

  const { addTransaction, isAdding } = useTransactions();

  const [step,    setStep]    = useState<Step>(1);
  const [catId,   setCatId]   = useState<string | null>(null);
  const [amount,  setAmount]  = useState<string>('');
  const [note,    setNote]    = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const selectedCat  = CATEGORIES.find(c => c.id === catId) ?? null;
  const numericAmount = Number(amount) || 0;

  const handleCatSelect = (id: string): void => {
    setCatId(id);
    setStep(2);
  };

  const handleNumpad = (key: NumpadKey): void => {
    if (key === '⌫') {
      setAmount(a => a.slice(0, -1));
      return;
    }
    if (key === '') return;
    setAmount(a => {
      const next = a + key;
      return next.replace(/^0+([1-9])/, '$1');
    });
  };

  const handleSubmit = async (): Promise<void> => {
    if (numericAmount <= 0 || !catId) return;
    try {
      await addTransaction({
        merchant:    null,
        category:    catId,
        amount:      numericAmount,
        direction:   'debit',
        date:        new Date().toISOString(),
        source:      'manual',
        status:      'confirmed',
        description: (note.trim() || selectedCat?.label) ?? '',      });
    } catch {
      // toast is shown by the hook on error — just don't show success
      return;
    }
    setSuccess(true);
    setTimeout(() => navigate('/dashboard'), 1800);
  };

  return (
    <div className="flex flex-col h-screen bg-forge-bg overflow-hidden relative">

      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] flex-shrink-0">
        <button
          type="button"
          onClick={() => step === 2 ? setStep(1) : navigate('/dashboard')}
          className="flex items-center gap-1.5 text-[14px] font-semibold text-cream/55 hover:text-cream transition-colors"
        >
          <ArrowLeft size={20} />
          {step === 2 ? 'Back' : 'Cancel'}
        </button>
        <h1 className="text-[17px] font-bold font-display text-cream">Log Expense</h1>
        <div className="w-16" aria-hidden="true" />
      </header>

      {/* Step indicator */}
      <div className="flex gap-1.5 px-4 pt-3 flex-shrink-0">
        {([1, 2] as const).map(s => (
          <motion.div
            key={s}
            animate={{ backgroundColor: s <= step ? '#B7410E' : '#211A14' }}
            transition={{ duration: 0.3 }}
            className="flex-1 h-[3px] rounded-full"
          />
        ))}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.25 }}
            >
              <div className="mb-7">
                <h2 className="text-[26px] font-extrabold font-display text-cream tracking-tight leading-tight">
                  What did you spend on?
                </h2>
                <p className="text-[14px] text-cream/40 mt-1">Select a category to continue.</p>
              </div>
              <CategoryGrid selected={catId} onSelect={handleCatSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6"
            >
              {/* Selected category badge */}
              {selectedCat != null && (
                <div className="flex items-center gap-3 p-4 bg-forge-surface border border-white/[0.07] rounded-2xl">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `color-mix(in srgb, ${selectedCat.color} 15%, transparent)` }}
                  >
                    <selectedCat.Icon size={22} style={{ color: selectedCat.color }} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-[13px] font-bold uppercase tracking-wide"
                      style={{ color: selectedCat.color }}
                    >
                      {selectedCat.label}
                    </p>
                    <p className="text-[12px] text-cream/30">Tap Back to change</p>
                  </div>
                </div>
              )}

              {/* Amount display + numpad */}
              <div className="flex flex-col items-center py-4 gap-6">
                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-cream/30">
                  Enter amount
                </p>
                <div className="flex items-start gap-1">
                  <span className="text-[32px] font-bold text-cream/40 mt-2 font-display">₦</span>
                  <span className={cn(
                    'text-[64px] font-extrabold font-display tracking-tight leading-none min-w-[60px] text-center',
                    numericAmount > 0 ? 'text-cream' : 'text-cream/20'
                  )}>
                    {numericAmount > 0 ? numericAmount.toLocaleString('en-NG') : '0'}
                  </span>
                </div>
                <Numpad onPress={handleNumpad} />
              </div>

              {/* Note + submit */}
              <div className="space-y-4 pb-4">
                <Input
                  label="Note (optional)"
                  placeholder="What was this for?"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  onClear={() => setNote('')}
                />
                <Button
                  size="lg"
                  className="w-full"
                  disabled={numericAmount <= 0 || isAdding}
                  isLoading={isAdding}
                  onClick={() => { void handleSubmit(); }}
                >
                  Log {numericAmount > 0 ? formatNaira(numericAmount) : 'Expense'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6 text-center px-8"
            style={{ background: 'linear-gradient(135deg, #1A0C06, #0A0908)' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-rust/15 border-2 border-rust/40 flex items-center justify-center"
            >
              <CheckCircle size={52} className="text-rust-light" />
            </motion.div>
            <div>
              <h2 className="text-[36px] font-extrabold font-display text-cream tracking-tight">
                Logged!
              </h2>
              <p className="text-[18px] text-cream/50 font-medium mt-1">
                {formatNaira(numericAmount)} on {selectedCat?.label ?? ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
