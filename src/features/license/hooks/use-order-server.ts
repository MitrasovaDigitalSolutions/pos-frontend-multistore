import { useCallback } from "react";
import type { UseFormSetValue } from "react-hook-form";
import type { ServerPackage } from "../types";
import type { OrderLicenseInput } from "../schemas/license-schema";

// ─── Params ──────────────────────────────────────────────────────────────────

interface UseOrderServerParams {
    setValue: UseFormSetValue<OrderLicenseInput>;
    safeServerPackages: ServerPackage[];
    clearCoupon: () => void;
}

// ─── Return Type ─────────────────────────────────────────────────────────────

export interface OrderServerActions {
    selectServerPackage: (packageId: string | null) => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOrderServer({
    setValue,
    safeServerPackages,
    clearCoupon,
}: UseOrderServerParams): OrderServerActions {
    const selectServerPackage = useCallback(
        (packageId: string | null) => {
            if (!packageId) {
                setValue("server_package_id", null, { shouldValidate: true });
                setValue("include_server", false, { shouldValidate: true });
                clearCoupon();
                return;
            }
            const pkg = safeServerPackages.find((s) => s.id === packageId);
            if (!pkg || pkg.code === "on_premise" || pkg.harga_bulanan === 0) {
                setValue("server_package_id", packageId, {
                    shouldValidate: true,
                });
                setValue("include_server", false, { shouldValidate: true });
            } else {
                setValue("server_package_id", packageId, {
                    shouldValidate: true,
                });
                setValue("include_server", true, { shouldValidate: true });
            }
            clearCoupon();
        },
        [setValue, safeServerPackages, clearCoupon]
    );

    return { selectServerPackage };
}
