// src/components/ui/Input.tsx
import { useState } from 'react';
import { Eye, EyeOff, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?:   string;
  error?:   string;
  /** Show a ✕ button to clear the value */
  onClear?: () => void;
  /** Light (white) surface used on auth pages */
  inverse?: boolean;
}

export default function Input({
  label,
  error,
  className,
  disabled,
  onClear,
  type    = 'text',
  inverse = false,
  value,
  ...props
}: InputProps): React.JSX.Element {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword && showPw ? 'text' : type;

  const hasClearBtn = !isPassword && onClear != null && value !== '' && value != null;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label != null && (
        <label className={cn(
          'text-[13px] font-medium',
          inverse ? 'text-gray-600' : 'text-cream/55'
        )}>
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          disabled={disabled}
          value={value}
          className={cn(
            'w-full min-h-[48px] px-4 rounded-xl text-[15px] font-medium',
            'border transition-all duration-200 outline-none',
            'focus:ring-2 focus:ring-rust/30 focus:border-rust',
            inverse
              ? 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              : 'bg-forge-surface border-white/[0.10] text-cream placeholder:text-cream/30',
            error != null && 'border-danger focus:ring-danger/25 focus:border-danger',
            (isPassword || hasClearBtn) && 'pr-11',
            'disabled:opacity-50',
            className
          )}
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className={cn(
              'absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5',
              'flex items-center justify-center transition-colors',
              inverse ? 'text-gray-400 hover:text-gray-700' : 'text-cream/30 hover:text-cream/70'
            )}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {/* Clear button */}
        {hasClearBtn && (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5',
              'flex items-center justify-center transition-colors',
              inverse ? 'text-gray-400 hover:text-gray-700' : 'text-cream/30 hover:text-cream/70'
            )}
            aria-label="Clear input"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {error != null && (
        <p className="flex items-center gap-1 text-[12px] font-medium text-danger">
          <AlertTriangle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
