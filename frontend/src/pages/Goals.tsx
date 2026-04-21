// src/pages/Goals.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Target } from 'lucide-react';
import { mockGoals } from '@/data/mockData';
import { formatNaira } from '@/lib/utils';
import type { Goal, GoalFormValues } from '@/types/goals';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import GoalCard from '@/components/goals/GoalCard';

// ─── Goal modal ──────────────────────────────────────────────

interface GoalModalProps {
  goal:    Goal | null;
  onClose: () => void;
  onSave:  (values: GoalFormValues) => void;
}

function GoalModal({ goal, onClose, onSave }: GoalModalProps): React.JSX.Element {
  const [name,   setName]   = useState<string>(goal?.name ?? '');
  const [target, setTarget] = useState<string>(goal != null ? String(goal.targetAmount) : '');
  const [error,  setError]  = useState<string>('');

  const handleSave = (): void => {
    if (!name.trim()) {
      setError('Goal name is required');
      return;
    }
    const parsed = Number(target);
    if (!target || isNaN(parsed) || parsed <= 0) {
      setError('Enter a valid target amount');
      return;
    }
    onSave({ name: name.trim(), targetAmount: parsed });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-lg bg-forge-surface border border-white/[0.10] rounded-t-4xl p-7"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[20px] font-bold font-display text-cream">
            {goal != null ? 'Edit Goal' : 'New Goal'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-cream/30 hover:text-cream hover:bg-forge-elevated transition-all"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Goal Name"
            placeholder="e.g. Emergency Fund"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
          />
          <Input
            label="Target Amount (₦)"
            placeholder="e.g. 500000"
            value={target}
            onChange={e => { setTarget(e.target.value.replace(/\D/g, '')); setError(''); }}
          />
          {error.length > 0 && (
            <p className="text-[12px] text-danger font-semibold">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} className="flex-1">
              {goal != null ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Goals page ──────────────────────────────────────────────

export default function Goals(): React.JSX.Element {
  const [goals,     setGoals]     = useState<Goal[]>(mockGoals);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing,   setEditing]   = useState<Goal | null>(null);

  const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount,  0);

  const openCreate = (): void => { setEditing(null);  setShowModal(true); };
  const openEdit   = (g: Goal): void => { setEditing(g); setShowModal(true); };
  const closeModal = (): void => setShowModal(false);

  const handleSave = ({ name, targetAmount }: GoalFormValues): void => {
    if (editing != null) {
      setGoals(gs => gs.map(g => g.id === editing.id ? { ...g, name, targetAmount } : g));
    } else {
      const newGoal: Goal = {
        id:            `g${Date.now()}`,
        name,
        targetAmount,
        currentAmount: 0,
        deadline:      new Date(Date.now() + 90 * 86_400_000).toISOString(),
        icon:          'savings',
        userId:        'u1',
      };
      setGoals(gs => [...gs, newGoal]);
    }
    closeModal();
  };

  const handleDelete = (id: string): void => {
    setGoals(gs => gs.filter(g => g.id !== id));
  };

  return (
    <div className="pt-6 pb-8">

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold font-display text-cream tracking-tight">
            Savings Goals
          </h1>
          <p className="text-[14px] text-cream/40 font-medium mt-1">
            What are you building towards?
          </p>
        </div>
        {goals.length > 0 && (
          <Button size="sm" onClick={openCreate}>
            <Plus size={15} /> New Goal
          </Button>
        )}
      </div>

      {/* Summary banner */}
      {goals.length > 0 && (
        <Card variant="accent" className="p-5 mb-6 flex justify-between items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-cream/40 mb-1.5">
              Total Saved
            </p>
            <p className="text-[22px] font-extrabold font-display text-rust-light tracking-tight">
              {formatNaira(totalSaved)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-cream/40 mb-1.5">
              Target
            </p>
            <p className="text-[18px] font-bold font-display text-cream/60">
              {formatNaira(totalTarget)}
            </p>
          </div>
        </Card>
      )}

      {/* List or empty state */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-5">
          <div className="w-[72px] h-[72px] rounded-3xl bg-rust/10 border border-rust/20 flex items-center justify-center text-rust">
            <Target size={36} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold font-display text-cream mb-2">No goals yet</h3>
            <p className="text-[14px] text-cream/40 max-w-[240px] mx-auto leading-relaxed">
              Start saving for your next milestone today.
            </p>
          </div>
          <Button size="lg" onClick={openCreate}>
            <Plus size={16} /> Create First Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(g => (
            <GoalCard
              key={g.id}
              goal={g}
              onEdit={() => openEdit(g)}
              onDelete={() => handleDelete(g.id)}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <GoalModal goal={editing} onClose={closeModal} onSave={handleSave} />
        )}
      </AnimatePresence>
    </div>
  );
}
