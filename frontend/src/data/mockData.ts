// src/data/mockData.ts
// Prototype mock data — replace each export with real API/hook calls.

import type { Transaction } from '@/types/transactions';
import type { Goal }        from '@/types/goals';
import type { Alert }       from '@/types/alerts';
import type { User, DashboardData } from '@/types/user';

export const mockUser: User = {
  id:            'u1',
  fullName:      'Adeola Okafor',
  email:         'adeola@spendwise.ng',
  monthlyBudget: 150_000,
};

export const mockDashboard: DashboardData = {
  totalSpent:      87_450,
  monthlyBudget:   150_000,
  daysLeftInMonth: 11,
  dailySafeSpend:  5_686,
  weeklySpend:     [12_500, 8_200, 15_600, 9_800, 22_100, 11_400, 7_850],
  spendByCategory: {
    food:          28_400,
    transport:     14_200,
    shopping:      18_600,
    utilities:      9_800,
    entertainment:  7_200,
    airtime:        4_800,
    health:         3_200,
    other:          1_250,
  },
};

const now = Date.now();
const daysAgo = (d: number): string => new Date(now - d * 86_400_000).toISOString();
const hoursAgo = (h: number): string => new Date(now - h * 3_600_000).toISOString();

export const mockTransactions: Transaction[] = [
  { id: 't1',  merchant: 'Shoprite Ikeja',     category: 'shopping',      amount: 12_400, direction: 'debit',  date: new Date().toISOString(), source: 'manual', status: 'confirmed', description: 'Groceries & Shopping' },
  { id: 't2',  merchant: 'Bolt',                category: 'transport',     amount:  2_800, direction: 'debit',  date: hoursAgo(1),              source: 'sms',    status: 'confirmed', description: 'Ride to Victoria Island' },
  { id: 't3',  merchant: 'Chicken Republic',    category: 'food',          amount:  4_500, direction: 'debit',  date: hoursAgo(5),              source: 'manual', status: 'confirmed', description: 'Lunch' },
  { id: 't4',  merchant: 'MTN Airtime',         category: 'airtime',       amount:  1_000, direction: 'debit',  date: daysAgo(1),               source: 'sms',    status: 'confirmed', description: 'Airtime recharge' },
  { id: 't5',  merchant: 'DSTV',                category: 'entertainment', amount:  7_200, direction: 'debit',  date: daysAgo(2),               source: 'sms',    status: 'confirmed', description: 'Monthly subscription' },
  { id: 't6',  merchant: 'April Salary',        category: 'other',         amount: 350_000,direction: 'credit', date: daysAgo(3),               source: 'sms',    status: 'confirmed', description: 'Salary credit' },
  { id: 't7',  merchant: 'EKEDC',               category: 'utilities',     amount:  9_800, direction: 'debit',  date: daysAgo(4),               source: 'sms',    status: 'confirmed', description: 'Electricity prepaid' },
  { id: 't8',  merchant: 'Reddington Hospital', category: 'health',        amount: 15_000, direction: 'debit',  date: daysAgo(5),               source: 'manual', status: 'confirmed', description: 'Medical consultation' },
  { id: 't9',  merchant: 'Zara Lagos',          category: 'shopping',      amount: 22_500, direction: 'debit',  date: daysAgo(6),               source: 'manual', status: 'confirmed', description: 'Clothing' },
  { id: 't10', merchant: 'Mama Put — Yaba',     category: 'food',          amount:    800, direction: 'debit',  date: daysAgo(7),               source: 'manual', status: 'confirmed', description: 'Lunch' },
  { id: 't11', merchant: 'Lekki Toll Gate',     category: 'transport',     amount:    600, direction: 'debit',  date: daysAgo(7),               source: 'manual', status: 'confirmed', description: 'Toll' },
  { id: 't12', merchant: 'Netflix',             category: 'entertainment', amount:  4_200, direction: 'debit',  date: daysAgo(8),               source: 'sms',    status: 'confirmed', description: 'Monthly subscription' },
  { id: 't13', merchant: "Domino's Pizza",      category: 'food',          amount:  6_800, direction: 'debit',  date: daysAgo(9),               source: 'manual', status: 'confirmed', description: 'Dinner' },
  { id: 't14', merchant: 'Uber',                category: 'transport',     amount:  3_200, direction: 'debit',  date: daysAgo(10),              source: 'sms',    status: 'confirmed', description: 'Ride to Airport' },
];

export const mockGoals: Goal[] = [
  { id: 'g1', name: 'Emergency Fund', targetAmount: 500_000, currentAmount: 175_000, deadline: new Date(now + 90  * 86_400_000).toISOString(), icon: 'savings',       userId: 'u1' },
  { id: 'g2', name: 'Dubai Vacation', targetAmount: 800_000, currentAmount: 120_000, deadline: new Date(now + 180 * 86_400_000).toISOString(), icon: 'entertainment', userId: 'u1' },
  { id: 'g3', name: 'MacBook Pro M4', targetAmount: 350_000, currentAmount: 340_000, deadline: new Date(now + 15  * 86_400_000).toISOString(), icon: 'shopping',      userId: 'u1' },
];

export const mockAlerts: Alert[] = [
  { id: 'a1', type: 'budget_warning', title: 'Budget Alert',           message: "You've used 58% of your monthly budget with 11 days remaining. Slow down on non-essentials.", read: false, createdAt: new Date().toISOString() },
  { id: 'a2', type: 'high_spend',     title: 'High Shopping Spend',    message: 'Your shopping spend this week is ₦22,500 — 40% above your weekly average.',                 read: false, createdAt: daysAgo(1) },
  { id: 'a3', type: 'streak',         title: '7-Day Logging Streak 🔥',message: "You've logged every transaction for 7 days straight. Keep the momentum going!",            read: true,  createdAt: daysAgo(2) },
  { id: 'a4', type: 'goal_reached',   title: 'Goal Nearly Complete!',  message: 'Your MacBook Pro fund is at 97%! Just ₦10,000 more to reach your goal!',                   read: false, createdAt: daysAgo(3) },
];
