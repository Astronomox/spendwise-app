// src/components/ui/Card.tsx
import type { FC, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'elevated' | 'glass' | 'accent' | 'hero';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children?:  ReactNode;
  variant?:   CardVariant;
  hoverable?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default:  'bg-forge-surface border border-white/[0.06]',
  elevated: 'bg-forge-elevated border border-white/[0.10]',
  glass:    'glass border border-white/[0.10]',
  accent:   'bg-accent-card border border-rust/20',
  hero:     'bg-hero-mesh border border-rust/[0.22]',
};

const Card: FC<CardProps> = ({
  children,
  variant   = 'default',
  hoverable = false,
  className,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' } : undefined}
      transition={{ duration: 0.15 }}
      className={cn(
        'rounded-3xl overflow-hidden shadow-card transition-shadow duration-200',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;