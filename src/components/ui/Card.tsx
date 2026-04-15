import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glow';
  featured?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', featured = false, ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--color-bg-card)] border-[var(--color-border)] shadow-[var(--shadow-shadow-sm)] hover:shadow-[var(--shadow-shadow-md)] text-[var(--color-text-primary)]',
      elevated: 'bg-[var(--color-bg-card)] border-[var(--color-border)] shadow-[var(--shadow-shadow-md)] hover:shadow-[var(--shadow-shadow-lg)] text-[var(--color-text-primary)]',
      glow: 'accent-gradient text-white border-none shadow-[var(--shadow-shadow-lg)]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-[16px] border-[1px] border-solid p-[20px] transition-all duration-150 hover:-translate-y-[2px] overflow-hidden',
          featured ? 'pl-[24px]' : '',
          variants[variant],
          className
        )}
        {...props}
      >
        {featured && (
          <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-[var(--color-accent)]" />
        )}
        {props.children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
