import { create } from "zustand";

export type CatalogTutorialId = "pembuatan_katalog" | "distribusi_toko";

interface CursorState {
    x: number;
    y: number;
    visible?: boolean;
    clicking?: boolean;
    label?: string;
}

interface CatalogTutorialStoreState {
    activeTutorial: CatalogTutorialId | null;
    stepIndex: number;
    isRunning: boolean;
    isMenuOpen: boolean;
    cursor: CursorState | null;
    onStopCallback: (() => void) | null;

    setOnStopCallback: (cb: (() => void) | null) => void;
    startTutorial: (id: CatalogTutorialId) => void;
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

export const useCatalogTutorialStore = create<CatalogTutorialStoreState>((set) => ({
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
    onStopCallback: null,

    setOnStopCallback: (cb) => set({ onStopCallback: cb }),

    startTutorial: (id) =>
        set({
            activeTutorial: id,
            stepIndex: 0,
            isRunning: true,
            isMenuOpen: false,
        }),

    stopTutorial: () =>
        set((state) => {
            state.onStopCallback?.();
            return {
                activeTutorial: null,
                stepIndex: 0,
                isRunning: false,
                cursor: state.cursor ? { ...state.cursor, visible: false, clicking: false } : null,
            };
        }),

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
        set((state) => {
            const current = state.cursor;
            if (current) {
                const hasChange = Object.entries(cursor).some(
                    ([key, val]) => current[key as keyof CursorState] !== val
                );
                if (!hasChange) return state;
            }
            return {
                cursor: current ? { ...current, ...cursor } : { x: 0, y: 0, ...cursor },
            };
        }),

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
