import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { CartItem } from "@/types/common";

// ─── Cart Store ─────────────────────────────────────────────────────────────
// Client-side only state for the checkout cart.

interface CartState {
    items: CartItem[];
    transactionId: string | null;

    // Actions
    setTransactionId: (uid: string | null) => void;
    setItems: (items: CartItem[]) => void;
    addItem: (item: CartItem) => void;
    updateItemQty: (itemId: number, qty: number) => void;
    removeItem: (itemId: number) => void;
    clearCart: () => void;

    // Computed-like getters (Zustand doesn't have true computed — use selectors)
}

export const useCartStore = create<CartState>()(
    immer((set) => ({
        items: [],
        transactionId: null,

        setTransactionId: (id) =>
            set((state) => {
                state.transactionId = id;
            }),

        setItems: (items) =>
            set((state) => {
                state.items = items;
            }),

        addItem: (item) =>
            set((state) => {
                const existing = state.items.find(
                    (i) => i.product_uid === item.product_uid,
                );
                if (existing) {
                    existing.qty += item.qty;
                } else {
                    state.items.push(item);
                }
            }),

        updateItemQty: (itemId, qty) =>
            set((state) => {
                const item = state.items.find((i) => i.itemId === itemId);
                if (item) {
                    item.qty = qty;
                }
            }),

        removeItem: (itemId) =>
            set((state) => {
                state.items = state.items.filter((i) => i.itemId !== itemId);
            }),

        clearCart: () =>
            set((state) => {
                state.items = [];
                state.transactionId = null;
            }),
    })),
);

// ─── Selectors ──────────────────────────────────────────────────────────────

export const selectSubtotal = (state: CartState) =>
    state.items.reduce((acc, item) => acc + item.price * item.qty, 0);

export const selectTax = (state: CartState) =>
    Math.round(selectSubtotal(state) * 0.11);

export const selectGrandTotal = (state: CartState) =>
    selectSubtotal(state) + selectTax(state);

export const selectItemCount = (state: CartState) =>
    state.items.reduce((acc, item) => acc + item.qty, 0);
