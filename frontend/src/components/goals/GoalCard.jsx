// src/components/goals/GoalCard.jsx
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { getCategoryById } from '@/lib/categories';
import { formatNaira } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

/**
 * @param {{ goal: object, onEdit: () => void, onDelete: () => void }} props
 */
export default function GoalCard({ goal, onEdit, onDelete }) {
  const pct      = goal.targetAmount > 0
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0;
  const isComplete = pct >= 100;
  const cat      = getCategoryById(goal.icon);
  const Icon     = cat.Icon;
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline) - Date.now()) / 86400000));
  const dailySave = daysLeft > 0 ? (goal.targetAmount - goal.currentAmount) / daysLeft : 0;

  // SVG ring
  const R    = 22;
  const circ = 2 * Math.PI * R;
  const strokeColor = isComplete ? '#2DB37A' : '#B7410E';

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-4 p-5 bg-forge-surface rounded-3xl border border-white/[0.06] shadow-card"
    >
      {/* Animated progress ring */}
      <div className="relative w-[60px] h-[60px] flex-shrink-0">
        <svg width="60" height="60" viewBox="0 0 60 60" className="-rotate-90">
          <circle cx="30" cy="30" r={R} stroke="#211A14" strokeWidth="4" fill="none" />
          <motion.circle
            cx="30" cy="30" r={R}
            stroke={strokeColor}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[11px] font-black font-display text-cream">{pct}%</span>
        </div>
      </div>

      {/* Goal details */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={onEdit}>
        <div className="flex items-center gap-1.5 mb-1">
          <Icon size={13} style={{ color: cat.color }} className="flex-shrink-0" />
          <h3 className="text-[15px] font-bold font-display text-cream truncate">{goal.name}</h3>
        </div>
        <p className="text-[14px] font-bold font-display text-cream mb-2">
          {formatNaira(goal.currentAmount)}
          <span className="text-[12px] text-cream/40 font-normal">
            {' '}/ {formatNaira(goal.targetAmount)}
          </span>
        </p>
        {isComplete ? (
          <Badge preset="success">Goal Reached!</Badge>
        ) : (
          <div className="flex gap-1.5 flex-wrap">
            <Badge preset="muted">{daysLeft}d left</Badge>
            {dailySave > 0 && (
              <Badge preset="rust">{formatNaira(Math.ceil(dailySave))}/day</Badge>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="p-2 rounded-xl text-cream/20 hover:text-danger hover:bg-danger/10 transition-all flex-shrink-0"
        aria-label="Delete goal"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
}
