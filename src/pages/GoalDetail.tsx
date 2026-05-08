// src/pages/GoalDetail.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ArrowLeft, ArrowUpRight, Pencil, Trash2, Trophy, Flame } from 'lucide-react';
import { useGoalDetail, useGoals } from '@/hooks/useGoals';
import { getCategoryById } from '@/lib/categories';
import { formatNaira } from '@/lib/utils';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DepositModal } from '@/components/goals/DepositModal';
import { GoalModal } from '@/components/goals/GoalModal';
import type { GoalFormValues } from '@/types/goals';

// Milestone thresholds
const MILESTONES = [
  { label: '25%',  percent: 25 },
  { label: '50%',  percent: 50 },
  { label: '75%',  percent: 75 },
  { label: '100%', percent: 100 },
];

export default function GoalDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: goal, isLoading } = useGoalDetail(id!);
  const { updateGoal, deleteGoal, deposit } = useGoals();

  const [showDeposit, setShowDeposit] = useState(false);
  const [showEdit,    setShowEdit]    = useState(false);

  if (isLoading) {
    return (
      <div className="pt-6 pb-8 space-y-4">
        <div className="h-8 w-32 rounded-2xl bg-forge-surface animate-pulse" />
        <div className="h-48 rounded-3xl bg-forge-surface animate-pulse" />
        <div className="h-64 rounded-3xl bg-forge-surface animate-pulse" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="pt-6 pb-8 text-center">
        <p className="text-cream/40 text-[14px]">Goal not found.</p>
        <Button size="sm" className="mt-4" onClick={() => navigate('/goals')}>
          Back to Goals
        </Button>
      </div>
    );
  }

  const cat       = getCategoryById(goal.icon);
  const Icon      = cat.Icon;
  const pct       = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
  const isComplete = pct >= 100;
  const daysLeft  = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86_400_000));
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const dailySave = daysLeft > 0 ? remaining / daysLeft : 0;

  // Build cumulative chart data from deposits
  const chartData = (goal.deposits ?? [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce<Array<{ date: string; total: number }>>((acc, dep) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].total : 0;
      acc.push({
        date:  new Date(dep.date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
        total: prev + dep.amount,
      });
      return acc;
    }, []);

  // Add starting point if deposits exist
  if (chartData.length > 0) {
    chartData.unshift({ date: 'Start', total: 0 });
  }

  const handleEdit = async (values: GoalFormValues) => {
    await updateGoal({ id: goal.id, ...values });
    setShowEdit(false);
  };

  const handleDelete = async () => {
    await deleteGoal(goal.id);
    navigate('/goals');
  };

  const handleDeposit = async (goalId: string, amount: number, note?: string) => {
    await deposit({ goalId, amount, note });
  };

  // Custom chart tooltip
  const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string } }> }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-3 py-2 rounded-xl bg-forge-elevated border border-white/[0.08] shadow-card-lg">
        <p className="text-[12px] font-bold text-cream">{formatNaira(payload[0].value)}</p>
        <p className="text-[10px] text-cream/40">{payload[0].payload.date}</p>
      </div>
    );
  };

  return (
    <div className="pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/goals')}
          className="p-2 rounded-xl text-cream/40 hover:text-cream hover:bg-forge-elevated transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon size={16} style={{ color: cat.color }} />
            <h1 className="text-[22px] font-extrabold font-display text-cream tracking-tight truncate">
              {goal.name}
            </h1>
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="p-2 rounded-xl text-cream/30 hover:text-cream hover:bg-forge-elevated transition-all"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl text-cream/30 hover:text-danger hover:bg-danger/10 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Hero card */}
      <Card variant="accent" className="p-6 mb-5">
        <div className="text-center mb-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-cream/40 mb-2">
            {isComplete ? 'Goal Reached' : 'Progress'}
          </p>
          <p className="text-[32px] font-extrabold font-display text-rust-light tracking-tight leading-none">
            {formatNaira(goal.currentAmount)}
          </p>
          <p className="text-[14px] text-cream/40 mt-1">
            of {formatNaira(goal.targetAmount)}
          </p>
        </div>

        {/* Progress bar with milestone markers */}
        <div className="relative mb-2">
          <div className="h-4 rounded-full bg-forge-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                background: isComplete
                  ? 'linear-gradient(90deg, #2DB37A, #00E5A0)'
                  : 'linear-gradient(90deg, #D4541A, #B87333)',
              }}
            />
          </div>
          {/* Milestone dots */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            {MILESTONES.map(m => (
              <div
                key={m.percent}
                className="absolute"
                style={{ left: `${m.percent}%`, transform: 'translateX(-50%)' }}
              >
                <div
                  className={`w-2 h-2 rounded-full border ${
                    pct >= m.percent
                      ? 'bg-cream border-cream/40'
                      : 'bg-forge-muted border-white/10'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          {MILESTONES.map(m => (
            <span
              key={m.percent}
              className={`text-[9px] font-bold ${pct >= m.percent ? 'text-cream/60' : 'text-cream/20'}`}
              style={{ width: '25%', textAlign: 'center' }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-cream/30 mb-1">Left</p>
            <p className="text-[14px] font-bold font-display text-cream">{formatNaira(remaining)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-cream/30 mb-1">Days</p>
            <p className="text-[14px] font-bold font-display text-cream">{daysLeft}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-cream/30 mb-1">/Day</p>
            <p className="text-[14px] font-bold font-display text-rust-light">
              {dailySave > 0 ? formatNaira(Math.ceil(dailySave)) : '—'}
            </p>
          </div>
        </div>

        {/* CTA */}
        {!isComplete && (
          <Button className="w-full mt-5" size="lg" onClick={() => setShowDeposit(true)}>
            <ArrowUpRight size={16} /> Add Money
          </Button>
        )}
        {isComplete && (
          <div className="flex items-center justify-center gap-2 mt-5 text-success">
            <Trophy size={18} />
            <span className="text-[14px] font-bold font-display">Goal Complete!</span>
          </div>
        )}
      </Card>

      {/* Progress chart */}
      {chartData.length > 1 && (
        <Card className="p-5 mb-5">
          <h3 className="text-[14px] font-bold font-display text-cream mb-4 flex items-center gap-2">
            <Flame size={14} className="text-rust" /> Savings Progress
          </h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4541A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#D4541A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#211A14" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#F5F1EB60', fontSize: 10 }}
                  axisLine={{ stroke: '#211A14' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#F5F1EB40', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#D4541A"
                  strokeWidth={2}
                  fill="url(#savingsGrad)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Deposit history */}
      <Card className="p-5">
        <h3 className="text-[14px] font-bold font-display text-cream mb-4">
          Deposit History
        </h3>
        {(goal.deposits ?? []).length === 0 ? (
          <p className="text-[13px] text-cream/30 text-center py-6">
            No deposits yet. Start saving!
          </p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {[...(goal.deposits ?? [])]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((dep, i) => (
                  <motion.div
                    key={dep.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-forge-elevated border border-white/[0.04]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                      <ArrowUpRight size={14} className="text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-cream">
                        +{formatNaira(dep.amount)}
                      </p>
                      {dep.note && (
                        <p className="text-[11px] text-cream/30 truncate">{dep.note}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-cream/25 flex-shrink-0">
                      {new Date(dep.date).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Modals */}
      <DepositModal
        goal={goal}
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDeposit={handleDeposit}
      />
      <GoalModal
        goal={goal}
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSave={handleEdit}
      />
    </div>
  );
}
