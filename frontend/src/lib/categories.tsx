// src/lib/categories.tsx
// Single source of truth for expense categories used across the app.

import {
  UtensilsCrossed,
  Car,
  Smartphone,
  ShoppingBag,
  Zap,
  Heart,
  Music2,
  PiggyBank,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export interface Category {
  id:      string;
  label:   string;
  Icon:    LucideIcon;
  /** Hex colour used for icons and tinted backgrounds */
  color:   string;
  /** Tailwind text-* class for the colour (kept for legacy use) */
  twColor: string;
}

export const CATEGORIES: readonly Category[] = [
  { id: 'food',          label: 'Food',          Icon: UtensilsCrossed, color: '#F59E0B', twColor: 'text-cat-food'          },
  { id: 'transport',     label: 'Transport',     Icon: Car,             color: '#3B82F6', twColor: 'text-cat-transport'     },
  { id: 'airtime',       label: 'Airtime',       Icon: Smartphone,      color: '#8B5CF6', twColor: 'text-cat-airtime'       },
  { id: 'shopping',      label: 'Shopping',      Icon: ShoppingBag,     color: '#EC4899', twColor: 'text-cat-shopping'      },
  { id: 'utilities',     label: 'Utilities',     Icon: Zap,             color: '#06B6D4', twColor: 'text-cat-utilities'     },
  { id: 'health',        label: 'Health',        Icon: Heart,           color: '#10B981', twColor: 'text-cat-health'        },
  { id: 'entertainment', label: 'Entertainment', Icon: Music2,          color: '#F43F5E', twColor: 'text-cat-entertainment' },
  { id: 'savings',       label: 'Savings',       Icon: PiggyBank,       color: '#00E5A0', twColor: 'text-cat-savings'       },
  { id: 'other',         label: 'Other',         Icon: MoreHorizontal,  color: '#94A3B8', twColor: 'text-cat-other'         },
] as const;

/** Look up a category by id. Falls back to "other" if not found. */
export function getCategoryById(id: string): Category {
  return (
    CATEGORIES.find(c => c.id === id) ??
    (CATEGORIES[CATEGORIES.length - 1] as Category)
  );
}
