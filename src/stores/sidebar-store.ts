import { create } from "zustand";
import { persist } from "zustand/middleware";

// ─── Sidebar Store ──────────────────────────────────────────────────────────

interface SidebarState {
    isCollapsed: boolean;
    isMobileOpen: boolean;
    toggle: () => void;
    setCollapsed: (collapsed: boolean) => void;
    toggleMobile: () => void;
    setMobileOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            isCollapsed: false,
            isMobileOpen: false,
            toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
            setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
            toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
            setMobileOpen: (open) => set({ isMobileOpen: open }),
        }),
        {
            name: "sidebar-storage", // name of the item in localStorage
            partialize: (state) => ({ isCollapsed: state.isCollapsed }),
        }
    )
);
