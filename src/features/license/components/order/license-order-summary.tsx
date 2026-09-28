"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { BillingPeriod } from "../../types";

interface LicenseOrderSummaryProps {
    selectedCount: number;
    billingPeriod: BillingPeriod;
    includeBase: boolean;
    totalMonthly: number;
    totalAnnual: number;
    displayTotal: number;
    basePrice?: number;
    addonsTotal?: number;
    couponDiscount?: number;
    couponCode?: string;
    serverPrice?: number;
    includeServer?: boolean;
    isProrated?: boolean;
    proratedDays?: number | null;
    withRenewal?: boolean;
    isCalculating?: boolean;
}

function LicenseOrderSummaryComponent({
    selectedCount,
    billingPeriod,
    includeBase,
    totalMonthly,
    totalAnnual,
    displayTotal,
    basePrice = 0,
    addonsTotal = 0,
    couponDiscount = 0,
    couponCode,
    serverPrice = 0,
    includeServer = false,
    isProrated = false,
    proratedDays,
    withRenewal = false,
    isCalculating = false,
}: LicenseOrderSummaryProps) {
    const isAnnual = billingPeriod === "annual";
    const normalAnnualTotal = isProrated ? 0 : totalMonthly * 12;
    const hasDiscount = isAnnual && !isProrated && totalAnnual > 0 && normalAnnualTotal > totalAnnual;
    const discountAmount = hasDiscount ? normalAnnualTotal - totalAnnual : 0;
    const discountPercent = hasDiscount && normalAnnualTotal > 0
        ? Math.round((discountAmount / normalAnnualTotal) * 100)
        : 0;

    return (
        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Ringkasan Biaya
                </span>
                <Badge
                    variant="secondary"
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200/60"
                >
                    {selectedCount} Add-on Terpilih
                </Badge>
            </div>

            <div className="space-y-2 text-xs">
                {isAnnual && hasDiscount ? (
                    <>
                        <div className="flex justify-between text-slate-500">
                            <span>Harga Normal (12 bln)</span>
                            <span className="font-semibold text-slate-700 line-through">
                                {formatRupiah(normalAnnualTotal)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-emerald-700">
                            <div className="flex items-center gap-1.5">
                                <span>Potongan Hemat Tahunan</span>
                                {discountPercent > 0 && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 leading-none">
                                        Hemat {discountPercent}%
                                    </span>
                                )}
                            </div>
                            <span className="font-bold">
                                -{formatRupiah(discountAmount)}
                            </span>
                        </div>
                    </>
                ) : null}

                {selectedCount > 0 && (
                    <div className="flex justify-between items-center text-slate-600">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span>Subtotal Add-on</span>
                            {isProrated && (
                                <Badge
                                    variant="outline"
                                    className="text-[9px] font-bold px-1.5 py-0 rounded bg-emerald-50 text-emerald-700 border-emerald-200"
                                >
                                    Prorata {proratedDays ? `(${proratedDays} hr)` : ""}
                                </Badge>
                            )}
                            {isProrated && withRenewal && (
                                <Badge
                                    variant="outline"
                                    className="text-[9px] font-bold px-1.5 py-0 rounded bg-blue-50 text-blue-700 border-blue-200"
                                >
                                    +1 {isAnnual ? "Tahun" : "Bulan"}
                                </Badge>
                            )}
                        </div>
                        {isCalculating ? (
                            <Skeleton className="h-4 w-20 rounded bg-slate-200/90" />
                        ) : (
                            <span className="font-bold text-slate-900 font-mono">
                                {formatRupiah(addonsTotal)}
                            </span>
                        )}
                    </div>
                )}

                {includeBase && (
                    <div className="flex justify-between items-center text-emerald-700 font-semibold pt-1 border-t border-slate-200/50">
                        <span className="flex items-center gap-1.5">
                            <span>Lisensi Utama POS</span>
                            <span className="text-[10px] text-emerald-600/80 font-normal">
                                ({isAnnual ? "Tahunan" : "Bulanan"})
                            </span>
                        </span>
                        <span>
                            {basePrice > 0 ? formatRupiah(basePrice) : "Rp 0 (Termasuk)"}
                        </span>
                    </div>
                )}

                {includeServer && serverPrice > 0 && (
                    <div className="flex justify-between items-center text-slate-700 font-semibold pt-1 border-t border-slate-200/50">
                        <span>Sewa Server Cloud</span>
                        <span>{formatRupiah(serverPrice)}</span>
                    </div>
                )}

                {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-emerald-700 font-semibold pt-1 border-t border-emerald-100">
                        <div className="flex items-center gap-1.5">
                            <span>Diskon Kupon</span>
                            {couponCode && (
                                <Badge variant="outline" className="text-[9px] font-mono font-bold px-1.5 py-0 bg-emerald-100/90 text-emerald-800 border-emerald-300">
                                    {couponCode}
                                </Badge>
                            )}
                        </div>
                        <span className="font-bold text-emerald-700">
                            -{formatRupiah(couponDiscount)}
                        </span>
                    </div>
                )}
            </div>

            <div className="pt-2.5 border-t border-slate-200/80 flex items-baseline justify-between">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Total Tagihan
                </span>
                <div className="text-right">
                    {isCalculating ? (
                        <div className="flex flex-col items-end gap-1">
                            <Skeleton className="h-6 w-28 rounded bg-emerald-200/60" />
                            <Skeleton className="h-3 w-36 rounded bg-slate-200/80" />
                        </div>
                    ) : (
                        <>
                            <span className="text-lg font-black text-emerald-700 block leading-tight font-mono">
                                {formatRupiah(displayTotal)}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {isProrated
                                    ? withRenewal
                                        ? `Prorata ${proratedDays ? `${proratedDays} hr` : ""} + 1 ${isAnnual ? "tahun" : "bulan"}`
                                        : `Prorata ${proratedDays ? `${proratedDays} hari` : "sisa masa aktif"}`
                                    : `/${isAnnual ? "tahun" : "bulan"}`}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export const LicenseOrderSummary = React.memo(LicenseOrderSummaryComponent);
