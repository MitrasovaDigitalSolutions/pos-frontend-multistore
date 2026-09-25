"use client";

import {
    IconAlertTriangle,
    IconCalendarOff,
    IconClock,
    IconRefresh,
    IconShieldCheck,
    IconShieldOff,
    IconShieldX,
    IconSparkles,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import type { LicenseStatus } from "../types";
import { getLicenseTimeMetrics } from "../utils/license-time";
import {
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

    // Precise dynamic metrics for remaining time and thresholds
    const timeMetrics = getLicenseTimeMetrics(data);
    const { isExpired, isLastDay, effectiveDays, progressPercent, urgencyLevel } = timeMetrics;

    const isCritical = urgencyLevel === "critical" || urgencyLevel === "expired" || isSuspended || isGrace;
    const isWarning = urgencyLevel === "warning" && !isCritical;

    const barGradient = isCritical
        ? "bg-gradient-to-r from-rose-500 to-red-500"
        : isWarning
            ? "bg-gradient-to-r from-amber-400 to-yellow-400"
            : "bg-gradient-to-r from-emerald-500 to-teal-500";

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
        <div className="relative w-full rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all duration-200 hover:shadow-xs">
            {/* Subtle background ambient tint based on health state */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className={cn(
                        "absolute -top-16 -right-16 w-60 h-60 rounded-full blur-2xl opacity-15",
                        isCritical
                            ? "bg-rose-200"
                            : isWarning
                                ? "bg-yellow-200/70"
                                : "bg-emerald-100"
                    )}
                />
            </div>

            <div className="relative z-10 p-4 sm:p-5 space-y-4">
                {/* Header row: Icon + Plan Name + Status Badge + Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs",
                                isActive
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                    : isGrace || isExpired || isSuspended
                                        ? "bg-rose-50 border-rose-100 text-rose-600"
                                        : "bg-slate-100 border-slate-200 text-slate-500"
                            )}
                        >
                            {isActive ? (
                                <IconShieldCheck size={22} />
                            ) : isGrace ? (
                                <IconClock size={22} />
                            ) : isExpired ? (
                                <IconCalendarOff size={22} />
                            ) : isSuspended ? (
                                <IconShieldX size={22} />
                            ) : (
                                <IconShieldOff size={22} />
                            )}
                        </div>

                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                                    POS Multi-Store
                                </h2>
                                {/* Subscription Plan Badge */}
                                {data.subscription_type && (
                                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide shrink-0 bg-blue-50 text-blue-700 border-blue-200/80">
                                        <IconSparkles size={11} className="text-blue-500" />
                                        <span>
                                            {SUBSCRIPTION_TYPE_LABELS[data.subscription_type] ?? data.subscription_type}
                                        </span>
                                    </div>
                                )}
                                {/* Status Badge */}
                                <div
                                    className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold tracking-wide shrink-0",
                                        isActive
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                            : isGrace || isExpired || isSuspended
                                                ? "bg-rose-50 text-rose-700 border-rose-200/80"
                                                : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                >
                                    {isActive && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    )}
                                    {isGrace && <IconAlertTriangle size={11} className="text-rose-600" />}
                                    {(isExpired || isSuspended) && <IconShieldX size={11} className="text-rose-600" />}
                                    {LICENSE_STATUS_LABELS[data.status] ?? data.status}
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium truncate">
                                {data.instance_name ? (
                                    <span className="font-semibold text-slate-700">{data.instance_name}</span>
                                ) : (
                                    "Cloud POS Multi-Store"
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Quick CTA Buttons with clean color transitions */}
                    <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                        {(isExpired || !data.can_operate || isLastDay || effectiveDays <= 3) && !isSuspended && !isNotActivated && (
                            <button
                                type="button"
                                onClick={onRenewClick}
                                className="h-8 sm:h-9 px-3.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors duration-150"
                            >
                                <IconRefresh size={14} className="stroke-[2.2]" />
                                <span>Perbarui Langganan</span>
                            </button>
                        )}
                        {isNotActivated && (
                            <button
                                type="button"
                                onClick={onActivateClick}
                                className="h-8 sm:h-9 px-3.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors duration-150"
                            >
                                <IconSparkles size={14} />
                                <span>Aktivasi License Key</span>
                            </button>
                        )}
                        {isActive && (
                            <button
                                type="button"
                                onClick={onActivateClick}
                                className="h-8 sm:h-9 px-3 rounded-xl text-xs font-bold border border-slate-200/90 bg-slate-50/60 hover:bg-slate-100 active:bg-slate-200 text-slate-700 cursor-pointer transition-colors duration-150"
                            >
                                Ganti License Key
                            </button>
                        )}
                    </div>
                </div>

                {/* Google One Signature: Compact Animated Quota Progress Meter with Dynamic Color Shifts */}
                {(data.days_remaining !== null || data.expires_at !== null) && (
                    <div
                        className={cn(
                            "space-y-1.5 rounded-xl border p-3 transition-colors duration-300",
                            isCritical
                                ? "bg-rose-50/60 border-rose-200/80"
                                : isWarning
                                    ? "bg-amber-50/60 border-amber-200/80"
                                    : "bg-slate-50/70 border-slate-200/60"
                        )}
                    >
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[11px] sm:text-xs">
                                <IconClock
                                    size={13}
                                    className={cn("shrink-0", meterIconColor)}
                                />
                                <span>
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
                                                        "ml-1.5 text-[10px] font-black px-1.5 py-0.2 rounded-full",
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
                                <span className="text-[11px] text-slate-500 font-medium">
                                    Jatuh Tempo: <strong className="text-slate-800 font-semibold">{formattedExpiry}</strong>
                                </span>
                            )}
                        </div>

                        {/* Animated Progress Meter Bar with Dynamic State Colors */}
                        <div className="h-2 w-full bg-slate-200/60 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className={cn("h-full rounded-full transition-all duration-300", barGradient)}
                            />
                        </div>

                        {/* Grace period callout */}
                        {isGrace && data.grace_days_remaining > 0 && (
                            <p className="text-[10px] font-bold text-rose-700 pt-0.5 flex items-center gap-1">
                                <IconAlertTriangle size={12} className="shrink-0" />
                                <span>Masa tenggang: Tersisa {data.grace_days_remaining} hari sebelum akses operasional dibatasi.</span>
                            </p>
                        )}
                    </div>
                )}

                {/* Metadata Row: License Key Only */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    {/* License Key Masked Chip (Password-style dots with peek toggle & copy) */}
                    <LicenseKeyMaskedChip
                        licenseKey={data.license_key}
                        variant="hero"
                    />

                    {/* Suspended Notice */}
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
