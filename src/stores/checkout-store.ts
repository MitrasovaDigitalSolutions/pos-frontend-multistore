import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem, HoldTransaction } from "@/features/checkout/types";
import type { Member } from "@/features/members/types";

// ─── Checkout Zustand Store ──────────────────────────────────────────────────
// Persists the active cart and offline holdList in sessionStorage to prevent
// loss on refresh, while avoiding layout shifts on SSR via a client-side mounted check.

interface CheckoutStoreState {
    cart: CartItem[];
    holdList: HoldTransaction[];
    selectedMember: Member | null;

    // Cart Actions
    setCart: (items: CartItem[]) => void;
    addItem: (item: CartItem) => void;
    updateItemQty: (productId: number, qty: number) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;

    // Member Actions
    setSelectedMember: (member: Member | null) => void;

    // Hold/Recall Actions
    addHoldTransaction: (hold: HoldTransaction) => void;
    removeHoldTransaction: (id: number) => void;
    clearHoldList: () => void;
}

export const useCheckoutStore = create<CheckoutStoreState>()(
    persist(
        (set) => ({
            cart: [],
            holdList: [],
            selectedMember: null,

            setCart: (items) => set({ cart: items }),

            addItem: (item) =>
                set((state) => {
                    const existing = state.cart.find(
                        (i) => i.product_id === item.product_id,
                    );
                    if (existing) {
                        return {
                            cart: state.cart.map((i) =>
                                i.product_id === item.product_id
                                    ? { ...i, qty: i.qty + item.qty }
                                    : i
                            ),
                        };
                    }
                    return { cart: [...state.cart, item] };
                }),

            updateItemQty: (productId, qty) =>
                set((state) => ({
                    cart: state.cart.map((i) =>
                        i.product_id === productId ? { ...i, qty } : i
                    ),
                })),

            removeItem: (productId) =>
                set((state) => ({
                    cart: state.cart.filter((i) => i.product_id !== productId),
                })),

            clearCart: () => set({ cart: [], selectedMember: null }),

            setSelectedMember: (member) => set({ selectedMember: member }),

            addHoldTransaction: (hold) =>
                set((state) => ({
                    holdList: [...state.holdList, hold],
                })),

            removeHoldTransaction: (id) =>
                set((state) => ({
                    holdList: state.holdList.filter((h) => h.id !== id),
                })),

            clearHoldList: () => set({ holdList: [] }),
        }),
        {
            name: "checkout-storage",
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
