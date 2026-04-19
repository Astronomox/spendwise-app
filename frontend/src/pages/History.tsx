import React, { useState, useMemo } from 'react';
import { TransactionFeed } from '@/src/components/transactions/TransactionFeed';
import { useTransactions } from '@/src/hooks/useTransactions';
import { CATEGORIES, CategoryId } from '@/src/components/logger/CategoryPicker';
import { cn } from '@/src/lib/utils';
import { SearchIcon, RefreshIcon } from '@/src/components/ui/icons';
import { EditTransactionModal } from '@/src/components/transactions/EditTransactionModal';
import { Transaction } from '@/src/types/transactions';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { useToastStore } from '@/src/components/ui/Toast';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const { transactions, isLoading, error } = useTransactions();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleEdit = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) setEditingTransaction(transaction);
  };

  const { addToast } = useToastStore();

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    // API deletion not available yet
    addToast('Deletion coming soon.', 'warning');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Time filter
      const date = new Date(t.date);
      const now = new Date();

      if (timeFilter === 'today' && date.toDateString() !== now.toDateString()) return false;
      if (timeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        if (date < weekAgo) return false;
      }
      if (timeFilter === 'month' && (date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear())) return false;

      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const merchant = (t.merchant || '').toLowerCase();
        const description = t.description.toLowerCase();
        if (!merchant.includes(query) && !description.includes(query)) return false;
      }

      return true;
    });
  }, [timeFilter, categoryFilter, searchQuery, transactions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col h-full bg-[var(--color-bg-secondary)]"
    >
      {/* Search & Filter Header */}
      <div className="px-[16px] py-[16px] space-y-[16px] border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-secondary)] z-20 shadow-[var(--shadow-shadow-sm)]">
        <div className="relative">
          <SearchIcon className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[48px] pl-[40px] pr-[16px] bg-[var(--color-bg-elevated)] rounded-[12px] border border-transparent focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-secondary)] focus:shadow-[var(--shadow-shadow-accent)] transition-all outline-none text-[15px] font-[500] placeholder-[var(--color-text-muted)]"
          />
        </div>

        <div className="flex gap-[8px] overflow-x-auto pb-[4px] scrollbar-hide">
          {(['all', 'today', 'week', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={cn(
                "px-[16px] py-[8px] rounded-[9999px] text-[13px] font-[600] capitalize transition-all whitespace-nowrap border-[1px]",
                timeFilter === f ? "bg-[var(--color-accent)] text-[#121212] border-[var(--color-accent)] shadow-[var(--shadow-shadow-sm)]" : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-[8px] overflow-x-auto pb-[4px] scrollbar-hide">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              "px-[16px] py-[8px] rounded-[12px] text-[12px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border-[1px]",
              categoryFilter === 'all' ? "bg-[var(--color-text-primary)] text-[var(--color-bg-secondary)] border-[var(--color-text-primary)]" : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)]"
            )}
          >
            All
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "px-[16px] py-[8px] rounded-[12px] text-[12px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border-[1px] flex items-center gap-[6px]",
                  categoryFilter === cat.id
                    ? "bg-[rgba(0,135,81,0.05)] border-[var(--color-accent)] text-[var(--color-text-primary)] shadow-[var(--shadow-shadow-sm)]"
                    : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]"
                )}
                style={{
                  borderColor: categoryFilter === cat.id ? cat.color : undefined,
                  color: categoryFilter === cat.id ? cat.color : undefined
                }}
                aria-label={`Filter by ${cat.label}`}
              >
                <Icon size={14} style={{ color: categoryFilter === cat.id ? cat.color : undefined }} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 p-[16px] space-y-[16px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full h-[64px] skeleton rounded-[16px]"></div>
          ))}
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-[24px] text-center">
          <p className="text-[var(--color-danger)] font-bold">Failed to load transactions.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pb-[72px]">
          <TransactionFeed
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      <EditTransactionModal
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
      />
    </motion.div>
  );
}
