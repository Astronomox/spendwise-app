import { cn } from '@/src/lib/utils';
import { 
  FoodCategoryIcon, 
  TransportCategoryIcon, 
  AirtimeCategoryIcon, 
  ShoppingCategoryIcon, 
  UtilitiesCategoryIcon, 
  HealthCategoryIcon, 
  EntertainmentCategoryIcon, 
  SavingsCategoryIcon, 
  OtherCategoryIcon 
} from '@/src/components/ui/icons';

export const CATEGORIES = [
  { id: 'food', label: 'Food', Icon: FoodCategoryIcon, color: 'var(--color-food)' },
  { id: 'transport', label: 'Transport', Icon: TransportCategoryIcon, color: 'var(--color-transport)' },
  { id: 'airtime', label: 'Airtime', Icon: AirtimeCategoryIcon, color: 'var(--color-airtime)' },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingCategoryIcon, color: 'var(--color-shopping)' },
  { id: 'utilities', label: 'Utilities', Icon: UtilitiesCategoryIcon, color: 'var(--color-utilities)' },
  { id: 'health', label: 'Health', Icon: HealthCategoryIcon, color: 'var(--color-health)' },
  { id: 'entertainment', label: 'Entertainment', Icon: EntertainmentCategoryIcon, color: 'var(--color-entertainment)' },
  { id: 'savings', label: 'Savings', Icon: SavingsCategoryIcon, color: 'var(--color-savings)' },
  { id: 'other', label: 'Other', Icon: OtherCategoryIcon, color: 'var(--color-other)' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

interface CategoryPickerProps {
  selectedId: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}

export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-y-[32px] gap-x-[16px] px-[8px]">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedId === cat.id;
        const Icon = cat.Icon;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-center gap-[12px] transition-all duration-200 active:scale-95"
            aria-label={`Select ${cat.label} category`}
          >
            <div 
              className={cn(
                "min-w-[80px] min-h-[80px] rounded-[24px] flex items-center justify-center transition-all duration-200 relative",
                isSelected ? "scale-105" : ""
              )}
              style={{ 
                backgroundColor: `color-mix(in srgb, ${cat.color} 10%, transparent)`,
                boxShadow: isSelected ? `0 0 0 3px var(--color-bg-secondary), 0 0 0 5px ${cat.color}` : 'none'
              }}
            >
              <Icon size={32} style={{ color: cat.color }} />
            </div>
            <span 
              className={cn(
                "text-[11px] font-bold uppercase tracking-widest text-center",
                isSelected ? "" : "text-[var(--color-text-secondary)]"
              )}
              style={{ color: isSelected ? cat.color : undefined }}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
