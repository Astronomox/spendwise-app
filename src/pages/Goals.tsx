import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '@/src/lib/store';
import { useGoals } from '@/src/hooks/useGoals';
import { GoalCard } from '@/src/components/goals/GoalCard';
import { GoalModal } from '@/src/components/goals/GoalModal';
import { Button } from '@/src/components/ui/Button';
import { RefreshIcon, GoalsIcon } from '@/src/components/ui/icons';
import { SavingsGoal } from '@/src/types/goals';

export default function GoalsPage() {
  const { user } = useAppStore();
  const { goals, isLoading, addGoal, updateGoal, deleteGoal } = useGoals();
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleSave = async (goalData: Omit<SavingsGoal, 'id' | 'user_id' | 'created_at' | 'current_amount'>) => {
    if (!user) return;
    try {
      if (editingGoal) {
        await updateGoal({ id: editingGoal.id, ...goalData });
      } else {
        await addGoal({ user_id: user.id, ...goalData });
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      // Re-throw to be caught by the modal
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      await deleteGoal(id);
    }
  };

  const totalSaved = goals.reduce((sum, g) => sum + g.current_amount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full bg-[var(--color-bg-secondary)] relative pb-[72px]"
    >
      <div className="px-[16px] pt-[32px] pb-[16px] bg-[var(--color-bg-secondary)] sticky top-0 z-20 border-b border-[var(--color-border)] shadow-[var(--shadow-shadow-sm)] space-y-[16px]">
        <div>
          <h1 className="text-[28px] font-bold font-display tracking-tight leading-tight">Savings Goals</h1>
          <p className="text-[var(--color-text-secondary)] text-[15px] font-[500]">What are we building towards?</p>
        </div>

        {goals.length > 0 && (
          <div className="flex justify-between items-center bg-[var(--color-bg-elevated)] rounded-[12px] p-[16px] border border-[var(--color-border)]">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Total Saved</p>
              <p className="text-[20px] font-bold font-display text-[var(--color-accent)] naira leading-none mt-[4px]">{totalSaved.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Target</p>
              <p className="text-[16px] font-bold font-display text-[var(--color-text-primary)] naira leading-none mt-[4px] opacity-80">{totalTarget.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-[16px]">
          <RefreshIcon className="animate-spin text-[var(--color-accent)]" size={32} />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-[24px] text-center space-y-[24px]">
          <div className="w-[80px] h-[80px] bg-[rgba(0,135,81,0.1)] rounded-full flex items-center justify-center text-[var(--color-accent)]">
            <GoalsIcon size={40} />
          </div>
          <div className="space-y-[8px]">
            <h3 className="font-bold text-[20px] font-display text-[var(--color-text-primary)]">No goals yet</h3>
            <p className="text-[var(--color-text-secondary)] text-[15px] font-[500] max-w-[280px] mx-auto">Start saving for that vacation or emergency fund today.</p>
          </div>
          <Button onClick={handleCreate} size="lg" className="px-[32px]">Create First Goal</Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-[24px] space-y-[16px]">
          {goals.map((goal: SavingsGoal) => (
            <div key={goal.id}>
              <GoalCard
                goal={goal}
                onEdit={() => handleEdit(goal)}
                onDelete={() => handleDelete(goal.id)}
              />
            </div>
          ))}
        </div>
      )}

      {goals.length > 0 && (
        <div className="absolute bottom-[88px] right-[24px] z-20">
          <Button
            className="rounded-full shadow-[var(--shadow-shadow-lg)] hover:shadow-[var(--shadow-shadow-accent)] h-[56px] px-[24px] gap-[8px]"
            onClick={handleCreate}
          >
            <span className="text-[24px] leading-none mb-[2px]">+</span>
            <span className="font-bold text-[15px]">New Goal</span>
          </Button>
        </div>
      )}

      <GoalModal
        goal={editingGoal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </motion.div>
  );
}
