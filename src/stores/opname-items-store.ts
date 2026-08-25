import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface OpnameItemLocal {
    temp_uid: string;
    product_uid: string;
    brand_uid?: string | null;
    category_uid?: string | null;
    barcode: string | null;
    nama: string;
    stok_sistem: number;
    stok_fisik: number;
    alasan: string;
    /** Timestamp of last modification — used for sorting (most recent first) */
    updated_at: number;
}

interface OpnameItemsState {
    opnameId: string | null;
    /** Internal Map storage keyed by product_uid for O(1) lookups */
    itemsMap: Record<string, OpnameItemLocal>;
    lastUpdated: number;

    // ── Derived Getters ──
    /** Returns items sorted by updated_at desc (most recently touched first) */
    readonly items: OpnameItemLocal[];
    readonly itemCount: number;

    // ── O(1) Lookup Methods ──
    hasItem: (productUid: string) => boolean;
    getItem: (productUid: string) => OpnameItemLocal | undefined;

    // ── Actions ──
    setOpnameId: (uid: string) => void;
    addItem: (product: {
        product_uid: string;
        brand_uid?: string | null;
        category_uid?: string | null;
        barcode: string | null;
        nama: string;
        stok_sistem: number;
        stok_fisik?: number;
        alasan?: string;
    }) => void;
    updateItem: (productUid: string, data: Partial<Pick<OpnameItemLocal, "stok_fisik" | "alasan" | "brand_uid" | "category_uid">>) => void;
    removeItem: (productUid: string) => void;
    clearAll: () => void;
    setItems: (items: OpnameItemLocal[]) => void;
    bulkSetItems: (items: OpnameItemLocal[]) => void;
}

function generateTempId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/** Derive sorted items array from the map (most recently updated first) */
function deriveItems(itemsMap: Record<string, OpnameItemLocal>): OpnameItemLocal[] {
    return Object.values(itemsMap).sort((a, b) => b.updated_at - a.updated_at);
}

/**
 * Migration: detect old localStorage format (flat array) and convert to Map format.
 * Old format: { items: OpnameItemLocal[], ... }
 * New format: { itemsMap: Record<string, OpnameItemLocal>, ... }
 */
function migrateFromArrayFormat(persistedState: Record<string, unknown>): Record<string, unknown> {
    // If already has itemsMap, no migration needed
    if (persistedState.itemsMap && typeof persistedState.itemsMap === "object") {
        return persistedState;
    }

    // Check for old "items" array format
    const oldItems = persistedState.items;
    if (Array.isArray(oldItems) && oldItems.length > 0) {
        const migratedMap: Record<string, OpnameItemLocal> = {};
        const now = Date.now();
        for (let i = 0; i < oldItems.length; i++) {
            const item = oldItems[i] as OpnameItemLocal;
            if (item && item.product_uid) {
                migratedMap[item.product_uid] = {
                    ...item,
                    updated_at: item.updated_at ?? (now - i), // preserve ordering
                };
            }
        }
        return {
            ...persistedState,
            itemsMap: migratedMap,
            items: undefined, // remove old field
        };
    }

    return persistedState;
}

export function createOpnameItemsStore(opnameId: string) {
    const storageKey = `opname-items-${opnameId}`;

    return create<OpnameItemsState>()(
        persist(
            (set, get) => ({
                opnameId,
                itemsMap: {},
                lastUpdated: Date.now(),

                // ── Derived Getters (computed on access) ──
                get items() {
                    return deriveItems(get().itemsMap);
                },

                get itemCount() {
                    return Object.keys(get().itemsMap).length;
                },

                // ── O(1) Lookup Methods ──
                hasItem: (productUid) => productUid in get().itemsMap,

                getItem: (productUid) => get().itemsMap[productUid],

                // ── Actions ──
                setOpnameId: (id) =>
                    set({
                        opnameId: id,
                        lastUpdated: Date.now(),
                    }),

                addItem: (product) =>
                    set((state) => {
                        const now = Date.now();
                        const existing = state.itemsMap[product.product_uid];

                        if (existing) {
                            // Item already exists → increment qty, bump timestamp
                            return {
                                itemsMap: {
                                    ...state.itemsMap,
                                    [product.product_uid]: {
                                        ...existing,
                                        stok_fisik: (Number(existing.stok_fisik) || 0) + 1,
                                        updated_at: now,
                                    },
                                },
                                lastUpdated: now,
                            };
                        }

                        // New item
                        return {
                            itemsMap: {
                                ...state.itemsMap,
                                [product.product_uid]: {
                                    temp_uid: generateTempId(),
                                    product_uid: product.product_uid,
                                    brand_uid: product.brand_uid ?? null,
                                    category_uid: product.category_uid ?? null,
                                    barcode: product.barcode,
                                    nama: product.nama,
                                    stok_sistem: product.stok_sistem,
                                    stok_fisik: product.stok_fisik ?? 1,
                                    alasan: product.alasan || "Opname rutin",
                                    updated_at: now,
                                },
                            },
                            lastUpdated: now,
                        };
                    }),

                updateItem: (productUid, data) =>
                    set((state) => {
                        const existing = state.itemsMap[productUid];
                        if (!existing) return state;

                        return {
                            itemsMap: {
                                ...state.itemsMap,
                                [productUid]: {
                                    ...existing,
                                    ...data,
                                    updated_at: Date.now(),
                                },
                            },
                            lastUpdated: Date.now(),
                        };
                    }),

                removeItem: (productUid) =>
                    set((state) => {
                        const newMap = { ...state.itemsMap };
                        delete newMap[productUid];
                        return {
                            itemsMap: newMap,
                            lastUpdated: Date.now(),
                        };
                    }),

                clearAll: () =>
                    set({
                        itemsMap: {},
                        lastUpdated: Date.now(),
                    }),

                setItems: (items) =>
                    set(() => {
                        const now = Date.now();
                        const newMap: Record<string, OpnameItemLocal> = {};
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            newMap[item.product_uid] = {
                                ...item,
                                updated_at: item.updated_at ?? (now - i),
                            };
                        }
                        return {
                            itemsMap: newMap,
                            lastUpdated: now,
                        };
                    }),

                bulkSetItems: (items) =>
                    set((state) => {
                        const now = Date.now();
                        const newMap = { ...state.itemsMap };
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            newMap[item.product_uid] = {
                                ...item,
                                updated_at: item.updated_at ?? (now - i),
                            };
                        }
                        return {
                            itemsMap: newMap,
                            lastUpdated: now,
                        };
                    }),
            }),
            {
                name: storageKey,
                storage: createJSONStorage(() => localStorage),
                // Only persist the map, not the derived getters
                partialize: (state) => ({
                    opnameId: state.opnameId,
                    itemsMap: state.itemsMap,
                    lastUpdated: state.lastUpdated,
                }),
                migrate: (persistedState) => {
                    return migrateFromArrayFormat(persistedState as Record<string, unknown>) as unknown as OpnameItemsState;
                },
                version: 1,
            },
        ),
    );
}

type StoreInstance = ReturnType<typeof createOpnameItemsStore>;
const storeRegistry = new Map<string, StoreInstance>();

export function getOpnameItemsStore(opnameId: string): StoreInstance {
    if (!storeRegistry.has(opnameId)) {
        storeRegistry.set(opnameId, createOpnameItemsStore(opnameId));
    }
    return storeRegistry.get(opnameId)!;
}

export function clearOpnameItemsStore(opnameId: string): void {
    const storageKey = `opname-items-${opnameId}`;
    try {
        localStorage.removeItem(storageKey);
    } catch {
        // ignore
    }
    storeRegistry.delete(opnameId);
}
