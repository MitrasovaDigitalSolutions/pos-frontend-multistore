"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CatalogAddon, ProrateItem } from "../../types";

interface LicenseCatalogPriceBlockProps {
    addon: CatalogAddon;
    isOwned: boolean;
    billingView: "monthly" | "annual";
    isProrateLoading?: boolean;
    prorateItem?: ProrateItem;
}

/**
 * Single Responsibility: Format and render pricing calculation with prorate and discounts.
 */
export function LicenseCatalogPriceBlock({
    addon,
    isOwned,
    billingView,
    isProrateLoading = false,
    prorateItem,
}: LicenseCatalogPriceBlockProps) {
    const price = billingView === "monthly" ? addon.harga_bulanan : addon.harga_tahunan;
    const hasProratePrice =
        !isOwned &&
        billingView === "monthly" &&
        Boolean(prorateItem && prorateItem.is_prorated);

    if (isProrateLoading && billingView === "monthly" && !isOwned) {
        return (
            <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                    Biaya Langganan
                </span>
                <div className="flex items-center gap-1.5 pt-0.5">
                    <Skeleton className="h-4 w-20 rounded" />
                </div>
            </div>
        );
    }

    if (hasProratePrice && prorateItem) {
        return (
            <div className="space-y-0.5">
                <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Biaya Langganan
                    </span>
                    <Badge
                        variant="outline"
                        className="text-[9px] font-bold px-1 py-0 rounded bg-emerald-50 text-emerald-700 border-emerald-200"
                    >
                        Prorata
                    </Badge>
                </div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-slate-900 font-mono">
                        {prorateItem.formatted_price || formatRupiah(prorateItem.price)}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through font-mono">
                        {formatRupiah(addon.harga_bulanan)}
                    </span>
                </div>
                <span className="text-[9px] text-slate-400 block leading-tight">
                    sisa {prorateItem.prorated_days} hari masa aktif lisensi
                </span>
            </div>
        );
    }

    return (
        <div>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                Biaya Langganan
            </span>
            <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-slate-900 font-mono">
                    {formatRupiah(price)}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                    /{billingView === "monthly" ? "bln" : "thn"}
                </span>
            </div>
        </div>
    );
}
