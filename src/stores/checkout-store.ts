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
    discountType: "nominal" | "percent";
    discountValue: number;
    namaTransaksi: string;

    // Cart Actions
    setCart: (items: CartItem[]) => void;
    addItem: (item: CartItem) => void;
    updateItemQty: (productId: string, qty: number) => void;
    updateItemPrice: (productId: string, price: number) => void;
    removeItem: (productId: string) => void;
    clearCart: () => void;

    // Member Actions
    setSelectedMember: (member: Member | null) => void;

    // Nama Transaksi Actions
    setNamaTransaksi: (name: string) => void;

    // Discount Actions
    setDiscountType: (type: "nominal" | "percent") => void;
    setDiscountValue: (val: number) => void;

    // Hold/Recall Actions
    addHoldTransaction: (hold: HoldTransaction) => void;
    removeHoldTransaction: (uid: string) => void;
    clearHoldList: () => void;
}

export const useCheckoutStore = create<CheckoutStoreState>()(
    persist(
        (set) => ({
            cart: [],
            holdList: [],
            selectedMember: null,
            discountType: "nominal",
            discountValue: 0,
            namaTransaksi: "",

            setCart: (items) => set({ cart: items }),

            addItem: (item) =>
                set((state) => {
                    const existing = state.cart.find(
                        (i) => i.product_uid === item.product_uid,
                    );
                    if (existing) {
                        return {
                            cart: state.cart.map((i) =>
                                i.product_uid === item.product_uid
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
                        i.product_uid === productId ? { ...i, qty } : i
                    ),
                })),

            updateItemPrice: (productId, price) =>
                set((state) => ({
                    cart: state.cart.map((i) =>
                        i.product_uid === productId ? { ...i, price } : i
                    ),
                })),

            removeItem: (productId) =>
                set((state) => ({
                    cart: state.cart.filter((i) => i.product_uid !== productId),
                })),

            clearCart: () => set({ cart: [], selectedMember: null, discountType: "nominal", discountValue: 0, namaTransaksi: "" }),

            setSelectedMember: (member) => set({ selectedMember: member }),

            setNamaTransaksi: (name) => set({ namaTransaksi: name }),

            setDiscountType: (type) => set({ discountType: type }),

            setDiscountValue: (val) => set({ discountValue: val }),

            addHoldTransaction: (hold) =>
                set((state) => ({
                    holdList: [...state.holdList, hold],
                })),

            removeHoldTransaction: (id) =>
                set((state) => ({
                    holdList: state.holdList.filter((h) => h.uid !== id),
                })),

            clearHoldList: () => set({ holdList: [] }),
        }),
        {
            name: "checkout-storage",
            storage: createJSONStorage(() => sessionStorage),
        },
    ),
);
