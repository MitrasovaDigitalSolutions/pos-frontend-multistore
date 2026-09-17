import { create } from "zustand";
import type {
    StockTutorialId,
    StockTutorialBranch,
    StockTutorialPreSnapshot,
} from "@/features/stock/tutorial/types/stock-tutorial";

interface CursorState {
    x: number;
    y: number;
    visible: boolean;
    clicking: boolean;
    label?: string;
}

interface StockTutorialStoreState {
    activeTutorial: StockTutorialId | null;
    selectedBranch: StockTutorialBranch | null;
    stepIndex: number;
    isRunning: boolean;
    isMenuOpen: boolean;
    preSnapshot: StockTutorialPreSnapshot | null;
    cursor: CursorState;

    // Actions
    startTutorial: (id: StockTutorialId) => void;
    stopTutorial: () => void;
    setSelectedBranch: (branch: StockTutorialBranch | null) => void;
    setStepIndex: (index: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setMenuOpen: (open: boolean) => void;
    saveSnapshot: (snapshot: StockTutorialPreSnapshot) => void;
    clearSnapshot: () => void;
    updateCursor: (cursor: Partial<CursorState>) => void;
    triggerCursorClick: () => void;
}

export const useStockTutorialStore = create<StockTutorialStoreState>((set) => ({
    activeTutorial: null,
    selectedBranch: null,
    stepIndex: 0,
    isRunning: false,
    isMenuOpen: false,
    preSnapshot: null,
    cursor: {
        x: 0,
        y: 0,
        visible: false,
        clicking: false,
    },

    startTutorial: (id) => {
        set({
            activeTutorial: id,
            selectedBranch: null,
            stepIndex: 0,
            isRunning: true,
            isMenuOpen: false,
            cursor: {
                x: 0,
                y: 0,
                visible: false,
                clicking: false,
            },
        });
    },

    stopTutorial: () => {
        set({
            activeTutorial: null,
            selectedBranch: null,
            stepIndex: 0,
            isRunning: false,
            cursor: {
                x: 0,
                y: 0,
                visible: false,
                clicking: false,
            },
        });
    },

    setSelectedBranch: (branch) => set({ selectedBranch: branch }),

    setStepIndex: (index) => set({ stepIndex: index }),

    nextStep: () => set((state) => ({ stepIndex: state.stepIndex + 1 })),

    prevStep: () => set((state) => ({ stepIndex: Math.max(0, state.stepIndex - 1) })),

    setMenuOpen: (open) => set({ isMenuOpen: open }),

    saveSnapshot: (snapshot) => set({ preSnapshot: snapshot }),

    clearSnapshot: () => set({ preSnapshot: null }),

    updateCursor: (cursorUpdate) =>
        set((state) => ({
            cursor: { ...state.cursor, ...cursorUpdate },
        })),

    triggerCursorClick: () => {
        set((state) => ({ cursor: { ...state.cursor, clicking: true } }));
        setTimeout(() => {
            set((state) => ({ cursor: { ...state.cursor, clicking: false } }));
        }, 300);
    },
}));
