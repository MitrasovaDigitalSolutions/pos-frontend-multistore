"use client";

import React, { useState } from "react";
import {
    IconShieldCheck,
    IconShieldOff,
    IconShield,
    IconCode,
    IconLoader2,
    IconCloudOff,
    IconDatabase,
    IconUsers,
    IconRefresh,
    IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { OfflineReadinessState, OfflineReadinessStatus } from "@/hooks/use-offline-readiness";
import { Button } from "@/components/ui/button";

interface OfflineReadinessBadgeProps {
    state: OfflineReadinessState;
    onRefreshRequest?: () => void;
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
                icon: <IconLoader2 size={13} className="animate-spin" />,
                label: "Memeriksa...",
                badgeClass: "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                dotClass: "bg-slate-500 hover:bg-slate-200",
                pulse: false,
            };
        case "ready":
            return {
                icon: <IconShieldCheck size={13} />,
                label: "Offline Siap",
                badgeClass: "text-emerald-400 hover:bg-emerald-700 hover:text-emerald-200",
                dotClass: "bg-emerald-400 hover:bg-emerald-200",
                pulse: false,
            };
        case "partial":
            return {
                icon: <IconShield size={13} />,
                label: "Offline Parsial",
                badgeClass: "text-amber-400 hover:bg-amber-700 hover:text-amber-200",
                dotClass: "bg-amber-400 hover:bg-amber-200",
                pulse: true,
            };
        case "not-ready":
            return {
                icon: <IconShieldOff size={13} />,
                label: "Offline Belum Siap",
                badgeClass: "text-rose-400 hover:bg-rose-700 hover:text-rose-200",
                dotClass: "bg-rose-500 hover:bg-rose-200",
                pulse: true,
            };
        case "dev-mode":
            return {
                icon: <IconCode size={13} />,
                label: "Dev Mode",
                badgeClass: "text-slate-500 hover:bg-slate-600 hover:text-slate-200",
                dotClass: "bg-slate-600 hover:bg-slate-200",
                pulse: false,
            };
    }
}

function formatLastSynced(iso: string | null): string {
    if (!iso) return "Belum pernah";
    try {
        const date = new Date(iso);
        return date.toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "Tidak diketahui";
    }
}

export function OfflineReadinessBadge({
    state,
    onRefreshRequest,
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
                    "font-semibold text-[11px] h-7 cursor-pointer",
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
                    <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 p-4 text-xs">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-slate-200 text-[13px]">
                                Status Offline Mode
                            </span>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-500 hover:text-slate-300 transition-colors outline-none cursor-pointer"
                            >
                                <IconX size={14} />
                            </button>
                        </div>

                        {/* Status Items */}
                        <div className="space-y-2.5">
                            {/* Dev Mode Notice */}
                            {state.isDevMode && (
                                <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 text-[11px] leading-snug">
                                    ⚠️ Service Worker <span className="text-amber-400 font-semibold">dinonaktifkan</span> di development mode. Jalankan production build untuk menguji offline sepenuhnya.
                                </div>
                            )}

                            {/* Service Worker */}
                            {!state.isDevMode && (
                                <CheckItem
                                    icon={<IconCloudOff size={13} />}
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
                                icon={<IconDatabase size={13} />}
                                label="Katalog Produk"
                                ok={state.productsCount > 0}
                                okText={`${state.productsCount.toLocaleString("id-ID")} produk tersimpan lokal`}
                                failText="Belum ada data — sinkronisasi dulu saat online"
                            />

                            {/* Members */}
                            <CheckItem
                                icon={<IconUsers size={13} />}
                                label="Data Member"
                                ok={state.membersCount > 0}
                                okText={`${state.membersCount.toLocaleString("id-ID")} member tersimpan lokal`}
                                failText="Belum ada data member lokal"
                            />
                        </div>

                        {/* Divider */}
                        <div className="border-t border-slate-800 my-3" />

                        {/* Last Synced */}
                        <div className="flex items-center justify-between text-slate-500">
                            <span>Terakhir sinkronisasi:</span>
                            <span className="text-slate-300 font-medium">
                                {formatLastSynced(state.lastSyncedAt)}
                            </span>
                        </div>

                        {/* Advice */}
                        {(state.status === "partial" || state.status === "not-ready") && !state.isDevMode && (
                            <div className="mt-3 bg-amber-950/30 border border-amber-800/40 rounded-lg px-3 py-2 text-amber-300/90 text-[11px] leading-snug">
                                💡 Pastikan terhubung ke internet dan buka halaman checkout agar sistem dapat mengunduh data untuk offline.
                                {onRefreshRequest && (
                                    <button
                                        onClick={() => {
                                            onRefreshRequest();
                                            setIsOpen(false);
                                        }}
                                        className="mt-2 flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer outline-none"
                                    >
                                        <IconRefresh size={12} />
                                        Sinkronisasi Sekarang
                                    </button>
                                )}
                            </div>
                        )}

                        {state.status === "ready" && (
                            <div className="mt-3 bg-emerald-950/30 border border-emerald-800/40 rounded-lg px-3 py-2 text-emerald-300/90 text-[11px] leading-snug">
                                ✅ Sistem siap digunakan secara offline. Transaksi akan disimpan lokal dan disinkronisasi otomatis saat kembali online.
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
        <div className="flex items-start gap-2.5">
            <span className={cn("mt-0.5 shrink-0", colorClass)}>{icon}</span>
            <div className="flex-1 min-w-0">
                <div
                    className={cn(
                        "font-semibold",
                        ok ? "text-slate-200" : "text-slate-400"
                    )}
                >
                    {label}
                </div>
                <div className={cn("text-[11px] leading-snug", colorClass + "/80")}>
                    {ok ? okText : failText}
                </div>
            </div>
            <span className="shrink-0 mt-0.5 text-base">
                {ok ? "✅" : inProgress ? "⏳" : "❌"}
            </span>
        </div>
    );
}
