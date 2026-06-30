"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/stores/settings-store";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const fetchSettings = useSettingsStore((state) => state.fetchSettings);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return <>{children}</>;
}
