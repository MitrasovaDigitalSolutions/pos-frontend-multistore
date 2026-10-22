"use client";

import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import {
    IconArrowRight,
    IconCpu,
    IconDatabase,
    IconDeviceDesktop,
} from "@tabler/icons-react";
import type { ServerPackage } from "../../types";

interface LicenseServerCardProps {
    server: ServerPackage;
    billingView: "monthly" | "annual";
    onSelectServer: (serverCode?: string) => void;
}

/**
 * Single Responsibility: Render an individual Server / Cloud Hosting infrastructure card.
 */
export function LicenseServerCard({
    server,
    billingView,
    onSelectServer,
}: LicenseServerCardProps) {
    const isFree = server.harga_bulanan === 0;
    const price = billingView === "annual" ? server.harga_tahunan : server.harga_bulanan;
    const isRecommended = server.code?.includes("4gb") || server.nama?.includes("Pro");

    return (
        <div
            className={cn(
                "relative rounded-xl border p-3.5 flex flex-col justify-between gap-2.5 transition-all shadow-2xs group hover:shadow-xs",
                isRecommended
                    ? "bg-gradient-to-b from-blue-50/30 to-white border-blue-200"
                    : "bg-white border-slate-200/80 hover:border-slate-300"
            )}
        >
            {isRecommended && (
                <span className="absolute -top-2.5 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-2xs">
                    Rekomendasi
                </span>
            )}

            <div className="space-y-2">
                <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {server.nama}
                        </h5>
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">
                            {server.code}
                        </span>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[9px] font-mono px-1.5 py-0 shrink-0",
                            isFree
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                        )}
                    >
                        {isFree ? "Local" : "Cloud"}
                    </Badge>
                </div>

                {/* Hardware Specs Chips */}
                {server.cpu && server.cpu !== "Self-Hosted" && (
                    <div className="flex flex-wrap gap-1 text-[10px] text-slate-600 font-mono font-medium">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/60">
                            <IconCpu size={11} className="text-slate-500" />
                            {server.cpu}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/60">
                            <IconDeviceDesktop size={11} className="text-slate-500" />
                            {server.ram}
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/60">
                            <IconDatabase size={11} className="text-slate-500" />
                            {server.storage}
                        </span>
                    </div>
                )}

                {server.description && (
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                        {server.description}
                    </p>
                )}
            </div>

            {/* Bottom: Price + Action Button */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block tracking-wider">
                        Infrastruktur
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="font-extrabold text-xs text-slate-900 font-mono">
                            {isFree ? "Rp 0 (Gratis)" : formatRupiah(price)}
                        </span>
                        {!isFree && (
                            <span className="text-[10px] text-slate-400 font-medium">
                                /{billingView === "annual" ? "thn" : "bln"}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onSelectServer(server.code)}
                    className="h-7.5 px-3 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200/80 border border-blue-200/80 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                    <span>Pilih Server</span>
                    <IconArrowRight size={13} />
                </button>
            </div>
        </div>
    );
}
