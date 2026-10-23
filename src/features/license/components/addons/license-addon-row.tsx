"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCheck, IconLock } from "@tabler/icons-react";
import { LicenseAddonExpiryTime } from "../license-addon-expiry-time";
import type { PurchasedAddonItem } from "../../types";
import { cn } from "@/lib/utils";

interface LicenseAddonRowProps {
    addon: PurchasedAddonItem;
    isOperable: boolean;
    isProrateLoading: boolean;
    fallbackExpiresAt?: string | null;
    fallbackDaysRemaining?: number | null;
}

export function LicenseAddonRow({
    addon,
    isOperable,
    isProrateLoading,
    fallbackExpiresAt,
    fallbackDaysRemaining,
}: LicenseAddonRowProps) {
    return (
        <div
            className={cn(
                "p-3.5 sm:px-4 sm:py-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                isOperable
                    ? "hover:bg-slate-50/60"
                    : "bg-slate-50/35 hover:bg-rose-50/20",
            )}
        >
            {/* Left: Icon + Title + Description + Akses Menu */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
                <div
                    className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border shadow-2xs",
                        isOperable
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-500 border-rose-200/80",
                    )}
                >
                    {isOperable ? (
                        <IconCheck size={16} strokeWidth={2.5} />
                    ) : (
                        <IconLock size={15} strokeWidth={2} />
                    )}
                </div>
                <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4
                            className={cn(
                                "text-xs font-bold tracking-tight",
                                isOperable ? "text-slate-900" : "text-slate-700",
                            )}
                        >
                            {addon.nama}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60 font-semibold uppercase">
                            {addon.code}
                        </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                        {addon.description}
                    </p>

                    {/* Akses Menu */}
                    {addon.menuPaths.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                Akses Menu:
                            </span>
                            {addon.menuPaths.map((path) => (
                                <span
                                    key={path}
                                    className={cn(
                                        "px-2 py-0.5 rounded-md text-[10px] font-medium shadow-2xs border flex items-center gap-1",
                                        isOperable
                                            ? "bg-slate-100 border-slate-200/80 text-slate-700"
                                            : "bg-slate-100/70 border-slate-200/60 text-slate-400 line-through decoration-rose-400/60",
                                    )}
                                >
                                    {!isOperable && <IconLock size={10} className="text-rose-400" />}
                                    <span>{path}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Dynamic Status Badge & Masa Berlaku / Realtime Countdown */}
            <div className="shrink-0 sm:self-center pl-11 sm:pl-0 flex flex-col sm:items-end gap-1.5">
                <div className="flex items-center gap-2">
                    {isOperable ? (
                        <Badge
                            variant="outline"
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200/90 uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Aktif</span>
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border-rose-200 uppercase tracking-wider flex items-center gap-1 shadow-2xs"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Tidak Aktif</span>
                        </Badge>
                    )}
                </div>

                {/* Masa Berlaku / Realtime Countdown */}
                {isProrateLoading ? (
                    <div className="flex flex-col sm:items-end gap-1 py-0.5">
                        <Skeleton className="h-3 w-24 rounded bg-slate-200/80" />
                        <Skeleton className="h-2.5 w-16 rounded bg-slate-100" />
                    </div>
                ) : (
                    <LicenseAddonExpiryTime
                        expiresAt={addon.expires_at ?? fallbackExpiresAt}
                        daysRemaining={addon.days_remaining ?? fallbackDaysRemaining}
                        isOperable={isOperable}
                    />
                )}
            </div>
        </div>
    );
}
