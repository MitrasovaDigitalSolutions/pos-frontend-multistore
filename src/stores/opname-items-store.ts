import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface OpnameItemLocal {
    temp_id: string;
    product_id: number;
    barcode: string | null;
    nama: string;
    stok_sistem: number;
    stok_fisik: number;
    alasan: string;
}

interface OpnameItemsState {
    opnameId: number | null;
    items: OpnameItemLocal[];
    lastUpdated: number;

    // Actions
    setOpnameId: (id: number) => void;
    addItem: (product: {
        product_id: number;
        barcode: string | null;
        nama: string;
        stok_sistem: number;
        stok_fisik?: number;
        alasan?: string;
    }) => void;
    updateItem: (temp_id: string, data: Partial<Pick<OpnameItemLocal, "stok_fisik" | "alasan">>) => void;
    removeItem: (temp_id: string) => void;
    clearAll: () => void;
    setItems: (items: OpnameItemLocal[]) => void;
}

function generateTempId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function createOpnameItemsStore(opnameId: number) {
    const storageKey = `opname-items-${opnameId}`;

    return create<OpnameItemsState>()(
        persist(
            (set) => ({
                opnameId,
                items: [],
                lastUpdated: Date.now(),

                setOpnameId: (id) =>
                    set({
                        opnameId: id,
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
                                        ? { ...i, stok_fisik: i.stok_fisik + 1 }
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
                                    stok_sistem: product.stok_sistem,
                                    stok_fisik: product.stok_fisik ?? product.stok_sistem,
                                    alasan: product.alasan || "Opname rutin",
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

                setItems: (items) =>
                    set({
                        items,
                        lastUpdated: Date.now(),
                    }),
            }),
            {
                name: storageKey,
                storage: createJSONStorage(() => localStorage),
            },
        ),
    );
}

type StoreInstance = ReturnType<typeof createOpnameItemsStore>;
const storeRegistry = new Map<number, StoreInstance>();

export function getOpnameItemsStore(opnameId: number): StoreInstance {
    if (!storeRegistry.has(opnameId)) {
        storeRegistry.set(opnameId, createOpnameItemsStore(opnameId));
    }
    return storeRegistry.get(opnameId)!;
}

export function clearOpnameItemsStore(opnameId: number): void {
    const storageKey = `opname-items-${opnameId}`;
    try {
        localStorage.removeItem(storageKey);
    } catch {
        // ignore
    }
    storeRegistry.delete(opnameId);
}
