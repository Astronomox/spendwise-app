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
    <Card className="p-[20px] space-y-[16px] border-[var(--color-border)]">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-[12px]">
          <div className="w-[48px] h-[48px] rounded-[16px] flex items-center justify-center text-[var(--color-text-primary)]" style={{ backgroundColor: `color-mix(in srgb, ${iconItem.color} 15%, transparent)` }}>
            <Icon size={24} style={{ color: iconItem.color }} />
          </div>
          <div>
            <h3 className="font-bold font-display text-[16px] text-[var(--color-text-primary)]">{goal.name}</h3>
            <div className="inline-flex items-center px-[8px] py-[2px] mt-[4px] bg-[var(--color-bg-elevated)] rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] text-[11px] font-bold uppercase tracking-wider">
              {daysRemaining} days left
            </div>
          </div>
        </div>
        <div className="flex gap-[8px]">
          <button onClick={onEdit} className="p-[8px] -mt-[4px] -mr-[4px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-full active:scale-95"><EditIcon size={20} /></button>
          <button onClick={onDelete} className="p-[8px] -mt-[4px] -mr-[4px] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors rounded-full active:scale-95"><TrashIcon size={20} /></button>
        </div>
      </div>

      <div className="space-y-[8px]">
        <div className="flex justify-between items-end">
          <span className="font-bold text-[20px] text-[var(--color-text-primary)] font-display tracking-tight leading-none">{formatNaira(goal.current_amount)}</span>
          <span className="text-[var(--color-text-secondary)] text-[13px] font-[500]">of {formatNaira(goal.target_amount)}</span>
        </div>
        <div className="h-[8px] w-full bg-[var(--color-bg-elevated)] rounded-full overflow-hidden border border-[var(--color-border)]/50">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isComplete ? 'bg-[var(--color-success)]' : 'bg-[var(--color-accent)]'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {!isComplete && dailySave > 0 && (
        <div className="pt-[16px] border-t border-[var(--color-border)] flex justify-between items-center">
          <span className="text-[13px] text-[var(--color-text-secondary)] font-[500]">Daily save needed</span>
          <span className="text-[14px] font-bold text-[var(--color-accent)]">{formatNaira(dailySave)}</span>
        </div>
      )}
      {isComplete && (
        <div className="pt-[16px] border-t border-[var(--color-border)] flex justify-center items-center">
          <div className="flex items-center gap-[6px] px-[12px] py-[4px] bg-[rgba(16,185,129,0.1)] text-[var(--color-success)] rounded-full">
            <span className="text-[13px] font-bold tracking-wide uppercase">Goal Reached!</span>
          </div>
        </div>
      )}
    </Card>
  );
}
