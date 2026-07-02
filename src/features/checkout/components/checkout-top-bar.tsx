"use client";

import { Button } from "@/components/ui/button";
import { OfflineReadinessBadge } from "@/features/checkout/components/offline-readiness-badge";
import type { OfflineReadinessState } from "@/hooks/use-offline-readiness";
import { getImageUrl } from "@/lib/utils";
import { useSettingsStore } from "@/stores/settings-store";
import { IconCash, IconHome, IconLogout, IconScan, IconWifi } from "@tabler/icons-react";

interface CheckoutTopBarProps {
    transactionId: string | null;
    activeDrawerSession: { uid: string } | null | undefined;
    hasAccessAdmin: boolean;
    onInfoSesiClick: () => void;
    onLogout: () => void;
    onDashboardClick: () => void;
    isOnline?: boolean;
    pendingCount?: number;
    isSyncing?: boolean;
    onSyncClick?: () => void;
    offlineReadiness?: OfflineReadinessState;
    onCatalogSyncRequest?: () => void;
    isCatalogSyncing?: boolean;
}

export function CheckoutTopBar({
    transactionId,
    activeDrawerSession,
    hasAccessAdmin,
    onInfoSesiClick,
    onLogout,
    onDashboardClick,
    isOnline = true,
    pendingCount = 0,
    isSyncing = false,
    onSyncClick,
    offlineReadiness,
    onCatalogSyncRequest,
    isCatalogSyncing = false,
}: CheckoutTopBarProps) {
    const getSetting = useSettingsStore((state) => state.getSetting);
    const appName = getSetting("app_name", "Mitrasova POS");
    const appLogoRaw = getSetting("app_logo_url", "");
    const appLogo = getImageUrl(appLogoRaw);

    return (
        <div className="bg-slate-900 text-white h-10 px-3 sm:px-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {appLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={appLogo} alt={appName} className="h-6 w-auto shrink-0 rounded" />
                ) : (
                    <IconScan size={20} className="text-emerald-400 shrink-0" />
                )}
                <span className="font-bold text-[12px] tracking-wide truncate max-w-28 sm:max-w-none shrink-0">
                    <span className="hidden sm:inline">{appName} — Cashier Terminal</span>
                    <span className="inline sm:hidden">{appName.substring(0, 8)} POS</span>
                </span>
                {transactionId && (
                    <span className="bg-emerald-700 text-emerald-100 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider shrink-0">
                        TRX #{transactionId}
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <Button
                    variant="ghost"
                    onClick={onInfoSesiClick}
                    disabled={!activeDrawerSession}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-350 hover:bg-emerald-950/20 h-7 px-2 sm:px-2.5 rounded-md flex items-center gap-1.5 cursor-pointer bg-transparent border-none disabled:opacity-40 transition-colors"
                >
                    <IconCash size={15} />
                    <span className="hidden sm:inline">Info Laci Kasir</span>
                </Button>
                <div className="w-px h-4 bg-slate-800" />

                {hasAccessAdmin && (
                    <>
                        <Button
                            variant="ghost"
                            onClick={onDashboardClick}
                            className="text-[11px] font-bold text-slate-300 hover:text-white hover:bg-slate-800 h-7 px-2 sm:px-2.5 rounded-md flex items-center gap-1.5 cursor-pointer bg-transparent border-none transition-colors"
                        >
                            <IconHome size={15} />
                            <span className="hidden sm:inline">Admin</span>
                        </Button>
                        <div className="w-px h-4 bg-slate-800" />
                    </>
                )}

                <Button
                    variant="ghost"
                    onClick={onLogout}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 h-7 px-2 sm:px-2.5 rounded-md flex items-center gap-1.5 cursor-pointer bg-transparent border-none transition-colors"
                >
                    <IconLogout size={15} />
                    <span className="hidden sm:inline">Logout</span>
                </Button>
            </div>

            <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-400">
                {/* Offline Readiness Badge */}
                {offlineReadiness && (
                    <OfflineReadinessBadge
                        state={offlineReadiness}
                        onRefreshRequest={onCatalogSyncRequest}
                        isSyncing={isCatalogSyncing}
                    />
                )}

                <div className="w-px h-4 bg-slate-800" />

                {/* Network / Sync Status */}
                {!isOnline ? (
                    <button
                        onClick={onSyncClick}
                        className="flex items-center gap-1.5 text-rose-500 hover:text-rose-400 px-2 py-1 rounded-lg transition-all cursor-pointer font-bold outline-none border-none bg-transparent"
                    >
                        <IconWifi size={16} className="opacity-60" />
                        <span>Offline {pendingCount > 0 ? `(${pendingCount} pending)` : "(Ready)"}</span>
                    </button>
                ) : pendingCount > 0 ? (
                    <button
                        onClick={onSyncClick}
                        disabled={isSyncing}
                        className="flex items-center gap-1.5 text-amber-500 border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer font-bold disabled:opacity-60 outline-none"
                    >
                        <IconWifi size={16} className={isSyncing ? "animate-spin" : ""} />
                        <span>Sinkronisasi {pendingCount} Transaksi</span>
                    </button>
                ) : (
                    <button
                        onClick={onSyncClick}
                        className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded-lg transition-all cursor-pointer font-bold outline-none border-none bg-transparent"
                    >
                        <IconWifi size={16} />
                        <span>Online</span>
                    </button>
                )}
                <div className="w-px h-4 bg-slate-800" />
                <div>Terminal: POS-01</div>
            </div>
        </div>
    );
}
