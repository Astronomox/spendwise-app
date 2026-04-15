import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'danger' | 'warning' | 'neutral';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => {
    const variants = {
      success: 'bg-accent/10 text-accent border-accent/20',
      danger: 'bg-danger/10 text-danger border-danger/20',
      warning: 'bg-warning/10 text-warning border-warning/20',
      neutral: 'bg-gray-100 text-text-secondary border-gray-200',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-radius-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
