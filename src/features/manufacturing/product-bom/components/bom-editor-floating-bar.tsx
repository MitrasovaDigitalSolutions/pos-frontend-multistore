"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    IconCheck,
    IconDeviceFloppy,
    IconLoader2,
    IconRotateClockwise,
} from "@tabler/icons-react";

interface BomEditorFloatingBarProps {
    itemCount: number;
    utamaCount: number;
    pendukungCount: number;
    hasUnsavedChanges: boolean;
    isSubmitting: boolean;
    disabled?: boolean;
    onSubmit: () => void;
    onCancel?: () => void;
    className?: string;
}

export function BomEditorFloatingBar({
    itemCount,
    utamaCount,
    pendukungCount,
    hasUnsavedChanges,
    isSubmitting,
    disabled = false,
    onSubmit,
    onCancel,
    className,
}: BomEditorFloatingBarProps) {
    return (
        <div className={cn("sticky bottom-2 sm:bottom-4 z-30 mt-4", className)}>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 p-3 sm:p-3.5 px-4 sm:px-5 transition-all">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Left: Stats & Status */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 flex-wrap">
                        {/* Unsaved / Saved Badge */}
                        {hasUnsavedChanges ? (
                            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider">
                                    Perubahan Belum Disimpan
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 shrink-0">
                                <IconCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
                                <span className="text-[11px] font-semibold">
                                    Semua Tersimpan
                                </span>
                            </div>
                        )}

                        {/* Counts summary */}
                        <div className="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {itemCount} Bahan Baku
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">|</span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {utamaCount} Utama
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">|</span>
                            <span className="inline-flex items-center gap-1 text-sky-700 dark:text-sky-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                {pendukungCount} Pendukung
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2.5 justify-end w-full sm:w-auto">
                        {onCancel && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={!hasUnsavedChanges || isSubmitting || disabled}
                                className="h-10 px-4 text-xs font-semibold rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:bg-transparent flex-1 sm:flex-initial transition-colors"
                                title="Batalkan semua perubahan dan kembalikan ke kondisi terakhir disimpan"
                            >
                                <IconRotateClockwise size={15} className="mr-1.5" />
                                <span>Batal</span>
                            </Button>
                        )}
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={disabled || isSubmitting || !hasUnsavedChanges}
                            className={cn(
                                "h-10 px-5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 flex-1 sm:flex-initial",
                                "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20",
                                "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-emerald-600",
                                hasUnsavedChanges && "hover:shadow-lg hover:shadow-emerald-600/30 ring-2 ring-emerald-400/30"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2 size={16} className="animate-spin" />
                                    <span>Menyimpan Resep...</span>
                                </>
                            ) : (
                                <>
                                    <IconDeviceFloppy size={16} />
                                    <span>Simpan Resep BoM</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
