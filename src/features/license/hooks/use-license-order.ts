import { useCallback } from "react";
import type { CatalogProduct, ServerPackage } from "../types";
import { useOrderForm } from "./use-order-form";
import { useOrderProrate } from "./use-order-prorate";
import { useOrderCoupon } from "./use-order-coupon";
import { useOrderPricing } from "./use-order-pricing";
import { useOrderAddons } from "./use-order-addons";
import { useOrderServer } from "./use-order-server";
import { useOrderSubmit } from "./use-order-submit";

// ─── Params ──────────────────────────────────────────────────────────────────

export interface UseLicenseOrderParams {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog?: CatalogProduct[];
    serverPackages?: ServerPackage[];
    productCode?: string;
    initialAddonId?: string;
    isOperable?: boolean;
}

// ─── Orchestrator Hook ───────────────────────────────────────────────────────

export function useLicenseOrder({
    open,
    onOpenChange,
    catalog = [],
    serverPackages = [],
    productCode,
    initialAddonId,
    isOperable = true,
}: UseLicenseOrderParams) {
    // 1. Form & watched state
    const formState = useOrderForm({
        open,
        catalog,
        serverPackages,
        productCode,
        initialAddonId,
        isOperable,
    });

    const {
        methods,
        targetProduct,
        addons,
        billingPeriod,
        selectedAddonIds,
        includeBase,
        includeServer,
        serverPackageId,
        selectedServer,
        safeServerPackages,
        customDays,
        isProrated,
        withRenewal,
    } = formState;

    const { setValue, handleSubmit } = methods;

    // 2. Prorate calculations & queries (auto-refetches on param change, no manual spam)
    const prorateState = useOrderProrate({
        addons,
        withRenewal,
        billingPeriod,
        open,
        isOperable,
    });

    const {
        addonCustomDays,
        setAddonCustomDays,
        resetAddonCustomDays,
        prorateData,
        prorateMap,
        isCalculating,
    } = prorateState;

    // 3. Preliminary pricing for coupon maximum check
    const preliminaryPricing = useOrderPricing({
        targetProduct,
        addons,
        selectedAddonIds,
        billingPeriod,
        includeBase,
        includeServer,
        selectedServer,
        isProrated,
        prorateMap,
        couponResult: null,
        addonCustomDays,
    });

    // 4. Coupon management
    const couponState = useOrderCoupon({
        open,
        billingPeriod,
        includeBase,
        selectedAddonIds,
        includeServer,
        serverPackageId,
        grossTotal: preliminaryPricing.grossTotal,
        setValue,
    });

    const {
        couponInput,
        setCouponInput,
        couponResult,
        couponError,
        isCheckingCoupon,
        couponDiscount,
        handleApplyCoupon,
        handleRemoveCoupon,
        clearCoupon,
    } = couponState;

    // 5. Final pricing with coupon applied
    const pricingState = useOrderPricing({
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
        addonCustomDays,
    });

    // 6. Server actions
    const { selectServerPackage } = useOrderServer({
        setValue,
        safeServerPackages,
        clearCoupon,
    });

    // 7. Addon selection actions
    const {
        toggleAddon,
        selectAllAddons,
        clearAllAddons,
        enableRenewalForAddon,
    } = useOrderAddons({
        addons,
        selectedAddonIds,
        setValue,
        withRenewal,
        includeBase,
        prorateMap,
        clearCoupon,
        resetAddonCustomDays,
    });

    // 8. Base product renewal handler (no duplicate refetches)
    const handleIncludeBaseChange = useCallback(
        (val: boolean) => {
            setValue("include_base_product", val, { shouldValidate: true });
            resetAddonCustomDays();
            clearCoupon();

            // Filter out add-ons that cannot be purchased without renewal
            if (!val && prorateMap.size > 0) {
                const currentSelected = selectedAddonIds;
                const validSelected = currentSelected.filter((id) => {
                    const matched = addons.find(
                        (a) => a.id === id || a.code === id
                    );
                    const item = matched
                        ? prorateMap.get(matched.id) ??
                          prorateMap.get(matched.code)
                        : undefined;
                    return item?.is_eligible ?? true;
                });
                if (validSelected.length !== currentSelected.length) {
                    setValue("addon_ids", validSelected, {
                        shouldValidate: true,
                    });
                }
            }
        },
        [
            setValue,
            resetAddonCustomDays,
            clearCoupon,
            prorateMap,
            selectedAddonIds,
            addons,
        ]
    );

    // 9. Billing period change handler
    const handleBillingPeriodChange = useCallback(
        (val: string) => {
            const period = val as "monthly" | "annual";
            setValue("billing_period", period, { shouldValidate: true });
            resetAddonCustomDays();
            clearCoupon();
        },
        [setValue, resetAddonCustomDays, clearCoupon]
    );

    // 10. Form submission handler
    const { onSubmit, isPending } = useOrderSubmit({
        handleSubmit,
        addons,
        prorateMap,
        addonCustomDays,
        isProrated,
        withRenewal,
        couponResult,
        onOpenChange,
    });

    const setCustomDays = useCallback(
        (days: number | null) => {
            setValue("custom_days", days, { shouldValidate: true });
        },
        [setValue]
    );

    const maxDaysAvailable =
        prorateData?.max_days_available ?? prorateData?.days_remaining ?? 30;
    const sliderTicks = prorateData?.slider_ticks ?? [];

    return {
        methods,
        targetProduct,
        addons,
        billingPeriod,
        selectedAddonIds,
        includeBase,
        includeServer,
        serverPackageId,
        selectedServer,
        serverPackages: safeServerPackages,
        serverMonthlyPrice: pricingState.serverMonthlyPrice,
        serverAnnualPrice: pricingState.serverAnnualPrice,
        currentServerPrice: pricingState.currentServerPrice,
        selectServerPackage,
        grossTotal: pricingState.grossTotal,
        displayTotal: pricingState.displayTotal,
        totalMonthly: pricingState.totalMonthly,
        totalAnnual: pricingState.totalAnnual,
        addonsMonthly: pricingState.addonsMonthly,
        addonsAnnual: pricingState.addonsAnnual,
        displayAddonsTotal: pricingState.displayAddonsTotal,
        baseMonthlyPrice: pricingState.baseMonthlyPrice,
        baseAnnualPrice: pricingState.baseAnnualPrice,
        currentBasePrice: pricingState.currentBasePrice,
        toggleAddon,
        selectAllAddons,
        clearAllAddons,
        enableRenewalForAddon,
        couponInput,
        setCouponInput,
        couponResult,
        couponError,
        isCheckingCoupon,
        couponDiscount,
        handleApplyCoupon,
        handleRemoveCoupon,
        isPending,
        onSubmit,
        isProrated,
        withRenewal,
        handleIncludeBaseChange,
        handleBillingPeriodChange,
        customDays,
        setCustomDays,
        addonCustomDays,
        setAddonCustomDays,
        maxDaysAvailable,
        sliderTicks,
        prorateMap,
        prorateData,
        isProrateLoading: isCalculating,
        isCalculating,
        refetchProrate: () => {},
    };
}
