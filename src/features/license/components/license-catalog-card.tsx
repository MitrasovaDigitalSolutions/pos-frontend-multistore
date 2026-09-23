"use client";

import { Badge } from "@/components/ui/badge";
import {
    IconArrowsExchange,
    IconAssembly,
    IconBuildingWarehouse,
    IconChartBar,
    IconCheck,
    IconCreditCard,
    IconPackage,
    IconPlus,
    IconReceipt2,
    IconReportMoney,
    IconScan,
    IconTruckDelivery,
    IconUsers,
} from "@tabler/icons-react";
import type { CatalogAddon } from "../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";

interface LicenseCatalogCardProps {
    addon: CatalogAddon;
    isOwned: boolean;
    isOperable?: boolean;
    billingView: "monthly" | "annual";
    onOrder: () => void;
}

const ADDON_VISUALS: Record<
    string,
    {
        icon: typeof IconPackage;
        iconBg: string;
        iconColor: string;
        borderColor: string;
    }
> = {
    purchasing: {
        icon: IconTruckDelivery,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-100",
    },
    debts: {
        icon: IconCreditCard,
        iconBg: "bg-rose-50",
        iconColor: "text-rose-600",
        borderColor: "border-rose-100",
    },
    expenses: {
        icon: IconReceipt2,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        borderColor: "border-amber-100",
    },
    members: {
        icon: IconUsers,
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
        borderColor: "border-violet-100",
    },
    stock_opname: {
        icon: IconScan,
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-100",
    },
    reports: {
        icon: IconChartBar,
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        borderColor: "border-cyan-100",
    },
    accounting: {
        icon: IconReportMoney,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        borderColor: "border-blue-100",
    },
    consignment: {
        icon: IconArrowsExchange,
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
        borderColor: "border-teal-100",
    },
    production: {
        icon: IconAssembly,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        borderColor: "border-orange-100",
    },
    assets: {
        icon: IconBuildingWarehouse,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        borderColor: "border-purple-100",
    },
};

export function LicenseCatalogCard({
    addon,
    isOwned,
    isOperable = true,
    billingView,
    onOrder,
}: LicenseCatalogCardProps) {
    const visual = ADDON_VISUALS[addon.code] ?? {
        icon: IconPackage,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
        borderColor: "border-slate-200",
    };
    const VisualIcon = visual.icon;

    const price =
        billingView === "monthly"
            ? addon.harga_bulanan
            : addon.harga_tahunan;

    return (
        <div
            className={cn(
                "rounded-xl border p-3.5 sm:p-4 flex flex-col justify-between gap-3.5 transition-all",
                isOwned
                    ? isOperable
                        ? "bg-slate-50/40 border-slate-200/90"
                        : "bg-rose-50/20 border-rose-200/70"
                    : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-2xs",
            )}
        >
            {/* Top: Semantic Icon + Title + Status */}
            <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                        <div
                            className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs",
                                visual.iconBg,
                                visual.iconColor,
                                visual.borderColor,
                            )}
                        >
                            <VisualIcon size={18} strokeWidth={2} />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                                {addon.nama}
                            </h4>
                            <span className="font-mono text-[10px] text-slate-400 font-semibold">
                                {addon.code}
                            </span>
                        </div>
                    </div>

                    {isOwned ? (
                        isOperable ? (
                            <Badge
                                variant="outline"
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200/90 shrink-0 flex items-center gap-1 shadow-2xs"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Terpasang</span>
                            </Badge>
                        ) : (
                            <Badge
                                variant="outline"
                                className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border-rose-200 shrink-0 flex items-center gap-1 shadow-2xs"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                <span>Nonaktif</span>
                            </Badge>
                        )
                    ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60 shrink-0">
                            Tersedia
                        </span>
                    )}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {addon.description}
                </p>
            </div>

            {/* Bottom: Pricing + Action */}
            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                        Biaya Langganan
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xs font-extrabold text-slate-900">
                            {formatRupiah(price)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                            /{billingView === "monthly" ? "bulan" : "tahun"}
                        </span>
                    </div>
                </div>

                <div>
                    {isOwned ? (
                        isOperable ? (
                            <div className="h-7.5 px-3 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                                <IconCheck size={13} strokeWidth={2.5} />
                                <span>Aktif</span>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={onOrder}
                                className="h-7.5 px-2.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200/80 transition-colors duration-150 flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="Perpanjang paket langganan untuk mengaktifkan kembali add-on ini"
                            >
                                <span>Perlu Perpanjangan</span>
                            </button>
                        )
                    ) : (
                        <button
                            type="button"
                            onClick={onOrder}
                            className="h-7.5 px-3 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200/80 border border-emerald-200/80 transition-colors duration-150 flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                            <IconPlus size={13} strokeWidth={2.5} />
                            <span>Pesan Add-on</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
