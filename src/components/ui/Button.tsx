import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-[var(--color-accent)] text-[#121212] font-[600] active:scale-[0.97] hover:shadow-[var(--shadow-shadow-accent)]',
      secondary: 'bg-transparent border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[rgba(0,135,81,0.1)] active:scale-[0.97]',
      tertiary: 'bg-transparent border-none text-[var(--color-accent)] hover:underline active:scale-[0.97]',
      ghost: 'bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)] hover:bg-[var(--color-border)] active:scale-[0.97]',
      danger: 'bg-[rgba(225,29,72,0.1)] text-[var(--color-danger)] hover:bg-[rgba(225,29,72,0.2)] active:scale-[0.97]',
      outline: 'bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] active:scale-[0.97]',
    };

    const sizes = {
      sm: 'min-h-[32px] px-[16px] text-[13px]',
      md: 'min-h-[44px] px-[24px] text-[15px]',
      lg: 'min-h-[52px] px-[32px] text-[16px]',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.1 }}
        className={cn(
          'inline-flex items-center justify-center rounded-[8px] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed font-body w-full sm:w-auto',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="h-5 w-5 animate-spin rounded-full border-[2px] border-current border-t-transparent" />
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
