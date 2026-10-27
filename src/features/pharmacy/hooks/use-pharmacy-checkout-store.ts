import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CompoundedItem } from "../types";

interface PharmacyCheckoutState {
    compoundedItems: CompoundedItem[];

    // Compounded Items Actions
    addCompoundedItem: (item: CompoundedItem) => void;
    updateCompoundedItem: (uid: string, updated: CompoundedItem) => void;
    removeCompoundedItem: (uid: string) => void;
    clearCompoundedItems: () => void;

    // Bulk Reset
    clearPharmacyCheckout: () => void;
}

export const usePharmacyCheckoutStore = create<PharmacyCheckoutState>()(
    persist(
        (set) => ({
            compoundedItems: [],

            addCompoundedItem: (item) =>
                set((state) => ({
                    compoundedItems: [...state.compoundedItems, item],
                })),

            updateCompoundedItem: (uid, updated) =>
                set((state) => ({
                    compoundedItems: state.compoundedItems.map((item) =>
                        item.uid === uid ? updated : item
                    ),
                })),

            removeCompoundedItem: (uid) =>
                set((state) => ({
                    compoundedItems: state.compoundedItems.filter((item) => item.uid !== uid),
                })),

            clearCompoundedItems: () => set({ compoundedItems: [] }),

            clearPharmacyCheckout: () =>
                set({
                    compoundedItems: [],
                }),
        }),
        {
            name: "pharmacy_checkout_storage",
        }
    )
);
