// src/lib/categories.jsx
// Single source of truth for expense categories.
// Icons from lucide-react — swap freely.

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
} from 'lucide-react';

/** @type {Array<{ id: string, label: string, Icon: import('lucide-react').LucideIcon, color: string, twColor: string }>} */
export const CATEGORIES = [
  { id: 'food',          label: 'Food',          Icon: UtensilsCrossed, color: '#F59E0B', twColor: 'text-cat-food'          },
  { id: 'transport',     label: 'Transport',     Icon: Car,             color: '#3B82F6', twColor: 'text-cat-transport'     },
  { id: 'airtime',       label: 'Airtime',       Icon: Smartphone,      color: '#8B5CF6', twColor: 'text-cat-airtime'       },
  { id: 'shopping',      label: 'Shopping',      Icon: ShoppingBag,     color: '#EC4899', twColor: 'text-cat-shopping'      },
  { id: 'utilities',     label: 'Utilities',     Icon: Zap,             color: '#06B6D4', twColor: 'text-cat-utilities'     },
  { id: 'health',        label: 'Health',        Icon: Heart,           color: '#10B981', twColor: 'text-cat-health'        },
  { id: 'entertainment', label: 'Entertainment', Icon: Music2,          color: '#F43F5E', twColor: 'text-cat-entertainment' },
  { id: 'savings',       label: 'Savings',       Icon: PiggyBank,       color: '#00E5A0', twColor: 'text-cat-savings'       },
  { id: 'other',         label: 'Other',         Icon: MoreHorizontal,  color: '#94A3B8', twColor: 'text-cat-other'         },
];

/** Lookup a category by id, falling back to "other". */
export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
