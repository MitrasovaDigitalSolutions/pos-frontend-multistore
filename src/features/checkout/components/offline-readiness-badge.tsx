"use client";

import React, { useState } from "react";
import {
    ShieldCheck,
    ShieldAlert,
    Shield,
    Code,
    Loader2,
    CloudOff,
    Database,
    Users,
    RefreshCw,
    X,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/date-utils";
import type { OfflineReadinessState, OfflineReadinessStatus } from "@/hooks/use-offline-readiness";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OfflineReadinessBadgeProps {
    state: OfflineReadinessState;
    onRefreshRequest?: () => void;
    isSyncing?: boolean;
}

interface StatusConfig {
    icon: React.ReactNode;
    label: string;
    badgeClass: string;
    dotClass: string;
    pulse: boolean;
}

function getStatusConfig(status: OfflineReadinessStatus): StatusConfig {
    switch (status) {
        case "checking":
            return {
                icon: <Loader2 size={13} className="animate-spin" />,
                label: "Memeriksa...",
                badgeClass: "bg-slate-800/80 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                dotClass: "bg-slate-500",
                pulse: false,
            };
        case "ready":
            return {
                icon: <ShieldCheck size={13} />,
                label: "Offline Siap",
                badgeClass: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300",
                dotClass: "bg-emerald-400",
                pulse: false,
            };
        case "partial":
            return {
                icon: <Shield size={13} className="animate-pulse" />,
                label: "Offline Parsial",
                badgeClass: "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300",
                dotClass: "bg-amber-400",
                pulse: true,
            };
        case "not-ready":
            return {
                icon: <ShieldAlert size={13} />,
                label: "Offline Belum Siap",
                badgeClass: "bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300",
                dotClass: "bg-rose-500",
                pulse: true,
            };
        case "dev-mode":
            return {
                icon: <Code size={13} />,
                label: "Dev Mode",
                badgeClass: "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300",
                dotClass: "bg-blue-400",
                pulse: false,
            };
    }
}

function formatLastSynced(iso: string | null): string {
    if (!iso) return "Belum pernah";
    const formatted = formatDate(iso, "dd MMM, HH:mm");
    return formatted || "Tidak diketahui";
}

export function OfflineReadinessBadge({
    state,
    onRefreshRequest,
    isSyncing = false,
}: OfflineReadinessBadgeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const config = getStatusConfig(state.status);

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="xs"
                onClick={() => setIsOpen((v) => !v)}
                className={cn(
                    "font-semibold text-[11px] h-7 cursor-pointer gap-1.5 px-2.5 rounded-full transition-all duration-200",
                    config.badgeClass
                )}
                title="Status Kesiapan Offline"
            >
                {/* Dot */}
                <span className="relative flex items-center justify-center w-2 h-2 shrink-0">
                    <span
                        className={cn(
                            "absolute inline-flex w-full h-full rounded-full opacity-60",
                            config.pulse && "animate-ping",
                            config.dotClass
                        )}
                    />
                    <span
                        className={cn(
                            "relative inline-flex w-1.5 h-1.5 rounded-full",
                            config.dotClass
                        )}
                    />
                </span>
                {config.icon}
                <span>{config.label}</span>
            </Button>

            {/* Popover Detail */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    {/* Panel */}
                    <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl shadow-black/50 p-4 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                            <span className="font-bold text-slate-200 text-[13px]">
                                Status Offline Mode
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-500 hover:text-slate-350 transition-colors outline-none cursor-pointer p-0.5 rounded-md hover:bg-slate-800"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Status Items */}
                        <div className="space-y-3">
                            {/* Dev Mode Notice */}
                            {state.isDevMode && (
                                <div className="bg-slate-800/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 text-[11px] leading-snug flex items-start gap-2">
                                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                                    <span>
                                        Service Worker <span className="text-amber-400 font-semibold">dinonaktifkan</span> di development mode. Jalankan production build untuk menguji offline sepenuhnya.
                                    </span>
                                </div>
                            )}

                            {/* Service Worker */}
                            {!state.isDevMode && (
                                <CheckItem
                                    icon={<CloudOff size={13} />}
                                    label="Service Worker"
                                    ok={state.swStatus === "controlling" || state.swStatus === "activated"}
                                    okText={`Aktif (${state.swStatus})`}
                                    failText={
                                        state.swStatus === "none"
                                            ? "Tidak aktif — halaman belum di-cache"
                                            : `Sedang proses: ${state.swStatus}...`
                                    }
                                    inProgress={["installing", "installed", "activating"].includes(state.swStatus)}
                                />
                            )}

                            {/* Products */}
                            <CheckItem
                                icon={<Database size={13} />}
                                label="Katalog Produk"
                                ok={state.productsCount > 0}
                                okText={`${state.productsCount.toLocaleString("id-ID")} produk tersimpan lokal`}
                                failText="Belum ada data — sinkronisasi dulu saat online"
                            />

                            {/* Members */}
                            <CheckItem
                                icon={<Users size={13} />}
                                label="Data Member"
                                ok={state.membersCount > 0}
                                okText={`${state.membersCount.toLocaleString("id-ID")} member tersimpan lokal`}
                                failText="Belum ada data member lokal"
                            />
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-800/80 my-3" />

                        {/* Last Synced */}
                        <div className="flex items-center justify-between text-slate-500 text-[11px] mb-3">
                            <span>Terakhir sinkronisasi:</span>
                            <span className="text-slate-350 font-semibold">
                                {formatLastSynced(state.lastSyncedAt)}
                            </span>
                        </div>

                        {/* Manual Sync Button */}
                        {onRefreshRequest && (
                            <button
                                onClick={async () => {
                                    toast.promise(
                                        (async () => {
                                            await onRefreshRequest();
                                        })(),
                                        {
                                            loading: "Menyinkronkan katalog produk & member...",
                                            success: "Katalog berhasil disinkronisasi!",
                                            error: "Gagal menyinkronkan katalog.",
                                        }
                                    );
                                }}
                                disabled={isSyncing}
                                className={cn(
                                    "w-full flex items-center justify-center gap-1.5 font-bold transition-all cursor-pointer outline-none py-2 rounded-lg text-slate-200 border border-slate-700 bg-slate-850 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none text-xs mb-3",
                                    isSyncing && "bg-slate-800 text-slate-400 border-slate-800"
                                )}
                            >
                                <RefreshCw size={13} className={cn(isSyncing && "animate-spin")} />
                                <span>{isSyncing ? "Menyinkronkan..." : "Jalankan Sinkronisasi"}</span>
                            </button>
                        )}

                        {/* Advice */}
                        {(state.status === "partial" || state.status === "not-ready") && !state.isDevMode && (
                            <div className="mt-1 bg-amber-950/20 border border-amber-900/30 rounded-lg px-3 py-2 text-amber-300/90 text-[11px] leading-snug flex flex-col gap-2">
                                <div className="flex items-start gap-1.5">
                                    <Lightbulb size={14} className="text-amber-400 shrink-0 mt-0.5" />
                                    <span>Pastikan terhubung ke internet dan buka halaman checkout agar sistem dapat mengunduh data untuk offline.</span>
                                </div>
                            </div>
                        )}

                        {state.status === "ready" && (
                            <div className="mt-1 bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-3 py-2 text-emerald-300/90 text-[11px] leading-snug flex items-start gap-1.5">
                                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                <span>Sistem siap digunakan secara offline. Transaksi akan disimpan lokal dan disinkronisasi otomatis saat kembali online.</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function CheckItem({
    icon,
    label,
    ok,
    okText,
    failText,
    inProgress = false,
}: {
    icon: React.ReactNode;
    label: string;
    ok: boolean;
    okText: string;
    failText: string;
    inProgress?: boolean;
}) {
    const colorClass = ok
        ? "text-emerald-400"
        : inProgress
            ? "text-amber-400"
            : "text-rose-400";

    return (
        <div className="flex items-start gap-2.5 bg-slate-950/30 border border-slate-800/40 p-2 rounded-lg">
            <span className={cn("mt-0.5 shrink-0 p-1 bg-slate-900 rounded-md border border-slate-800", colorClass)}>{icon}</span>
            <div className="flex-1 min-w-0">
                <div
                    className={cn(
                        "font-semibold text-slate-350",
                        ok ? "text-slate-200" : "text-slate-400"
                    )}
                >
                    {label}
                </div>
                <div className={cn("text-[10px] leading-snug mt-0.5", colorClass + "/80")}>
                    {ok ? okText : failText}
                </div>
            </div>
            <span className="shrink-0 mt-0.5">
                {ok ? (
                    <CheckCircle2 size={15} className="text-emerald-400" />
                ) : inProgress ? (
                    <Loader2 size={15} className="text-amber-400 animate-spin" />
                ) : (
                    <XCircle size={15} className="text-rose-400" />
                )}
            </span>
        </div>
    );
}
