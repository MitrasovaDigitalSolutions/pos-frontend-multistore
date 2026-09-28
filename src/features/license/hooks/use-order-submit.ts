import type { FormEvent } from "react";
import type { UseFormHandleSubmit } from "react-hook-form";
import type { CatalogAddon, CouponCheckResult, ProrateItem } from "../types";
import type { OrderLicenseInput } from "../schemas/license-schema";
import { useLicenseOrderMutation } from "../api/license-api";

// ─── Params ──────────────────────────────────────────────────────────────────

interface UseOrderSubmitParams {
    handleSubmit: UseFormHandleSubmit<OrderLicenseInput>;
    addons: CatalogAddon[];
    prorateMap: Map<string, ProrateItem>;
    addonCustomDays: Record<string, number>;
    isProrated: boolean;
    withRenewal: boolean;
    couponResult: CouponCheckResult | null;
    onOpenChange: (open: boolean) => void;
}

// ─── Return Type ─────────────────────────────────────────────────────────────

export interface OrderSubmitState {
    onSubmit: (e?: FormEvent) => Promise<void>;
    isPending: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOrderSubmit({
    handleSubmit,
    addons,
    prorateMap,
    addonCustomDays,
    isProrated,
    withRenewal,
    couponResult,
    onOpenChange,
}: UseOrderSubmitParams): OrderSubmitState {
    const { mutate, isPending } = useLicenseOrderMutation();

    const onSubmit = handleSubmit((data: OrderLicenseInput) => {
        const orderAddons = (data.addon_ids || [])
            .filter((id) => {
                const matched = addons.find(
                    (a) => a.id === id || a.code === id
                );
                const item = matched
                    ? prorateMap.get(matched.id) ?? prorateMap.get(matched.code)
                    : undefined;
                return (
                    (item?.is_eligible ?? true) ||
                    withRenewal ||
                    data.include_base_product
                );
            })
            .map((id) => {
                const matched = addons.find(
                    (a) => a.id === id || a.code === id
                );
                const key = matched?.id ?? id;
                const codeKey = matched?.code ?? id;
                const days = addonCustomDays[key] ?? addonCustomDays[codeKey];
                return {
                    id: matched?.code || matched?.id || id,
                    ...(isProrated && days && days > 0
                        ? { custom_days: days }
                        : {}),
                };
            });

        mutate(
            {
                billing_period: data.billing_period,
                include_base_product: data.include_base_product,
                include_server: data.include_server,
                server_package_id: data.server_package_id ?? undefined,
                addon_ids: orderAddons.map((a) => a.id),
                addons: orderAddons,
                coupon_code:
                    couponResult?.code ?? data.coupon_code ?? undefined,
                prorate: isProrated,
            },
            {
                onSuccess: () => onOpenChange(false),
            }
        );
    });

    return {
        onSubmit,
        isPending,
    };
}
