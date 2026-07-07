import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PurchaseItemLocal } from "@/features/purchase/types";

// ─── Purchase Items Store ───────────────────────────────────────────────────
// Persists items in localStorage per parent document (PO/Receiving/Return).
// Items are stored locally for fast barcode scanning, then bulk-submitted to the server.

export type ParentType = "po" | "receiving" | "return";

export interface SavedHeaderData {
    purchase_order_uid?: string | null;
    supplier_uid?: string | null;
    nomor_faktur?: string | null;
    nilai_faktur?: number | null;
    tanggal_terima?: string | null;
    status_pembayaran?: "pending" | "unpaid" | "partial" | "paid";
    catatan?: string | null;
}

interface PurchaseItemsState {
    parentId: string | null;
    parentType: ParentType | null;
    items: PurchaseItemLocal[];
    headerData: SavedHeaderData | null;
    lastUpdated: number;

    // Actions
    setParent: (uid: string, type: ParentType) => void;
    setHeaderData: (data: SavedHeaderData | null) => void;
    addItem: (product: {
        product_uid: string;
        barcode: string | null;
        nama: string;
        harga_estimasi: number;
        kuantitas?: number;
        alasan?: string | null;
    }) => void;
    updateItem: (temp_uid: string, data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi" | "alasan">>) => void;
    removeItem: (temp_uid: string) => void;
    clearAll: () => void;
    getSubmitPayload: () => {
        items: {
            product_uid: string;
            kuantitas: number;
            harga_estimasi: number;
            alasan?: string | null;
        }[];
    };
}

// Generate a simple unique ID
function generateTempId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Factory function to create a store for a specific parent
export function createPurchaseItemsStore(parentId: string, parentType: ParentType) {
    const storageKey = `purchase-items-${parentType}-${parentId}`;

    return create<PurchaseItemsState>()(
        persist(
            (set, get) => ({
                parentId,
                parentType,
                items: [],
                headerData: null,
                lastUpdated: Date.now(),

                setParent: (uid, type) =>
                    set({
                        parentId: uid,
                        parentType: type,
                        lastUpdated: Date.now(),
                    }),

                setHeaderData: (data) =>
                    set((state) => ({
                        headerData: data ? { ...state.headerData, ...data } : null,
                        lastUpdated: Date.now(),
                    })),

                addItem: (product) =>
                    set((state) => {
                        const targetQty = product.kuantitas ?? 1;
                        const existing = state.items.find(
                            (i) => i.product_uid === product.product_uid,
                        );
                        if (existing) {
                            return {
                                items: state.items.map((i) =>
                                    i.product_uid === product.product_uid
                                        ? { ...i, kuantitas: i.kuantitas + targetQty }
                                        : i,
                                ),
                                lastUpdated: Date.now(),
                            };
                        }
                        return {
                            items: [
                                ...state.items,
                                {
                                    temp_uid: generateTempId(),
                                    product_uid: product.product_uid,
                                    barcode: product.barcode,
                                    nama: product.nama,
                                    kuantitas: targetQty,
                                    harga_estimasi: product.harga_estimasi,
                                    alasan: product.alasan || null,
                                },
                            ],
                            lastUpdated: Date.now(),
                        };
                    }),

                updateItem: (temp_uid, data) =>
                    set((state) => ({
                        items: state.items.map((i) =>
                            i.temp_uid === temp_uid ? { ...i, ...data } : i,
                        ),
                        lastUpdated: Date.now(),
                    })),

                removeItem: (temp_uid) =>
                    set((state) => ({
                        items: state.items.filter((i) => i.temp_uid !== temp_uid),
                        lastUpdated: Date.now(),
                    })),

                clearAll: () =>
                    set({
                        items: [],
                        headerData: null,
                        lastUpdated: Date.now(),
                    }),

                getSubmitPayload: () => {
                    const { items } = get();
                    return {
                        items: items.map((i) => ({
                            product_uid: i.product_uid,
                            kuantitas: i.kuantitas,
                            harga_estimasi: i.harga_estimasi,
                            alasan: i.alasan || null,
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

export function getPurchaseItemsStore(parentId: string, parentType: ParentType): StoreInstance {
    const key = `${parentType}-${parentId}`;
    if (!storeRegistry.has(key)) {
        storeRegistry.set(key, createPurchaseItemsStore(parentId, parentType));
    }
    return storeRegistry.get(key)!;
}

// Cleanup a store instance and its localStorage data
export function clearPurchaseItemsStore(parentId: string, parentType: ParentType): void {
    const key = `${parentType}-${parentId}`;
    const storageKey = `purchase-items-${parentType}-${parentId}`;

    // Reset in-memory store state first (clears items + headerData)
    // This prevents any lingering useWatch effects from re-persisting stale data
    const existing = storeRegistry.get(key);
    if (existing) {
        existing.getState().clearAll();
    }

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
