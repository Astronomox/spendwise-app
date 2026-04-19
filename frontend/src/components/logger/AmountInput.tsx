import { cn, formatNaira } from '@/src/lib/utils';
import { DeleteIcon } from '@/src/components/ui/icons';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function AmountInput({ value, onChange }: AmountInputProps) {
  const handlePress = (key: string) => {
    if (key === 'backspace') {
      onChange(value.slice(0, -1));
    } else if (value.length < 10) {
      // Prevent multiple leading zeros
      if (value === '0' && key === '0') return;
      if (value === '0' && key !== '0') {
        onChange(key);
      } else {
        onChange(value + key);
      }
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'];

  return (
    <div className="space-y-[32px] w-full max-w-[320px] mx-auto">
      <div className="text-center space-y-[4px]">
        <p className="text-[13px] text-[var(--color-text-secondary)] font-[600] uppercase tracking-widest">Amount</p>
        <div className="flex items-center justify-center gap-[4px] h-[64px]">
          <span className="text-[56px] font-bold font-display tracking-tight text-[var(--color-text-primary)]">
            {value ? formatNaira(Number(value)) : formatNaira(0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-[16px] max-w-[280px] mx-auto">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handlePress(key)}
            className={cn(
              "h-[64px] rounded-full flex items-center justify-center text-[24px] font-bold transition-colors active:scale-95 duration-100",
              key === 'backspace' ? "text-[var(--color-text-secondary)] bg-transparent hover:bg-[var(--color-bg-elevated)]" : "text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-border)] shadow-[var(--shadow-shadow-sm)]"
            )}
            aria-label={key === 'backspace' ? 'Backspace' : `Number ${key}`}
          >
            {key === 'backspace' ? <DeleteIcon size={28} /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}
