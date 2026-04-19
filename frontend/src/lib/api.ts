const BASE_URL = import.meta.env.VITE_API_URL || 'https://spendwise-app-39vv.onrender.com';

async function request(path: string, options: RequestInit = {}) {
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
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const auth = {
  login: async (email: string, password: string) => {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },
  signup: async (email: string, password: string, fullName: string) => {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName })
    });
  }
};

export const transactions = {
  list: async (filters: Record<string, string | number> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    const qs = params.toString();
    return request(`/api/transactions${qs ? `?${qs}` : ''}`);
  },
  create: async (data: { amount: number; type: 'EXPENSE' | 'INCOME'; categoryId?: string; description?: string }) => {
    return request('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

export const analytics = {
  summary: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const qs = params.toString();
    return request(`/api/analytics${qs ? `?${qs}` : ''}`);
  },
  burnRate: async (days?: number) => {
    const params = new URLSearchParams();
    if (days) params.append('days', String(days));
    const qs = params.toString();
    return request(`/api/analytics/burn-rate${qs ? `?${qs}` : ''}`);
  }
};
