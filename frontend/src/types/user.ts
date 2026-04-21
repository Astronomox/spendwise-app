// src/types/user.ts

export interface User {
  id:            string;
  fullName:      string;
  email:         string;
  monthlyBudget: number;
}

/**
 * Shape returned by the /dashboard summary endpoint.
 * weeklySpend is a 7-tuple: index 0 = Monday … index 6 = Sunday.
 */
export interface DashboardData {
  totalSpent:      number;
  monthlyBudget:   number;
  daysLeftInMonth: number;
  dailySafeSpend:  number;
  weeklySpend:     [number, number, number, number, number, number, number];
  spendByCategory: Record<string, number>;
}
