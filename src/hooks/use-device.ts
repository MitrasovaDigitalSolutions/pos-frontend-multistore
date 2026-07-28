"use client";

import { useDeviceStore } from "@/stores/device-store";

/**
 * Custom Hook to easily access device responsive state across any component.
 *
 * Returns:
 * - isMobile: boolean (< 768px)
 * - isTablet: boolean (>= 768px && < 1024px)
 * - isDesktop: boolean (>= 1024px)
 * - deviceType: "mobile" | "tablet" | "desktop"
 * - screenWidth: number
 * - screenHeight: number
 * - isInitialized: boolean
 */
export function useDevice() {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const isTablet = useDeviceStore((state) => state.isTablet);
    const isDesktop = useDeviceStore((state) => state.isDesktop);
    const deviceType = useDeviceStore((state) => state.deviceType);
    const screenWidth = useDeviceStore((state) => state.screenWidth);
    const screenHeight = useDeviceStore((state) => state.screenHeight);
    const isInitialized = useDeviceStore((state) => state.isInitialized);

    return {
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        screenWidth,
        screenHeight,
        isInitialized,
    };
}

/**
 * Helper hook to check if current viewport is mobile (< 768px)
 */
export function useDeviceResponsive() {
    const isMobile = useDeviceStore((state) => state.isMobile);
    const isTablet = useDeviceStore((state) => state.isTablet);
    const isDesktop = useDeviceStore((state) => state.isDesktop);

    return { isMobile, isTablet, isDesktop };
}
