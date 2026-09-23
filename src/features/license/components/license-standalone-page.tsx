"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useAppRouter } from "@/hooks/use-app-router";
import {
    IconAlertTriangle,
    IconFileInvoice,
    IconKey,
    IconPackage,
    IconRefresh,
    IconShieldCheck,
    IconShoppingCart,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { LicenseTopNav } from "./license-top-nav";
import { LicenseHeroCard } from "./license-hero-card";
import { LicenseActivateForm } from "./license-activate-form";
import { LicenseAddonsTab } from "./license-addons-tab";
import { LicenseCatalogSection } from "./license-catalog-section";
import { LicenseInvoicesTable } from "./license-invoices-table";
import { LicenseOrderDialog } from "./license-order-dialog";
import { AppButton } from "@/components/shared/app-button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLicenseStatusQuery, useLicenseCatalogQuery, useLicenseInvoicesQuery } from "../api/license-api";
import { getLicenseTimeMetrics } from "../utils/license-time";
import { SUBSCRIPTION_TYPE_LABELS } from "../constants/license-constants";
import { cn } from "@/lib/utils";

type TabId = "status" | "catalog" | "addons" | "invoices" | "activate";

interface TabDef {
    id: TabId;
    label: string;
    icon: typeof IconShieldCheck;
}

export function LicenseStandalonePage() {
    const router = useAppRouter();
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<TabId>("status");
    const [orderOpen, setOrderOpen] = useState(false);

    const {
        data: status,
        isLoading: statusLoading,
        isError: statusError,
        refetch: refetchStatus,
    } = useLicenseStatusQuery({ refetchOnMount: "always" });

    const { data: catalog, isLoading: catalogLoading } = useLicenseCatalogQuery();
    const { data: invoices, isLoading: invoicesLoading } = useLicenseInvoicesQuery();

    const userRoles = session?.user?.roles ?? [];
    const isAdmin = userRoles.includes("admin");

    // Redirect non-admin users
    useEffect(() => {
        if (session && !isAdmin) {
            router.replace("/unauthorized");
        }
    }, [session, isAdmin, router]);

    if (session && !isAdmin) {
        return null;
    }

    const invoiceList = invoices ?? [];
    const activeAddons = status?.active_addons ?? [];
    const catalogList = catalog ?? [];

    const handleActivated = () => {
        // After activation, switch to the status tab to see the result
        setActiveTab("status");
    };

    const isLicenseActiveAndValid = status?.status === "active" && status?.can_operate === true;
    const isGracePeriod = Boolean(status?.is_grace_period && status?.can_operate);
    const isOperable = isLicenseActiveAndValid || isGracePeriod;
    const timeMetrics = getLicenseTimeMetrics(status);

    const tabs: TabDef[] = [
        { id: "status",   label: "Ringkasan",        icon: IconShieldCheck },
        { id: "catalog",  label: "Paket & Add-on",   icon: IconPackage     },
        { id: "addons",   label: isOperable ? "Add-on Aktif" : "Modul Add-on", icon: IconShoppingCart },
        { id: "invoices", label: "Riwayat Tagihan",  icon: IconFileInvoice  },
        { id: "activate", label: "Aktivasi Lisensi", icon: IconKey         },
    ];

    return (
        <div className="flex flex-col min-h-[100dvh]">
            {/* Top Navigation Bar */}
            <LicenseTopNav />

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">
                {/* ── Hero License Card ─────────────────────────────────────────── */}
                {statusLoading ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 space-y-4 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-12 h-12 rounded-xl" />
                            <div className="space-y-1.5 flex-1">
                                <Skeleton className="h-3.5 w-28 rounded-md" />
                                <Skeleton className="h-5 w-48 rounded-md" />
                            </div>
                        </div>
                        <Skeleton className="h-6 w-full rounded-xl" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-32 rounded-lg" />
                            <Skeleton className="h-6 w-24 rounded-lg" />
                        </div>
                    </div>
                ) : statusError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-5 text-center space-y-2">
                        <p className="text-rose-700 font-extrabold text-sm">Gagal Memuat Status Langganan</p>
                        <p className="text-rose-600/80 text-xs">Pastikan koneksi internet aktif, lalu coba beberapa saat lagi.</p>
                        <div className="flex justify-center pt-1.5">
                            <AppButton
                                variant="outline"
                                size="sm"
                                onClick={() => void refetchStatus()}
                                className="h-8 text-xs font-bold rounded-lg border-rose-200 text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs gap-1.5 cursor-pointer"
                            >
                                <IconRefresh size={14} />
                                <span>Coba Lagi</span>
                            </AppButton>
                        </div>
                    </div>
                ) : status ? (
                    <LicenseHeroCard
                        data={status}
                        onRenewClick={() => setOrderOpen(true)}
                        onActivateClick={() => setActiveTab("activate")}
                    />
                ) : null}

                {/* ── Tab Navigation (Apple/Google Sliding Segmented Controls) ── */}
                <div className="sticky top-12 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-slate-50/90 backdrop-blur-md border-b border-slate-200/70">
                    <div className="flex items-center justify-between gap-3">
                        {/* Sliding Tab Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none bg-slate-200/60 p-1 rounded-xl w-full sm:w-fit border border-slate-200/70">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer select-none shrink-0 transition-colors duration-150",
                                            isActive
                                                ? "text-slate-900"
                                                : "text-slate-600 hover:text-slate-900"
                                        )}
                                    >
                                        {/* Animated Sliding Pill Indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabIndicator"
                                                className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-slate-200/60"
                                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                            />
                                        )}

                                        <span className="relative z-10 flex items-center gap-1.5">
                                            <Icon
                                                size={13}
                                                className={isActive ? "text-emerald-600" : "text-slate-500"}
                                            />
                                            <span>{tab.label}</span>
                                            {tab.id === "addons" && activeAddons.length > 0 && (
                                                <span
                                                    className={cn(
                                                        "text-[9px] font-black px-1.5 py-0.2 rounded-full",
                                                        isActive
                                                            ? isOperable
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : "bg-rose-100 text-rose-800"
                                                            : isOperable
                                                                ? "bg-slate-300/70 text-slate-700"
                                                                : "bg-rose-200/60 text-rose-700"
                                                    )}
                                                >
                                                    {activeAddons.length}
                                                    {!isOperable && " Nonaktif"}
                                                </span>
                                            )}
                                            {tab.id === "catalog" && !isOperable && (
                                                <span
                                                    className={cn(
                                                        "text-[9px] font-bold px-1.5 py-0.2 rounded-full",
                                                        isActive
                                                            ? "bg-rose-100 text-rose-800"
                                                            : "bg-rose-200/60 text-rose-700"
                                                    )}
                                                >
                                                    Perpanjang
                                                </span>
                                            )}
                                            {tab.id === "status" && !isOperable && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                                            )}
                                            {tab.id === "invoices" && invoiceList.length > 0 && (
                                                <span
                                                    className={cn(
                                                        "text-[9px] font-black px-1.5 py-0.2 rounded-full",
                                                        isActive
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-slate-300/70 text-slate-700"
                                                    )}
                                                >
                                                    {invoiceList.length}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Tab Content Panel with Smooth Animation ───────────────── */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden p-4 sm:p-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                        >
                            {/* Tab: Ringkasan (status KPI) */}
                            {activeTab === "status" && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <div>
                                            <h3 className="text-sm font-extrabold text-slate-900">
                                                Ringkasan Status Langganan
                                            </h3>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Informasi masa berlaku paket, lisensi, dan modul operasional toko Anda
                                            </p>
                                        </div>
                                        {!isOperable && status && (
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] font-bold bg-rose-50 text-rose-700 border-rose-200 px-2 py-0.5 self-start sm:self-auto"
                                            >
                                                Layanan Dinonaktifkan
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Prominent Warning Banner if Subscription Expired */}
                                    {!isOperable && status && (
                                        <div className="rounded-xl border border-rose-200/90 bg-rose-50/70 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs text-left animate-fade-in">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
                                                    <IconAlertTriangle size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                                                            Masa Langganan Kedaluwarsa — Layanan Dinonaktifkan
                                                        </h4>
                                                        <Badge variant="outline" className="text-[9px] font-bold bg-rose-100 text-rose-700 border-rose-200">
                                                            Perlu Tindakan
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[11px] text-rose-700/80 mt-0.5 leading-relaxed">
                                                        Akses kasir POS dan seluruh modul add-on ({activeAddons.length} modul terpasang) saat ini terkunci. Perpanjang paket sekarang untuk memulihkan kembali operasional toko Anda.
                                                    </p>
                                                </div>
                                            </div>
                                            <AppButton
                                                size="sm"
                                                onClick={() => setOrderOpen(true)}
                                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-2xs gap-1.5 h-8 cursor-pointer self-end sm:self-center"
                                            >
                                                <IconRefresh size={14} />
                                                <span>Perpanjang Sekarang</span>
                                            </AppButton>
                                        </div>
                                    )}

                                    {statusLoading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                            {[1, 2, 3, 4].map((i) => (
                                                <Skeleton key={i} className="h-20 rounded-xl" />
                                            ))}
                                        </div>
                                    ) : status ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                            {/* Stat: Masa Aktif */}
                                            <StatCard
                                                label="Sisa Masa Aktif"
                                                value={
                                                    !isOperable
                                                        ? "Kedaluwarsa"
                                                        : timeMetrics.timeRemainingLabel
                                                }
                                                sub={
                                                    !isOperable
                                                        ? "Masa aktif telah berakhir"
                                                        : timeMetrics.timeRemainingDescription
                                                }
                                                accent={
                                                    !isOperable
                                                        ? "rose"
                                                        : timeMetrics.urgencyLevel === "critical"
                                                        ? "rose"
                                                        : timeMetrics.urgencyLevel === "warning"
                                                        ? "amber"
                                                        : "emerald"
                                                }
                                            />
                                            {/* Stat: Kunci Lisensi */}
                                            <StatCard
                                                label="Kunci Lisensi"
                                                value={
                                                    status.license_key
                                                        ? isOperable
                                                            ? "Aktif & Terpasang"
                                                            : "Kedaluwarsa"
                                                        : "Belum Diaktifkan"
                                                }
                                                sub={
                                                    status.license_key
                                                        ? isOperable
                                                            ? status.license_key.substring(0, 16) + "..."
                                                            : "Perlu perpanjangan lisensi"
                                                        : "Belum diaktifkan"
                                                }
                                                accent={status.license_key ? (isOperable ? "emerald" : "rose") : "slate"}
                                            />
                                            {/* Stat: Paket */}
                                            <StatCard
                                                label="Paket Langganan"
                                                value={
                                                    status.subscription_type
                                                        ? (SUBSCRIPTION_TYPE_LABELS[status.subscription_type] ?? "POS Multi-Store")
                                                        : "POS Multi-Store"
                                                }
                                                sub={
                                                    status.subscription_type === "lifetime"
                                                        ? "Akses penuh permanen tanpa batas"
                                                        : status.subscription_type === "trial"
                                                        ? "Masa evaluasi dan uji coba fitur"
                                                        : isOperable
                                                        ? "Multi-cabang cloud aktif"
                                                        : "Operasional terhenti"
                                                }
                                                accent={isOperable ? "blue" : "slate"}
                                            />
                                            {/* Stat: Add-on */}
                                            <StatCard
                                                label="Status Modul Add-on"
                                                value={
                                                    isOperable
                                                        ? `${activeAddons.length} Modul Aktif`
                                                        : `${activeAddons.length} Modul Dinonaktifkan`
                                                }
                                                sub={
                                                    !isOperable
                                                        ? "Terkunci — paket utama kedaluwarsa"
                                                        : activeAddons.length > 0
                                                            ? "Semua modul operasional aktif"
                                                            : "Belum ada add-on"
                                                }
                                                accent={isOperable ? "emerald" : "rose"}
                                            />
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-xs text-center py-6">
                                            Data status tidak tersedia.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Tab: Paket & Add-on (Catalog) */}
                            {activeTab === "catalog" && (
                                <div>
                                    {catalogLoading ? (
                                        <div className="space-y-2.5">
                                            {[1, 2, 3].map((i) => (
                                                <Skeleton key={i} className="h-14 w-full rounded-xl" />
                                            ))}
                                        </div>
                                    ) : (
                                        <LicenseCatalogSection
                                            catalog={catalogList}
                                            activeAddons={activeAddons}
                                            isOperable={isOperable}
                                        />
                                    )}
                                </div>
                            )}

                            {/* Tab: Add-on Aktif */}
                            {activeTab === "addons" && (
                                <LicenseAddonsTab
                                    activeAddons={activeAddons}
                                    isOperable={isOperable}
                                    onGoToCatalog={() => setActiveTab("catalog")}
                                    onRenewClick={() => setOrderOpen(true)}
                                />
                            )}

                            {/* Tab: Riwayat Tagihan */}
                            {activeTab === "invoices" && (
                                <LicenseInvoicesTable
                                    invoices={invoiceList}
                                    isLoading={invoicesLoading}
                                />
                            )}

                            {/* Tab: Aktivasi Lisensi */}
                            {activeTab === "activate" && (
                                <div className="max-w-md mx-auto py-1">
                                    <div className="mb-4 space-y-1">
                                        <h3 className="text-sm font-extrabold text-slate-800">
                                            Aktivasi Lisensi POS
                                        </h3>
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            Masukkan kunci lisensi resmi yang Anda terima saat pembelian paket atau perpanjangan langganan.
                                        </p>
                                    </div>
                                    <LicenseActivateForm
                                        compact
                                        onSuccess={handleActivated}
                                    />

                                    {/* Info callout */}
                                    <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs text-slate-600 space-y-1">
                                        <p className="font-extrabold text-slate-800 text-[11px]">
                                            Panduan Kunci Lisensi
                                        </p>
                                        <p className="leading-relaxed text-slate-500 text-[11px]">
                                            Kunci lisensi diterbitkan secara otomatis setelah konfirmasi pembayaran paket langganan. Hubungi tim dukungan pelanggan melalui{" "}
                                            <a
                                                href="mailto:support@mitrasovapos.my.id"
                                                className="text-emerald-600 font-bold underline hover:text-emerald-700"
                                            >
                                                support@mitrasovapos.my.id
                                            </a>{" "}
                                            jika membutuhkan bantuan teknis.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Footer ───────────────────────────────────────────────── */}
                <footer className="text-center space-y-0.5 pt-2 pb-2">
                    <p className="text-[10px] text-slate-400 font-medium">
                        Mitrasova POS · Multi-Store Retail Platform
                    </p>
                    <p className="text-[10px] text-slate-400">
                        Layanan Bantuan:{" "}
                        <a
                            href="mailto:support@mitrasovapos.my.id"
                            className="text-emerald-600 hover:text-emerald-700 underline font-semibold"
                        >
                            support@mitrasovapos.my.id
                        </a>
                    </p>
                </footer>
            </main>

            {/* Order Dialog */}
            <LicenseOrderDialog
                open={orderOpen}
                onOpenChange={setOrderOpen}
                catalog={catalogList}
            />
        </div>
    );
}

// ── Internal Compact StatCard ──────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: string;
    sub: string;
    accent: "emerald" | "amber" | "rose" | "blue" | "slate";
}

