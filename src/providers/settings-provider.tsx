"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useSession } from "next-auth/react";
import { useActiveStoreStore } from "@/stores/active-store-store";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);
    const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated" && activeStoreUid) {
            fetchSettings();
        } else if (status === "unauthenticated") {
            useActiveStoreStore.getState().setActiveStore(null);
        }
    }, [status, activeStoreUid, fetchSettings]);

    return <>{children}</>;
}
