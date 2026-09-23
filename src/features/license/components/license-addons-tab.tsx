"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AppButton } from "@/components/shared/app-button";
import {
    IconAlertTriangle,
    IconCheck,
    IconLayersLinked,
    IconLock,
    IconRefresh,
    IconSearch,
    IconShieldCheck,
    IconShieldX,
} from "@tabler/icons-react";
import { useLicenseAddons } from "../hooks/use-license-addons";
import { cn } from "@/lib/utils";

interface LicenseAddonsTabProps {
    activeAddons: string[];
    isOperable?: boolean;
    onGoToCatalog?: () => void;
    onRenewClick?: () => void;
}

export function LicenseAddonsTab({
    activeAddons,
    isOperable = true,
    onGoToCatalog,
    onRenewClick,
}: LicenseAddonsTabProps) {
    const {
        purchasedAddons,
        filteredAddons,
        searchQuery,
        setSearchQuery,
    } = useLicenseAddons(activeAddons);

    return (
        <div className="space-y-3.5">
            {/* Warning Banner if Subscription is Expired / Inactive */}
            {!isOperable && (
                <div className="rounded-xl border border-rose-200/90 bg-rose-50/70 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left animate-fade-in shadow-2xs">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 mt-0.5">
                            <IconAlertTriangle size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">
                                    Modul Add-on Dinonaktifkan Sementara
                                </h4>
                                <Badge variant="outline" className="text-[9px] font-bold bg-rose-100 text-rose-700 border-rose-200">
                                    Terkunci
                                </Badge>
                            </div>
                            <p className="text-[11px] text-rose-700/80 mt-0.5 leading-relaxed">
                                Masa aktif paket langganan POS telah kedaluwarsa. Seluruh fitur modul add-on yang terpasang di bawah ini tidak dapat dioperasikan hingga paket langganan toko diperpanjang.
                            </p>
                        </div>
                    </div>
                    {onRenewClick && (
                        <AppButton
                            size="sm"
                            onClick={onRenewClick}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-2xs gap-1.5 h-8 cursor-pointer self-end sm:self-center"
                        >
                            <IconRefresh size={14} />
                            <span>Perpanjang Paket</span>
                        </AppButton>
                    )}
                </div>
            )}

            {/* Top Toolbar: Title, Count Badge, & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div
                        className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                            isOperable
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100/70"
                                : "bg-rose-50 text-rose-600 border-rose-100",
                        )}
                    >
                        {isOperable ? <IconShieldCheck size={15} /> : <IconShieldX size={15} />}
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                {isOperable ? "Daftar Add-on Aktif" : "Daftar Add-on Terpasang"}
                            </h3>
                            <span
                                className={cn(
                                    "text-[10px] font-extrabold px-1.5 py-0.2 rounded-full border",
                                    isOperable
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                        : "bg-rose-100 text-rose-700 border-rose-200",
                                )}
                            >
                                {purchasedAddons.length} {isOperable ? "Add-on Aktif" : "Add-on Dinonaktifkan"}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            {isOperable
                                ? "Fitur tambahan yang terpasang dan siap digunakan pada operasional toko Anda"
                                : "Fitur terpasang ditangguhkan sementara karena paket langganan kedaluwarsa"}
                        </p>
                    </div>
                </div>

                {/* Search Bar */}
                {purchasedAddons.length > 3 && (
                    <div className="relative w-full sm:w-64 shrink-0">
                        <IconSearch
                            size={14}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <Input
                            type="text"
                            placeholder="Cari fitur atau jalur menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 pl-8 pr-3 text-xs rounded-xl border-slate-200 focus-visible:ring-emerald-500 bg-slate-50/50"
                        />
                    </div>
                )}
            </div>

            {/* Compact Card List */}
            {filteredAddons.length > 0 ? (
                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
                    {filteredAddons.map((addon) => (
                        <div
                            key={addon.code}
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
                                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60 font-semibold">
                                            {addon.code}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-snug">
                                        {addon.description}
                                    </p>

                                    {/* Akses Menu placed on the LEFT */}
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

                            {/* Right: CLEAR - Dynamic Status Badge */}
                            <div className="shrink-0 sm:self-center pl-11 sm:pl-0">
                                {isOperable ? (
                                    <Badge
                                        variant="outline"
                                        className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200/90 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>Aktif</span>
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border-rose-200 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        <span>Tidak Aktif (Kedaluwarsa)</span>
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : purchasedAddons.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <IconLayersLinked size={20} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-700">Belum Ada Add-on Tambahan</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                        Sistem Anda saat ini berjalan dengan add-on POS dasar. Anda dapat menambah fitur pada tab Katalog & Paket.
                    </p>
                    {onGoToCatalog && (
                        <button
                            type="button"
                            onClick={onGoToCatalog}
                            className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                        >
                            Eksplor Katalog Add-on →
                        </button>
                    )}
                </div>
            ) : (
                <div className="text-center py-8 rounded-xl bg-white border border-slate-200/80">
                    <p className="text-xs font-bold text-slate-600">Tidak ada add-on yang cocok dengan pencarian</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Coba periksa kembali kata kunci pencarian Anda.
                    </p>
                </div>
            )}
        </div>
    );
}
