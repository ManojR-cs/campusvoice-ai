import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        set({ user: JSON.parse(storedUser), token, isAuthenticated: true, isLoading: false });
        const res = await api.get('/auth/me');
        if (res.data.success) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          set({ user: res.data.user });
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
      return user;
    }
    throw new Error(res.data.message || 'Login failed');
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { user, token } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true });
      return user;
    }
    throw new Error(res.data.message || 'Registration failed');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
