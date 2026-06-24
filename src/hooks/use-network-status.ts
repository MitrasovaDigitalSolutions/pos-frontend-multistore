"use client";

import { useState, useEffect } from "react";

export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState<boolean>(true);

    useEffect(() => {
        // Safe check for browser environment
        if (typeof window === "undefined") return;

        setIsOnline(window.navigator.onLine);

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return isOnline;
}
