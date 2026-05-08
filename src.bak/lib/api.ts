// src/lib/api.ts

const BASE_URL = import.meta.env.VITE_API_URL || 'https://spendwise-app-39vv.onrender.com';

// ——— Internal helpers ———

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

// ——— Auth ———

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

// ——— Transactions ———

export type TransactionFilters = Partial<Record<string, string | number>>;

export interface CreateTransactionPayload {
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  categoryId?: string;
  description?: string;
}

export interface RawTransaction {
  id?: string;
  _id?: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  categoryId?: string;
  category?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
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
    return request<RawTransaction[]>(`/api/transactions${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) =>
    request<RawTransaction>(`/api/transactions/${id}`),

  create: (data: CreateTransactionPayload) =>
    request<RawTransaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ——— Analytics ———

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