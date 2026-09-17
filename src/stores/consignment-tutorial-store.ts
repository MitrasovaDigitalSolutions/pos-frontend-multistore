import { create } from "zustand";
import type {
    ConsignmentTutorialId,
    ConsignmentTutorialPreSnapshot,
} from "@/features/consignment/tutorial/types/consignment-tutorial";

interface CursorState {
    x: number;
    y: number;
    visible: boolean;
    clicking: boolean;
    label?: string;
}

interface ConsignmentTutorialStoreState {
    activeTutorial: ConsignmentTutorialId | null;
    stepIndex: number;
    isRunning: boolean;
    isMenuOpen: boolean;
    preSnapshot: ConsignmentTutorialPreSnapshot | null;
    cursor: CursorState;

    // Actions
    startTutorial: (id: ConsignmentTutorialId) => void;
    stopTutorial: () => void;
    setStepIndex: (index: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setMenuOpen: (open: boolean) => void;
    saveSnapshot: (snapshot: ConsignmentTutorialPreSnapshot) => void;
    clearSnapshot: () => void;
    updateCursor: (cursor: Partial<CursorState>) => void;
    triggerCursorClick: () => void;
}

export const useConsignmentTutorialStore = create<ConsignmentTutorialStoreState>((set) => ({
    activeTutorial: null,
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
