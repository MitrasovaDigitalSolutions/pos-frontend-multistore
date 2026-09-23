"use client";

import {
    IconAlertTriangle,
    IconShield,
} from "@tabler/icons-react";
import { LicenseKpiCards } from "./license-kpi-cards";
import { LicenseAddonsTab } from "./license-addons-tab";
import { LicenseCatalogSection } from "./license-catalog-section";
import { LicenseInvoicesTable } from "./license-invoices-table";
import { LicenseSyncButton } from "./license-sync-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LICENSE_STATUS_LABELS } from "../constants/license-constants";
import { useLicenseManagement } from "../hooks/use-license-management";
import { cn } from "@/lib/utils";

const STATUS_BADGE_CLASS: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    grace_period: "bg-amber-50 text-amber-700 border-amber-200/80",
    expired: "bg-rose-50 text-rose-700 border-rose-200/80",
    suspended: "bg-rose-50 text-rose-700 border-rose-200/80",
    not_activated: "bg-slate-50 text-slate-600 border-slate-200/80",
};

export function LicensePage() {
    const {
        status,
        catalog,
        invoices,
        statusLoading,
        catalogLoading,
        invoicesLoading,
        statusError,
        activeTab,
        setActiveTab,
        formattedSync,
        tabs,
    } = useLicenseManagement();

    return (
        <div className="w-full space-y-4 pb-12">
            {/* ─── Compact Top Action Bar ───────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/70 shadow-2xs shrink-0">
                        <IconShield size={20} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                                Langganan & Lisensi POS
                            </h1>
                            {status && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[9px] font-bold px-1.5 py-0 rounded-full uppercase tracking-wider",
                                        STATUS_BADGE_CLASS[status.status] ??
                                        STATUS_BADGE_CLASS.not_activated,
                                    )}
                                >
                                    ● {LICENSE_STATUS_LABELS[status.status] ?? status.status}
                                </Badge>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Kelola paket langganan, add-on aktif, dan riwayat tagihan bisnis Anda
                        </p>
                    </div>
                </div>

                {/* Right Action Group */}
                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                    {formattedSync && (
                        <span className="text-[10px] text-slate-400 font-medium hidden md:inline">
                            Terakhir disinkronkan: {formattedSync} WIB
                        </span>
                    )}
                    <LicenseSyncButton />
                </div>
            </div>

            {/* ─── Status Loading & Error Handling ──────────────────────────── */}
            {statusLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-slate-200/80 p-3.5 space-y-2"
                        >
                            <Skeleton className="h-3 w-1/3 rounded" />
                            <Skeleton className="h-5 w-2/3 rounded" />
                            <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                    ))}
                </div>
            )}

            {statusError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3 text-rose-700 shadow-sm">
                    <IconAlertTriangle size={20} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold text-xs">
                            Gagal memuat status langganan dari server
                        </p>
                        <p className="text-[11px] mt-0.5 text-rose-600 leading-relaxed">
                            Aplikasi tidak dapat menghubungi server lisensi. Pastikan sambungan internet aktif lalu coba sinkronkan kembali.
                        </p>
                    </div>
                </div>
            )}

            {/* ─── Top 4-Tile KPI Summary Strip ─────────────────────────────── */}
            {status && <LicenseKpiCards data={status} />}

            {/* ─── Unified Main Card with Horizontal Navigation Tabs ────────── */}
            <Card className="border border-slate-200/80 rounded-2xl shadow-[0_4px_20px_rgba(15,23,42,0.03)] bg-white overflow-hidden flex flex-col w-full">
                {/* Horizontal Navigation Header Bar */}
                <div className="border-b border-slate-100 bg-slate-50/60 p-2 sm:p-2.5 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 shrink-0">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap",
                                        isActive
                                            ? "bg-white text-emerald-800 shadow-2xs ring-1 ring-slate-200/60"
                                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50",
                                    )}
                                >
                                    <Icon
                                        size={15}
                                        className={cn(
                                            "shrink-0",
                                            isActive
                                                ? "text-emerald-600"
                                                : "text-slate-400",
                                        )}
                                    />
                                    <span>{tab.label}</span>

                                    {tab.id === "addons" && status && (
                                        <span
                                            className={cn(
                                                "text-[9px] font-extrabold px-1.5 py-0.2 rounded-full",
                                                isActive
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-200/80 text-slate-600",
                                            )}
                                        >
                                            {status.active_addons.length}
                                        </span>
                                    )}

                                    {tab.id === "invoices" && invoices.length > 0 && (
                                        <span
                                            className={cn(
                                                "text-[9px] font-extrabold px-1.5 py-0.2 rounded-full",
                                                isActive
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-200/80 text-slate-600",
                                            )}
                                        >
                                            {invoices.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Body Content */}
                <div className="p-4 sm:p-5">
                    {/* Tab 1: Add-on Aktif */}
                    {activeTab === "addons" && (
                        <LicenseAddonsTab
                            activeAddons={status?.active_addons ?? []}
                            onGoToCatalog={() => setActiveTab("catalog")}
                        />
                    )}

                    {/* Tab 2: Katalog & Upgrade POS */}
                    {activeTab === "catalog" && (
                        <div>
                            {catalogLoading && (
                                <div className="space-y-3">
                                    <Skeleton className="h-14 w-full rounded-xl" />
                                    <Skeleton className="h-14 w-full rounded-xl" />
                                    <Skeleton className="h-14 w-full rounded-xl" />
                                </div>
                            )}
                            {!catalogLoading && (
                                <LicenseCatalogSection
                                    catalog={catalog}
                                    activeAddons={status?.active_addons ?? []}
                                />
                            )}
                        </div>
                    )}

                    {/* Tab 3: Riwayat Tagihan */}
                    {activeTab === "invoices" && (
                        <LicenseInvoicesTable
                            invoices={invoices}
                            isLoading={invoicesLoading}
                        />
                    )}
                </div>
            </Card>
        </div>
    );
}
