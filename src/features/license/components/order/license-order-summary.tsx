"use client";

import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { BillingPeriod } from "../../types";

interface LicenseOrderSummaryProps {
    selectedCount: number;
    billingPeriod: BillingPeriod;
    includeBase: boolean;
    totalMonthly: number;
    totalAnnual: number;
    displayTotal: number;
}

export function LicenseOrderSummary({
    selectedCount,
    billingPeriod,
    includeBase,
    totalMonthly,
    totalAnnual,
    displayTotal,
}: LicenseOrderSummaryProps) {
    const isAnnual = billingPeriod === "annual";
    const normalAnnualTotal = totalMonthly * 12;
    const hasDiscount = isAnnual && selectedCount > 0 && normalAnnualTotal > totalAnnual;
    const discountAmount = hasDiscount ? normalAnnualTotal - totalAnnual : 0;
    const discountPercent = hasDiscount
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
                ) : (
                    <div className="flex justify-between text-slate-600">
                        <span>Subtotal Add-on</span>
                        <span className="font-bold text-slate-900">
                            {formatRupiah(displayTotal)}
                        </span>
                    </div>
                )}

                {includeBase && (
                    <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-200/50">
                        <span>Lisensi Utama POS</span>
                        <span>Termasuk</span>
                    </div>
                )}
            </div>

            <div className="pt-2.5 border-t border-slate-200/80 flex items-baseline justify-between">
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    Total Tagihan
                </span>
                <div className="text-right">
                    <span className="text-lg font-black text-emerald-700 block leading-tight">
                        {formatRupiah(displayTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                        /{isAnnual ? "tahun" : "bulan"}
                    </span>
                </div>
            </div>
        </div>
    );
}
