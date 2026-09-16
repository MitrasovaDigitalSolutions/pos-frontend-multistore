import { create } from "zustand";

export type CentralReportTutorialId = "laporan_konsolidasi";

interface CursorState {
    x: number;
    y: number;
    visible?: boolean;
    clicking?: boolean;
    label?: string;
}

interface CentralReportTutorialStoreState {
    activeTutorial: CentralReportTutorialId | null;
    stepIndex: number;
    isRunning: boolean;
    isMenuOpen: boolean;
    cursor: CursorState | null;

    startTutorial: (id: CentralReportTutorialId) => void;
    stopTutorial: () => void;
    setStepIndex: (index: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    openMenu: () => void;
    closeMenu: () => void;
    setMenuOpen: (open: boolean) => void;
    updateCursor: (cursor: Partial<CursorState>) => void;
    triggerCursorClick: () => void;
}

export const useCentralReportTutorialStore = create<CentralReportTutorialStoreState>((set) => ({
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
            cursor: state.cursor ? { ...state.cursor, visible: false, clicking: false } : null,
        })),

    setStepIndex: (index) => set({ stepIndex: index }),

    nextStep: () => set((state) => ({ stepIndex: state.stepIndex + 1 })),

    prevStep: () =>
        set((state) => ({
            stepIndex: Math.max(0, state.stepIndex - 1),
        })),

    openMenu: () => set({ isMenuOpen: true }),

    closeMenu: () => set({ isMenuOpen: false }),

    setMenuOpen: (open) => set({ isMenuOpen: open }),

    updateCursor: (cursor) =>
        set((state) => ({
            cursor: state.cursor ? { ...state.cursor, ...cursor } : { x: 0, y: 0, ...cursor },
        })),

    triggerCursorClick: () => {
        set((state) => ({
            cursor: state.cursor ? { ...state.cursor, clicking: true } : { x: 0, y: 0, clicking: true },
        }));
        setTimeout(() => {
            set((state) => ({
                cursor: state.cursor ? { ...state.cursor, clicking: false } : null,
            }));
        }, 250);
    },
}));
