"use client";

import { useLicenseStore } from "@/stores/license-store";
import type { BusinessPresetType } from "@/features/license/types";

/**
 * Hook to access the current business preset type from the license.
 *
 * The preset is determined by the license issued from Portal Admin Mitrasova,
 * NOT user-configurable. It controls which POS modules and features are visible.
 *
 * @example
 * ```tsx
 * const { isConfectionery, isPharmacy, hasPresetFeature } = useAppPreset();
 *
 * // Conditionally render based on preset
 * if (isConfectionery) { ... }
 *
 * // Or check multiple presets
 * if (hasPresetFeature(["retail", "confectionery"])) { ... }
 * ```
 */
export function useAppPreset() {
    const businessType = useLicenseStore((s) => s.businessType);
    const isRetail = businessType === "retail";
    const isConfectionery = businessType === "confectionery";
    const isPharmacy = businessType === "pharmacy";

    return {
        /** Current active business preset type */
        businessType,
        /** True if preset is `retail` (default — minimarket, toko kelontong, fashion) */
        isRetail,
        /** True if preset is `confectionery` (konveksi, sablon, manufaktur garmen) */
        isConfectionery,
        /** True if preset is `pharmacy` (apotek, toko obat, alkes) */
        isPharmacy,
        /**
         * Check if current preset is one of the given presets.
         * Useful for features shared between specific presets but not all.
         */
        hasPresetFeature: (presets: BusinessPresetType[]) =>
            presets.includes(businessType),
    };
}
