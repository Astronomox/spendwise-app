import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-accent text-white hover:brightness-110 active:scale-[0.97]',
      ghost: 'bg-bg-elevated text-text-primary border border-gray-200 hover:bg-gray-200 active:scale-[0.97]',
      danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 active:scale-[0.97]',
      outline: 'bg-white text-text-primary border border-gray-200 hover:bg-gray-50 active:scale-[0.97]',
    };

    const sizes = {
      sm: 'h-9 px-4 text-[13px] font-medium',
      md: 'h-11 px-6 text-[15px] font-semibold',
      lg: 'h-[52px] px-8 text-[16px] font-bold',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={{ scale: 0.97 }}
        className={cn(
          'inline-flex items-center justify-center rounded-radius-md transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
