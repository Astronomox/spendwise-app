import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, disabled, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[13px] font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'flex h-12 w-full rounded-radius-md border border-gray-200 bg-bg-secondary px-4 py-3 text-[15px] text-text-primary transition-all duration-150 placeholder:text-text-muted focus:border-accent focus:outline-none disabled:opacity-40 disabled:bg-bg-elevated',
            error && 'border-danger focus:border-danger',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[12px] text-danger animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
