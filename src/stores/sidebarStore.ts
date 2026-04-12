import { create } from "zustand";

interface SidebarState {
  open: boolean;
  pinned: boolean;
  setOpen: (open: boolean) => void;
  togglePin: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  open: false,
  pinned: false,
  setOpen: (open) => set({ open }),
  togglePin: () =>
    set((state) => ({ pinned: !state.pinned, open: !state.pinned })),
}));
