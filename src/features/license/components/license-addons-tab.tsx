"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    IconCheck,
    IconLayersLinked,
    IconSearch,
    IconShieldCheck,
} from "@tabler/icons-react";
import { useLicenseAddons } from "../hooks/use-license-addons";

interface LicenseAddonsTabProps {
    activeAddons: string[];
    onGoToCatalog?: () => void;
}

export function LicenseAddonsTab({
    activeAddons,
    onGoToCatalog,
}: LicenseAddonsTabProps) {
    const {
        purchasedAddons,
        filteredAddons,
        searchQuery,
        setSearchQuery,
    } = useLicenseAddons(activeAddons);

    return (
        <div className="space-y-3">
            {/* Top Toolbar: Title, Count Badge, & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/70">
                        <IconShieldCheck size={15} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Daftar Add-on Aktif
                            </h3>
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
                                {purchasedAddons.length} Add-on Aktif
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Fitur tambahan yang terpasang dan siap digunakan pada operasional toko Anda
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
                            className="p-3.5 sm:px-4 sm:py-3.5 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                            {/* Left: Icon + Title + Description + Akses Menu */}
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100 shadow-2xs">
                                    <IconCheck size={16} strokeWidth={2.5} />
                                </div>
                                <div className="min-w-0 space-y-1 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs font-bold text-slate-900 tracking-tight">
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
                                                    className="bg-slate-100 border border-slate-200/80 px-2 py-0.5 rounded-md text-[10px] font-medium text-slate-700 shadow-2xs"
                                                >
                                                    {path}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: CLEAR - Only the Status Badge */}
                            <div className="shrink-0 sm:self-center pl-11 sm:pl-0">
                                <Badge
                                    variant="outline"
                                    className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200/90 uppercase tracking-wider flex items-center gap-1.5 shadow-2xs"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Aktif</span>
                                </Badge>
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
