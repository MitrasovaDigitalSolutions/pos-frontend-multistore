import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BusinessPresetType, LicenseStatus } from "@/features/license/types";

interface LicenseStoreState {
    licenseStatus: LicenseStatus | null;
    businessType: BusinessPresetType;
    isLoading: boolean;
    lastSyncedAt: string | null;

    // Actions
    setLicenseStatus: (status: LicenseStatus | null) => void;
    setLoading: (isLoading: boolean) => void;
    clearLicense: () => void;

    // Helper Selectors
    getBusinessType: () => BusinessPresetType;
    isRetail: () => boolean;
    isConfectionery: () => boolean;
    isPharmacy: () => boolean;
    hasAddon: (addonCode: string) => boolean;
    hasAllAddons: (addonCodes: string[]) => boolean;
    hasAnyAddon: (addonCodes: string[]) => boolean;
    canOperate: () => boolean;
    isOperable: () => boolean;
    getActiveAddons: () => string[];
}

export const useLicenseStore = create<LicenseStoreState>()(
    persist(
        (set, get) => ({
            licenseStatus: null,
            businessType: "retail",
            isLoading: false,
            lastSyncedAt: null,

            setLicenseStatus: (status) => {
                const normalizedStatus = status
                    ? {
                          ...status,
                          active_addons: Array.isArray(status.active_addons)
                              ? status.active_addons.map((a) => a.toLowerCase())
                              : [],
                      }
                    : null;

                const activeType = status?.business_type || get().businessType || "retail";

                set({
                    licenseStatus: normalizedStatus,
                    businessType: activeType,
                    lastSyncedAt: status?.last_synced_at ?? new Date().toISOString(),
                });
            },

            setLoading: (isLoading) => set({ isLoading }),

            clearLicense: () => set({ licenseStatus: null, lastSyncedAt: null, businessType: "retail" }),

            getBusinessType: () => get().businessType || "retail",
            isRetail: () => (get().businessType || "retail") === "retail",
            isConfectionery: () => get().businessType === "confectionery",
            isPharmacy: () => get().businessType === "pharmacy",

            hasAddon: (addonCode: string) => {
                const status = get().licenseStatus;
                if (!status) return false;

                // If license allows operation and status is active or grace period
                const isOperable = Boolean(
                    status.can_operate && (status.status === "active" || status.is_grace_period)
                );
                if (!isOperable) return false;

                const addons = Array.isArray(status.active_addons)
                    ? status.active_addons.map((a) => a.toLowerCase())
                    : [];
                return addons.includes(addonCode.toLowerCase());
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
                return Array.isArray(status?.active_addons)
                    ? status.active_addons.map((a) => a.toLowerCase())
                    : [];
            },
        }),
        {
            name: "app_license_storage",
            partialize: (state) => ({
                businessType: state.businessType,
                licenseStatus: state.licenseStatus,
            }),
        }
    )
);

/**
 * Convenient selector hooks for components
 */
export function useHasAddon(addonCode: string): boolean {
    return useLicenseStore((state) => state.hasAddon(addonCode));
}

export function useIsLicenseOperable(): boolean {
    return useLicenseStore((state) => state.isOperable());
}
