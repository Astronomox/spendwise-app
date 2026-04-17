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

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="p-[20px] border-[var(--color-border)] shadow-none flex gap-[16px] items-center relative overflow-hidden group transition-all duration-200">
      {/* Delete Zone on Swipe/Hover (Simplifying for desktop/hover for now, real swipe would use Framer Motion drag) */}
      <div className="absolute right-0 top-0 bottom-0 w-[80px] bg-[var(--color-danger)] flex items-center justify-center text-white opacity-0 translate-x-full group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <button onClick={onDelete} className="p-[16px] h-full w-full flex items-center justify-center">
          <TrashIcon size={24} />
        </button>
      </div>

      <div className="relative w-[64px] h-[64px] shrink-0 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
          <circle
            className="text-[var(--color-bg-elevated)]"
            strokeWidth="4"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
          />
          <circle
            className={isComplete ? "text-[var(--color-success)]" : "text-[var(--color-accent)]"}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="32"
            cy="32"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-[12px] font-bold font-display leading-none">{percent}%</span>
        </div>
      </div>

      <div className="flex-1 min-w-0 pr-[32px] cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-[8px] mb-[4px]">
          <Icon size={16} className="text-[var(--color-text-secondary)]" style={{ color: iconItem.color }} />
          <h3 className="font-bold font-display text-[16px] text-[var(--color-text-primary)] truncate">{goal.name}</h3>
        </div>
        <p className="text-[14px] font-bold font-display text-[var(--color-text-primary)] naira leading-tight mb-[4px]">
          {goal.current_amount.toLocaleString()} <span className="text-[12px] text-[var(--color-text-secondary)] font-[500] font-body">/ {goal.target_amount.toLocaleString()}</span>
        </p>

        {isComplete ? (
          <div className="inline-flex items-center gap-[4px] px-[8px] py-[2px] bg-[rgba(16,185,129,0.1)] text-[var(--color-success)] rounded-full">
            <span className="text-[11px] font-bold uppercase tracking-wider">Goal Reached! 🎉</span>
          </div>
        ) : (
          <div className="flex gap-[8px]">
            <span className="inline-flex items-center px-[8px] py-[2px] bg-[var(--color-bg-elevated)] rounded-full text-[var(--color-text-secondary)] text-[11px] font-bold uppercase tracking-wider">
              {daysRemaining}d left
            </span>
            {dailySave > 0 && (
              <span className="inline-flex items-center px-[8px] py-[2px] bg-[rgba(0,135,81,0.05)] text-[var(--color-accent)] rounded-full text-[11px] font-bold uppercase tracking-wider">
                ₦{Math.ceil(dailySave).toLocaleString()}/day
              </span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
