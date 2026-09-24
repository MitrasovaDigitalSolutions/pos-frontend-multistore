import { create } from "zustand";
import type { LicenseStatus } from "@/features/license/types";

interface LicenseStoreState {
    licenseStatus: LicenseStatus | null;
    isLoading: boolean;
    lastSyncedAt: string | null;

    // Actions
    setLicenseStatus: (status: LicenseStatus | null) => void;
    setLoading: (isLoading: boolean) => void;
    clearLicense: () => void;

    // Helper Selectors
    hasAddon: (addonCode: string) => boolean;
    hasAllAddons: (addonCodes: string[]) => boolean;
    hasAnyAddon: (addonCodes: string[]) => boolean;
    canOperate: () => boolean;
    isOperable: () => boolean;
    getActiveAddons: () => string[];
}

export const useLicenseStore = create<LicenseStoreState>((set, get) => ({
    licenseStatus: null,
    isLoading: false,
    lastSyncedAt: null,

    setLicenseStatus: (status) =>
        set({
            licenseStatus: status,
            lastSyncedAt: status?.last_synced_at ?? new Date().toISOString(),
        }),

    setLoading: (isLoading) => set({ isLoading }),

    clearLicense: () => set({ licenseStatus: null, lastSyncedAt: null }),

    hasAddon: (addonCode: string) => {
        const status = get().licenseStatus;
        if (!status) return false;

        // If license allows operation and status is active or grace period
        const isOperable = Boolean(
            status.can_operate && (status.status === "active" || status.is_grace_period)
        );
        if (!isOperable) return false;

        const addons = Array.isArray(status.active_addons) ? status.active_addons : [];
        return addons.includes(addonCode);
    },

    hasAllAddons: (addonCodes: string[]) => {
        const { hasAddon } = get();
        return addonCodes.every((code) => hasAddon(code));
    },

    hasAnyAddon: (addonCodes: string[]) => {
        const { hasAddon } = get();
        return addonCodes.some((code) => hasAddon(code));
    },

    canOperate: () => {
        const status = get().licenseStatus;
        return Boolean(
            status?.can_operate && (status?.status === "active" || status?.is_grace_period)
        );
    },

    isOperable: () => {
        const status = get().licenseStatus;
        return Boolean(
            status?.can_operate && (status?.status === "active" || status?.is_grace_period)
        );
    },

    getActiveAddons: () => {
        const status = get().licenseStatus;
        return Array.isArray(status?.active_addons) ? status.active_addons : [];
    },
}));

/**
 * Convenient selector hooks for components
 */
export function useHasAddon(addonCode: string): boolean {
    return useLicenseStore((state) => state.hasAddon(addonCode));
}

export function useIsLicenseOperable(): boolean {
    return useLicenseStore((state) => state.isOperable());
}
