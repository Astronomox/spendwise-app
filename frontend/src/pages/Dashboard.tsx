// src/pages/Dashboard.tsx
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Share2 } from 'lucide-react';
import { mockUser, mockDashboard, mockTransactions, mockGoals } from '@/data/mockData';
import { formatNaira, getGreeting, cn } from '@/lib/utils';
import type { DashboardData } from '@/types/user';
import Card from '@/components/ui/Card';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import WeeklyBarChart from '@/components/charts/WeeklyBarChart';
import TopCategories from '@/components/dashboard/TopCategories';
import TransactionItem from '@/components/transactions/TransactionItem';
import GoalCard from '@/components/goals/GoalCard';

// ─── Stat card ───────────────────────────────────────────────

interface StatCardProps {
  label:  string;
  value:  number;
  accent: boolean;
}

function StatCard({ label, value, accent }: StatCardProps): React.JSX.Element {
  return (
    <Card variant={accent ? 'accent' : 'default'} className="p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.07em] text-cream/40 mb-2">{label}</p>
      <p className={cn(
        'text-[23px] font-extrabold font-display tracking-tight leading-none',
        accent ? 'text-rust-light' : 'text-cream'
      )}>
        <span className="text-[14px] opacity-60">₦</span>
        <AnimatedNumber value={value} />
      </p>
    </Card>
  );
}

// ─── Dashboard ───────────────────────────────────────────────

export default function Dashboard(): React.JSX.Element {
  const navigate = useNavigate();
  const data: DashboardData = mockDashboard;

  const budgetPct = Math.min(100, (data.totalSpent / data.monthlyBudget) * 100);
  const remaining = data.monthlyBudget - data.totalSpent;

  const spentToday = useMemo<number>(() => {
    const today = new Date().toDateString();
    return mockTransactions
      .filter(t => new Date(t.date).toDateString() === today && t.direction === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
  }, []);

  const progressClass =
    budgetPct >= 90 ? 'bg-danger' :
    budgetPct >= 70 ? 'bg-warning' :
    'bg-progress-rust';

  return (
    <div className="space-y-6 pt-6 lg:pt-8">

      {/* ── Hero card ──────────────────────────────────── */}
      <section>
        <div className="relative rounded-4xl overflow-hidden bg-hero-mesh border border-rust/[0.22] shadow-card-lg p-7">
          <div className="absolute inset-0 hero-glow-1 pointer-events-none" />
          <div className="absolute inset-0 hero-glow-2 pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-rust/[0.07] pointer-events-none" />

          <div className="relative z-10">
            {/* Top row */}
            <div className="flex items-start justify-between mb-7">
              <div>
                <p className="text-[13px] text-cream/50 font-medium mb-1">
                  Good {getGreeting()}, {mockUser.fullName.split(' ')[0]}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-cream/30">
                  Spent this month
                </p>
              </div>
              <button
                type="button"
                className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center text-cream/60 hover:bg-white/[0.10] transition-colors"
                aria-label="Share summary"
              >
                <Share2 size={15} />
              </button>
            </div>

            {/* Big spend number */}
            <p className={cn(
              'text-[54px] font-extrabold font-display tracking-[-0.04em] leading-none mb-7',
              budgetPct >= 100 ? 'text-danger' : 'text-cream'
            )}>
              <span className="text-[30px] opacity-50 align-top mt-2 inline-block mr-1">₦</span>
              <AnimatedNumber value={data.totalSpent} />
            </p>

            {/* Budget progress bar */}
            <div className="space-y-2.5">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetPct}%` }}
                  transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
                  className={cn('h-full rounded-full', progressClass)}
                />
              </div>
              <div className="flex justify-between text-[12px] font-medium text-cream/40">
                <span>
                  <AnimatedNumber value={Math.round(budgetPct)} format="pct" />% of budget used
                </span>
                <span>{formatNaira(remaining)} left · {data.daysLeftInMonth}d</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Two-column grid (desktop) ───────────────────── */}
      <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start space-y-6 lg:space-y-0">

        {/* Left column */}
        <div className="space-y-6">

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Spent Today"      value={spentToday}          accent={false} />
            <StatCard label="Daily Safe Spend" value={data.dailySafeSpend} accent={true}  />
          </div>

          {/* Weekly chart */}
          <Card variant="default" className="p-5">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-[17px] font-bold font-display text-cream">This Week</h3>
              <span className="text-[16px] font-extrabold font-display text-cream">
                {formatNaira(data.weeklySpend.reduce((a, b) => a + b, 0))}
              </span>
            </div>
            <div className="-mx-2">
              <WeeklyBarChart data={data.weeklySpend} />
            </div>
          </Card>

          {/* Top categories */}
          <div>
            <h3 className="text-[17px] font-bold font-display text-cream mb-3">Top Categories</h3>
            <TopCategories spendByCategory={data.spendByCategory} />
          </div>

          {/* Recent transactions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[17px] font-bold font-display text-cream">Recent</h3>
              <button
                type="button"
                onClick={() => navigate('/history')}
                className="text-[13px] font-bold text-rust hover:underline"
              >
                See all →
              </button>
            </div>
            <Card variant="default" className="!p-0 overflow-hidden">
              {mockTransactions.slice(0, 5).map((t, i) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  isLast={i === 4}
                />
              ))}
            </Card>
          </div>
        </div>

        {/* Right column — desktop only */}
        <div className="hidden lg:block space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[17px] font-bold font-display text-cream">Savings Goals</h3>
              <button
                type="button"
                onClick={() => navigate('/goals')}
                className="text-[13px] font-bold text-rust hover:underline"
              >
                Manage →
              </button>
            </div>
            <div className="space-y-3">
              {mockGoals.map(g => (
                <GoalCard
                  key={g.id}
                  goal={g}
                  onEdit={() => navigate('/goals')}
                  onDelete={() => undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
