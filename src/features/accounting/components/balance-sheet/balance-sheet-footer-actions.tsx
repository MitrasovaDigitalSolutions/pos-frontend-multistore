"use client";

import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { IconCheck, IconDeviceFloppy, IconLoader2, IconX } from "@tabler/icons-react";

interface BalanceSheetFooterActionsProps {
    isBalanced: boolean;
    difference: number;
    totalDebit: number;
    totalCredit: number;
    onCancel: () => void;
    onSaveDraft: () => void;
    onPost: () => void;
    isPending: boolean;
    hasDescriptionAndDate: boolean;
}

export function BalanceSheetFooterActions({
    isBalanced,
    difference,
    totalDebit,
    totalCredit,
    onCancel,
    onSaveDraft,
    onPost,
    isPending,
    hasDescriptionAndDate,
}: BalanceSheetFooterActionsProps) {
    return (
        <div className="sticky bottom-4 z-50 w-full mt-6">
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] rounded-2xl px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-5 transition-all duration-300">
                {/* Left Side: Balance & Totals Status */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3.5 text-xs w-full lg:w-auto">
                    <div className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-xl border font-bold uppercase tracking-wider text-[10px]",
                        isBalanced
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                            : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                    )}>
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            isBalanced ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                        )} />
                        {isBalanced ? (
                            "Seimbang (Balanced)"
                        ) : (
                            `Selisih: ${formatRupiah(difference)} (${totalDebit > totalCredit ? "Kredit Kurang" : "Debet Kurang"})`
                        )}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-slate-650 dark:text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                            <span>Total Debet:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200 font-mono">
                                {formatRupiah(totalDebit)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <span>Total Kredit:</span>
                            <span className="font-bold text-slate-850 dark:text-slate-200 font-mono">
                                {formatRupiah(totalCredit)}
                            </span>
                        </div>

                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden sm:block" />
                    </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isPending}
                        className="h-10 px-4 text-xs font-bold rounded-xl border-slate-200 dark:border-rose-800 bg-white dark:bg-rose-900 hover:bg-rose-50 dark:hover:bg-rose-800 text-rose-600 dark:text-rose-400 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                        title="Batalkan semua perubahan dan buang draf"
                    >
                        <IconX className="w-3.5 h-3.5 text-slate-400" />
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={onSaveDraft}
                        className="h-10 px-4 text-xs font-bold rounded-xl border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                        {isPending ? (
                            <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <IconDeviceFloppy className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                        )}
                        Simpan Draft
                    </Button>
                    <Button
                        type="button"
                        disabled={!isBalanced || !hasDescriptionAndDate || isPending}
                        onClick={onPost}
                        className="h-10 px-5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-450 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer"
                    >
                        {isPending ? (
                            <>
                                <IconLoader2 className="w-3.5 h-3.5 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <IconCheck className="w-3.5 h-3.5" />
                                Posting Jurnal
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
