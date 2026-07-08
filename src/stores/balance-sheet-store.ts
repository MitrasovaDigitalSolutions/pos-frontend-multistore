import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BalanceSheetEditItem {
    uid: string;
    kode: string;
    nama: string;
    amount: number;
}

export interface BalanceSheetEditData {
    assets: BalanceSheetEditItem[];
    liabilities: BalanceSheetEditItem[];
    equity: BalanceSheetEditItem[];
    revenue: BalanceSheetEditItem[];
    expense: BalanceSheetEditItem[];
}

interface BalanceSheetStoreState {
    isEditing: boolean;
    editedData: BalanceSheetEditData | null;
    description: string;
    transactionDate: string;

    setEditing: (editing: boolean) => void;
    initializeData: (data: { assets?: any; liabilities?: any; equity?: any }, coaList: any[]) => void;
    updateItemAmount: (
        section: "assets" | "liabilities" | "equity" | "revenue" | "expense",
        uid: string,
        amount: number
    ) => void;
    addItem: (
        section: "assets" | "liabilities" | "equity" | "revenue" | "expense",
        item: BalanceSheetEditItem
    ) => void;
    removeItem: (
        section: "assets" | "liabilities" | "equity" | "revenue" | "expense",
        uid: string
    ) => void;
    setDescription: (desc: string) => void;
    setTransactionDate: (date: string) => void;
    reset: () => void;
}

export const useBalanceSheetStore = create<BalanceSheetStoreState>()(
    persist(
        (set) => ({
            isEditing: false,
            editedData: null,
            description: "",
            transactionDate: "",

            setEditing: (editing) => set({ isEditing: editing }),

            initializeData: (data, coaList) => {
                const mapSection = (items: any[]) => {
                    return (items || []).map((item) => {
                        const matched = coaList.find((coa) => coa.kode === item.kode);
                        return {
                            uid: matched?.uid || `temp-${Math.random().toString(36).substring(2, 9)}`,
                            kode: item.kode,
                            nama: item.nama,
                            amount: item.amount,
                        };
                    });
                };

                set({
                    editedData: {
                        assets: mapSection(data.assets?.items),
                        liabilities: mapSection(data.liabilities?.items),
                        equity: mapSection(data.equity?.items),
                        revenue: [],
                        expense: [],
                    },
                    description: "Penyesuaian Neraca Keuangan",
                    transactionDate: new Date().toISOString().split("T")[0],
                });
            },

            updateItemAmount: (section, uid, amount) =>
                set((state) => {
                    if (!state.editedData) return {};
                    return {
                        editedData: {
                            ...state.editedData,
                            [section]: state.editedData[section].map((item) =>
                                item.uid === uid ? { ...item, amount } : item
                            ),
                        },
                    };
                }),

            addItem: (section, item) =>
                set((state) => {
                    if (!state.editedData) return {};
                    const exists = state.editedData[section].some(
                        (i) => i.uid === item.uid || i.kode === item.kode
                    );
                    if (exists) return {};
                    return {
                        editedData: {
                            ...state.editedData,
                            [section]: [...state.editedData[section], item],
                        },
                    };
                }),

            removeItem: (section, uid) =>
                set((state) => {
                    if (!state.editedData) return {};
                    return {
                        editedData: {
                            ...state.editedData,
                            [section]: state.editedData[section].filter((item) => item.uid !== uid),
                        },
                    };
                }),

            setDescription: (desc) => set({ description: desc }),
            setTransactionDate: (date) => set({ transactionDate: date }),

            reset: () =>
                set({
                    isEditing: false,
                    editedData: null,
                    description: "",
                    transactionDate: "",
                }),
        }),
        {
            name: "balance-sheet-edit-storage",
        }
    )
);
