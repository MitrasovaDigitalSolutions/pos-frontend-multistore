"use client";

import { useEffect, type ReactNode } from "react";
import { useDeviceStore } from "@/stores/device-store";

interface DeviceProviderProps {
    children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
    const setDimensions = useDeviceStore((state) => state.setDimensions);

    useEffect(() => {
        const handleResize = () => {
            setDimensions(window.innerWidth, window.innerHeight);
        };

        // Initialize dimensions on mount
        handleResize();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [setDimensions]);

    return <>{children}</>;
}
