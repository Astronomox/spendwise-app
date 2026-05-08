// src/pages/Goals.tsx
import { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useGoals } from '@/hooks/useGoals';
import { formatNaira } from '@/lib/utils';
import type { Goal, GoalFormValues } from '@/types/goals';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import GoalCard from '@/components/goals/GoalCard';
import { GoalModal } from '@/components/goals/GoalModal';

// ——— Goals page ———

export default function Goals(): React.JSX.Element {
  const {
    goals,
    isLoading,
    addGoal,
    updateGoal,
    deleteGoal,
  } = useGoals();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount,  0);

  const openCreate = (): void => { setEditing(null); setShowModal(true); };
  const openEdit   = (g: Goal): void => { setEditing(g); setShowModal(true); };
  const closeModal = (): void => setShowModal(false);

  const handleSave = async ({ name, targetAmount }: GoalFormValues): Promise<void> => {
    try {
      if (editing != null) {
        await updateGoal({ id: editing.id, name, targetAmount });
      } else {
        await addGoal({ name, targetAmount });
      }
    } catch {
      // Handle error silently
    }
    closeModal();
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteGoal(id);
    } catch {
      // Handle error silently
    }
  };

  return (
    <div className="pt-6 pb-8">

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

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-3xl bg-forge-surface animate-pulse" />
          ))}
        </div>
      ) : goals.length === 0 ? (
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
              onDelete={() => { void handleDelete(g.id); }}
            />
          ))}
        </div>
      )}

      <GoalModal
        goal={editing}
        isOpen={showModal}
        onClose={closeModal}
        onSave={(v) => handleSave(v)}
      />
    </div>
  );
}