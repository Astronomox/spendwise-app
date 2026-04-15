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
    <div className="relative overflow-hidden group">
      {/* Actions behind the row */}
      <div className="absolute inset-0 flex justify-between items-center px-6">
        <motion.div 
          style={{ opacity: editOpacity }}
          className="flex items-center gap-2 text-accent font-bold"
        >
          <EditIcon size={20} />
          <span>Edit</span>
        </motion.div>
        <motion.div 
          style={{ opacity: deleteOpacity }}
          className="flex items-center gap-2 text-danger font-bold"
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
        className="relative bg-white flex items-center gap-3 py-4 px-6 border-b border-gray-100 active:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing"
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ 
            backgroundColor: `${category.color}15`,
          }}
        >
          <Icon size={20} style={{ color: category.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold truncate">
              {transaction.merchant || transaction.description}
            </p>
            {transaction.status === 'pending' && (
              <Badge variant="warning" className="text-[9px] px-1 py-0">Pending</Badge>
            )}
            {transaction.source === 'sms' && (
              <Badge variant="neutral" className="text-[9px] px-1 py-0">SMS</Badge>
            )}
          </div>
          <p className="text-[11px] text-text-secondary">
            {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className={cn(
            "text-[15px] font-bold",
            isCredit ? "text-accent" : "text-text-primary"
          )}>
            {isCredit ? '+' : '-'} {formatNaira(transaction.amount).replace('NGN', '').trim()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
