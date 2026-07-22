"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconAlertCircle, IconLoader2, IconUpload } from "@tabler/icons-react";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkSubmitBarProps {
    itemCount: number;
    productCount: number;
    total: number;
    onSubmit: () => void;
    onSecondarySubmit?: () => void;
    onReset: () => void;
    isSubmitting?: boolean;
    disabled?: boolean;
    submitLabel?: string;
    submitIcon?: React.ReactNode;
    secondarySubmitLabel?: string;
    secondarySubmitIcon?: React.ReactNode;
    className?: string;
}

export function BulkSubmitBar({
    itemCount,
    productCount,
    total,
    onSubmit,
    onSecondarySubmit,
    onReset,
    isSubmitting = false,
    disabled = false,
    submitLabel,
    submitIcon,
    secondarySubmitLabel,
    secondarySubmitIcon,
    className,
}: BulkSubmitBarProps) {
    const hasItems = itemCount > 0;

    return (
        <div className={cn("sticky bottom-2 sm:bottom-0 z-30 mt-4", className)}>
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 p-3 sm:p-4 transition-all">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                    {/* Left: Stats */}
                    <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-4 flex-wrap">
                        {hasItems && (
                            <>
                                {/* Unsaved badge */}
                                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-xl border border-amber-200/60 dark:border-amber-900/40 shrink-0">
                                    <IconAlertCircle size={14} className="shrink-0" />
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                                        {productCount} produk belum disubmit
                                    </span>
                                </div>

                                <div className="flex items-center gap-3 text-xs flex-wrap">
                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-medium">Qty:</span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{itemCount} pcs</span>
                                    </div>

                                    <span className="text-slate-300 dark:text-slate-700 hidden xs:inline">|</span>

                                    <div className="flex items-center gap-1">
                                        <span className="text-slate-400 font-medium">Total:</span>
                                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                                            {formatRupiah(total)}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {!hasItems && (
                            <span className="text-xs text-slate-400 font-medium py-1">
                                Belum ada item — scan barcode untuk mulai
                            </span>
                        )}
                    </div>

                    {/* Right: Actions */}
                    <div className="grid grid-cols-12 gap-2 w-full sm:w-auto sm:flex sm:items-center sm:gap-3">
                        {/* Reset */}
                        <button
                            type="button"
                            onClick={onReset}
                            disabled={isSubmitting || disabled}
                            title="Reset Form"
                            className={cn(
                                "flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 disabled:opacity-40 disabled:cursor-not-allowed",
                                onSecondarySubmit ? "col-span-2 sm:col-auto px-2.5 sm:px-4" : "col-span-3 sm:col-auto px-3 sm:px-4"
                            )}
                        >
                            <RefreshCcw size={15} className="shrink-0" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>

                        {/* Secondary Submit (Simpan Penerimaan/PO/Retur) */}
                        {onSecondarySubmit && (
                            <button
                                type="button"
                                onClick={onSecondarySubmit}
                                disabled={!hasItems || isSubmitting || disabled}
                                className="col-span-5 sm:col-auto flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2.5 rounded-xl text-xs font-bold border border-emerald-600 text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer truncate"
                            >
                                <span className="shrink-0">{secondarySubmitIcon || <IconUpload size={15} />}</span>
                                <span className="truncate">{secondarySubmitLabel || "Simpan"}</span>
                            </button>
                        )}

                        {/* Main Submit (Proses Penerimaan/PO/Retur) */}
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={!hasItems || isSubmitting || disabled}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer truncate",
                                onSecondarySubmit ? "col-span-5 sm:col-auto" : "col-span-9 sm:col-auto"
                            )}
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2 size={15} className="animate-spin shrink-0" />
                                    <span className="truncate">Mengirim...</span>
                                </>
                            ) : (
                                <>
                                    <span className="shrink-0">{submitIcon || <IconUpload size={15} />}</span>
                                    <span className="truncate">{submitLabel || "Simpan Semua"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
