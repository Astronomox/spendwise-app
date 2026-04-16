import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';
import { CloseIcon, WarningIcon } from '@/src/components/ui/icons';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isCurrency?: boolean;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, disabled, isCurrency, value, onClear, ...props }, ref) => {
    return (
      <div className="w-full space-y-[8px] relative">
        {label && (
          <label className="text-[13px] font-[500] text-[var(--color-text-secondary)] block">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {isCurrency && (
            <div className="absolute left-[16px] top-1/2 -translate-y-1/2 font-[600] text-[var(--color-text-primary)] pointer-events-none">
              ₦
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            value={value}
            className={cn(
              'flex min-h-[48px] w-full rounded-[12px] border-[1px] border-[var(--color-border)] bg-[var(--color-bg-secondary)] py-[12px] text-[15px] text-[var(--color-text-primary)] transition-all duration-200 placeholder-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:shadow-[var(--shadow-shadow-accent)] focus:outline-none disabled:opacity-50 disabled:bg-[var(--color-bg-elevated)]',
              isCurrency ? 'pl-[40px]' : 'px-[16px]',
              error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:shadow-[0_0_0_3px_rgba(225,29,72,0.2)]',
              className
            )}
            {...props}
          />
          {value && onClear && typeof value === 'string' && value.length > 0 && !disabled && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </div>
        {error && (
          <p className="text-[12px] text-[var(--color-danger)] font-[500] flex items-center gap-[4px] animate-in fade-in slide-in-from-top-1">
            <WarningIcon size={14} />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
