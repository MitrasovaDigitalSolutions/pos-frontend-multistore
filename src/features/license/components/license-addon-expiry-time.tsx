"use client";

import React from "react";
import { IconClock, IconSparkles } from "@tabler/icons-react";
import { useLicenseCountdown } from "../hooks/use-license-countdown";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface LicenseAddonExpiryTimeProps {
    expiresAt: string | null | undefined;
    daysRemaining?: number | null;
    isOperable?: boolean;
    className?: string;
}

/**
 * Komponen penampil masa berlaku add-on aktif.
 * Jika sisa waktu < 24 jam, otomatis beralih ke mode countdown interaktif
 * (HH:MM:SS) yang berdetak setiap detik seperti countdown di Hero lisensi.
 */
export function LicenseAddonExpiryTime({
    expiresAt,
    daysRemaining,
    isOperable = true,
    className,
}: LicenseAddonExpiryTimeProps) {
    // Lisensi tidak aktif / ditangguhkan
    if (!isOperable) {
        return (
            <div className={cn("flex items-center gap-1 text-[11px] font-semibold text-rose-600", className)}>
                <IconClock size={12} className="text-rose-500 shrink-0" />
                <span>Masa aktif berakhir</span>
            </div>
        );
    }

    // Lisensi tanpa batas / seumur hidup
    if (!expiresAt) {
        return (
            <div className={cn("flex items-center gap-1 text-[11px] font-semibold text-emerald-700", className)}>
                <IconSparkles size={12} className="text-emerald-500 shrink-0" />
                <span>Permanen (Aktif)</span>
            </div>
        );
    }

    const now = Date.now();
    const expiryTime = new Date(expiresAt).getTime();
    const diffMs = expiryTime - now;

    // Sudah lewat batas waktu
    if (diffMs <= 0 || Number.isNaN(diffMs)) {
        return (
            <div className={cn("flex items-center gap-1 text-[11px] font-semibold text-rose-600", className)}>
                <IconClock size={12} className="text-rose-500 shrink-0" />
                <span>Masa aktif berakhir</span>
            </div>
        );
    }

    // Kurang dari 24 jam (< 24 jam) -> Render Countdown realtime
    if (diffMs <= 24 * 60 * 60 * 1000) {
        return <LicenseAddonCountdown expiresAt={expiresAt} className={className} />;
    }

    // Normal: Sisa >= 1 hari (lebih dari 24 jam)
    const calendarDaysCeil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const effectiveDays = daysRemaining ?? calendarDaysCeil;
    const isWarning = effectiveDays <= 3;
    const formattedExpiry = formatDate(expiresAt, "d MMM yyyy");

    return (
        <div className={cn("flex flex-col sm:items-end text-[11px] space-y-0.5", className)}>
            <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400 font-medium">Masa aktif:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                    <IconClock
                        size={12}
                        className={isWarning ? "text-amber-500 shrink-0" : "text-emerald-500 shrink-0"}
                    />
                    <strong className={isWarning ? "text-amber-700 font-extrabold font-mono" : "text-slate-900 font-bold font-mono"}>
                        {effectiveDays} hari
                    </strong>
                </span>
                {isWarning && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full text-amber-800 bg-amber-100 border border-amber-200 leading-none">
                        Segera Berakhir
                    </span>
                )}
            </div>
            {formattedExpiry && (
                <span className="text-[10px] text-slate-400 font-medium">
                    Jatuh tempo: <strong className="text-slate-600 font-semibold">{formattedExpiry}</strong>
                </span>
            )}
        </div>
    );
}

/**
 * Sub-komponen countdown realtime detik per detik saat < 24 jam.
 */
function LicenseAddonCountdown({
    expiresAt,
    className,
}: {
    expiresAt: string;
    className?: string;
}) {
    const { hours, minutes, seconds, isCountdownFinished } = useLicenseCountdown(expiresAt);

    if (isCountdownFinished) {
        return (
            <div className={cn("flex items-center gap-1 text-[11px] font-semibold text-rose-600", className)}>
                <IconClock size={12} className="text-rose-500 shrink-0" />
                <span>Masa aktif berakhir</span>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/90 px-2 py-0.5 rounded-lg shadow-2xs",
                className,
            )}
        >
            <IconClock size={12} className="text-rose-500 shrink-0 animate-pulse" />
            <span className="text-[10px] font-bold text-rose-700">Berakhir dalam:</span>
            <strong className="font-mono font-black text-xs text-rose-600 tracking-wider tabular-nums">
                <span>{hours}</span>
                <span className="text-rose-400/80 animate-pulse font-bold mx-0.5">:</span>
                <span>{minutes}</span>
                <span className="text-rose-400/80 animate-pulse font-bold mx-0.5">:</span>
                <span>{seconds}</span>
            </strong>
        </div>
    );
}
