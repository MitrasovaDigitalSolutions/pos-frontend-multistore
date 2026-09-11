import { create } from "zustand";
import type { TutorialId, TutorialPreSnapshot } from "@/features/tutorial/types/tutorial";
import { useCheckoutStore } from "@/stores/checkout-store";
import {
    isMockCartItem,
    isMockMember,
    isMockHold,
    isMockNamaTransaksi,
    MOCK_MEMBER_WITH_DEBT,
    MOCK_PRODUCTS,
} from "@/features/tutorial/constants/tutorial-constants";

interface CursorState {
    x: number;
    y: number;
    visible: boolean;
    clicking: boolean;
    label?: string;
}

interface TutorialStoreState {
    activeTutorial: TutorialId | null;
    stepIndex: number;
    isRunning: boolean;
    isMenuOpen: boolean;
    preSnapshot: TutorialPreSnapshot | null;
    cursor: CursorState;

    // Actions
    startTutorial: (id: TutorialId) => void;
    stopTutorial: () => void;
    setStepIndex: (index: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setMenuOpen: (open: boolean) => void;
    saveSnapshot: (snapshot: TutorialPreSnapshot) => void;
    clearSnapshot: () => void;
    updateCursor: (cursor: Partial<CursorState>) => void;
    triggerCursorClick: () => void;
}

export const useTutorialStore = create<TutorialStoreState>((set) => ({
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
        const checkout = useCheckoutStore.getState();
        const cleanCart = checkout.cart.filter((item) => !isMockCartItem(item));
        const cleanMember = isMockMember(checkout.selectedMember) ? null : checkout.selectedMember;
        const cleanNama = isMockNamaTransaksi(checkout.namaTransaksi) ? "" : checkout.namaTransaksi;
        const cleanHold = checkout.holdList.filter((h) => !isMockHold(h));

        // Purge residual mock state from previous aborted tutorial if present
        if (cleanCart.length !== checkout.cart.length) {
            checkout.setCart(cleanCart);
        }
        if (checkout.selectedMember && !cleanMember) {
            checkout.setSelectedMember(null);
        }
        if (checkout.namaTransaksi && !cleanNama) {
            checkout.setNamaTransaksi("");
        }
        if (cleanHold.length !== checkout.holdList.length) {
            checkout.clearHoldList();
            cleanHold.forEach((h) => checkout.addHoldTransaction(h));
        }

        const snapshot: TutorialPreSnapshot = {
            cart: [...cleanCart],
            selectedMember: cleanMember,
            discountType: checkout.discountType,
            discountValue: checkout.discountValue,
            namaTransaksi: cleanNama,
            holdList: [...cleanHold],
        };

        // Pre-inject mock state needed for step 1
        if (id === "hutang_member") {
            checkout.setSelectedMember(MOCK_MEMBER_WITH_DEBT);
        }
        if (id === "hold_recall_void") {
            checkout.setCart(MOCK_PRODUCTS.slice(0, 2));
            checkout.setNamaTransaksi("Pelanggan A (Pending)");
        }

        set({
            activeTutorial: id,
            stepIndex: 0,
            isRunning: true,
            isMenuOpen: false,
            preSnapshot: snapshot,
        });
    },

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
