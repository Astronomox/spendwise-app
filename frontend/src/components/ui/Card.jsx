// src/components/ui/Card.jsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const variants = {
  default:  'bg-forge-surface border border-white/[0.06]',
  elevated: 'bg-forge-elevated border border-white/[0.1]',
  glass:    'glass border border-white/[0.1]',
  accent:   'bg-accent-card border border-rust/20',
  hero:     'bg-hero-mesh border border-rust/[0.22]',
};

/**
 * @param {{ variant?: keyof variants, hoverable?: boolean } & React.HTMLAttributes<HTMLDivElement>} props
 */
export default function Card({
  children,
  variant   = 'default',
  hoverable = false,
  className,
  ...props
}) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' } : undefined}
      transition={{ duration: 0.15 }}
      className={cn(
        'rounded-3xl overflow-hidden',
        'shadow-card transition-shadow duration-200',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
