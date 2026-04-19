import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

const initialUserStr = typeof window !== 'undefined' ? localStorage.getItem('sw_user') : null;
let initialUser: User | null = null;
if (initialUserStr) {
  try {
    initialUser = JSON.parse(initialUserStr);
  } catch (e) {
    // Ignore invalid JSON
  }
}

export const useAppStore = create<AppState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialUser,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
