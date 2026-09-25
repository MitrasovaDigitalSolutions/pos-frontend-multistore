"use client";

import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useLicenseStatusQuery } from "../api/license-api";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getLicenseTimeMetrics } from "../utils/license-time";

export function LicenseBanner() {
    const { data: license } = useLicenseStatusQuery();
    const [dismissed, setDismissed] = useState(false);

    if (!license || dismissed) return null;

    const timeMetrics = getLicenseTimeMetrics(license);

    // Active license with plenty of days remaining (>30 days) — show nothing
    if (license.can_operate && license.status === "active" && timeMetrics.urgencyLevel === "healthy") {
        return null;
    }

    // Grace period — rose critical warning banner
    if (license.is_grace_period && license.can_operate) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs relative">
                <IconAlertTriangle size={14} className="shrink-0 text-rose-600" />
                <span className="flex-1">
                    <span className="font-bold">Masa tenggang langganan aktif.</span>{" "}
                    {license.grace_days_remaining > 0 && (
                        <>{license.grace_days_remaining} hari tersisa sebelum akses operasional dibatasi. </>
                    )}
                    <Link
                        href={ROUTES.LICENSE}
                        className="underline font-bold hover:text-rose-900 ml-1"
                    >
                        Perbarui langganan sekarang →
                    </Link>
                </span>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-0.5 rounded hover:bg-rose-200/60 transition-colors cursor-pointer"
                    aria-label="Tutup"
                >
                    <IconX size={12} />
                </button>
            </div>
        );
    }

    // Expiring soon (≤30 days or last day) — dynamic amber/rose warning banner
    if (license.can_operate && license.status === "active" && (timeMetrics.urgencyLevel === "warning" || timeMetrics.urgencyLevel === "critical")) {
        const isCritical = timeMetrics.urgencyLevel === "critical";
        return (
            <div className={cn(
                "flex items-center gap-2 px-4 py-2 border-b text-xs relative",
                isCritical
                    ? "bg-rose-50 border-rose-200 text-rose-800"
                    : "bg-amber-50 border-amber-100 text-amber-700"
            )}>
                <IconAlertTriangle size={14} className={cn("shrink-0", isCritical ? "text-rose-600" : "text-amber-600")} />
                <span className="flex-1">
                    <span className="font-bold">
                        {timeMetrics.isLastDay
                            ? "Masa aktif paket langganan berakhir hari ini (tersisa < 24 jam)."
                            : `Masa aktif paket langganan berakhir dalam ${timeMetrics.effectiveDays} hari.`}
                    </span>{" "}
                    <Link
                        href={ROUTES.LICENSE}
                        className={cn("underline font-bold ml-1", isCritical ? "hover:text-rose-950" : "hover:text-amber-900")}
                    >
                        Kelola Langganan →
                    </Link>
                </span>
                <button
                    onClick={() => setDismissed(true)}
                    className={cn(
                        "p-0.5 rounded transition-colors cursor-pointer",
                        isCritical ? "hover:bg-rose-200/60" : "hover:bg-amber-200/60"
                    )}
                    aria-label="Tutup"
                >
                    <IconX size={12} />
                </button>
            </div>
        );
    }

    // Expired / suspended but still loaded (shouldn't normally happen since login gate blocks) — rose blocking banner
    if (!license.can_operate) {
        return (
            <div className="flex items-center gap-3 px-4 py-3 bg-rose-600 text-white text-xs">
                <IconAlertTriangle size={15} className="shrink-0" />
                <span className="flex-1 font-medium">
                    Masa berlaku langganan telah berakhir. Akses operasional kasir dibatasi.{" "}
                    <Link
                        href={ROUTES.LICENSE}
                        className="underline font-bold hover:text-rose-200 ml-1"
                    >
                        Aktivasi atau perbarui langganan →
                    </Link>
                </span>
            </div>
        );
    }

    return null;
}
