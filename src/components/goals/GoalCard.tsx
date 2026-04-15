import React from 'react';
import { Card } from '@/src/components/ui/Card';
import { formatNaira } from '@/src/lib/utils';
import { SavingsGoal } from '@/src/types/goals';
import { CATEGORIES } from '@/src/components/logger/CategoryPicker';
import { EditIcon, TrashIcon } from '@/src/components/ui/icons';

interface GoalCardProps {
  goal: SavingsGoal;
  onEdit: () => void;
  onDelete: () => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const percent = goal.target_amount > 0 ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100)) : 0;
  const isComplete = percent >= 100;

  const iconItem = CATEGORIES.find(c => c.id === goal.icon) || CATEGORIES[0];
  const Icon = iconItem.Icon;

  const daysRemaining = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 3600 * 24)));
  const dailySave = daysRemaining > 0 ? (goal.target_amount - goal.current_amount) / daysRemaining : 0;

  return (
    <Card className="p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-bg-elevated text-accent">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="font-black text-[18px]">{goal.name}</h3>
            <p className="text-text-secondary text-[13px]">{daysRemaining} days left</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-1.5 text-text-secondary hover:text-accent rounded-full bg-bg-elevated transition-colors"><EditIcon size={16} /></button>
          <button onClick={onDelete} className="p-1.5 text-danger/80 hover:text-danger rounded-full bg-danger/10 transition-colors"><TrashIcon size={16} /></button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="font-bold text-[18px]">{formatNaira(goal.current_amount)}</span>
          <span className="text-text-secondary text-[12px] font-medium">of {formatNaira(goal.target_amount)}</span>
        </div>
        <div className="h-2 w-full bg-bg-elevated rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-success' : 'bg-accent'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {!isComplete && dailySave > 0 && (
        <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[12px] text-text-secondary font-medium">Daily save required</span>
          <span className="text-[13px] font-bold text-accent">{formatNaira(dailySave)}</span>
        </div>
      )}
      {isComplete && (
        <div className="pt-2 border-t border-gray-100 flex items-center gap-1.5 text-success">
          <span className="text-[13px] font-bold">Goal Reached!</span>
        </div>
      )}
    </Card>
  );
}
