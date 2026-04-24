import { create } from 'zustand';

const useThemeStore = create((set) => ({
  dark: localStorage.getItem('voxera_theme') !== 'light',

  toggle: () =>
    set((state) => {
      const next = !state.dark;
      localStorage.setItem('voxera_theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return { dark: next };
    }),
}));

export default useThemeStore;