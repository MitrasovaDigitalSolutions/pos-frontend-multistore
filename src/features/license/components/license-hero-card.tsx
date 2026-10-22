"use client";

import {
    IconAlertTriangle,
    IconBuildingStore,
    IconCalendarOff,
    IconClock,
    IconRefresh,
    IconShieldCheck,
    IconShieldOff,
    IconShieldX,
    IconSparkles,
} from "@tabler/icons-react";
import type { LicenseStatus } from "../types";
import { getLicenseTimeMetrics } from "../utils/license-time";
import {
    BUSINESS_PRESET_SHORT_LABELS,
    LICENSE_STATUS_LABELS,
    SUBSCRIPTION_TYPE_LABELS,
} from "../constants/license-constants";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { LicenseKeyMaskedChip } from "./license-key-masked-chip";
import { LicenseHeroCountdown } from "./license-hero-countdown";

interface LicenseHeroCardProps {
    data: LicenseStatus;
    onRenewClick: () => void;
    onActivateClick: () => void;
}

/**
 * High-performance, lightweight License Hero summary card.
 * Avoids heavy GPU filter blurs for ultra-smooth rendering on low-spec devices.
 */
export function LicenseHeroCard({
    data,
    onRenewClick,
    onActivateClick,
}: LicenseHeroCardProps) {
    const formattedExpiry = data.expires_at
        ? formatDate(data.expires_at, "d MMMM yyyy")
        : null;

    const isActive = data.status === "active";
    const isGrace = data.status === "grace_period";
    const isSuspended = data.status === "suspended";
    const isNotActivated = data.status === "not_activated";

    // Dynamic metrics for remaining time and thresholds
    const timeMetrics = getLicenseTimeMetrics(data);
    const { isExpired, isLastDay, effectiveDays, progressPercent, urgencyLevel } = timeMetrics;

    const isCritical = urgencyLevel === "critical" || urgencyLevel === "expired" || isSuspended || isGrace;
    const isWarning = urgencyLevel === "warning" && !isCritical;

    const barGradient = isCritical
        ? "bg-rose-500"
        : isWarning
            ? "bg-amber-400"
            : "bg-emerald-500";

    const meterIconColor = isCritical
        ? "text-rose-600"
        : isWarning
            ? "text-amber-500"
            : "text-emerald-600";

    const meterTextColor = isCritical
        ? "text-rose-600 font-black"
        : isWarning
            ? "text-amber-700 font-extrabold"
            : "text-slate-900 font-extrabold";

    return (
        <div
            className={cn(
                "relative w-full rounded-xl border bg-white shadow-2xs overflow-hidden transition-colors",
                isCritical
                    ? "border-rose-200"
                    : isWarning
                        ? "border-amber-200"
                        : "border-slate-200/80"
            )}
        >
            <div className="p-3.5 sm:p-4 space-y-3">
                {/* Header row: Icon + Plan Name + Status Badge + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div
                            className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs",
                                isActive
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                    : isGrace || isExpired || isSuspended
                                        ? "bg-rose-50 border-rose-100 text-rose-600"
                                        : "bg-slate-100 border-slate-200 text-slate-500"
                            )}
                        >
                            {isActive ? (
                                <IconShieldCheck size={20} />
                            ) : isGrace ? (
                                <IconClock size={20} />
                            ) : isExpired ? (
                                <IconCalendarOff size={20} />
                            ) : isSuspended ? (
                                <IconShieldX size={20} />
                            ) : (
                                <IconShieldOff size={20} />
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                                    Point of Sales
                                </h2>
                                {/* Subscription Plan Badge */}
                                {data.subscription_type && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full border text-[10px] font-bold tracking-wide shrink-0 bg-blue-50 text-blue-700 border-blue-200/80">
                                        <IconSparkles size={10} className="text-blue-500" />
                                        <span>
                                            {SUBSCRIPTION_TYPE_LABELS[data.subscription_type] ?? data.subscription_type}
                                        </span>
                                    </span>
                                )}
                                {/* Business Preset Badge */}
                                {data.business_type && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full border text-[10px] font-bold tracking-wide shrink-0 bg-indigo-50 text-indigo-700 border-indigo-200/80">
                                        <IconBuildingStore size={10} className="text-indigo-500" />
                                        <span>
                                            {BUSINESS_PRESET_SHORT_LABELS[data.business_type] ?? data.business_type}
                                        </span>
                                    </span>
                                )}
                                {/* Status Badge */}
                                <span
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.2 rounded-full border text-[10px] font-bold tracking-wide shrink-0",
                                        isActive
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                            : isGrace || isExpired || isSuspended
                                                ? "bg-rose-50 text-rose-700 border-rose-200/80"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                >
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    )}
                                    {isGrace && <IconAlertTriangle size={10} className="text-rose-600" />}
                                    {(isExpired || isSuspended) && <IconShieldX size={10} className="text-rose-600" />}
                                    {LICENSE_STATUS_LABELS[data.status] ?? data.status}
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                                {data.instance_name ? (
                                    <span className="font-semibold text-slate-700">{data.instance_name}</span>
                                ) : (
                                    "Cloud Point of Sales"
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Quick CTA Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        {(isExpired || !data.can_operate || isLastDay || effectiveDays <= 3) && !isSuspended && !isNotActivated && (
                            <button
                                type="button"
                                onClick={onRenewClick}
                                className="h-8 px-3 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                                <IconRefresh size={13} className="stroke-[2.2]" />
                                <span>Perbarui Langganan</span>
                            </button>
                        )}
                        {isNotActivated && (
                            <button
                                type="button"
                                onClick={onActivateClick}
                                className="h-8 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                                <IconSparkles size={13} />
                                <span>Aktivasi License Key</span>
                            </button>
                        )}
                        {isActive && (
                            <button
                                type="button"
                                onClick={onActivateClick}
                                className="h-8 px-3 rounded-lg text-xs font-bold border border-slate-200/90 bg-slate-50/60 hover:bg-slate-100 active:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                            >
                                Ganti License Key
                            </button>
                        )}
                    </div>
                </div>

                {/* Quota Progress Bar: Lightweight CSS width transition, zero blur rasterization */}
                {(data.days_remaining !== null || data.expires_at !== null) && (
                    <div
                        className={cn(
                            "space-y-1.5 rounded-xl border p-2.5 sm:p-3 transition-colors",
                            isCritical
                                ? "bg-rose-50/50 border-rose-200/70"
                                : isWarning
                                    ? "bg-amber-50/50 border-amber-200/70"
                                    : "bg-slate-50/70 border-slate-200/60"
                        )}
                    >
                        <div className="flex items-center justify-between text-xs gap-2">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] sm:text-xs min-w-0">
                                <IconClock
                                    size={13}
                                    className={cn("shrink-0", meterIconColor)}
                                />
                                <span className="truncate">
                                    {isExpired ? (
                                        <span className="text-rose-600 font-black">Masa berlaku langganan telah berakhir</span>
                                    ) : isLastDay ? (
                                        <LicenseHeroCountdown expiresAt={data.expires_at} />
                                    ) : (
                                        <>
                                            Tersisa{" "}
                                            <strong className={meterTextColor}>
                                                {`${effectiveDays} hari`}
                                            </strong>
                                            {(isCritical || isWarning) && (
                                                <span
                                                    className={cn(
                                                        "ml-1.5 text-[9px] font-black px-1.5 py-0.2 rounded-full",
                                                        isCritical
                                                            ? "text-rose-700 bg-rose-100/90 border border-rose-200"
                                                            : "text-amber-800 bg-amber-100/90 border border-amber-200"
                                                    )}
                                                >
                                                    Segera Berakhir
                                                </span>
                                            )}
                                        </>
                                    )}
                                </span>
                            </span>
                            {formattedExpiry && (
                                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium shrink-0">
                                    Jatuh Tempo: <strong className="text-slate-800 font-semibold">{formattedExpiry}</strong>
                                </span>
                            )}
                        </div>

                        {/* Animated Progress Meter Bar */}
                        <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                            <div
                                style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                                className={cn("h-full rounded-full transition-all duration-300", barGradient)}
                            />
                        </div>

                        {/* Grace period notice */}
                        {isGrace && data.grace_days_remaining > 0 && (
                            <p className="text-[10px] font-bold text-rose-700 pt-0.5 flex items-center gap-1">
                                <IconAlertTriangle size={11} className="shrink-0" />
                                <span>Masa tenggang: Tersisa {data.grace_days_remaining} hari sebelum akses kasir dibatasi.</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Metadata Row: Masked License Key */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <LicenseKeyMaskedChip
                        licenseKey={data.license_key}
                        variant="hero"
                    />

                    {isSuspended && (
                        <div className="w-full p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center justify-between">
                            <span>Akses aplikasi saat ini ditangguhkan oleh server pusat.</span>
                            <a
                                href="mailto:support@mitrasovapos.my.id"
                                className="underline hover:text-rose-900 font-extrabold"
                            >
                                Hubungi Dukungan →
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
