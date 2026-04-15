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
  const recentTransactions = transactions.slice(0, 3);

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
      <section className="px-[24px]">
        <div className="relative rounded-[24px] bg-[var(--color-text-primary)] p-[24px] text-white shadow-[var(--shadow-shadow-lg)] overflow-hidden">
          {/* Radial Glow */}
          <div className="absolute top-[-30%] right-[-20%] w-[200px] h-[200px] bg-[var(--color-accent)] rounded-full blur-[80px] opacity-40 pointer-events-none" />

          <div className="relative z-10 flex justify-between items-start mb-[32px]">
            <div>
              <p className="text-[14px] text-[var(--color-text-muted)] font-[500] mb-[4px]">
                Good evening, {user?.name?.split(' ')[0] || 'Adeola'}
              </p>
              <h2 className="text-[14px] font-bold uppercase tracking-widest opacity-80">Spent this month</h2>
            </div>
            {data && (
              <button
                onClick={() => setShowSummary(true)}
                className="p-[8px] bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
                title="Share Summary"
              >
                <ShareIcon size={20} />
              </button>
            )}
          </div>
          
          <div className="relative z-10 space-y-[24px]">
            <p className="text-[40px] font-black font-display tracking-tight naira leading-none">{data.total_spent.toLocaleString()}</p>

            <div className="space-y-[12px]">
              <div className="h-[8px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, budgetProgress)}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  className={`h-full rounded-full ${getProgressColor(budgetProgress)}`}
                />
              </div>
              <div className="flex justify-between items-center text-[13px] font-[600] opacity-80">
                <span>{Math.round(budgetProgress)}% of budget used</span>
                <span>{data.days_left_in_month} days left</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Safe Spend */}
      <section className="px-[24px]">
        <Card className="border-[var(--color-accent-border)] bg-[rgba(0,135,81,0.05)] flex justify-between items-center">
          <div className="space-y-[4px]">
            <p className="text-[13px] font-[500] text-[var(--color-text-secondary)]">Daily Safe Spend</p>
            <p className="text-[28px] font-black font-display text-[var(--color-text-primary)] naira leading-none">{data.daily_safe_spend.toLocaleString()}</p>
          </div>
          <div className="w-[48px] h-[48px] rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)]">
            <TrendingUpIcon size={24} />
          </div>
        </Card>
      </section>

      {/* Weekly Chart */}
      <section className="px-[24px]">
        <Card className="space-y-[24px]">
          <div className="flex justify-between items-center">
            <h3 className="text-[16px] font-black font-display">Weekly Spend</h3>
            <span className="text-[13px] font-[600] text-[var(--color-text-secondary)]">Last 7 Days</span>
          </div>
          <WeeklyBarChart data={data.weekly_spend} />
        </Card>
      </section>

      {/* Top Categories */}
      <section className="space-y-[16px]">
        <div className="px-[24px]">
          <h3 className="text-[16px] font-black font-display">Top Categories</h3>
        </div>
        <TopCategories spendByCategory={data.spend_by_category} />
      </section>

      {/* Recent Transactions */}
      <section className="space-y-[16px]">
        <div className="px-[24px] flex justify-between items-center">
          <h3 className="text-[16px] font-black font-display">Recent Transactions</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-[14px] text-[var(--color-accent)] font-bold hover:underline"
          >
            View all
          </button>
        </div>
        <div className="bg-[var(--color-bg-card)] border-y-[1px] border-[var(--color-border)]">
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
