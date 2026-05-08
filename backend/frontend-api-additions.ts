// Add these to the BOTTOM of your existing src/lib/api.ts file
// (don't replace the file — append after the analytics section)

// ── Goals ──

export interface GoalResponse {
  id:            string;
  userId:        string;
  name:          string;
  targetAmount:  number;
  currentAmount: number;
  deadline:      string;
  icon:          string;
  createdAt:     string;
  deposits:      DepositResponse[];
}

export interface DepositResponse {
  id:     string;
  amount: number;
  date:   string;
  note:   string | null;
}

export interface GoalsApiResponse {
  success: boolean;
  data:    GoalResponse[];
}

export interface GoalApiResponse {
  success: boolean;
  data:    GoalResponse;
}

export const goals = {
  list: () =>
    request<GoalsApiResponse>('/api/goals'),

  get: (id: string) =>
    request<GoalApiResponse>(`/api/goals/${id}`),

  create: (data: { name: string; targetAmount: number; deadline: string; icon: string }) =>
    request<GoalApiResponse>('/api/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ name: string; targetAmount: number; deadline: string; icon: string }>) =>
    request<GoalApiResponse>(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ success: boolean }>(`/api/goals/${id}`, {
      method: 'DELETE',
    }),

  deposit: (id: string, data: { amount: number; note?: string }) =>
    request<GoalApiResponse>(`/api/goals/${id}/deposit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ── Alerts ──

export interface AlertResponse {
  id:        string;
  type:      string;
  title:     string;
  message:   string;
  read:      boolean;
  createdAt: string;
}

export interface AlertsApiResponse {
  success: boolean;
  data:    AlertResponse[];
}

export const alerts = {
  list: () =>
    request<AlertsApiResponse>('/api/alerts'),

  markRead: (id: string) =>
    request<{ success: boolean }>(`/api/alerts/${id}/read`, {
      method: 'PUT',
    }),

  markAllRead: () =>
    request<{ success: boolean }>('/api/alerts/read-all', {
      method: 'PUT',
    }),

  clear: () =>
    request<{ success: boolean }>('/api/alerts', {
      method: 'DELETE',
    }),
};

// ── User ──

export interface UserProfile {
  id:             string;
  fullName:       string;
  email:          string;
  monthlyBudget:  number;
  primaryBank:    string | null;
  smsEnabled:     boolean;
  onboardingDone: boolean;
}

export interface UserApiResponse {
  success: boolean;
  data:    UserProfile;
}

export const users = {
  me: () =>
    request<UserApiResponse>('/api/users/me'),

  updateProfile: (data: { fullName?: string; email?: string }) =>
    request<UserApiResponse>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateBudget: (monthlyBudget: number) =>
    request<UserApiResponse>('/api/users/budget', {
      method: 'PUT',
      body: JSON.stringify({ monthlyBudget }),
    }),

  saveOnboarding: (data: { primaryBank?: string; smsEnabled?: boolean }) =>
    request<UserApiResponse>('/api/users/onboarding', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  exportData: () =>
    request<{ success: boolean; data: unknown }>('/api/users/export'),
};
