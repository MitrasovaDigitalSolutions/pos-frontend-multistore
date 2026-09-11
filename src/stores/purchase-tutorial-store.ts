import { create } from "zustand";
import type {
    PurchaseTutorialId,
    PurchaseTutorialPreSnapshot,
} from "@/features/purchase/tutorial/types/purchase-tutorial";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import {
    isMockPurchaseItem,
    MOCK_PO_ITEMS,
    MOCK_RECEIVING_ITEMS,
} from "@/features/purchase/tutorial/constants/purchase-tutorial-constants";

interface CursorState {
    x: number;
    y: number;
    visible: boolean;
    clicking: boolean;
    label?: string;
}

interface PurchaseTutorialStoreState {
    activeTutorial: PurchaseTutorialId | null;
    stepIndex: number;
    isRunning: boolean;
    isMenuOpen: boolean;
    activeDialog: "price_alert" | "finalize" | null;
    preSnapshot: PurchaseTutorialPreSnapshot | null;
    cursor: CursorState;

    // Actions
    startTutorial: (id: PurchaseTutorialId) => void;
    stopTutorial: () => void;
    setStepIndex: (index: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setMenuOpen: (open: boolean) => void;
    setActiveDialog: (dialog: "price_alert" | "finalize" | null) => void;
    saveSnapshot: (snapshot: PurchaseTutorialPreSnapshot) => void;
    clearSnapshot: () => void;
    updateCursor: (cursor: Partial<CursorState>) => void;
    triggerCursorClick: () => void;
}

export const usePurchaseTutorialStore = create<PurchaseTutorialStoreState>((set) => ({
    activeTutorial: null,
    stepIndex: 0,
    isRunning: false,
    isMenuOpen: false,
    activeDialog: null,
    preSnapshot: null,
    cursor: {
        x: 0,
        y: 0,
        visible: false,
        clicking: false,
    },

    startTutorial: (id) => {
        const scope = id === "receiving_create" ? "receiving" : "po";
        const store = getPurchaseItemsStore("new", scope);
        const currentItems = store.getState().items;
        const currentHeader = store.getState().headerData;

        const cleanItems = currentItems.filter((i) => !isMockPurchaseItem(i));

        const snapshot: PurchaseTutorialPreSnapshot = {
            items: cleanItems,
            headerData: currentHeader,
        };

        if (id === "po_create") {
            store.setState({
                items: [...MOCK_PO_ITEMS],
                lastUpdated: Date.now(),
            });
        } else if (id === "receiving_create") {
            store.setState({
                items: [...MOCK_RECEIVING_ITEMS],
                lastUpdated: Date.now(),
            });
        }

        set({
            activeTutorial: id,
            stepIndex: 0,
            isRunning: true,
            isMenuOpen: false,
            activeDialog: null,
            preSnapshot: snapshot,
        });
    },

    stopTutorial: () =>
        set((state) => ({
            activeTutorial: null,
            stepIndex: 0,
            isRunning: false,
            activeDialog: null,
            cursor: { ...state.cursor, visible: false, clicking: false },
        })),

    setStepIndex: (index) => set({ stepIndex: index }),

    nextStep: () => set((state) => ({ stepIndex: state.stepIndex + 1 })),

    prevStep: () =>
        set((state) => ({
            stepIndex: Math.max(0, state.stepIndex - 1),
        })),

    setMenuOpen: (open) => set({ isMenuOpen: open }),

    setActiveDialog: (dialog) => set({ activeDialog: dialog }),

    saveSnapshot: (snapshot) => set({ preSnapshot: snapshot }),

    clearSnapshot: () => set({ preSnapshot: null }),

    updateCursor: (partial) =>
        set((state) => ({
            cursor: { ...state.cursor, ...partial },
        })),

    triggerCursorClick: () => {
        set((state) => ({
            cursor: { ...state.cursor, clicking: true },
        }));
        setTimeout(() => {
            set((state) => ({
                cursor: { ...state.cursor, clicking: false },
            }));
        }, 300);
    },
}));
