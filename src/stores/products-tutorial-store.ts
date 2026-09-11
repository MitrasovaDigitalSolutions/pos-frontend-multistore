import { create } from "zustand";
import type { ProductsTutorialId } from "@/features/master/products/tutorial/types/products-tutorial";

interface CursorState {
    x: number;
    y: number;
    visible: boolean;
    clicking: boolean;
    label?: string;
}

interface ProductsTutorialStoreState {
    activeTutorial: ProductsTutorialId | null;
    stepIndex: number;
    isRunning: boolean;
    isMenuOpen: boolean;
    cursor: CursorState;

    // Actions
    startTutorial: (id: ProductsTutorialId) => void;
    stopTutorial: () => void;
    setStepIndex: (index: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setMenuOpen: (open: boolean) => void;
    updateCursor: (cursor: Partial<CursorState>) => void;
    triggerCursorClick: () => void;
}

export const useProductsTutorialStore = create<ProductsTutorialStoreState>((set) => ({
    activeTutorial: null,
    stepIndex: 0,
    isRunning: false,
    isMenuOpen: false,
    cursor: {
        x: 0,
        y: 0,
        visible: false,
        clicking: false,
    },

    startTutorial: (id) =>
        set({
            activeTutorial: id,
            stepIndex: 0,
            isRunning: true,
            isMenuOpen: false,
        }),

    stopTutorial: () =>
        set((state) => ({
            activeTutorial: null,
            stepIndex: 0,
            isRunning: false,
            cursor: { ...state.cursor, visible: false, clicking: false },
        })),

    setStepIndex: (index) => set({ stepIndex: index }),

    nextStep: () => set((state) => ({ stepIndex: state.stepIndex + 1 })),

    prevStep: () =>
        set((state) => ({
            stepIndex: Math.max(0, state.stepIndex - 1),
        })),

    setMenuOpen: (open) => set({ isMenuOpen: open }),

    updateCursor: (cursor) =>
        set((state) => ({
            cursor: { ...state.cursor, ...cursor },
        })),

    triggerCursorClick: () => {
        set((state) => ({ cursor: { ...state.cursor, clicking: true } }));
        setTimeout(() => {
            set((state) => ({ cursor: { ...state.cursor, clicking: false } }));
        }, 250);
    },
}));
