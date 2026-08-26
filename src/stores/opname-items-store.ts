import { create } from "zustand";

export interface OpnameFilterState {
    page: number;
    perPage: number;
    search: string;
    filterSelisih: "all" | "diff" | "match" | "plus" | "minus";
    categoryUid: string;
    brandUid: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

interface OpnameUIStoreState extends OpnameFilterState {
    setPage: (page: number) => void;
    setPerPage: (perPage: number) => void;
    setSearch: (search: string) => void;
    setFilterSelisih: (filter: "all" | "diff" | "match" | "plus" | "minus") => void;
    setCategoryUid: (uid: string) => void;
    setBrandUid: (uid: string) => void;
    setSorting: (sortBy: string, sortOrder: "asc" | "desc") => void;
    resetFilters: () => void;
}

const defaultFilterState: OpnameFilterState = {
    page: 1,
    perPage: 25,
    search: "",
    filterSelisih: "all",
    categoryUid: "",
    brandUid: "",
    sortBy: "updated_at",
    sortOrder: "desc",
};

export const useOpnameUIStore = create<OpnameUIStoreState>((set) => ({
    ...defaultFilterState,
    setPage: (page) => set({ page }),
    setPerPage: (perPage) => set({ perPage, page: 1 }),
    setSearch: (search) => set({ search, page: 1 }),
    setFilterSelisih: (filterSelisih) => set({ filterSelisih, page: 1 }),
    setCategoryUid: (categoryUid) => set({ categoryUid, page: 1 }),
    setBrandUid: (brandUid) => set({ brandUid, page: 1 }),
    setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
    resetFilters: () => set({ ...defaultFilterState }),
}));
