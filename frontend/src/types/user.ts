// src/types/user.ts

export interface User {
  id:            string;
  fullName:      string;
  email:         string;
  monthlyBudget: number;
}

export interface DashboardData {
  totalSpent:          number;
  monthlyBudget:       number;
  daysLeftInMonth:     number;
  dailySafeSpend:      number;
  dailyBurnRate:       number;
  projectedMonthlyBurn: number;
  weeklySpend:         [number, number, number, number, number, number, number];
  spendByCategory:     Record<string, number>;
}