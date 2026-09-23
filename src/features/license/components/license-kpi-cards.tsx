"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    IconCalendar,
    IconClock,
    IconCopy,
    IconKey,
    IconLayersLinked,
    IconPackage,
} from "@tabler/icons-react";
import type { LicenseStatus } from "../types";
import {
    LICENSE_STATUS_LABELS,
    SUBSCRIPTION_TYPE_LABELS,
} from "../constants/license-constants";
import { formatDate } from "@/lib/date-utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LicenseKpiCardsProps {
    data: LicenseStatus;
}

const STATUS_BADGE_CLASS: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    grace_period: "bg-amber-50 text-amber-700 border-amber-200/80",
    expired: "bg-rose-50 text-rose-700 border-rose-200/80",
    suspended: "bg-rose-50 text-rose-700 border-rose-200/80",
    not_activated: "bg-slate-50 text-slate-600 border-slate-200/80",
};

export function LicenseKpiCards({ data }: LicenseKpiCardsProps) {
    const [copied, setCopied] = useState(false);

    const formattedExpiry = data.expires_at
        ? formatDate(data.expires_at, "d MMM yyyy") || "-"
        : "Tanpa Batas Waktu";

    const handleCopyKey = () => {
        if (!data.license_key) return;
        void navigator.clipboard.writeText(data.license_key);
        setCopied(true);
        toast.success("License key berhasil disalin ke clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const badgeClass = STATUS_BADGE_CLASS[data.status] ?? STATUS_BADGE_CLASS.not_activated;

    return (
        <div className="space-y-2.5">
            {/* 4 Compact Stat Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Tile 1: Status Langganan */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Status Langganan
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                            <IconCalendar size={13} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-slate-800 tracking-tight">
                                {formattedExpiry}
                            </span>
                            <Badge
                                variant="outline"
                                className={cn("text-[9px] font-bold px-1.5 py-0 rounded-full", badgeClass)}
                            >
                                ● {LICENSE_STATUS_LABELS[data.status] ?? data.status}
                            </Badge>
                        </div>
                        <div className="mt-1">
                            {data.days_remaining !== null ? (
                                <span
                                    className={cn(
                                        "text-[11px] font-semibold",
                                        data.days_remaining > 30
                                            ? "text-emerald-600"
                                            : data.days_remaining >= 0
                                              ? "text-amber-600"
                                              : "text-rose-600"
                                    )}
                                >
                                    {data.days_remaining >= 0
                                        ? `Sisa masa aktif: ${data.days_remaining} hari`
                                        : `Telah lewat ${Math.abs(data.days_remaining)} hari`}
                                </span>
                            ) : (
                                <span className="text-[11px] text-slate-400 font-medium">
                                    Paket aktif permanen
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tile 2: Kunci Lisensi */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Kunci Lisensi
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60">
                            <IconKey size={13} />
                        </div>
                    </div>
                    <div>
                        {data.license_key ? (
                            <div className="flex items-center justify-between gap-1 bg-slate-50 border border-slate-200/70 rounded-lg px-2 py-1">
                                <span
                                    className="font-mono text-xs font-bold text-slate-800 truncate"
                                    title={data.license_key}
                                >
                                    {data.license_key}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopyKey}
                                    className="text-slate-400 hover:text-emerald-600 transition-colors p-0.5 shrink-0 cursor-pointer"
                                    title="Salin Kunci Lisensi"
                                >
                                    <IconCopy size={13} className={copied ? "text-emerald-600" : ""} />
                                </button>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 font-medium">Belum terpasang</span>
                        )}
                        <p className="text-[10px] text-slate-400 font-medium truncate mt-1">
                            Instalasi: {data.instance_name || "Mitrasova POS"}
                        </p>
                    </div>
                </div>

                {/* Tile 3: Paket Sistem */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Paket Langganan
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
                            <IconPackage size={13} />
                        </div>
                    </div>
                    <div>
                        <span className="text-sm font-extrabold text-slate-800 tracking-tight block truncate">
                            {data.subscription_type
                                ? SUBSCRIPTION_TYPE_LABELS[data.subscription_type] ?? data.subscription_type
                                : "Multi-Store POS"}
                        </span>
                        <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                            Akses multi-cabang & pusat aktif
                        </span>
                    </div>
                </div>

                {/* Tile 4: Add-on Terpasang */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between gap-2">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Add-on Terpasang
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
                            <IconLayersLinked size={13} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-extrabold text-slate-800 tracking-tight">
                                {data.active_addons.length} Add-on Aktif
                            </span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">
                                Lengkap
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                            Semua fitur operasional aktif
                        </span>
                    </div>
                </div>
            </div>

            {/* Grace Period Alert (Only shown if in grace period) */}
            {data.is_grace_period && data.grace_days_remaining > 0 && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-800 text-xs">
                    <IconClock size={15} className="text-amber-600 shrink-0" />
                    <span className="flex-1 font-medium">
                        <strong className="font-bold">Masa Tenggang Berjalan:</strong> Sisa waktu{" "}
                        <strong className="font-bold">{data.grace_days_remaining} hari</strong> sebelum layanan ditangguhkan.
                        Segera perpanjang paket langganan agar operasional kasir tetap berjalan lancar.
                    </span>
                </div>
            )}
        </div>
    );
}
