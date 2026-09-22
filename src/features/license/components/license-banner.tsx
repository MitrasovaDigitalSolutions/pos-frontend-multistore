"use client";

import { IconAlertTriangle, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { useLicenseStatusQuery } from "../api/license-api";
import { useState } from "react";

export function LicenseBanner() {
    const { data: license } = useLicenseStatusQuery();
    const [dismissed, setDismissed] = useState(false);

    if (!license || dismissed) return null;

    // Active license with plenty of days remaining — show nothing
    if (license.can_operate && license.status === "active" && (license.days_remaining === null || license.days_remaining > 30)) {
        return null;
    }

    // Grace period — amber warning banner
    if (license.is_grace_period && license.can_operate) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs relative">
                <IconAlertTriangle size={14} className="shrink-0 text-amber-600" />
                <span className="flex-1">
                    <span className="font-bold">Masa tenggang paket langganan sedang berjalan.</span>{" "}
                    {license.grace_days_remaining > 0 && (
                        <>{license.grace_days_remaining} hari tersisa sebelum akses ditangguhkan. </>
                    )}
                    <Link
                        href={ROUTES.ADMIN_LICENSE}
                        className="underline font-bold hover:text-amber-900 ml-1"
                    >
                        Perpanjang paket sekarang →
                    </Link>
                </span>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-0.5 rounded hover:bg-amber-200/60 transition-colors cursor-pointer"
                    aria-label="Tutup"
                >
                    <IconX size={12} />
                </button>
            </div>
        );
    }

    // Expiring soon (≤30 days) — softer amber
    if (license.status === "active" && license.days_remaining !== null && license.days_remaining <= 30) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs relative">
                <IconAlertTriangle size={14} className="shrink-0 text-amber-600" />
                <span className="flex-1">
                    <span className="font-bold">Masa aktif paket langganan akan berakhir dalam {license.days_remaining} hari.</span>{" "}
                    <Link
                        href={ROUTES.ADMIN_LICENSE}
                        className="underline font-bold hover:text-amber-900 ml-1"
                    >
                        Kelola langganan →
                    </Link>
                </span>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-0.5 rounded hover:bg-amber-200/60 transition-colors cursor-pointer"
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
                    Paket langganan tidak aktif. Operasional toko dibatasi.{" "}
                    <Link
                        href={ROUTES.ADMIN_LICENSE}
                        className="underline font-bold hover:text-rose-200 ml-1"
                    >
                        Aktivasi paket langganan →
                    </Link>
                </span>
            </div>
        );
    }

    return null;
}
