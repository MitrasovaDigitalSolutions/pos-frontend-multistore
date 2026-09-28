"use client";

import { memo } from "react";
import { Scrollable } from "@/components/ui/scrollable";
import { AppButton } from "@/components/shared/app-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconReceipt, IconTag } from "@tabler/icons-react";
import type { CouponCheckResult } from "../../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { LicenseOrderSummary } from "./license-order-summary";

interface LicenseOrderCheckoutColumnProps {
    couponInput: string;
    onCouponInputChange: (val: string) => void;
    couponResult: CouponCheckResult | null;
    couponError: string | null;
    isCheckingCoupon: boolean;
    couponDiscount: number;
    onApplyCoupon: () => void;
    onRemoveCoupon: () => void;
    selectedCount: number;
    billingPeriod: "monthly" | "annual";
    includeBase: boolean;
    totalMonthly: number;
    totalAnnual: number;
    displayTotal: number;
    basePrice: number;
    addonsTotal: number;
    serverPrice: number;
    includeServer: boolean;
    isProrated: boolean;
    proratedDays: number | null;
    withRenewal: boolean;
    isCalculating: boolean;
    isPending: boolean;
    isSubmitDisabled: boolean;
    onCancel: () => void;
}

export const LicenseOrderCheckoutColumn = memo(
    function LicenseOrderCheckoutColumn({
        couponInput,
        onCouponInputChange,
        couponResult,
        couponError,
        isCheckingCoupon,
        couponDiscount,
        onApplyCoupon,
        onRemoveCoupon,
        selectedCount,
        billingPeriod,
        includeBase,
        totalMonthly,
        totalAnnual,
        displayTotal,
        basePrice,
        addonsTotal,
        serverPrice,
        includeServer,
        isProrated,
        proratedDays,
        withRenewal,
        isCalculating,
        isPending,
        isSubmitDisabled,
        onCancel,
    }: LicenseOrderCheckoutColumnProps) {
        return (
            <div className="lg:col-span-4 md:col-span-2 lg:col-span-4 flex flex-col min-h-0 max-h-[420px] md:max-h-[460px] lg:h-[460px] overflow-hidden">
                <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 shrink-0">
                    <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black flex items-center justify-center border border-emerald-200">
                        3
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                        Total & Pembayaran
                    </span>
                </div>

                {/* Scrollable Container for Summary & Promo Coupon */}
                <Scrollable
                    className="flex-1 min-h-0 max-h-[340px] md:max-h-[390px] pr-1.5 overflow-hidden"
                    scrollbarClassName="z-20"
                >
                    <div className="space-y-2.5 pt-2 pb-2">
                        {/* Promo Coupon Card */}
                        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                    <IconTag
                                        size={13}
                                        className="text-emerald-600"
                                    />
                                    <span>Kupon Promo / Diskon</span>
                                </span>
                                {couponResult && (
                                    <Badge
                                        variant="outline"
                                        className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border-emerald-300"
                                    >
                                        Kupon Aktif
                                    </Badge>
                                )}
                            </div>

                            {couponResult ? (
                                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-xs text-emerald-900 block font-mono">
                                                {couponResult.code}
                                            </span>
                                            {couponResult.discount_value >
                                                0 && (
                                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-1 py-0.2 rounded font-mono">
                                                    {couponResult.discount_type ===
                                                    "percentage"
                                                        ? `${couponResult.discount_value}%`
                                                        : "Potongan"}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-emerald-700 font-medium block truncate">
                                            {couponResult.name
                                                ? `${couponResult.name} • `
                                                : ""}
                                            Hemat{" "}
                                            {couponResult.formatted_discount ||
                                                formatRupiah(couponDiscount)}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onRemoveCoupon}
                                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer shrink-0"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) =>
                                                onCouponInputChange(
                                                    e.target.value.toUpperCase()
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    onApplyCoupon();
                                                }
                                            }}
                                            placeholder="Kode promo..."
                                            className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-mono uppercase bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            disabled={
                                                isCheckingCoupon ||
                                                !couponInput.trim()
                                            }
                                            onClick={onApplyCoupon}
                                            className="h-8 px-3 text-xs font-bold rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50 cursor-pointer shrink-0"
                                        >
                                            {isCheckingCoupon
                                                ? "Cek..."
                                                : "Terapkan"}
                                        </Button>
                                    </div>
                                    {couponError && (
                                        <span className="text-[10px] text-rose-600 font-medium block">
                                            {couponError}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order Summary & Final Breakdown - ALWAYS clearly visible */}
                        <LicenseOrderSummary
                            selectedCount={selectedCount}
                            billingPeriod={billingPeriod}
                            includeBase={includeBase}
                            totalMonthly={totalMonthly}
                            totalAnnual={totalAnnual}
                            displayTotal={displayTotal}
                            basePrice={basePrice}
                            addonsTotal={addonsTotal}
                            couponDiscount={couponDiscount}
                            couponCode={couponResult?.code}
                            serverPrice={serverPrice}
                            includeServer={includeServer}
                            isProrated={isProrated}
                            proratedDays={proratedDays}
                            withRenewal={withRenewal}
                            isCalculating={isCalculating}
                        />
                    </div>
                </Scrollable>

                {/* Pinned Bottom Action Buttons for Column 3 */}
                <div className="pt-2.5 border-t border-slate-100 bg-white shrink-0 mt-auto flex items-center gap-2">
                    <AppButton
                        type="button"
                        variant="outline"
                        className="flex-1 text-xs font-bold h-9 rounded-xl cursor-pointer"
                        onClick={onCancel}
                    >
                        Batal
                    </AppButton>
                    <AppButton
                        type="submit"
                        isLoading={isPending}
                        disabled={isSubmitDisabled}
                        className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-9 rounded-xl shadow-xs cursor-pointer gap-1.5"
                    >
                        <IconReceipt size={15} />
                        <span>Buat Pesanan & Bayar</span>
                    </AppButton>
                </div>
            </div>
        );
    }
);
