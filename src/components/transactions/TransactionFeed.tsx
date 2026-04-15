import React from 'react';
import { Transaction } from '@/src/types/transactions';
import { TransactionItem } from './TransactionItem';
import { TrendingUpIcon } from '@/src/components/ui/icons';

interface TransactionFeedProps {
  transactions: Transaction[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TransactionFeed({ transactions, onEdit, onDelete }: TransactionFeedProps) {
  // Group transactions by date
  const groups = transactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let label = '';
    if (date.toDateString() === today.toDateString()) {
      label = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday';
    } else {
      label = date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    if (!acc[label]) acc[label] = [];
    acc[label].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Sort groups by date (newest first)
  const sortedLabels = Object.keys(groups).sort((a, b) => {
    const dateA = new Date(groups[a][0].date);
    const dateB = new Date(groups[b][0].date);
    return dateB.getTime() - dateA.getTime();
  });

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[80px] text-center space-y-[16px]">
        <div className="w-[64px] h-[64px] bg-[var(--color-bg-elevated)] rounded-full flex items-center justify-center text-[var(--color-text-muted)]">
          <TrendingUpIcon size={32} />
        </div>
        <div className="space-y-[4px]">
          <p className="font-bold font-display text-[20px] text-[var(--color-text-primary)]">No transactions yet</p>
          <p className="text-[15px] font-[500] text-[var(--color-text-secondary)]">Tap + to log your first expense.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--color-border)]">
      {sortedLabels.map((label) => (
        <div key={label} className="space-y-[4px]">
          <div className="bg-[var(--color-bg-elevated)] px-[24px] py-[8px]">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">
              {label}
            </span>
          </div>
          <div className="bg-[var(--color-bg-secondary)]">
            {groups[label].map((t) => (
              <div key={t.id}>
                <TransactionItem 
                  transaction={t} 
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
