import { create } from "zustand";

interface PageLoadingState {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

export const usePageLoadingStore = create<PageLoadingState>((set) => ({
    isLoading: false,
    startLoading: () => set({ isLoading: true }),
    stopLoading: () => set({ isLoading: false }),
}));
