"use client";

import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconBuildingWarehouse,
    IconTrendingDown,
    IconWallet,
    IconChecklist,
} from "@tabler/icons-react";
import type { AssetSummary } from "../../types";

interface AssetMetricsSummaryProps {
    summary?: AssetSummary | null;
    isLoading?: boolean;
}

export function AssetMetricsSummary({ summary, isLoading = false }: AssetMetricsSummaryProps) {
    const totalNilaiBuku = summary?.total_nilai_buku ?? 0;
    const totalHargaPerolehan = summary?.total_harga_perolehan ?? 0;
    const totalPenyusutan = summary?.total_penyusutan ?? 0;
    const totalAktif = summary?.total_aset_aktif ?? 0;
    const totalHabisSusut = summary?.total_aset_habis_susut ?? 0;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Total Nilai Buku (Net Book Value) */}
            <Card className="p-3.5 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Total Nilai Buku
                        </span>
                        <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            {isLoading ? "Memuat..." : formatRupiah(totalNilaiBuku)}
                        </div>
                    </div>
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40 shrink-0">
                        <IconBuildingWarehouse className="w-4.5 h-4.5" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                    Nilai aset saat ini setelah dikurangi akumulasi penyusutan
                </p>
            </Card>

            {/* 2. Total Harga Perolehan (Acquisition Cost) */}
            <Card className="p-3.5 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Total Harga Perolehan
                        </span>
                        <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            {isLoading ? "Memuat..." : formatRupiah(totalHargaPerolehan)}
                        </div>
                    </div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-100 dark:border-emerald-900/40 shrink-0">
                        <IconWallet className="w-4.5 h-4.5" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                    Total modal kapitalisasi saat perolehan/pembelian awal
                </p>
            </Card>

            {/* 3. Total Akumulasi Penyusutan */}
            <Card className="p-3.5 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Akumulasi Penyusutan
                        </span>
                        <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            {isLoading ? "Memuat..." : formatRupiah(totalPenyusutan)}
                        </div>
                    </div>
                    <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-100 dark:border-amber-900/40 shrink-0">
                        <IconTrendingDown className="w-4.5 h-4.5" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                    Total beban penyusutan yang telah dialokasikan
                </p>
            </Card>

            {/* 4. Status Aset (Aktif & Habis Susut) */}
            <Card className="p-3.5 rounded-2xl border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent shadow-xs">
                <div className="flex items-center justify-between gap-2">
                    <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            Jumlah Unit Aset
                        </span>
                        <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {isLoading ? "-" : totalAktif} Aktif
                            </span>
                            <span className="text-slate-300 dark:text-slate-700">/</span>
                            <span className="text-slate-500">
                                {isLoading ? "-" : totalHabisSusut} Habis
                            </span>
                        </div>
                    </div>
                    <div className="p-2 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-xl border border-violet-100 dark:border-violet-900/40 shrink-0">
                        <IconChecklist className="w-4.5 h-4.5" />
                    </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">
                    Total unit aktif dalam buku dan unit habis susut
                </p>
            </Card>
        </div>
    );
}
