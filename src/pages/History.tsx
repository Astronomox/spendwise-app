import React, { useState, useMemo } from 'react';
import { TransactionFeed } from '@/src/components/transactions/TransactionFeed';
import { useTransactions } from '@/src/hooks/useTransactions';
import { CATEGORIES, CategoryId } from '@/src/components/logger/CategoryPicker';
import { cn } from '@/src/lib/utils';
import { SearchIcon, RefreshIcon } from '@/src/components/ui/icons';
import { EditTransactionModal } from '@/src/components/transactions/EditTransactionModal';
import { Transaction } from '@/src/types/transactions';
import { supabase } from '@/src/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'motion/react';

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    } catch (e) {
      console.error('Failed to delete transaction', e);
    }
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
      className="flex flex-col h-full bg-white"
    >
      {/* Search & Filter Header */}
      <div className="px-6 py-4 space-y-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-bg-elevated rounded-radius-md border border-transparent focus:border-accent focus:bg-white transition-all outline-none text-[14px]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'today', 'week', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[12px] font-bold capitalize transition-all whitespace-nowrap",
                timeFilter === f ? "bg-accent text-white" : "bg-bg-elevated text-text-secondary border border-gray-100"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              "px-3 py-1.5 rounded-radius-sm text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
              categoryFilter === 'all' ? "bg-text-primary text-white border-text-primary" : "bg-white text-text-secondary border-gray-200"
            )}
          >
            All Categories
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.Icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={cn(
                  "px-3 py-1.5 rounded-radius-sm text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border flex items-center gap-1.5",
                  categoryFilter === cat.id 
                    ? "bg-white border-accent text-text-primary shadow-sm" 
                    : "bg-white text-text-secondary border-gray-200"
                )}
                style={{ 
                  borderColor: categoryFilter === cat.id ? cat.color : undefined,
                  color: categoryFilter === cat.id ? cat.color : undefined
                }}
              >
                <Icon size={14} style={{ color: categoryFilter === cat.id ? cat.color : undefined }} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <RefreshIcon className="animate-spin text-accent" size={32} />
          <p className="text-text-secondary font-medium">Loading history...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-danger font-bold">Failed to load transactions.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
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
