// src/components/transactions/TransactionItem.jsx
import { motion } from 'framer-motion';
import { getCategoryById } from '@/lib/categories';
import { formatNaira, getTimeAgo, cn } from '@/lib/utils';

/**
 * @param {{ transaction: object, isLast?: boolean, onEdit?: (id:string)=>void }} props
 */
export default function TransactionItem({ transaction: t, isLast = false, onEdit }) {
  const cat    = getCategoryById(t.category);
  const Icon   = cat.Icon;
  const isCredit = t.direction === 'credit';

  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(33,26,20,0.9)' }}
      transition={{ duration: 0.12 }}
      onClick={() => onEdit?.(t.id)}
      className={cn(
        'flex items-center gap-3 px-4 py-3.5 transition-colors',
        onEdit && 'cursor-pointer',
        !isLast && 'border-b border-white/[0.06]'
      )}
    >
      {/* Category bubble */}
      <div
        className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${cat.color} 15%, transparent)` }}
      >
        <Icon size={18} style={{ color: cat.color }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-bold font-display text-cream truncate">
            {t.merchant || t.description}
          </p>
          {t.source === 'sms' && (
            <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 bg-forge-elevated border border-white/[0.1] text-cream/40 rounded font-bold uppercase tracking-wider">
              SMS
            </span>
          )}
        </div>
        <p className="text-[12px] text-cream/40 font-medium mt-0.5">
          {getTimeAgo(t.date)} · {cat.label}
        </p>
      </div>

      {/* Amount */}
      <p className={cn(
        'text-[15px] font-bold font-display flex-shrink-0',
        isCredit ? 'text-success' : 'text-cream'
      )}>
        {isCredit ? '+' : '−'}{formatNaira(t.amount)}
      </p>
    </motion.div>
  );
}
