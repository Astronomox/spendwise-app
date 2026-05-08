// src/lib/api.ts

const BASE_URL = import.meta.env.VITE_API_URL || 'https://spendwise-app-39vv.onrender.com';

// ─── Internal helpers ───

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('sw_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message || 'Request failed');
  }
  return res.json() as Promise<T>;
}

/** Check if a JWT token exists in localStorage */
export function hasToken(): boolean {
  return !!localStorage.getItem('sw_token');
}

// ─── Auth ───

export interface AuthResponse {
  id:       string;
  email:    string;
  fullName: string;
  token:    string;
}

export const auth = {
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (email: string, password: string, fullName: string) =>
    request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    }),

  google: (idToken: string) =>
    request<AuthResponse>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),
};

// ─── Dashboard (single cached endpoint) ───

export interface DashboardApiData {
  balance: {
    currentBalanceKobo: number;
    currentBalanceNaira: number;
  };
  spending: {
    totalIncomeKobo: number;
    totalExpensesKobo: number;
  };
  safeSpend: {
    dailySafeSpendKobo: number;
    dailySafeSpendNaira: number;
  };
  recentTransactions: RawTransaction[];
}

export interface DashboardApiResponse {
  success: boolean;
  data: DashboardApiData;
}

export const dashboard = {
  /** Single cached endpoint — replaces analytics + burn-rate + transactions on login */
  get: () => request<DashboardApiResponse>('/api/dashboard'),
};

// ─── Transactions ───

export type TransactionFilters = Partial<Record<string, string | number>>;

export interface CreateTransactionPayload {
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  categoryId?: string;
  category?: string;
  description?: string;
}

export interface RawTransaction {
  id?: string;
  _id?: string;
  amountKobo?: number;
  amountNaira?: number;
  amount?: number;
  type: 'EXPENSE' | 'INCOME';
  categoryId?: string;
  categoryName?: string;
  category?: string;
  description?: string;
  transactionDate?: string;
  createdAt?: string;
  created_at?: string;
}

export interface TransactionListResponse {
  success: boolean;
  data: RawTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export const transactions = {
  list: (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const qs = params.toString();
    return request<TransactionListResponse>(`/api/transactions${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) =>
    request<{ success: boolean; data: RawTransaction }>(`/api/transactions/${id}`),

  create: (data: CreateTransactionPayload) =>
    request<{ success: boolean; data: RawTransaction }>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Analytics ───

export interface AnalyticsCategory {
  categoryName: string;
  totalSpent: number;
  percentage: number;
  transactionCount: number;
}

export interface AnalyticsData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  byCategory: AnalyticsCategory[];
}

export interface AnalyticsApiResponse {
  success: boolean;
  data: AnalyticsData;
}

export interface BurnRateData {
  dailyBurnRate: number;
  projectedMonthlyBurn: number;
  daysAnalyzed: number;
  totalExpenses: number;
}

export interface BurnRateApiResponse {
  success: boolean;
  data: BurnRateData;
}

export const analytics = {
  summary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    params.append('startDate', start);
    params.append('endDate', end);
    const qs = params.toString();
    return request<AnalyticsApiResponse>(`/api/analytics?${qs}`);
  },

  burnRate: (days?: number) => {
    const params = new URLSearchParams();
    if (days !== undefined) params.append('days', String(days));
    const qs = params.toString();
    return request<BurnRateApiResponse>(`/api/analytics/burn-rate${qs ? `?${qs}` : ''}`);
  },

  financialSummary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    params.append('startDate', start);
    params.append('endDate', end);
    const qs = params.toString();
    return request<AnalyticsApiResponse>(`/api/analytics/summary?${qs}`);
  },
};

// ─── Savings ───

export interface SavingsPlanData {
  totalDays: number;
  remainingDays: number;
  disposableKobo: number;
  disposableNaira: number;
  dailySavingsTargetKobo: number;
  dailySavingsTargetNaira: number;
  reservedSavingsKobo: number;
  reservedSavingsNaira: number;
  safeSpendPoolKobo: number;
  safeSpendPoolNaira: number;
  dailySafeSpendKobo: number;
  dailySafeSpendNaira: number;
}

export interface SavingsPlanResponse {
  success: boolean;
  data: SavingsPlanData;
}

export const savings = {
  plan: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    const now = new Date();
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    params.append('startDate', start);
    params.append('endDate', end);
    const qs = params.toString();
    return request<SavingsPlanResponse>(`/api/savings/plan?${qs}`);
  },
};

// ─── SMS Ingestion ───

export interface SmsIngestResponse {
  success: boolean;
  transaction: RawTransaction;
}

export const sms = {
  ingest: (message: string) =>
    request<SmsIngestResponse>('/sms/ingest', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
