"use client";

import React from "react";
import { useLicenseCountdown } from "../hooks/use-license-countdown";
import { cn } from "@/lib/utils";

interface LicenseHeroCountdownProps {
    expiresAt: string | null | undefined;
    className?: string;
}

/**
 * Komponen animasi countdown realtime untuk Hero Card saat lisensi
 * berada di hari terakhir (< 24 jam tersisa).
 *
 * Menggunakan font monospace Geist Mono dengan tabular-nums dan animasi denyut
 * pemisah detik agar tipografi angka terlihat proporsional, presisi, dan stabil.
 */
export function LicenseHeroCountdown({ expiresAt, className }: LicenseHeroCountdownProps) {
    const { hours, minutes, seconds, isCountdownFinished } = useLicenseCountdown(expiresAt);

    if (isCountdownFinished) {
        return (
            <span className="text-rose-600 font-black">
                Masa berlaku langganan telah berakhir
            </span>
        );
    }

    return (
        <span className={cn("inline-flex items-center gap-1.5", className)}>
            <span className="text-xs sm:text-[13px] font-bold text-slate-700 dark:text-slate-200">
                Berakhir dalam
            </span>

            {/* Monospace Tabular Digits with Pulsing Colons (Clean typography without badge) */}
            <strong className="font-mono font-black text-xs sm:text-[13px] text-rose-600 dark:text-rose-400 tracking-wider tabular-nums">
                <span>{hours}</span>
                <span className="text-rose-400/80 dark:text-rose-500/70 animate-pulse font-bold mx-0.5">:</span>
                <span>{minutes}</span>
                <span className="text-rose-400/80 dark:text-rose-500/70 animate-pulse font-bold mx-0.5">:</span>
                <span>{seconds}</span>
            </strong>
        </span>
    );
}
