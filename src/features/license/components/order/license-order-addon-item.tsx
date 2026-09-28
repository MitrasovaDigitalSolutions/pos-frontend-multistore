"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { CatalogAddon, BillingPeriod, ProrateItem } from "../../types";
import { calculateAddonProratePrice } from "../../utils/license-pricing";

interface LicenseOrderAddonItemProps {
    addon: CatalogAddon;
    isSelected: boolean;
    billingPeriod: BillingPeriod;
    onToggle: (id: string) => void;
    prorateItem?: ProrateItem;
    withRenewal?: boolean;
    isProrated?: boolean;
    currentDays?: number;
    onDurationChange?: (id: string, days: number) => void;
    isLoadingPrice?: boolean;
}

function LicenseOrderAddonItemComponent({
    addon,
    isSelected,
    billingPeriod,
    onToggle,
    prorateItem,
    withRenewal = false,
    isProrated = false,
    currentDays,
    onDurationChange,
    isLoadingPrice = false,
}: LicenseOrderAddonItemProps) {
    const normalAnnualPrice = addon.harga_bulanan * 12;
    const isAnnual = billingPeriod === "annual";
    const hasAnnualDiscount = isAnnual && normalAnnualPrice > addon.harga_tahunan;

    const discountPercent = hasAnnualDiscount
        ? Math.round(((normalAnnualPrice - addon.harga_tahunan) / normalAnnualPrice) * 100)
        : 0;

    // Eligibility Logic:
    // If backend states is_eligible === false, user cannot purchase unless renewing (withRenewal === true)
    const isEligible = prorateItem?.is_eligible ?? true;
    const isFullyActive = !isEligible && !withRenewal;

    // Discrete Stepped Ticks Logic:
    const rawTicks = prorateItem?.slider_ticks;
    const maxAvailable = prorateItem?.max_days_available;
    const safeTicks = React.useMemo(() => {
        const fallbackMax = maxAvailable ?? (rawTicks && rawTicks.length > 0 ? rawTicks[rawTicks.length - 1] : 30);
        const list = rawTicks && rawTicks.length > 0 ? rawTicks : (fallbackMax > 0 ? [fallbackMax] : [30]);
        return Array.from(new Set(list)).sort((a, b) => a - b);
    }, [rawTicks, maxAvailable]);

    const maxVal = safeTicks[safeTicks.length - 1] ?? 30;
    // Default duration is the maximum available
    const activeDays = currentDays ?? maxVal;

    // Dynamically calculate effective prorated price based on activeDays on client side
    const normalPrice = isAnnual ? addon.harga_tahunan : addon.harga_bulanan;
    const effectiveProratePrice = React.useMemo(() => {
        if (!prorateItem) return normalPrice;
        return calculateAddonProratePrice(prorateItem, activeDays, normalPrice);
    }, [prorateItem, activeDays, normalPrice]);

    // Pure renewal: when withRenewal is true and prorated_amount is 0 (already aligned with license expiry)
    const isRenewalOnly = Boolean(
        withRenewal &&
            prorateItem &&
            (prorateItem.prorated_amount === 0 || !prorateItem.prorated_amount)
    );

    // Only show strikethrough if user is actually paying less than the full regular cycle price
    const showStrikethrough =
        !isRenewalOnly &&
        normalPrice > effectiveProratePrice &&
        effectiveProratePrice > 0;

    const handleClick = () => {
        if (isFullyActive) return;
        onToggle(addon.id);
    };

    const handleDurationSelect = (days: number) => {
        onDurationChange?.(addon.id, days);
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                "p-2.5 rounded-xl border transition-all flex flex-col gap-1 select-none",
                isFullyActive
                    ? "bg-slate-50/70 border-slate-200/80 opacity-60 cursor-default"
                    : isSelected
                        ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300/50 shadow-2xs cursor-pointer"
                        : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs cursor-pointer"
            )}
        >
            {/* Header Row: Checkbox + Title/Badges + Pricing & Top-Right Alert */}
            <div className="flex items-start gap-2.5">
                <Checkbox
                    checked={!isFullyActive && isSelected}
                    disabled={isFullyActive}
                    onCheckedChange={!isFullyActive ? () => onToggle(addon.id) : undefined}
                    className={cn(
                        "mt-0.5",
                        isFullyActive ? "opacity-40 cursor-default pointer-events-none" : "pointer-events-none"
                    )}
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <span className={cn("text-xs font-bold", isFullyActive ? "text-slate-600" : "text-slate-900")}>
                                {addon.nama}
                            </span>
                            <span className="font-mono text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60 font-semibold shrink-0">
                                {addon.code}
                            </span>

                            {/* Active badge */}
                            {prorateItem?.is_currently_active && (
                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded border border-emerald-200/70 flex items-center gap-0.5 shrink-0">
                                    <IconCheck size={10} strokeWidth={2.5} />
                                    Aktif
                                </span>
                            )}
                        </div>

                        {/* Top-Right Corner: Price & Status Display */}
                        {isLoadingPrice ? (
                            <div className="flex flex-col items-end gap-1.5 shrink-0 pl-1 py-0.5">
                                <Skeleton className="h-3 w-14 rounded bg-slate-200/90" />
                                <Skeleton className="h-4 w-20 rounded bg-slate-200/90" />
                            </div>
                        ) : isFullyActive ? (
                            <div className="flex items-center gap-1.5 shrink-0 pl-1">
                                <span className="text-xs font-bold text-slate-400 font-mono">
                                    Rp 0
                                </span>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            className="size-5 rounded-md flex items-center justify-center text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-200/90 transition-colors cursor-help shrink-0 shadow-2xs"
                                            role="button"
                                            tabIndex={0}
                                            aria-label="Keterangan add-on tidak dapat dipilih"
                                        >
                                            <IconAlertCircle size={13} className="stroke-[2.3]" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent
                                        side="top"
                                        align="end"
                                        className="max-w-xs text-xs p-2.5 bg-slate-900 text-white shadow-xl rounded-xl border border-slate-800 space-y-1 z-50"
                                    >
                                        <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
                                            <IconAlertCircle size={12} className="shrink-0" />
                                            <span>Add-on Tidak Dapat Dipilih</span>
                                        </div>
                                        <p className="text-[11px] text-slate-200 leading-relaxed font-normal">
                                            {prorateItem?.ineligibility_reason || "Add-on sudah aktif hingga akhir masa aktif lisensi utama toko."}
                                        </p>
                                        <p className="text-[10px] text-emerald-300 font-semibold pt-1 border-t border-slate-800/80">
                                            💡 Aktifkan &quot;Perbarui Paket Utama POS&quot; jika ingin memperpanjang ke periode berikutnya.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        ) : (
                            <div className="flex flex-col items-end shrink-0 pl-1">
                                {prorateItem?.is_prorated ? (
                                    <>
                                        <div className="flex items-center gap-1 leading-none mb-0.5">
                                            {showStrikethrough && (
                                                <span className="text-[10px] text-slate-400 line-through font-mono">
                                                    {formatRupiah(normalPrice)}
                                                </span>
                                            )}
                                            {isRenewalOnly ? (
                                                <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100/80 px-1 py-0.2 rounded border border-blue-200/70 leading-none">
                                                    Perpanjang 1 {isAnnual ? "Thn" : "Bln"}
                                                </span>
                                            ) : withRenewal ? (
                                                <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100/80 px-1 py-0.2 rounded border border-blue-200/70 leading-none">
                                                    Prorata + 1 {isAnnual ? "Thn" : "Bln"}
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/80 px-1 py-0.2 rounded border border-emerald-200/70 leading-none">
                                                    Prorata
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-xs font-black text-emerald-700 font-mono">
                                                {formatRupiah(effectiveProratePrice)}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                {isRenewalOnly
                                                    ? `(1 ${isAnnual ? "Tahun" : "Bulan"})`
                                                    : `(${activeDays} hari)`}
                                            </span>
                                        </div>
                                    </>
                                ) : withRenewal && !isEligible ? (
                                    <>
                                        <div className="flex items-center gap-1 leading-none mb-0.5">
                                            <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100/80 px-1 py-0.2 rounded border border-blue-200/70 leading-none">
                                                Perpanjang {isAnnual ? "1 Thn" : "1 Bln"}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-xs font-black text-blue-700 font-mono">
                                                {formatRupiah(prorateItem?.renewal_amount || (isAnnual ? addon.harga_tahunan : addon.harga_bulanan))}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">
                                                /{isAnnual ? "tahun" : "bulan"}
                                            </span>
                                        </div>
                                    </>
                                ) : isAnnual && hasAnnualDiscount ? (
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
                        )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight mt-0.5">
                        {addon.description}
                    </p>

                    {/* Active Addon Expiry Information */}
                    {prorateItem?.is_currently_active && prorateItem.current_expires_at && (
                        <div className="text-[10px] text-slate-400 font-medium pt-0.5">
                            Aktif s.d.{" "}
                            <span className="font-semibold text-slate-600">
                                {formatDate(prorateItem.current_expires_at, "d MMM yyyy")}
                            </span>{" "}
                            (sisa {prorateItem.current_remaining_days} hari)
                        </div>
                    )}
                </div>
            </div>

            {/* Discrete Stepped Slider: ONLY visible when add-on is selected and prorated */}
            {isSelected && isProrated && (isEligible || withRenewal) && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1.5 pt-1.5 border-t border-emerald-100/70 space-y-1.5"
                >
                    {isLoadingPrice ? (
                        <div className="space-y-1.5 py-1">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-3 w-16 rounded bg-emerald-100/70" />
                                <Skeleton className="h-3 w-20 rounded bg-emerald-100/70" />
                            </div>
                            <Skeleton className="h-2 w-full rounded bg-emerald-100/50" />
                        </div>
                    ) : safeTicks.length > 1 ? (
                        <>
                            <div className="flex items-center justify-between text-[10px]">
                                <span className="font-semibold text-slate-600">Pilih Durasi:</span>
                                <Badge
                                    variant="outline"
                                    className="text-[10px] font-mono font-bold bg-white text-emerald-800 border-emerald-300 px-1.5 py-0"
                                >
                                    {activeDays} Hari {activeDays === maxVal ? "(Maks)" : ""}
                                </Badge>
                            </div>

                            {/* Discrete Slider Component with smooth dragging and release snap */}
                            <Slider
                                ticks={safeTicks}
                                value={activeDays}
                                onValueChange={handleDurationSelect}
                                className="py-0.5"
                            />

                            {/* Discrete Quick Tick Pills */}
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                                <div className="flex items-center gap-1 flex-wrap">
                                    {safeTicks.map((tickVal) => {
                                        const isSelectedTick = tickVal === activeDays;
                                        const isTickMax = tickVal === maxVal;
                                        return (
                                            <button
                                                key={tickVal}
                                                type="button"
                                                onClick={() => handleDurationSelect(tickVal)}
                                                className={cn(
                                                    "px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer border select-none",
                                                    isSelectedTick
                                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                                        : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700"
                                                )}
                                            >
                                                {isTickMax ? `Maks (${tickVal}h)` : `${tickVal}h`}
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="text-[9px] text-slate-400 font-medium">
                                    {safeTicks.length} pilihan
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500 font-medium">
                                {isRenewalOnly ? "Durasi perpanjangan:" : "Durasi prorata:"}
                            </span>
                            <span className={cn(
                                "font-mono font-bold px-1.5 py-0.2 rounded text-[10px] border",
                                isRenewalOnly
                                    ? "text-blue-700 bg-blue-50 border-blue-200/80"
                                    : "text-emerald-700 bg-emerald-100/70 border-emerald-200/60"
                            )}>
                                {isRenewalOnly
                                    ? `1 ${isAnnual ? "Tahun" : "Bulan"}`
                                    : `${safeTicks[0]} Hari (Maksimal)`}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export const LicenseOrderAddonItem = React.memo(LicenseOrderAddonItemComponent);