const ACCENT_CLASSES: Record<StatCardProps["accent"], { bg: string; text: string; dot: string }> = {
    emerald: { bg: "bg-emerald-50/60 border-emerald-200/60", text: "text-emerald-800", dot: "bg-emerald-500" },
    amber:   { bg: "bg-amber-50/60 border-amber-200/60",     text: "text-amber-800",   dot: "bg-amber-500"   },
    rose:    { bg: "bg-rose-50/60 border-rose-200/60",       text: "text-rose-800",    dot: "bg-rose-500"    },
    blue:    { bg: "bg-blue-50/60 border-blue-200/60",       text: "text-blue-800",    dot: "bg-blue-500"    },
    slate:   { bg: "bg-slate-50 border-slate-200/60",        text: "text-slate-800",   dot: "bg-slate-400"   },
};

function StatCard({ label, value, sub, accent }: StatCardProps) {
    const cls = ACCENT_CLASSES[accent];
    return (
        <div
            className={cn(
                "rounded-xl border p-3 space-y-1 transition-colors duration-150 shadow-2xs",
                cls.bg
            )}
        >
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {label}
                </span>
                <div className={cn("w-1.5 h-1.5 rounded-full", cls.dot)} />
            </div>
            <p className={cn("text-sm font-black tracking-tight", cls.text)}>{value}</p>
            <p className="text-[10px] text-slate-500 font-medium truncate">{sub}</p>
        </div>
    );
}
