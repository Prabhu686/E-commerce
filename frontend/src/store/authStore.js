import { create } from 'zustand';
import api from '../api/axios';

const stored = JSON.parse(localStorage.getItem('nexaUser') || 'null');

const useAuthStore = create((set, get) => ({
  user: stored,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('nexaUser', JSON.stringify(data));
      set({ user: data, loading: false, error: null });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('nexaUser', JSON.stringify(data));
      set({ user: data, loading: false, error: null });
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: msg, loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('nexaUser');
    set({ user: null, error: null });
  },

  spin: async () => {
    const { data } = await api.post('/auth/spin');
    const user = get().user;
    const updated = { ...user, loyaltyPoints: data.loyaltyPoints, loyaltyLevel: data.loyaltyLevel };
    localStorage.setItem('nexaUser', JSON.stringify(updated));
    set({ user: updated });
    return data;
  },

  toggleWishlist: async (productId) => {
    const { data } = await api.put(`/auth/wishlist/${productId}`);
    const user = get().user;
    const updated = { ...user, wishlist: data.wishlist };
    localStorage.setItem('nexaUser', JSON.stringify(updated));
    set({ user: updated });
  },

  refreshProfile: async () => {
    try {
      const { data } = await api.get('/auth/profile');
      const user = get().user;
      const updated = { ...user, ...data };
      localStorage.setItem('nexaUser', JSON.stringify(updated));
      set({ user: updated });
    } catch {}
  },
}));

export default useAuthStore;



