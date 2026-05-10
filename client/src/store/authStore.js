import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('rentify_user') || 'null'),
  token: localStorage.getItem('rentify_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('rentify_token', data.token);
      localStorage.setItem('rentify_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('rentify_token', data.token);
      localStorage.setItem('rentify_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('rentify_token');
    localStorage.removeItem('rentify_user');
    set({ user: null, token: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('rentify_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      get().logout();
    }
  },

  updateUser: (userData) => {
    const updated = { ...get().user, ...userData };
    localStorage.setItem('rentify_user', JSON.stringify(updated));
    set({ user: updated });
  },

  isOwner: () => get().user?.role === 'owner',
  isAuthenticated: () => !!get().token,
}));

export default useAuthStore;