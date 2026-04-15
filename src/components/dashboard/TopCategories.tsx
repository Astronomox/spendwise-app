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
    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-6 -mx-6">
      {topCats.map((cat) => (
        <div 
          key={cat.id}
          className="flex items-center gap-2 px-3 py-2 bg-bg-elevated rounded-full border border-gray-100 shrink-0"
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${cat.color}15` }}
          >
            <cat.Icon size={16} style={{ color: cat.color }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              {cat.label}
            </span>
            <span className="text-[12px] font-bold">
              {formatNaira(cat.amount).replace('NGN', '').trim()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
