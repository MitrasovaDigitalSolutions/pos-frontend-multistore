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
    /** Stable array reference derived from itemsMap — sorted by updated_at desc */
    items: OpnameItemLocal[];
    itemCount: number;
    lastUpdated: number;

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
 * New format: { itemsMap: Record<string, OpnameItemLocal>, items: OpnameItemLocal[], ... }
 */
function migrateFromArrayFormat(persistedState: Record<string, unknown>): Record<string, unknown> {
    const rawMap = persistedState.itemsMap;
    if (rawMap && typeof rawMap === "object") {
        const itemsMap = rawMap as Record<string, OpnameItemLocal>;
        return {
            ...persistedState,
            itemsMap,
            items: deriveItems(itemsMap),
            itemCount: Object.keys(itemsMap).length,
        };
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
        const derived = deriveItems(migratedMap);
        return {
            ...persistedState,
            itemsMap: migratedMap,
            items: derived,
            itemCount: derived.length,
        };
    }

    return {
        ...persistedState,
        itemsMap: {},
        items: [],
        itemCount: 0,
    };
}

export function createOpnameItemsStore(opnameId: string) {
    const storageKey = `opname-items-${opnameId}`;

    return create<OpnameItemsState>()(
        persist(
            (set, get) => ({
                opnameId,
                itemsMap: {},
                items: [],
                itemCount: 0,
                lastUpdated: Date.now(),

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

                        let nextMap: Record<string, OpnameItemLocal>;
                        if (existing) {
                            nextMap = {
                                ...state.itemsMap,
                                [product.product_uid]: {
                                    ...existing,
                                    stok_fisik: (Number(existing.stok_fisik) || 0) + 1,
                                    updated_at: now,
                                },
                            };
                        } else {
                            nextMap = {
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
                            };
                        }

                        const nextItems = deriveItems(nextMap);
                        return {
                            itemsMap: nextMap,
                            items: nextItems,
                            itemCount: nextItems.length,
                            lastUpdated: now,
                        };
                    }),

                updateItem: (productUid, data) =>
                    set((state) => {
                        const existing = state.itemsMap[productUid];
                        if (!existing) return state;

                        const now = Date.now();
                        const nextMap = {
                            ...state.itemsMap,
                            [productUid]: {
                                ...existing,
                                ...data,
                                updated_at: now,
                            },
                        };

                        const nextItems = deriveItems(nextMap);
                        return {
                            itemsMap: nextMap,
                            items: nextItems,
                            itemCount: nextItems.length,
                            lastUpdated: now,
                        };
                    }),

                removeItem: (productUid) =>
                    set((state) => {
                        const nextMap = { ...state.itemsMap };
                        delete nextMap[productUid];
                        const nextItems = deriveItems(nextMap);
                        return {
                            itemsMap: nextMap,
                            items: nextItems,
                            itemCount: nextItems.length,
                            lastUpdated: Date.now(),
                        };
                    }),

                clearAll: () =>
                    set({
                        itemsMap: {},
                        items: [],
                        itemCount: 0,
                        lastUpdated: Date.now(),
                    }),

                setItems: (items) =>
                    set(() => {
                        const now = Date.now();
                        const nextMap: Record<string, OpnameItemLocal> = {};
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            nextMap[item.product_uid] = {
                                ...item,
                                updated_at: item.updated_at ?? (now - i),
                            };
                        }
                        const nextItems = deriveItems(nextMap);
                        return {
                            itemsMap: nextMap,
                            items: nextItems,
                            itemCount: nextItems.length,
                            lastUpdated: now,
                        };
                    }),

                bulkSetItems: (items) =>
                    set((state) => {
                        const now = Date.now();
                        const nextMap = { ...state.itemsMap };
                        for (let i = 0; i < items.length; i++) {
                            const item = items[i];
                            nextMap[item.product_uid] = {
                                ...item,
                                updated_at: item.updated_at ?? (now - i),
                            };
                        }
                        const nextItems = deriveItems(nextMap);
                        return {
                            itemsMap: nextMap,
                            items: nextItems,
                            itemCount: nextItems.length,
                            lastUpdated: now,
                        };
                    }),
            }),
            {
                name: storageKey,
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    opnameId: state.opnameId,
                    itemsMap: state.itemsMap,
                    lastUpdated: state.lastUpdated,
                }),
                onRehydrateStorage: () => (state) => {
                    if (state && state.itemsMap) {
                        state.items = deriveItems(state.itemsMap);
                        state.itemCount = Object.keys(state.itemsMap).length;
                    }
                },
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
