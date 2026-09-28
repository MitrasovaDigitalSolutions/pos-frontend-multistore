import { useMemo } from "react";
import type { CatalogAddon, CatalogProduct, CouponCheckResult, ProrateItem, ServerPackage } from "../types";
import { calculateAddonProratePrice } from "../utils/license-pricing";

// ─── Params ──────────────────────────────────────────────────────────────────

interface UseOrderPricingParams {
    targetProduct?: CatalogProduct;
    addons: CatalogAddon[];
    selectedAddonIds: string[];
    billingPeriod: "monthly" | "annual";
    includeBase: boolean;
    includeServer: boolean;
    selectedServer: ServerPackage | null;
    isProrated: boolean;
    prorateMap: Map<string, ProrateItem>;
    couponResult: CouponCheckResult | null;
    addonCustomDays?: Record<string, number>;
}

// ─── Return Type ─────────────────────────────────────────────────────────────

export interface OrderPricingState {
    baseMonthlyPrice: number;
    baseAnnualPrice: number;
    currentBasePrice: number;
    addonsMonthly: number;
    addonsAnnual: number;
    displayAddonsTotal: number;
    serverMonthlyPrice: number;
    serverAnnualPrice: number;
    currentServerPrice: number;
    totalMonthly: number;
    totalAnnual: number;
    grossTotal: number;
    couponDiscount: number;
    displayTotal: number;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useOrderPricing({
    targetProduct,
    addons,
    selectedAddonIds,
    billingPeriod,
    includeBase,
    includeServer,
    selectedServer,
    isProrated,
    prorateMap,
    couponResult,
    addonCustomDays = {},
}: UseOrderPricingParams): OrderPricingState {
    const baseMonthlyPrice = targetProduct?.harga_bulanan ?? 0;
    const baseAnnualPrice = targetProduct?.harga_tahunan ?? 0;
    const currentBasePrice =
        billingPeriod === "monthly" ? baseMonthlyPrice : baseAnnualPrice;

    // Subtotal for addons (monthly) - calculated dynamically in frontend from slider days
    const addonsMonthly = useMemo(() => {
        return addons
            .filter((a) => selectedAddonIds.includes(a.id))
            .reduce((sum, a) => {
                if (isProrated) {
                    const prorateItem =
                        prorateMap.get(a.id) ?? prorateMap.get(a.code);
                    if (prorateItem) {
                        const customDays =
                            addonCustomDays[a.id] ?? addonCustomDays[a.code];
                        return (
                            sum +
                            calculateAddonProratePrice(
                                prorateItem,
                                customDays,
                                a.harga_bulanan
                            )
                        );
                    }
                    return sum + a.harga_bulanan;
                }
                return sum + a.harga_bulanan;
            }, 0);
    }, [addons, selectedAddonIds, isProrated, prorateMap, addonCustomDays]);

    // Subtotal for addons (annual) - calculated dynamically in frontend from slider days
    const addonsAnnual = useMemo(() => {
        return addons
            .filter((a) => selectedAddonIds.includes(a.id))
            .reduce((sum, a) => {
                if (isProrated) {
                    const prorateItem =
                        prorateMap.get(a.id) ?? prorateMap.get(a.code);
                    if (prorateItem) {
                        const customDays =
                            addonCustomDays[a.id] ?? addonCustomDays[a.code];
                        return (
                            sum +
                            calculateAddonProratePrice(
                                prorateItem,
                                customDays,
                                a.harga_tahunan
                            )
                        );
                    }
                    return sum + a.harga_tahunan;
                }
                return sum + a.harga_tahunan;
            }, 0);
    }, [addons, selectedAddonIds, isProrated, prorateMap, addonCustomDays]);

    const displayAddonsTotal =
        billingPeriod === "monthly" ? addonsMonthly : addonsAnnual;

    // Server package pricing (only added if include_server is active and has a cost)
    const isCloudServer = Boolean(
        selectedServer &&
            selectedServer.code !== "on_premise" &&
            selectedServer.harga_bulanan > 0
    );
    const serverMonthlyPrice =
        isCloudServer && includeServer ? (selectedServer?.harga_bulanan ?? 0) : 0;
    const serverAnnualPrice =
        isCloudServer && includeServer ? (selectedServer?.harga_tahunan ?? 0) : 0;
    const currentServerPrice =
        billingPeriod === "annual" ? serverAnnualPrice : serverMonthlyPrice;

    // Grand totals
    const totalMonthly = useMemo(() => {
        return (
            addonsMonthly +
            (includeBase ? baseMonthlyPrice : 0) +
            serverMonthlyPrice
        );
    }, [addonsMonthly, includeBase, baseMonthlyPrice, serverMonthlyPrice]);

    const totalAnnual = useMemo(() => {
        return (
            addonsAnnual +
            (includeBase ? baseAnnualPrice : 0) +
            serverAnnualPrice
        );
    }, [addonsAnnual, includeBase, baseAnnualPrice, serverAnnualPrice]);

    const grossTotal = useMemo(() => {
        return billingPeriod === "monthly" ? totalMonthly : totalAnnual;
    }, [billingPeriod, totalMonthly, totalAnnual]);

    const couponDiscount = useMemo(() => {
        return couponResult
            ? Math.min(grossTotal, Number(couponResult.discount_amount) || 0)
            : 0;
    }, [couponResult, grossTotal]);

    const displayTotal = useMemo(() => {
        return Math.max(0, grossTotal - couponDiscount);
    }, [grossTotal, couponDiscount]);

    return {
        baseMonthlyPrice,
        baseAnnualPrice,
        currentBasePrice,
        addonsMonthly,
        addonsAnnual,
        displayAddonsTotal,
        serverMonthlyPrice,
        serverAnnualPrice,
        currentServerPrice,
        totalMonthly,
        totalAnnual,
        grossTotal,
        couponDiscount,
        displayTotal,
    };
}
