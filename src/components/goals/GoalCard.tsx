// src/components/goals/GoalCard.tsx
import { motion } from 'framer-motion';
import { Trash2, ArrowUpRight, Trophy } from 'lucide-react';
import { getCategoryById } from '@/lib/categories';
import { formatNaira } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import type { Goal } from '@/types/goals';

export interface GoalCardProps {
  goal:      Goal;
  onEdit:    () => void;
  onDelete:  () => void;
  onDeposit: () => void;
  onView:    () => void;
}

export default function GoalCard({ goal, onEdit, onDelete, onDeposit, onView }: GoalCardProps): React.JSX.Element {
  const pct = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;
  const isComplete  = pct >= 100;
  const cat         = getCategoryById(goal.icon);
  const Icon        = cat.Icon;
  const daysLeft    = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86_400_000));
  const dailySave   = daysLeft > 0 ? (goal.targetAmount - goal.currentAmount) / daysLeft : 0;
  const isOverdue   = daysLeft === 0 && !isComplete;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.15 }}
      className="p-5 bg-forge-surface rounded-3xl border border-white/[0.06] shadow-card"
    >
      {/* Top row: icon + name + delete */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${cat.color}15`, border: `1px solid ${cat.color}25` }}
        >
          {isComplete ? (
            <Trophy size={18} className="text-success" />
          ) : (
            <Icon size={18} style={{ color: cat.color }} />
          )}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          <h3 className="text-[15px] font-bold font-display text-cream truncate">{goal.name}</h3>
          <p className="text-[13px] text-cream/40 font-medium">
            {isComplete ? 'Goal reached!' : isOverdue ? 'Overdue' : `${daysLeft}d left`}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="p-2 rounded-xl text-cream/15 hover:text-danger hover:bg-danger/10 transition-all flex-shrink-0"
          aria-label="Delete goal"
          type="button"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Amount row */}
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[18px] font-extrabold font-display text-cream tracking-tight">
          {formatNaira(goal.currentAmount)}
        </p>
        <p className="text-[13px] text-cream/40 font-medium">
          of {formatNaira(goal.targetAmount)}
        </p>
      </div>

      {/* Progress bar with milestone ticks */}
      <div className="mb-3">
        <div className="relative h-2.5 rounded-full bg-forge-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.15 }}
            style={{
              background: isComplete
                ? 'linear-gradient(90deg, #2DB37A, #00E5A0)'
                : 'linear-gradient(90deg, #D4541A, #B87333)',
            }}
          />
          {/* 25/50/75 ticks — visible only over the unfilled portion */}
          {[25, 50, 75].map(t => (
            <div
              key={t}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: `${t}%`,
                background: pct >= t ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] font-bold text-cream/30">{pct}%</span>
          {!isComplete && dailySave > 0 && (
            <span className="text-[11px] text-rust-light font-bold">
              {formatNaira(Math.ceil(dailySave))}/day
            </span>
          )}
        </div>
      </div>

      {/* Action row */}
      <div className="flex gap-2">
        {!isComplete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeposit(); }}
            className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl bg-rust/12 border border-rust/20 text-rust-light text-[12px] font-bold hover:bg-rust/20 transition-all"
          >
            <ArrowUpRight size={13} /> Add Money
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          className="flex-1 h-9 flex items-center justify-center rounded-xl bg-forge-elevated border border-white/[0.06] text-cream/50 text-[12px] font-bold hover:text-cream hover:border-white/[0.12] transition-all"
        >
          Edit
        </button>
      </div>

      {/* Badges */}
      {(isComplete || isOverdue) && (
        <div className="mt-3 flex gap-1.5">
          {isComplete && <Badge preset="success">Completed</Badge>}
          {isOverdue && <Badge preset="rust">Overdue</Badge>}
        </div>
      )}
    </motion.div>
  );
}
