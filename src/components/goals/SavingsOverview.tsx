// src/components/goals/SavingsOverview.tsx
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { TrendingUp, Target } from 'lucide-react';
import { formatNaira } from '@/lib/utils';
import { getCategoryById } from '@/lib/categories';
import Card from '@/components/ui/Card';
import type { Goal } from '@/types/goals';

interface SavingsOverviewProps {
  goals: Goal[];
}

export default function SavingsOverview({ goals }: SavingsOverviewProps): React.JSX.Element | null {
  if (goals.length === 0) return null;

  const totalSaved  = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount,  0);
  const overallPct  = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 0;
  const remaining   = Math.max(0, totalTarget - totalSaved);

  // Pie chart data: one slice per goal
  const pieData = goals.map(g => {
    const cat = getCategoryById(g.icon);
    return {
      name:  g.name,
      value: g.currentAmount,
      color: cat.color,
      pct:   g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
    };
  }).filter(d => d.value > 0);

  // Add remaining as a dim slice
  if (remaining > 0) {
    pieData.push({
      name:  'Remaining',
      value: remaining,
      color: '#211A14',
      pct:   0,
    });
  }

  // Stats
  const completedCount = goals.filter(g =>
    g.targetAmount > 0 && g.currentAmount >= g.targetAmount
  ).length;
  const activeCount = goals.length - completedCount;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { pct: number } }> }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    if (d.name === 'Remaining') return null;
    return (
      <div className="px-3 py-2 rounded-xl bg-forge-elevated border border-white/[0.08] shadow-card-lg">
        <p className="text-[12px] font-bold text-cream">{d.name}</p>
        <p className="text-[11px] text-cream/50">{formatNaira(d.value)} · {d.payload.pct}%</p>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-6"
    >
      <Card variant="accent" className="p-5">
        <div className="flex items-center gap-4">
          {/* Pie chart */}
          <div className="relative w-[100px] h-[100px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={46}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                  animationBegin={100}
                  animationDuration={800}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[16px] font-black font-display text-cream leading-none">
                {overallPct}%
              </span>
              <span className="text-[9px] text-cream/40 font-medium mt-0.5">saved</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-cream/40 mb-1">
                Total Saved
              </p>
              <p className="text-[22px] font-extrabold font-display text-rust-light tracking-tight leading-none">
                {formatNaira(totalSaved)}
              </p>
              <p className="text-[12px] text-cream/40 mt-0.5">
                of {formatNaira(totalTarget)}
              </p>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <Target size={12} className="text-cream/30" />
                <span className="text-[11px] text-cream/50 font-medium">
                  {activeCount} active
                </span>
              </div>
              {completedCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} className="text-success" />
                  <span className="text-[11px] text-success font-medium">
                    {completedCount} done
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-4">
          <div className="h-1.5 rounded-full bg-forge-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-progress-rust"
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
