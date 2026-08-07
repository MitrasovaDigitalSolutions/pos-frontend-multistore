"use client";

import { Button } from "@/components/ui/button";
import { IconFolder, IconPlus, IconRefresh } from "@tabler/icons-react";

interface CategoryMappingHeaderProps {
    totalCategoryCount: number;
    assignedCategoryCount: number;
    unassignedCategoryCount: number;
    completionPercent: number;
    onRefresh: () => void;
    onAddParent: () => void;
}

export function CategoryMappingHeader({
    totalCategoryCount,
    assignedCategoryCount,
    unassignedCategoryCount,
    completionPercent,
    onRefresh,
    onAddParent,
}: CategoryMappingHeaderProps) {
    return (
        <div className="space-y-3">
            {/* Top Bar: Title & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                    <h1 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                        <IconFolder size={20} className="text-emerald-500 shrink-0" />
                        <span>Mapping Kategori Produk</span>
                    </h1>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Kelompokkan kategori produk ke Kategori Induk untuk keperluan laporan akuntansi.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        className="h-8 px-2.5 text-xs font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                        title="Refresh Data"
                    >
                        <IconRefresh size={14} className="mr-1" />
                        <span>Refresh</span>
                    </Button>

                    <Button
                        onClick={onAddParent}
                        className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm cursor-pointer"
                    >
                        <IconPlus size={15} className="mr-1" />
                        <span>Tambah Kategori Induk</span>
                    </Button>
                </div>
            </div>

            {/* Progress Summary Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-3 rounded-xl shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-bold uppercase tracking-wider text-slate-400 text-[9px]">Status Pemetaan</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xs">
                            {assignedCategoryCount} / {totalCategoryCount} terpetakan
                        </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            {completionPercent}% Selesai
                        </span>
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            {unassignedCategoryCount} Belum Ter-assign
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${completionPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
