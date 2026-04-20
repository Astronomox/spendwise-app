// src/components/dashboard/TopCategories.jsx
import { motion } from 'framer-motion';
import { getCategoryById } from '@/lib/categories';
import { formatNaira } from '@/lib/utils';

/**
 * @param {{ spendByCategory: Record<string, number> }} props
 */
export default function TopCategories({ spendByCategory }) {
  const top = Object.entries(spendByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, amount]) => ({ ...getCategoryById(id), amount }));

  return (
    <div className="flex gap-2.5 overflow-x-auto pb-1">
      {top.map((cat, i) => {
        const Icon = cat.Icon;
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
            className="flex items-center gap-2.5 px-3.5 py-2.5 bg-forge-surface border border-white/[0.06] rounded-2xl flex-shrink-0 hover:border-white/[0.1] transition-colors cursor-default"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `color-mix(in srgb, ${cat.color} 15%, transparent)` }}
            >
              <Icon size={17} style={{ color: cat.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-cream/40 mb-0.5 leading-none">
                {cat.label}
              </p>
              <p className="text-[14px] font-bold font-display text-cream leading-none">
                {formatNaira(cat.amount)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
