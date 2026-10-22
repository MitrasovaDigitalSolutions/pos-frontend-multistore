"use client";

import { cn } from "@/lib/utils";
import {
    IconArrowsExchange,
    IconAssembly,
    IconBuildingStore,
    IconBuildingWarehouse,
    IconCalendar,
    IconChartBar,
    IconCreditCard,
    IconDeviceDesktop,
    IconLayoutGrid,
    IconMapPin,
    IconPackage,
    IconReceipt2,
    IconReportMoney,
    IconScan,
    IconTruckDelivery,
    IconUsers,
} from "@tabler/icons-react";
import { ADDON_METADATA } from "../constants/license-constants";
import type { CatalogAddon, ProrateItem } from "../types";
import { LicenseCatalogAction } from "./catalog/license-catalog-action";
import { LicenseCatalogPriceBlock } from "./catalog/license-catalog-price-block";
import { LicenseCatalogStatusBadge } from "./catalog/license-catalog-status-badge";

export interface LicenseCatalogCardProps {
    addon: CatalogAddon;
    isOwned: boolean;
    isOperable?: boolean;
    billingView: "monthly" | "annual";
    onOrder: () => void;
    isProrateLoading?: boolean;
    prorateItem?: ProrateItem;
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
        borderColor: "border-emerald-200/80",
    },
    debts: {
        icon: IconCreditCard,
        iconBg: "bg-rose-50",
        iconColor: "text-rose-600",
        borderColor: "border-rose-200/80",
    },
    expenses: {
        icon: IconReceipt2,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200/80",
    },
    members: {
        icon: IconUsers,
        iconBg: "bg-violet-50",
        iconColor: "text-violet-600",
        borderColor: "border-violet-200/80",
    },
    stock_opname: {
        icon: IconScan,
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-200/80",
    },
    reports: {
        icon: IconChartBar,
        iconBg: "bg-cyan-50",
        iconColor: "text-cyan-600",
        borderColor: "border-cyan-200/80",
    },
    accounting: {
        icon: IconReportMoney,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200/80",
    },
    consignment: {
        icon: IconArrowsExchange,
        iconBg: "bg-teal-50",
        iconColor: "text-teal-600",
        borderColor: "border-teal-200/80",
    },
    production: {
        icon: IconAssembly,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600",
        borderColor: "border-orange-200/80",
    },
    assets: {
        icon: IconBuildingWarehouse,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200/80",
    },
    multi_store: {
        icon: IconBuildingStore,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-200/80",
    },
    kds: {
        icon: IconDeviceDesktop,
        iconBg: "bg-rose-50",
        iconColor: "text-rose-600",
        borderColor: "border-rose-200/80",
    },
    table_mgmt: {
        icon: IconLayoutGrid,
        iconBg: "bg-sky-50",
        iconColor: "text-sky-600",
        borderColor: "border-sky-200/80",
    },
    reservation: {
        icon: IconCalendar,
        iconBg: "bg-fuchsia-50",
        iconColor: "text-fuchsia-600",
        borderColor: "border-fuchsia-200/80",
    },
};

/**
 * Compact Add-on Card formatted uniformly with Server Package cards.
 * Lightweight, hardware-accelerated, and responsive across mobile, tablet, and desktop.
 */
export function LicenseCatalogCard({
    addon,
    isOwned,
    isOperable = true,
    billingView,
    onOrder,
    isProrateLoading = false,
    prorateItem,
}: LicenseCatalogCardProps) {
    const codeLower = (addon.code || "").toLowerCase();
    const visual = ADDON_VISUALS[codeLower] ?? {
        icon: IconPackage,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
        borderColor: "border-slate-200",
    };
    const VisualIcon = visual.icon;

    const meta = ADDON_METADATA[codeLower];
    const primaryMenuPath = meta?.menuPaths?.[0];

    return (
        <div
            className={cn(
                "relative rounded-xl border p-3 sm:p-3.5 flex flex-col justify-between gap-2.5 transition-all shadow-2xs group hover:shadow-xs",
                isOwned
                    ? isOperable
                        ? "bg-slate-50/50 border-slate-200/90"
                        : "bg-rose-50/20 border-rose-200/70"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
            )}
        >
            <div className="space-y-2">
                {/* Top: Semantic Icon + Title + Code + Status Badge */}
                <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                        <div
                            className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs",
                                visual.iconBg,
                                visual.iconColor,
                                visual.borderColor
                            )}
                        >
                            <VisualIcon size={15} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                            <h5 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                {addon.nama}
                            </h5>
                            <span className="font-mono text-[9px] text-slate-400 font-semibold uppercase">
                                {addon.code}
                            </span>
                        </div>
                    </div>

                    <LicenseCatalogStatusBadge
                        isOwned={isOwned}
                        isOperable={isOperable}
                    />
                </div>

                {/* Middle: Menu Location Tag (Hardware/Module specs style) */}
                {primaryMenuPath && (
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-600 font-mono font-medium">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/60 truncate max-w-full">
                            <IconMapPin size={10} className="text-slate-400 shrink-0" />
                            <span className="truncate">{primaryMenuPath}</span>
                        </span>
                    </div>
                )}

                {/* Description: Exactly 2 lines */}
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {addon.description}
                </p>
            </div>

            {/* Bottom: Price + Action Button */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <LicenseCatalogPriceBlock
                    addon={addon}
                    isOwned={isOwned}
                    billingView={billingView}
                    isProrateLoading={isProrateLoading}
                    prorateItem={prorateItem}
                />
                <LicenseCatalogAction
                    isOwned={isOwned}
                    isOperable={isOperable}
                    onOrder={onOrder}
                />
            </div>
        </div>
    );
}
