// src/pages/Goals.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Target, Sparkles } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import type { Goal, GoalFormValues } from '@/types/goals';
import Button from '@/components/ui/Button';
import GoalCard from '@/components/goals/GoalCard';
import SavingsOverview from '@/components/goals/SavingsOverview';
import { GoalModal } from '@/components/goals/GoalModal';
import { DepositModal } from '@/components/goals/DepositModal';

export default function Goals(): React.JSX.Element {
  const navigate = useNavigate();
  const {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
    deposit,
  } = useGoals();

  const [showModal,    setShowModal]    = useState(false);
  const [showDeposit,  setShowDeposit]  = useState(false);
  const [editing,      setEditing]      = useState<Goal | null>(null);
  const [depositGoal,  setDepositGoal]  = useState<Goal | null>(null);

  const openCreate  = ()          => { setEditing(null); setShowModal(true); };
  const openEdit    = (g: Goal)   => { setEditing(g); setShowModal(true); };
  const closeModal  = ()          => setShowModal(false);
  const openDeposit = (g: Goal)   => { setDepositGoal(g); setShowDeposit(true); };
  const closeDeposit = ()         => setShowDeposit(false);

  const handleSave = async (values: GoalFormValues): Promise<void> => {
    try {
      if (editing != null) {
        await updateGoal({ id: editing.id, ...values });
      } else {
        await addGoal(values);
      }
    } catch {
      // handled by hook
    }
    closeModal();
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteGoal(id);
    } catch {
      // handled by hook
    }
  };

  const handleDeposit = async (goalId: string, amount: number, note?: string): Promise<void> => {
    await deposit({ goalId, amount, note });
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

      {/* Savings overview visualization */}
      <SavingsOverview goals={goals} />

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-forge-surface animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        /* Empty state */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-5"
        >
          {/* Animated icon */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(183,65,14,0)',
                '0 0 0 12px rgba(183,65,14,0.15)',
                '0 0 0 24px rgba(183,65,14,0)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-[80px] h-[80px] rounded-3xl bg-rust/10 border border-rust/20 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Target size={36} className="text-rust" />
            </motion.div>
          </motion.div>

          <div>
            <h3 className="text-[20px] font-bold font-display text-cream mb-2">
              No goals yet
            </h3>
            <p className="text-[14px] text-cream/40 max-w-[260px] mx-auto leading-relaxed">
              Set a target, track your progress, and watch your savings grow.
            </p>
          </div>

          <Button size="lg" onClick={openCreate}>
            <Sparkles size={16} /> Create First Goal
          </Button>
        </motion.div>
      ) : (
        /* Goal cards */
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {goals.map(g => (
              <GoalCard
                key={g.id}
                goal={g}
                onEdit={() => openEdit(g)}
                onDelete={() => { void handleDelete(g.id); }}
                onDeposit={() => openDeposit(g)}
                onView={() => navigate(`/goals/${g.id}`)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <GoalModal
        goal={editing}
        isOpen={showModal}
        onClose={closeModal}
        onSave={handleSave}
      />
      <DepositModal
        goal={depositGoal}
        isOpen={showDeposit}
        onClose={closeDeposit}
        onDeposit={handleDeposit}
      />
    </div>
  );
}
