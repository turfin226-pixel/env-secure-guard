import { create } from 'zustand';

interface UIState {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  closeDrawer: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isDrawerOpen: false,
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toastMessage: null,
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3000);
  },
  hideToast: () => set({ toastMessage: null }),
}));
