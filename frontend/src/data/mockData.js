// src/data/mockData.js — Prototype mock data
// Replace with real API calls when connecting to the backend.

export const mockUser = {
  id: 'u1',
  fullName: 'Adeola Okafor',
  email: 'adeola@spendwise.ng',
  monthlyBudget: 150000,
};

export const mockDashboard = {
  totalSpent: 87450,
  monthlyBudget: 150000,
  daysLeftInMonth: 11,
  dailySafeSpend: 5686,
  weeklySpend: [12500, 8200, 15600, 9800, 22100, 11400, 7850],
  spendByCategory: {
    food:          28400,
    transport:     14200,
    shopping:      18600,
    utilities:     9800,
    entertainment: 7200,
    airtime:       4800,
    health:        3200,
    other:         1250,
  },
};

export const mockTransactions = [
  { id: 't1',  merchant: 'Shoprite Ikeja',      category: 'shopping',      amount: 12400,  direction: 'debit',  date: new Date().toISOString(),                          source: 'manual', status: 'confirmed', description: 'Groceries & Shopping' },
  { id: 't2',  merchant: 'Bolt',                 category: 'transport',     amount: 2800,   direction: 'debit',  date: new Date(Date.now() - 1 * 3600000).toISOString(),  source: 'sms',    status: 'confirmed', description: 'Ride to Victoria Island' },
  { id: 't3',  merchant: 'Chicken Republic',     category: 'food',          amount: 4500,   direction: 'debit',  date: new Date(Date.now() - 5 * 3600000).toISOString(),  source: 'manual', status: 'confirmed', description: 'Lunch' },
  { id: 't4',  merchant: 'MTN Airtime',          category: 'airtime',       amount: 1000,   direction: 'debit',  date: new Date(Date.now() - 1 * 86400000).toISOString(), source: 'sms',    status: 'confirmed', description: 'Airtime recharge' },
  { id: 't5',  merchant: 'DSTV',                 category: 'entertainment', amount: 7200,   direction: 'debit',  date: new Date(Date.now() - 2 * 86400000).toISOString(), source: 'sms',    status: 'confirmed', description: 'Monthly subscription' },
  { id: 't6',  merchant: 'April Salary',         category: 'other',         amount: 350000, direction: 'credit', date: new Date(Date.now() - 3 * 86400000).toISOString(), source: 'sms',    status: 'confirmed', description: 'Salary credit' },
  { id: 't7',  merchant: 'EKEDC',                category: 'utilities',     amount: 9800,   direction: 'debit',  date: new Date(Date.now() - 4 * 86400000).toISOString(), source: 'sms',    status: 'confirmed', description: 'Electricity prepaid' },
  { id: 't8',  merchant: 'Reddington Hospital',  category: 'health',        amount: 15000,  direction: 'debit',  date: new Date(Date.now() - 5 * 86400000).toISOString(), source: 'manual', status: 'confirmed', description: 'Medical consultation' },
  { id: 't9',  merchant: 'Zara Lagos',           category: 'shopping',      amount: 22500,  direction: 'debit',  date: new Date(Date.now() - 6 * 86400000).toISOString(), source: 'manual', status: 'confirmed', description: 'Clothing' },
  { id: 't10', merchant: 'Mama Put — Yaba',      category: 'food',          amount: 800,    direction: 'debit',  date: new Date(Date.now() - 7 * 86400000).toISOString(), source: 'manual', status: 'confirmed', description: 'Lunch' },
  { id: 't11', merchant: 'Lekki Toll Gate',      category: 'transport',     amount: 600,    direction: 'debit',  date: new Date(Date.now() - 7 * 86400000).toISOString(), source: 'manual', status: 'confirmed', description: 'Toll' },
  { id: 't12', merchant: 'Netflix',              category: 'entertainment', amount: 4200,   direction: 'debit',  date: new Date(Date.now() - 8 * 86400000).toISOString(), source: 'sms',    status: 'confirmed', description: 'Monthly subscription' },
  { id: 't13', merchant: "Domino's Pizza",       category: 'food',          amount: 6800,   direction: 'debit',  date: new Date(Date.now() - 9 * 86400000).toISOString(), source: 'manual', status: 'confirmed', description: 'Dinner' },
  { id: 't14', merchant: 'Uber',                 category: 'transport',     amount: 3200,   direction: 'debit',  date: new Date(Date.now() - 10 * 86400000).toISOString(),source: 'sms',    status: 'confirmed', description: 'Ride to Airport' },
];

export const mockGoals = [
  { id: 'g1', name: 'Emergency Fund',  targetAmount: 500000, currentAmount: 175000, deadline: new Date(Date.now() + 90  * 86400000).toISOString(), icon: 'savings',       userId: 'u1' },
  { id: 'g2', name: 'Dubai Vacation',  targetAmount: 800000, currentAmount: 120000, deadline: new Date(Date.now() + 180 * 86400000).toISOString(), icon: 'entertainment', userId: 'u1' },
  { id: 'g3', name: 'MacBook Pro M4',  targetAmount: 350000, currentAmount: 340000, deadline: new Date(Date.now() + 15  * 86400000).toISOString(), icon: 'shopping',      userId: 'u1' },
];

export const mockAlerts = [
  { id: 'a1', type: 'budget_warning', title: 'Budget Alert',          message: "You've used 58% of your monthly budget with 11 days remaining. Consider slowing down on non-essentials.", read: false, createdAt: new Date().toISOString() },
  { id: 'a2', type: 'high_spend',     title: 'High Shopping Spend',   message: 'Your shopping spend this week is ₦22,500 — 40% above your weekly average.',                             read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'a3', type: 'streak',         title: '7-Day Logging Streak 🔥',message: "You've logged every transaction for 7 days straight. Keep the momentum going!",                        read: true,  createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { id: 'a4', type: 'goal_reached',   title: 'Goal Nearly Complete!', message: 'Your MacBook Pro fund is at 97%! Just ₦10,000 more to reach your goal!',                               read: false, createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];
