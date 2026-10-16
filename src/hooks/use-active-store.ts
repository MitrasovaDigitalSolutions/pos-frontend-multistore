"use client";

import { useSession } from "next-auth/react";
import { useActiveStoreStore } from "@/stores/active-store-store";
import type { Store } from "@/types/auth";

export interface ActiveStoreContext {
    activeStore: Store | null;
    activeStoreUid: string | null;
    userStores: Store[];
    isCentralStore: boolean;
    setActiveStoreUid: (uid: string | null) => void;
}

/**
 * Hook to retrieve the currently active store from session & activeStoreStore.
 * Centralizes resolution logic and prevents duplicate store-context boilerplate.
 */
export function useActiveStore(): ActiveStoreContext {
    const { data: session } = useSession();
    const activeStoreUid = useActiveStoreStore((s) => s.activeStoreUid);
    const setActiveStore = useActiveStoreStore((s) => s.setActiveStore);

    const userStores = session?.user?.stores || [];
    const activeStore = userStores.find((s) => s.uid === activeStoreUid) || userStores[0] || null;
    const isCentralStore = Boolean(activeStore?.is_central);

    return {
        activeStore,
        activeStoreUid: activeStore?.uid ?? activeStoreUid,
        userStores,
        isCentralStore,
        setActiveStoreUid: setActiveStore,
    };
}

/**
 * Returns whether the currently active store is the Central (HQ) store.
 */
export function useIsCentralStore(): boolean {
    const { isCentralStore } = useActiveStore();
    return isCentralStore;
}
