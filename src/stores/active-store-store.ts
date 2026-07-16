import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveStoreState {
    activeStoreUid: string | null;
    setActiveStore: (uid: string | null) => void;
}

export const useActiveStoreStore = create<ActiveStoreState>()(
    persist(
        (set) => ({
            activeStoreUid: null,
            setActiveStore: (uid) => set({ activeStoreUid: uid }),
        }),
        { name: "active-store-storage" }
    )
);