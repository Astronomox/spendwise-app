// src/components/ui/Button.jsx
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const variants = {
  primary:   'bg-rust-gradient text-white shadow-rust hover:shadow-rust-lg border-0',
  secondary: 'bg-transparent border-2 border-rust/30 text-rust hover:bg-rust/10',
  ghost:     'bg-forge-elevated text-cream border border-white/[0.1] hover:bg-forge-muted',
  danger:    'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/15',
  outline:   'bg-transparent border border-white/[0.1] text-cream hover:bg-forge-elevated',
  white:     'bg-white text-gray-900 border-0 hover:bg-gray-50',
};

const sizes = {
  sm: 'h-8  px-3.5 text-[13px] rounded-xl  gap-1.5',
  md: 'h-11 px-5   text-[15px] rounded-xl  gap-2',
  lg: 'h-13 px-7   text-[16px] rounded-2xl gap-2',
};

/**
 * @param {{ variant?: keyof variants, size?: keyof sizes, isLoading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  children,
  variant = 'primary',
  size    = 'md',
  isLoading,
  className,
  disabled,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        'transition-all duration-150 cursor-pointer select-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : children}
    </motion.button>
  );
}
