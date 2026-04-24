import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user:  null,
  token: localStorage.getItem('voxera_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('voxera_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('voxera_token');
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;