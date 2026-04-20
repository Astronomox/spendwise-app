// src/pages/History.jsx
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { mockTransactions } from '@/data/mockData';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';
import Card from '@/components/ui/Card';
import TransactionItem from '@/components/transactions/TransactionItem';

const TIME_FILTERS = ['all', 'today', 'week', 'month'];

function filterByTime(txns, filter) {
  const now = new Date();
  return txns.filter(t => {
    const d = new Date(t.date);
    if (filter === 'today') return d.toDateString() === now.toDateString();
    if (filter === 'week')  { const w = new Date(); w.setDate(now.getDate() - 7); return d >= w; }
    if (filter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    return true;
  });
}

function Chip({ active, onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3.5 py-1.5 rounded-full text-[13px] font-semibold border whitespace-nowrap transition-all duration-150',
        active
          ? 'bg-rust/12 border-rust text-rust'
          : 'bg-transparent border-white/[0.1] text-cream/50 hover:text-cream'
      )}
      style={active && color ? { borderColor: color, color, background: `color-mix(in srgb, ${color} 12%, transparent)` } : undefined}
    >
      {children}
    </button>
  );
}

export default function History() {
  const [search,     setSearch]     = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [catFilter,  setCatFilter]  = useState('all');

  const filtered = useMemo(() => {
    let list = filterByTime(mockTransactions, timeFilter);
    if (catFilter !== 'all') list = list.filter(t => t.category === catFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        (t.merchant || '').toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, timeFilter, catFilter]);

  return (
    <div className="flex flex-col pt-4">
      {/* Sticky filter header */}
      <div className="sticky top-0 z-20 bg-forge-bg/90 backdrop-blur-md pb-3 border-b border-white/[0.06] mb-4 space-y-3">
        {/* Search */}
        <div className="relative pt-4">
          <Search size={17} className="absolute left-3.5 top-1/2 translate-y-[calc(-50%+8px)] text-cream/30 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full h-11 pl-10 pr-10 bg-forge-surface border border-white/[0.1] rounded-xl text-[14px] text-cream placeholder:text-cream/30 outline-none focus:border-rust/50 focus:ring-2 focus:ring-rust/20 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 translate-y-[calc(-50%+8px)] text-cream/30 hover:text-cream transition-colors">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Time chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {TIME_FILTERS.map(f => (
            <Chip key={f} active={timeFilter === f} onClick={() => setTimeFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Chip>
          ))}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          <Chip active={catFilter === 'all'} onClick={() => setCatFilter('all')}>All</Chip>
          {CATEGORIES.map(cat => {
            const Icon = cat.Icon;
            return (
              <Chip
                key={cat.id}
                active={catFilter === cat.id}
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

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-forge-elevated flex items-center justify-center">
            <Search size={28} className="text-cream/20" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-cream mb-1">No transactions found</p>
            <p className="text-[14px] text-cream/40">Try adjusting your filters</p>
          </div>
        </div>
      ) : (
        <>
          <Card variant="default" className="!p-0 overflow-hidden mb-4">
            {filtered.map((t, i) => (
              <TransactionItem key={t.id} transaction={t} isLast={i === filtered.length - 1} />
            ))}
          </Card>
          <p className="text-center text-[12px] text-cream/30 font-medium pb-4">
            {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  );
}
