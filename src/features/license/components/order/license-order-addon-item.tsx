"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import type { CatalogAddon, BillingPeriod } from "../../types";

interface LicenseOrderAddonItemProps {
    addon: CatalogAddon;
    isSelected: boolean;
    billingPeriod: BillingPeriod;
    onToggle: () => void;
}

export function LicenseOrderAddonItem({
    addon,
    isSelected,
    billingPeriod,
    onToggle,
}: LicenseOrderAddonItemProps) {
    const normalAnnualPrice = addon.harga_bulanan * 12;
    const isAnnual = billingPeriod === "annual";
    const hasAnnualDiscount = isAnnual && normalAnnualPrice > addon.harga_tahunan;

    const discountPercent = hasAnnualDiscount
        ? Math.round(((normalAnnualPrice - addon.harga_tahunan) / normalAnnualPrice) * 100)
        : 0;

    return (
        <div
            onClick={onToggle}
            className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none",
                isSelected
                    ? "bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300/60 shadow-2xs"
                    : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs",
            )}
        >
            <Checkbox
                checked={isSelected}
                onCheckedChange={onToggle}
                className="mt-0.5 pointer-events-none"
            />
            <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                        <span className="text-xs font-bold text-slate-900">
                            {addon.nama}
                        </span>
                        <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60 font-semibold shrink-0">
                            {addon.code}
                        </span>
                    </div>

                    {/* Price with strikethrough logic when annual */}
                    <div className="flex flex-col items-end shrink-0 pl-1">
                        {hasAnnualDiscount ? (
                            <>
                                <div className="flex items-center gap-1 leading-none mb-0.5">
                                    <span className="text-[10px] text-slate-400 line-through font-medium">
                                        {formatRupiah(normalAnnualPrice)}
                                    </span>
                                    {discountPercent > 0 && (
                                        <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded border border-emerald-200/70 leading-none">
                                            Hemat {discountPercent}%
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-baseline gap-0.5">
                                    <span className="text-xs font-black text-emerald-700">
                                        {formatRupiah(addon.harga_tahunan)}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        /tahun
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-xs font-extrabold text-slate-800">
                                    {formatRupiah(isAnnual ? addon.harga_tahunan : addon.harga_bulanan)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                    /{isAnnual ? "tahun" : "bulan"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-1 leading-snug">
                    {addon.description}
                </p>
            </div>
        </div>
    );
}
