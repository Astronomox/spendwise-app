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
    if (editingGoal) {
      await updateGoal({ id: editingGoal.id, ...goalData });
    } else {
      await addGoal({ user_id: user.id, ...goalData });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      await deleteGoal(id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full bg-white relative pb-20"
    >
      <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-gray-100">
        <div>
          <h1 className="text-[28px] font-black tracking-tight">Savings Goals</h1>
          <p className="text-text-secondary text-[14px]">What are we building towards?</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <RefreshIcon className="animate-spin text-accent" size={32} />
        </div>
      ) : goals.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center text-accent">
            <GoalsIcon size={32} />
          </div>
          <div>
            <h3 className="font-bold text-[18px]">No goals yet</h3>
            <p className="text-text-secondary text-[14px]">Start saving for that vacation or emergency fund today.</p>
          </div>
          <Button onClick={handleCreate}>Create First Goal</Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
        <div className="absolute bottom-6 right-6 z-20">
          <Button
            className="rounded-full shadow-lg h-14 px-6 gap-2"
            onClick={handleCreate}
          >
            <span className="text-[20px]">+</span> New Goal
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
