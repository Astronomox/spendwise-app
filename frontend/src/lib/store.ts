// src/lib/store.ts
import { create } from 'zustand';
import { User } from '@/types/user';

interface AppState {
  user:            User | null;
  isAuthenticated: boolean;
  setUser:         (user: User | null) => void;
  clearUser:       () => void;
}

// Rehydrate from localStorage on first load
function loadPersistedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sw_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

const initialUser = loadPersistedUser();

export const useAppStore = create<AppState>((set) => ({
  user:            initialUser,
  isAuthenticated: initialUser !== null,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('sw_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sw_user');
      localStorage.removeItem('sw_token');
    }
    set({ user, isAuthenticated: user !== null });
  },

  clearUser: () => {
    localStorage.removeItem('sw_user');
    localStorage.removeItem('sw_token');
    set({ user: null, isAuthenticated: false });
  },
}));
