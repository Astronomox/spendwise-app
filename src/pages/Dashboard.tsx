import { useNavigate } from 'react-router-dom';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { useAppStore } from '@/src/lib/store';
import { cn, formatNaira } from '@/src/lib/utils';
import { WeeklyBarChart } from '@/src/components/charts/WeeklyBarChart';
import { TopCategories } from '@/src/components/dashboard/TopCategories';
import { TransactionItem } from '@/src/components/transactions/TransactionItem';
import { useDashboardSummary } from '@/src/hooks/useDashboard';
import { useTransactions } from '@/src/hooks/useTransactions';
import { ShareableSummaryCard } from '@/src/components/dashboard/ShareableSummaryCard';
import { 
  FlameIcon, 
  TrendingUpIcon, 
  CalendarIcon, 
  RefreshIcon,
  ShareIcon
} from '@/src/components/ui/icons';
import { useState } from 'react';
import { motion } from 'motion/react';
import { AnimatedNumber } from '@/src/components/ui/AnimatedNumber';

export default function Dashboard() {
  const { user } = useAppStore();
  const navigate = useNavigate();
  
  const { data, isLoading, error, refetch } = useDashboardSummary();
  const { transactions } = useTransactions();
  const [showSummary, setShowSummary] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <RefreshIcon className="animate-spin text-accent" size={32} />
        <p className="text-text-secondary font-medium">Loading your finances...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 space-y-4 text-center">
        <p className="text-danger font-bold">Failed to load dashboard data.</p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 bg-accent text-white rounded-radius-md font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const budgetProgress = data.monthly_budget > 0 ? (data.total_spent / data.monthly_budget) * 100 : 0;
  const recentTransactions = transactions.slice(0, 5);

  const spentToday = transactions
    .filter(t => t.date === new Date().toISOString().split('T')[0] && t.direction === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-[var(--color-danger)]';
    if (progress >= 70) return 'bg-[var(--color-warning)]';
    return 'bg-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-[32px] pb-[40px] pt-[8px]"
    >
      {/* Hero Section */}
      <section className="px-[16px]">
        <div className="relative rounded-[24px] hero-gradient radial-glow p-[24px] text-white shadow-[var(--shadow-shadow-lg)] overflow-hidden w-full">
          <div className="relative z-10 flex justify-between items-start mb-[32px]">
            <div>
              <p className="text-[14px] text-[var(--color-text-secondary)] font-[500] mb-[4px]">
                Good evening, {user?.name?.split(' ')[0] || 'Adeola'}
              </p>
              <h2 className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Spent this month</h2>
            </div>
            {data && (
              <button
                onClick={() => setShowSummary(true)}
                className="p-[8px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-full text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                title="Share Summary"
              >
                <ShareIcon size={18} />
              </button>
            )}
          </div>
          
          <div className="relative z-10 space-y-[24px]">
            <p className={cn(
              "text-[48px] font-bold font-display tracking-tight leading-none",
              budgetProgress >= 100 ? "text-[var(--color-danger)]" : "text-white"
            )}>
              <span className="text-[32px] align-top mr-[4px]">₦</span>
              <AnimatedNumber value={data.total_spent} />
            </p>

            <div className="space-y-[12px]">
              <div className="h-[6px] bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, budgetProgress)}%` }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  className={`h-full rounded-full ${getProgressColor(budgetProgress)}`}
                />
              </div>
              <div className="flex justify-between items-center text-[13px] font-[500] text-[var(--color-text-secondary)]">
                <span><AnimatedNumber value={budgetProgress} format="percentage" />% of budget used</span>
                <span>{data.days_left_in_month} days left</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2-Column Quick Stats Row */}
      <section className="px-[16px] grid grid-cols-2 gap-[12px]">
        <Card className="flex flex-col p-[16px] border-[var(--color-border)] shadow-none">
          <p className="text-[12px] font-[500] text-[var(--color-text-secondary)] mb-[8px]">Spent Today</p>
          <p className="text-[20px] font-bold font-display text-[var(--color-text-primary)] leading-none">
            <span className="text-[14px] align-top mr-[2px]">₦</span>
            <AnimatedNumber value={spentToday} />
          </p>
        </Card>
        <Card className="flex flex-col p-[16px] border-[var(--color-accent-border)] bg-[rgba(0,135,81,0.02)] shadow-none">
          <p className="text-[12px] font-[500] text-[var(--color-text-secondary)] mb-[8px]">Daily Safe Spend</p>
          <p className="text-[20px] font-bold font-display text-[var(--color-accent)] leading-none">
            <span className="text-[14px] align-top mr-[2px]">₦</span>
            <AnimatedNumber value={data.daily_safe_spend} />
          </p>
        </Card>
      </section>

      {/* Weekly Chart */}
      <section className="px-[16px]">
        <Card className="space-y-[24px] p-[20px] shadow-none">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-[18px] font-bold font-display text-[var(--color-text-primary)]">This Week</h3>
            </div>
            <div className="text-right">
              <span className="text-[16px] font-bold font-display text-[var(--color-text-primary)]">
                {formatNaira(data.weekly_spend.reduce((a: number, b: number) => a + b, 0))}
              </span>
            </div>
          </div>
          <div className="-ml-[16px]">
            <WeeklyBarChart data={data.weekly_spend} />
          </div>
        </Card>
      </section>

      {/* Top Categories */}
      <section className="space-y-[12px]">
        <div className="px-[16px]">
          <h3 className="text-[18px] font-bold font-display text-[var(--color-text-primary)]">Top Categories</h3>
        </div>
        <TopCategories spendByCategory={data.spend_by_category} />
      </section>

      {/* Recent Transactions */}
      <section className="space-y-[12px]">
        <div className="px-[16px] flex justify-between items-center">
          <h3 className="text-[18px] font-bold font-display text-[var(--color-text-primary)]">Recent</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-[13px] text-[var(--color-accent)] font-bold hover:underline"
          >
            See all
          </button>
        </div>
        <div className="bg-[var(--color-bg-secondary)] px-[16px]">
          <div className="border-[1px] border-[var(--color-border)] rounded-[16px] overflow-hidden bg-[var(--color-bg-card)]">
            {recentTransactions.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TransactionItem
                  transaction={t}
                  onEdit={(id) => navigate(`/history?edit=${id}`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Savings Snapshot */}
      <section className="space-y-[12px] px-[16px] pb-[24px]">
        <div className="flex justify-between items-center">
          <h3 className="text-[18px] font-bold font-display text-[var(--color-text-primary)]">Savings</h3>
          <button
            onClick={() => navigate('/goals')}
            className="text-[13px] text-[var(--color-accent)] font-bold hover:underline"
          >
            Manage
          </button>
        </div>
        <Card className="p-[16px] shadow-none">
          <p className="text-[14px] text-[var(--color-text-secondary)] font-[500]">No active savings goals found.</p>
        </Card>
      </section>

      {showSummary && data && (
        <ShareableSummaryCard
          data={data}
          user={user}
          onClose={() => setShowSummary(false)}
        />
      )}
    </motion.div>
  );
}
