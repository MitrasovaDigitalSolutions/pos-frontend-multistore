import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";

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
    /** Flag to track if there are unsaved local modifications */
    isDirty: boolean;

    // ── O(1) Lookup Methods ──
    hasItem: (productUid: string) => boolean;
    getItem: (productUid: string) => OpnameItemLocal | undefined;

    // ── Actions ──
    setOpnameId: (uid: string) => void;
    setIsDirty: (dirty: boolean) => void;
    markClean: () => void;
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

// ─── High-Capacity IndexedDB Storage Adapter ────────────────────────────────
// Replaces 5MB localStorage with IndexedDB to support 50,000+ items without QuotaExceededError.

const IDB_DB_NAME = "pos-opname-drafts-db";
const IDB_STORE_NAME = "drafts";

function getIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !("indexedDB" in window)) {
            return reject(new Error("IndexedDB not supported"));
        }
        const request = indexedDB.open(IDB_DB_NAME, 1);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
                db.createObjectStore(IDB_STORE_NAME);
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

const idbStorage: StateStorage = {
    getItem: async (name: string): Promise<string | null> => {
        try {
            // First check IndexedDB
            const db = await getIDB();
            const val = await new Promise<string | null>((resolve) => {
                const tx = db.transaction(IDB_STORE_NAME, "readonly");
                const store = tx.objectStore(IDB_STORE_NAME);
                const req = store.get(name);
                req.onsuccess = () => resolve(req.result ?? null);
                req.onerror = () => resolve(null);
            });

            if (val) return val;

            // Fallback & migration from legacy localStorage if exists
            if (typeof window !== "undefined" && window.localStorage) {
                const legacy = localStorage.getItem(name);
                if (legacy) {
                    // Migrate to IndexedDB and remove from localStorage to free quota
                    await idbStorage.setItem(name, legacy);
                    try {
                        localStorage.removeItem(name);
                    } catch {
                        // ignore
                    }
                    return legacy;
                }
            }

            return null;
        } catch {
            return null;
        }
    },
    setItem: async (name: string, value: string): Promise<void> => {
        try {
            const db = await getIDB();
            await new Promise<void>((resolve, reject) => {
                const tx = db.transaction(IDB_STORE_NAME, "readwrite");
                const store = tx.objectStore(IDB_STORE_NAME);
                const req = store.put(value, name);
                req.onsuccess = () => resolve();
                req.onerror = () => reject(req.error);
            });

            // Clean up any old copy in localStorage to keep quota empty
            if (typeof window !== "undefined" && window.localStorage) {
                try {
                    localStorage.removeItem(name);
                } catch {
                    // ignore
                }
            }
        } catch (e) {
            console.warn("[OpnameStorage] IndexedDB write failed:", e);
        }
    },
    removeItem: async (name: string): Promise<void> => {
        try {
            const db = await getIDB();
            await new Promise<void>((resolve) => {
                const tx = db.transaction(IDB_STORE_NAME, "readwrite");
                const store = tx.objectStore(IDB_STORE_NAME);
                const req = store.delete(name);
                req.onsuccess = () => resolve();
                req.onerror = () => resolve();
            });
        } catch {
            // ignore
        }

        if (typeof window !== "undefined" && window.localStorage) {
            try {
                localStorage.removeItem(name);
            } catch {
                // ignore
            }
        }
    },
};

/**
 * Migration: detect old format (flat array) and convert to Map format.
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
            isDirty: false,
        };
    }

    const oldItems = persistedState.items;
    if (Array.isArray(oldItems) && oldItems.length > 0) {
        const migratedMap: Record<string, OpnameItemLocal> = {};
        const now = Date.now();
        for (let i = 0; i < oldItems.length; i++) {
            const item = oldItems[i] as OpnameItemLocal;
            if (item && item.product_uid) {
                migratedMap[item.product_uid] = {
                    ...item,
                    updated_at: item.updated_at ?? (now - i),
                };
            }
        }
        const derived = deriveItems(migratedMap);
        return {
            ...persistedState,
            itemsMap: migratedMap,
            items: derived,
            itemCount: derived.length,
            isDirty: false,
        };
    }

    return {
        ...persistedState,
        itemsMap: {},
        items: [],
        itemCount: 0,
        isDirty: false,
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
                isDirty: false,

                // ── O(1) Lookup Methods ──
                hasItem: (productUid) => productUid in get().itemsMap,

                getItem: (productUid) => get().itemsMap[productUid],

                // ── Actions ──
                setOpnameId: (id) =>
                    set({
                        opnameId: id,
                        lastUpdated: Date.now(),
                    }),

                setIsDirty: (dirty) => set({ isDirty: dirty }),

                markClean: () => set({ isDirty: false }),

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
                            isDirty: true,
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
                            isDirty: true,
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
                            isDirty: true,
                        };
                    }),

                clearAll: () =>
                    set({
                        itemsMap: {},
                        items: [],
                        itemCount: 0,
                        lastUpdated: Date.now(),
                        isDirty: true,
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
                            isDirty: false,
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
                            isDirty: true,
                        };
                    }),
            }),
            {
                name: storageKey,
                storage: createJSONStorage(() => idbStorage),
                partialize: (state) => ({
                    opnameId: state.opnameId,
                    itemsMap: state.itemsMap,
                    lastUpdated: state.lastUpdated,
                    isDirty: state.isDirty,
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
        idbStorage.removeItem(storageKey);
    } catch {
        // ignore
    }
    storeRegistry.delete(opnameId);
}
