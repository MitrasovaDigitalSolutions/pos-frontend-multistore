import { useCallback } from "react";
import { toast } from "sonner";
import type { UseFormSetValue } from "react-hook-form";
import type { CatalogAddon, ProrateItem } from "../types";
import type { OrderLicenseInput } from "../schemas/license-schema";

// ─── Params ──────────────────────────────────────────────────────────────────

interface UseOrderAddonsParams {
    addons: CatalogAddon[];
    selectedAddonIds: string[];
    setValue: UseFormSetValue<OrderLicenseInput>;
    withRenewal: boolean;
    includeBase: boolean;
    prorateMap: Map<string, ProrateItem>;
    clearCoupon: () => void;
    resetAddonCustomDays: () => void;
}

// ─── Return Type ─────────────────────────────────────────────────────────────

export interface OrderAddonsActions {
    toggleAddon: (id: string) => void;
    selectAllAddons: () => void;
    clearAllAddons: () => void;
    enableRenewalForAddon: (addonId: string) => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOrderAddons({
    addons,
    selectedAddonIds,
    setValue,
    withRenewal,
    includeBase,
    prorateMap,
    clearCoupon,
    resetAddonCustomDays,
}: UseOrderAddonsParams): OrderAddonsActions {
    const toggleAddon = useCallback(
        (id: string) => {
            const matched = addons.find((a) => a.id === id || a.code === id);
            const prorateItem = matched
                ? prorateMap.get(matched.id) ?? prorateMap.get(matched.code)
                : undefined;
            const isEligible = prorateItem?.is_eligible ?? true;
            const canSelect = isEligible || withRenewal;

            if (!canSelect) {
                toast.warning(
                    prorateItem?.ineligibility_reason ||
                        "Add-on ini sudah aktif sampai akhir lisensi utama. Perbarui Paket Utama POS untuk memperpanjang."
                );
                return;
            }

            const current = selectedAddonIds;
            const updated = current.includes(id)
                ? current.filter((x) => x !== id)
                : [...current, id];
            setValue("addon_ids", updated, { shouldValidate: true });
            clearCoupon();
        },
        [addons, prorateMap, withRenewal, selectedAddonIds, setValue, clearCoupon]
    );

    const selectAllAddons = useCallback(() => {
        const eligibleAddonIds = addons
            .filter((a) => {
                const prorateItem =
                    prorateMap.get(a.id) ?? prorateMap.get(a.code);
                const isEligible = prorateItem?.is_eligible ?? true;
                return isEligible || withRenewal || includeBase;
            })
            .map((a) => a.id);

        setValue("addon_ids", eligibleAddonIds, { shouldValidate: true });
        clearCoupon();
    }, [addons, prorateMap, withRenewal, includeBase, setValue, clearCoupon]);

    const clearAllAddons = useCallback(() => {
        setValue("addon_ids", [], { shouldValidate: true });
        clearCoupon();
    }, [setValue, clearCoupon]);

    const enableRenewalForAddon = useCallback(
        (addonId: string) => {
            setValue("include_base_product", true, { shouldValidate: true });
            resetAddonCustomDays();
            const current = selectedAddonIds;
            if (!current.includes(addonId)) {
                setValue("addon_ids", [...current, addonId], {
                    shouldValidate: true,
                });
            }
            clearCoupon();
            toast.info(
                "Pembaruan paket utama POS diaktifkan untuk memperpanjang durasi add-on."
            );
        },
        [setValue, resetAddonCustomDays, selectedAddonIds, clearCoupon]
    );

    return {
        toggleAddon,
        selectAllAddons,
        clearAllAddons,
        enableRenewalForAddon,
    };
}
