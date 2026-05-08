// src/pages/History.tsx
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/transactions';
import Card from '@/components/ui/Card';
import TransactionItem from '@/components/transactions/TransactionItem';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

function applyTimeFilter(txns: Transaction[], filter: TimeFilter): Transaction[] {
  const now = new Date();
  return txns.filter(t => {
    const d = new Date(t.date);
    if (filter === 'today') return d.toDateString() === now.toDateString();
    if (filter === 'week')  {
      const w = new Date();
      w.setDate(now.getDate() - 7);
      return d >= w;
    }
    if (filter === 'month') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    return true;
  });
}

// ——— Filter chip ———

interface ChipProps {
  active:    boolean;
  onClick:   () => void;
  color?:    string;
  children:  React.ReactNode;
}

function Chip({ active, onClick, color, children }: ChipProps): React.JSX.Element {
  const baseClass = cn(
    'px-3.5 py-1.5 rounded-full text-[13px] font-semibold border whitespace-nowrap transition-all duration-150',
    active
      ? 'bg-rust/12 border-rust text-rust'
      : 'bg-transparent border-white/[0.10] text-cream/50 hover:text-cream'
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={baseClass}
      style={
        active && color != null
          ? {
              borderColor: color,
              color,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
            }
          : undefined
      }
    >
      {children}
    </button>
  );
}

// ——— History page ———

const TIME_FILTERS: readonly TimeFilter[] = ['all', 'today', 'week', 'month'] as const;

export default function History(): React.JSX.Element {
  const [search,     setSearch]     = useState<string>('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [catFilter,  setCatFilter]  = useState<string>('all');
  const [editing,    setEditing]    = useState<Transaction | null>(null);

  const { transactions, isLoading } = useTransactions();

  const filtered = useMemo<Transaction[]>(() => {
    let list = applyTimeFilter(transactions, timeFilter);

    if (catFilter !== 'all') {
      list = list.filter(t => t.category === catFilter);
    }

    if (search.trim().length > 0) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.merchant ?? '').toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, search, timeFilter, catFilter]);

  return (
    <div className="flex flex-col pt-4">

      {/* —— Sticky filter header —— */}
      <div className="sticky top-0 z-20 bg-forge-bg/90 backdrop-blur-md pb-3 border-b border-white/[0.06] mb-4 space-y-3">

        <div className="relative pt-4">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 translate-y-[calc(-50%+8px)] text-cream/30 pointer-events-none"
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full h-11 pl-10 pr-10 bg-forge-surface border border-white/[0.10] rounded-xl text-[14px] text-cream placeholder:text-cream/30 outline-none focus:border-rust/50 focus:ring-2 focus:ring-rust/20 transition-all"
          />
          {search.length > 0 && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 translate-y-[calc(-50%+8px)] text-cream/30 hover:text-cream transition-colors"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {TIME_FILTERS.map(f => (
            <Chip key={f} active={timeFilter === f} onClick={() => setTimeFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Chip>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <Chip active={catFilter === 'all'} onClick={() => setCatFilter('all')}>All</Chip>
          {CATEGORIES.map(cat => {
            const Icon   = cat.Icon;
            const active = catFilter === cat.id;
            return (
              <Chip
                key={cat.id}
                active={active}
                color={cat.color}
                onClick={() => setCatFilter(cat.id)}
              >
                <span className="flex items-center gap-1.5">
                  <Icon size={12} />
                  {cat.label}
                </span>
              </Chip>
            );
          })}
        </div>
      </div>

      {/* —— Results —— */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[68px] rounded-2xl bg-forge-surface animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-forge-elevated flex items-center justify-center">
            <Search size={28} className="text-cream/20" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-cream mb-1">No transactions found</p>
            <p className="text-[14px] text-cream/40">
              {transactions.length === 0
                ? 'Log your first expense to see it here!'
                : 'Try adjusting your filters'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <Card variant="default" className="!p-0 overflow-hidden mb-4">
            {filtered.map((t, i) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                isLast={i === filtered.length - 1}
                onEdit={() => setEditing(t)}
              />
            ))}
          </Card>
          <p className="text-center text-[12px] text-cream/30 font-medium pb-4">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>

          <EditTransactionModal
            transaction={editing}
            isOpen={!!editing}
            onClose={() => setEditing(null)}
          />
        </>
      )}
    </div>
  );
}