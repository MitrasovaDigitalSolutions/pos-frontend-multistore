import { create } from "zustand";

// ─── Sidebar Store ──────────────────────────────────────────────────────────

interface SidebarState {
    isCollapsed: boolean;
    toggle: () => void;
    setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
    isCollapsed: false,
    toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));
