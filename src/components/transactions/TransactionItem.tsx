import React from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Transaction } from '@/src/types/transactions';
import { CATEGORIES } from '@/src/components/logger/CategoryPicker';
import { cn, formatNaira } from '@/src/lib/utils';
import { Badge } from '@/src/components/ui/Badge';
import { EditIcon, TrashIcon } from '@/src/components/ui/icons';

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TransactionItem({ transaction, onEdit, onDelete }: TransactionItemProps) {
  const category = CATEGORIES.find((c) => c.id === transaction.category) || CATEGORIES[CATEGORIES.length - 1];
  
  const x = useMotionValue(0);
  
  // Transform x position to opacity and scale for actions
  const editOpacity = useTransform(x, [0, 80], [0, 1]);
  const deleteOpacity = useTransform(x, [-80, 0], [1, 0]);
  
  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onEdit?.(transaction.id);
    } else if (info.offset.x < -100) {
      onDelete?.(transaction.id);
    }
    // Snap back
    x.set(0);
  };

  const isCredit = transaction.direction === 'credit';
  const Icon = category.Icon;

  return (
    <div className="relative overflow-hidden group border-b-[1px] border-[var(--color-border)] last:border-b-0">
      {/* Actions behind the row */}
      <div className="absolute inset-0 flex justify-between items-center px-[24px]">
        <motion.div 
          style={{ opacity: editOpacity }}
          className="flex items-center gap-[8px] text-[var(--color-accent)] font-bold h-full"
        >
          <EditIcon size={20} />
          <span>Edit</span>
        </motion.div>
        <motion.div 
          style={{ opacity: deleteOpacity }}
          className="flex items-center gap-[8px] text-[var(--color-danger)] font-bold h-full"
        >
          <span>Delete</span>
          <TrashIcon size={20} />
        </motion.div>
      </div>

      {/* Main Row */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "relative bg-[var(--color-bg-secondary)] flex items-center gap-[12px] h-[64px] pl-[16px] pr-[24px] ml-[8px] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-grab active:cursor-grabbing",
          transaction.status === 'pending' ? "border-l-[4px] border-[var(--color-warning)] pl-[12px]" : ""
        )}
      >
        <div 
          className="w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0"
          style={{ 
            backgroundColor: `color-mix(in srgb, ${category.color} 15%, transparent)`,
          }}
        >
          <Icon size={20} style={{ color: category.color }} />
        </div>
        
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-[8px]">
            <p className="text-[15px] font-[500] truncate text-[var(--color-text-primary)]">
              {transaction.merchant || transaction.description}
            </p>
            {transaction.source === 'sms' && (
              <span className="text-[9px] px-[6px] py-[2px] bg-[var(--color-slate)] text-white rounded-[4px] font-bold uppercase tracking-wider">SMS</span>
            )}
          </div>
          <p className="text-[12px] text-[var(--color-text-secondary)] mt-[2px]">
            {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="text-right shrink-0 flex flex-col justify-center">
          <p className={cn(
            "text-[15px] font-bold",
            isCredit ? "text-[var(--color-accent)]" : "text-[var(--color-text-primary)]"
          )}>
            {isCredit ? '+' : '-'} {formatNaira(transaction.amount).replace('NGN', '').trim()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
