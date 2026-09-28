"use client";

import { useCallback } from "react";
import { FormProvider } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Badge } from "@/components/ui/badge";
import { IconShoppingCart } from "@tabler/icons-react";
import type { CatalogProduct, ServerPackage } from "../types";
import { useLicenseOrder } from "../hooks/use-license-order";
import { LicenseOrderConfigColumn } from "./order/license-order-config-column";
import { LicenseOrderAddonColumn } from "./order/license-order-addon-column";
import { LicenseOrderCheckoutColumn } from "./order/license-order-checkout-column";

interface LicenseOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    catalog?: CatalogProduct[];
    serverPackages?: ServerPackage[];
    productCode?: string;
    initialAddonId?: string;
    isOperable?: boolean;
}

export function LicenseOrderDialog({
    open,
    onOpenChange,
    catalog = [],
    serverPackages = [],
    productCode,
    initialAddonId,
    isOperable = true,
}: LicenseOrderDialogProps) {
    const {
        methods,
        targetProduct,
        addons,
        billingPeriod,
        selectedAddonIds,
        includeBase,
        includeServer,
        selectedServer,
        serverPackages: orderServerPackages,
        currentServerPrice,
        selectServerPackage,
        displayTotal,
        totalMonthly,
        totalAnnual,
        displayAddonsTotal,
        currentBasePrice,
        toggleAddon,
        selectAllAddons,
        clearAllAddons,
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
        addonCustomDays,
        setAddonCustomDays,
        prorateData,
        prorateMap,
        isCalculating,
    } = useLicenseOrder({
        open,
        onOpenChange,
        catalog,
        serverPackages,
        productCode,
        initialAddonId,
        isOperable,
    });

    const handleCancel = useCallback(() => {
        onOpenChange(false);
    }, [onOpenChange]);

    // Validation: Server is strictly required if base package extension is checked
    const isServerRequiredMissing = includeBase && !selectedServer;
    const isNothingSelected =
        selectedAddonIds.length === 0 &&
        !includeBase &&
        (!includeServer || currentServerPrice === 0);
    const isSubmitDisabled =
        isPending ||
        isServerRequiredMissing ||
        isNothingSelected ||
        isCalculating;

    if (!targetProduct) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            scrollable={false}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/70 shadow-2xs shrink-0">
                        <IconShoppingCart size={17} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-sm block leading-tight">
                                Pembaruan Langganan & Add-on POS
                            </span>
                            <Badge
                                variant="outline"
                                className="text-[10px] font-mono font-bold px-1.5 py-0 rounded bg-slate-100 text-slate-600 border-slate-200"
                            >
                                {targetProduct.nama}
                            </Badge>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium block">
                            Pilih paket utama, server, dan add-on yang ingin diaktifkan
                        </span>
                    </div>
                </div>
            }
            className="sm:max-w-5xl lg:max-w-6xl max-h-[92vh] overflow-hidden"
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={onSubmit}
                    className="mt-1 flex-1 min-h-0 flex flex-col overflow-hidden"
                >
                    {/* 3-Column Responsive Layout: Clear Separation of Configuration, Add-ons, and Checkout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch min-h-0 flex-1 overflow-hidden">
                        {/* COLUMN 1: Configuration (Billing Period, Base Package, Server) */}
                        <LicenseOrderConfigColumn
                            billingPeriod={billingPeriod}
                            onBillingPeriodChange={handleBillingPeriodChange}
                            includeBase={includeBase}
                            onIncludeBaseChange={handleIncludeBaseChange}
                            currentBasePrice={currentBasePrice}
                            serverPackages={orderServerPackages}
                            selectedServer={selectedServer}
                            currentServerPrice={currentServerPrice}
                            onSelectServerPackage={selectServerPackage}
                            isServerRequiredMissing={isServerRequiredMissing}
                        />

                        {/* COLUMN 2: Add-on Selection List */}
                        <LicenseOrderAddonColumn
                            addons={addons}
                            selectedAddonIds={selectedAddonIds}
                            billingPeriod={billingPeriod}
                            onToggleAddon={toggleAddon}
                            onSelectAll={selectAllAddons}
                            onClearAll={clearAllAddons}
                            prorateMap={prorateMap}
                            withRenewal={withRenewal}
                            isProrated={isProrated}
                            addonCustomDays={addonCustomDays}
                            onDurationChange={setAddonCustomDays}
                            isCalculating={isCalculating}
                        />

                        {/* COLUMN 3: Cost Summary & Docked Checkout */}
                        <LicenseOrderCheckoutColumn
                            couponInput={couponInput}
                            onCouponInputChange={setCouponInput}
                            couponResult={couponResult}
                            couponError={couponError}
                            isCheckingCoupon={isCheckingCoupon}
                            couponDiscount={couponDiscount}
                            onApplyCoupon={handleApplyCoupon}
                            onRemoveCoupon={handleRemoveCoupon}
                            selectedCount={selectedAddonIds.length}
                            billingPeriod={billingPeriod}
                            includeBase={includeBase}
                            totalMonthly={totalMonthly}
                            totalAnnual={totalAnnual}
                            displayTotal={displayTotal}
                            basePrice={currentBasePrice}
                            addonsTotal={displayAddonsTotal}
                            serverPrice={currentServerPrice}
                            includeServer={
                                includeServer && currentServerPrice > 0
                            }
                            isProrated={isProrated}
                            proratedDays={
                                customDays ||
                                prorateData?.selected_days ||
                                prorateData?.max_days_available ||
                                prorateData?.days_remaining ||
                                null
                            }
                            withRenewal={withRenewal}
                            isCalculating={isCalculating}
                            isPending={isPending}
                            isSubmitDisabled={isSubmitDisabled}
                            onCancel={handleCancel}
                        />
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
