import { cn } from '@/src/lib/utils';
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
    <div className="space-y-8">
      <div className="text-center space-y-1">
        <p className="text-[13px] text-text-secondary font-medium uppercase tracking-widest">Amount</p>
        <div className="flex items-center justify-center gap-1">
          <span className="text-[32px] font-bold text-accent">₦</span>
          <span className="text-[48px] font-black font-display tracking-tighter">
            {value || '0'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handlePress(key)}
            className={cn(
              "h-16 rounded-radius-md flex items-center justify-center text-[20px] font-bold transition-colors active:bg-gray-200",
              key === 'backspace' ? "text-text-secondary" : "text-text-primary bg-bg-elevated"
            )}
          >
            {key === 'backspace' ? <DeleteIcon size={24} /> : key}
          </button>
        ))}
      </div>
    </div>
  );
}
