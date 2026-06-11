import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PurchaseItemLocal } from "@/features/purchase/types";

// ─── Purchase Items Store ───────────────────────────────────────────────────
// Persists items in localStorage per parent document (PO/Receiving/Return).
// Items are stored locally for fast barcode scanning, then bulk-submitted to the server.

export type ParentType = "po" | "receiving" | "return";

interface PurchaseItemsState {
    parentId: number | null;
    parentType: ParentType | null;
    items: PurchaseItemLocal[];
    lastUpdated: number;

    // Actions
    setParent: (id: number, type: ParentType) => void;
    addItem: (product: {
        product_id: number;
        barcode: string | null;
        nama: string;
        harga_estimasi: number;
    }) => void;
    updateItem: (temp_id: string, data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi">>) => void;
    removeItem: (temp_id: string) => void;
    clearAll: () => void;
    getSubmitPayload: () => {
        items: {
            product_id: number;
            kuantitas: number;
            harga_estimasi: number;
        }[];
    };
}

// Generate a simple unique ID
function generateTempId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Factory function to create a store for a specific parent
export function createPurchaseItemsStore(parentId: number, parentType: ParentType) {
    const storageKey = `purchase-items-${parentType}-${parentId}`;

    return create<PurchaseItemsState>()(
        persist(
            (set, get) => ({
                parentId,
                parentType,
                items: [],
                lastUpdated: Date.now(),

                setParent: (id, type) =>
                    set({
                        parentId: id,
                        parentType: type,
                        lastUpdated: Date.now(),
                    }),

                addItem: (product) =>
                    set((state) => {
                        const existing = state.items.find(
                            (i) => i.product_id === product.product_id,
                        );
                        if (existing) {
                            return {
                                items: state.items.map((i) =>
                                    i.product_id === product.product_id
                                        ? { ...i, kuantitas: i.kuantitas + 1 }
                                        : i,
                                ),
                                lastUpdated: Date.now(),
                            };
                        }
                        return {
                            items: [
                                ...state.items,
                                {
                                    temp_id: generateTempId(),
                                    product_id: product.product_id,
                                    barcode: product.barcode,
                                    nama: product.nama,
                                    kuantitas: 1,
                                    harga_estimasi: product.harga_estimasi,
                                },
                            ],
                            lastUpdated: Date.now(),
                        };
                    }),

                updateItem: (temp_id, data) =>
                    set((state) => ({
                        items: state.items.map((i) =>
                            i.temp_id === temp_id ? { ...i, ...data } : i,
                        ),
                        lastUpdated: Date.now(),
                    })),

                removeItem: (temp_id) =>
                    set((state) => ({
                        items: state.items.filter((i) => i.temp_id !== temp_id),
                        lastUpdated: Date.now(),
                    })),

                clearAll: () =>
                    set({
                        items: [],
                        lastUpdated: Date.now(),
                    }),

                getSubmitPayload: () => {
                    const { items } = get();
                    return {
                        items: items.map((i) => ({
                            product_id: i.product_id,
                            kuantitas: i.kuantitas,
                            harga_estimasi: i.harga_estimasi,
                        })),
                    };
                },
            }),
            {
                name: storageKey,
                storage: createJSONStorage(() => localStorage),
            },
        ),
    );
}

// ─── Store Registry ─────────────────────────────────────────────────────────
// Cache store instances to avoid re-creating on every render.

type StoreInstance = ReturnType<typeof createPurchaseItemsStore>;

const storeRegistry = new Map<string, StoreInstance>();

export function getPurchaseItemsStore(parentId: number, parentType: ParentType): StoreInstance {
    const key = `${parentType}-${parentId}`;
    if (!storeRegistry.has(key)) {
        storeRegistry.set(key, createPurchaseItemsStore(parentId, parentType));
    }
    return storeRegistry.get(key)!;
}

// Cleanup a store instance and its localStorage data
export function clearPurchaseItemsStore(parentId: number, parentType: ParentType): void {
    const key = `${parentType}-${parentId}`;
    const storageKey = `purchase-items-${parentType}-${parentId}`;

    // Clear localStorage
    try {
        localStorage.removeItem(storageKey);
    } catch {
        // ignore
    }

    // Remove from registry
    storeRegistry.delete(key);
}

// ─── Selectors ──────────────────────────────────────────────────────────────

export const selectItemCount = (state: PurchaseItemsState) =>
    state.items.reduce((acc, item) => acc + item.kuantitas, 0);

export const selectTotal = (state: PurchaseItemsState) =>
    state.items.reduce((acc, item) => acc + item.kuantitas * item.harga_estimasi, 0);
