import { create } from "zustand";

export type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceState {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    screenWidth: number;
    screenHeight: number;
    deviceType: DeviceType;
    isInitialized: boolean;
    setDimensions: (width: number, height: number) => void;
}

export const MOBILE_BREAKPOINT = 768;
export const TABLET_BREAKPOINT = 1024;

export const useDeviceStore = create<DeviceState>((set) => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 0,
    screenHeight: 0,
    deviceType: "desktop",
    isInitialized: false,
    setDimensions: (width: number, height: number) => {
        const isMobile = width < MOBILE_BREAKPOINT;
        const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
        const isDesktop = width >= TABLET_BREAKPOINT;
        const deviceType: DeviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

        set({
            screenWidth: width,
            screenHeight: height,
            isMobile,
            isTablet,
            isDesktop,
            deviceType,
            isInitialized: true,
        });
    },
}));
