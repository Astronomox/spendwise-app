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
  const { transactions, isLoading: isTransactionsLoading } = useTransactions();
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

  const budgetProgress = (data.total_spent / data.monthly_budget) * 100;
  const recentTransactions = transactions.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8 pb-10"
    >
      {/* Greeting Section */}
      <header className="px-6 pt-6 flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[14px] text-text-secondary font-medium">
            Good evening, {user?.name?.split(' ')[0] || 'Adeola'}
          </p>
          <h2 className="text-[28px] font-black tracking-tight">Your Overview</h2>
        </div>
        {data && (
          <button
            onClick={() => setShowSummary(true)}
            className="p-2 text-text-secondary hover:bg-gray-100 rounded-full transition-colors"
            title="Share Summary"
          >
            <ShareIcon size={24} />
          </button>
        )}
      </header>

      {/* Main Balance Card */}
      <section className="px-6">
        <Card variant="glow" className="space-y-6 overflow-hidden relative">
          <div className="space-y-1 relative z-10">
            <p className="text-[13px] opacity-80 font-medium uppercase tracking-wider">Spent this month</p>
            <p className="text-[40px] font-black naira leading-none">{data.total_spent.toLocaleString()}</p>
          </div>
          
          <div className="space-y-3 relative z-10">
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${budgetProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-white" 
              />
            </div>
            <div className="flex justify-between items-center text-[12px] font-bold">
              <span className="opacity-90">{Math.round(budgetProgress)}% of budget used</span>
              <div className="flex items-center gap-1.5 opacity-90">
                <CalendarIcon size={14} />
                <span>{data.days_left_in_month} days left</span>
              </div>
            </div>
          </div>

          {/* Streak Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
            <FlameIcon size={16} className="text-warning" />
            <span className="text-[12px] font-bold text-white">{data.streak_count} day streak</span>
          </div>
        </Card>
      </section>

      {/* Daily Safe Spend & Weekly Chart */}
      <section className="px-6 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Card className="border-accent/20 bg-accent/5 flex justify-between items-center p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUpIcon size={16} className="text-accent" />
                <p className="text-[12px] font-bold uppercase tracking-widest text-accent">Daily Safe Spend</p>
              </div>
              <p className="text-[32px] font-black naira leading-none">{data.daily_safe_spend.toLocaleString()}</p>
            </div>
            <Badge variant="success" className="h-fit">Healthy</Badge>
          </Card>
        </div>

        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[14px] font-bold uppercase tracking-widest text-text-secondary">Weekly Spending</h3>
            <span className="text-[12px] font-bold text-accent">Last 7 Days</span>
          </div>
          <WeeklyBarChart data={data.weekly_spend} />
        </Card>
      </section>

      {/* Top Categories */}
      <section className="space-y-4">
        <div className="px-6">
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-text-secondary">Top Categories</h3>
        </div>
        <TopCategories spendByCategory={data.spend_by_category} />
      </section>

      {/* Recent Transactions */}
      <section className="space-y-4">
        <div className="px-6 flex justify-between items-center">
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-text-secondary">Recent Transactions</h3>
          <button 
            onClick={() => navigate('/history')}
            className="text-[12px] text-accent font-bold hover:underline"
          >
            See All
          </button>
        </div>
        <div className="bg-white border-y border-gray-100">
          {recentTransactions.map((t) => (
            <div key={t.id}>
              <TransactionItem 
                transaction={t} 
                onEdit={(id) => navigate(`/history?edit=${id}`)}
              />
            </div>
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
