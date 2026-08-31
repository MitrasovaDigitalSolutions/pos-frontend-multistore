"use client";

import { Skeleton } from "@/components/ui/skeleton";
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2 shadow-xs">
            {/* 1. Nilai Buku */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/30 min-w-0">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                    <IconBuildingWarehouse className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                        Nilai Buku
                    </span>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {isLoading ? (
                            <Skeleton className="h-4 w-24 rounded-md my-0.5" />
                        ) : (
                            formatRupiah(totalNilaiBuku)
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Harga Perolehan */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/60 dark:border-emerald-900/30 min-w-0">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                    <IconWallet className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                        Harga Perolehan
                    </span>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {isLoading ? (
                            <Skeleton className="h-4 w-24 rounded-md my-0.5" />
                        ) : (
                            formatRupiah(totalHargaPerolehan)
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Akumulasi Susut */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/60 dark:border-amber-900/30 min-w-0">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                    <IconTrendingDown className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                        Total Susut
                    </span>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {isLoading ? (
                            <Skeleton className="h-4 w-24 rounded-md my-0.5" />
                        ) : (
                            formatRupiah(totalPenyusutan)
                        )}
                    </div>
                </div>
            </div>

            {/* 4. Unit Aset */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/60 dark:border-violet-900/30 min-w-0">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/60 text-violet-600 dark:text-violet-400 rounded-xl shrink-0">
                    <IconChecklist className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                        Unit Aset
                    </span>
                    <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                        {isLoading ? (
                            <Skeleton className="h-4 w-20 rounded-md my-0.5" />
                        ) : (
                            <span>
                                <strong className="text-emerald-600 dark:text-emerald-400">{totalAktif}</strong>
                                <span className="text-slate-400 font-normal"> Aktif / </span>
                                <strong className="text-slate-600 dark:text-slate-300">{totalHabisSusut}</strong>
                                <span className="text-slate-400 font-normal"> Habis</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
