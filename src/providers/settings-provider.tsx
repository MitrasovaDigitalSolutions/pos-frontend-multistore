"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { useSession } from "next-auth/react";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            fetchSettings();
        }
    }, [status, fetchSettings]);

    return <>{children}</>;
}
