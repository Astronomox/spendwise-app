import React from 'react';
import { CATEGORIES } from '@/src/components/logger/CategoryPicker';
import { formatNaira } from '@/src/lib/utils';

interface TopCategoriesProps {
  spendByCategory: Record<string, number>;
}

export function TopCategories({ spendByCategory }: TopCategoriesProps) {
  // Sort categories by spend amount and take top 4
  const topCats = Object.entries(spendByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([id, amount]) => {
      const category = CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
      return { ...category, amount };
    });

  return (
    <div className="flex gap-[8px] overflow-x-auto pb-[4px] px-[16px] scrollbar-hide">
      {topCats.map((cat) => (
        <div 
          key={cat.id}
          className="flex items-center gap-[8px] p-[8px] pr-[16px] bg-[var(--color-bg-card)] rounded-[16px] border border-[var(--color-border)] shrink-0 shadow-sm"
        >
          <div 
            className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: `color-mix(in srgb, ${cat.color} 15%, transparent)` }}
          >
            <cat.Icon size={20} style={{ color: cat.color }} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)] leading-none mb-[4px]">
              {cat.label}
            </span>
            <span className="text-[15px] font-bold font-display leading-none text-[var(--color-text-primary)]">
              {formatNaira(cat.amount)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
