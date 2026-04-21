// src/lib/api.ts

const BASE_URL = import.meta.env.VITE_API_URL || 'https://spendwise-app-39vv.onrender.com';

// ─── Internal helpers ────────────────────────────────────────────────────────

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

// ─── Auth ────────────────────────────────────────────────────────────────────

// Backend returns a flat object: { id, email, fullName, token }
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
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export type TransactionFilters = Partial<Record<string, string | number>>;

/** Shape the backend expects when creating a transaction. */
export interface CreateTransactionPayload {
  /** Amount in kobo (multiply naira × 100 before sending). */
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  categoryId?: string;
  description?: string;
}

/** Raw transaction row as returned by the API (amount is in kobo). */
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

  create: (data: CreateTransactionPayload) =>
    request<RawTransaction>('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsSummaryResponse {
  totalSpentNaira: number;
  categoryBreakdown: Record<string, number>;
}

export interface BurnRateResponse {
  burnRate: number;
  projectedMonthlySpend: number;
}

export const analytics = {
  summary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    return request<AnalyticsSummaryResponse>(`/api/analytics${qs ? `?${qs}` : ''}`);
  },

  burnRate: (days?: number) => {
    const params = new URLSearchParams();
    if (days !== undefined) params.append('days', String(days));
    const qs = params.toString();
    return request<BurnRateResponse>(`/api/analytics/burn-rate${qs ? `?${qs}` : ''}`);
  },
};