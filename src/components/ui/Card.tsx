import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glow';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-white border-gray-100',
      elevated: 'bg-white border-gray-200 shadow-md',
      glow: 'accent-gradient text-white border-none shadow-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[16px] border bg-[var(--color-bg-card)] p-[20px] shadow-sm transition-transform duration-150 hover:-translate-y-[2px]',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export { Card };
