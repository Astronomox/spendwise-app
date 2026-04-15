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
  { id: 'food', label: 'Food', Icon: FoodCategoryIcon, color: 'var(--color-food, #F59E0B)' },
  { id: 'transport', label: 'Transport', Icon: TransportCategoryIcon, color: 'var(--color-transport, #3B82F6)' },
  { id: 'airtime', label: 'Airtime', Icon: AirtimeCategoryIcon, color: 'var(--color-airtime, #8B5CF6)' },
  { id: 'shopping', label: 'Shopping', Icon: ShoppingCategoryIcon, color: 'var(--color-shopping, #EC4899)' },
  { id: 'utilities', label: 'Utilities', Icon: UtilitiesCategoryIcon, color: 'var(--color-utilities, #06B6D4)' },
  { id: 'health', label: 'Health', Icon: HealthCategoryIcon, color: 'var(--color-health, #10B981)' },
  { id: 'entertainment', label: 'Entertainment', Icon: EntertainmentCategoryIcon, color: 'var(--color-entertainment, #F43F5E)' },
  { id: 'savings', label: 'Savings', Icon: SavingsCategoryIcon, color: 'var(--color-savings, #00E5A0)' },
  { id: 'other', label: 'Other', Icon: OtherCategoryIcon, color: 'var(--color-other, #94A3B8)' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

interface CategoryPickerProps {
  selectedId: CategoryId | null;
  onSelect: (id: CategoryId) => void;
}

export function CategoryPicker({ selectedId, onSelect }: CategoryPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-y-8 gap-x-4">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedId === cat.id;
        const Icon = cat.Icon;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex flex-col items-center gap-3 transition-all duration-200 active:scale-95"
          >
            <div 
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200",
                isSelected ? "ring-2 ring-offset-2" : "border border-gray-100"
              )}
              style={{ 
                backgroundColor: `${cat.color}15`,
                boxShadow: isSelected ? `0 0 0 2px ${cat.color}` : 'none'
              }}
            >
              <Icon size={32} style={{ color: cat.color }} />
            </div>
            <span 
              className={cn(
                "text-[11px] font-bold uppercase tracking-widest text-center",
                isSelected ? "text-text-primary" : "text-text-muted"
              )}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
