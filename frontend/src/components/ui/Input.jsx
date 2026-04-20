// src/components/ui/Input.jsx
import { useState } from 'react';
import { Eye, EyeOff, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @param {{ label?: string, error?: string, onClear?: () => void, inverse?: boolean } & React.InputHTMLAttributes<HTMLInputElement>} props
 */
export default function Input({
  label,
  error,
  className,
  disabled,
  onClear,
  type     = 'text',
  inverse  = false,
  ...props
}) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword && showPw ? 'text' : type;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className={cn('text-[13px] font-medium', inverse ? 'text-gray-600' : 'text-cream/55')}>
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          disabled={disabled}
          className={cn(
            'w-full min-h-[48px] px-4 rounded-xl text-[15px] font-medium',
            'border transition-all duration-200 outline-none',
            'input-focus',
            inverse
              ? 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              : 'bg-forge-surface border-white/[0.1] text-cream placeholder:text-cream/30',
            error && 'border-danger focus:ring-danger/25',
            (isPassword || (onClear && props.value)) && 'pr-11',
            'disabled:opacity-50',
            className
          )}
          {...props}
        />

        {/* Right slot: password toggle OR clear button */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className={cn(
              'absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5',
              'flex items-center justify-center transition-colors',
              inverse ? 'text-gray-400 hover:text-gray-700' : 'text-cream/30 hover:text-cream/70'
            )}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : onClear && props.value ? (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              'absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5',
              'flex items-center justify-center transition-colors',
              inverse ? 'text-gray-400 hover:text-gray-700' : 'text-cream/30 hover:text-cream/70'
            )}
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-[12px] font-medium text-danger">
          <AlertTriangle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}
