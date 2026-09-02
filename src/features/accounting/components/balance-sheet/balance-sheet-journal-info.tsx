"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatToReadableDate } from "@/lib/date-utils";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconAlertCircle,
    IconCalendar,
    IconCircleCheck,
    IconFileText,
    IconUser,
} from "@tabler/icons-react";
import type { ManualJournal } from "@/features/accounting/types/manual-journal";

interface BalanceSheetJournalInfoProps {
    journal: ManualJournal;
    showDebitCredit?: boolean;
    onShowDebitCreditChange?: (val: boolean) => void;
    totalDebit: number;
    totalCredit: number;
    isBalanced: boolean;
    difference: number;
}

export function BalanceSheetJournalInfo({
    journal,
    totalDebit,
    totalCredit,
    isBalanced,
    difference,
}: BalanceSheetJournalInfoProps) {
    const formattedDate = formatToReadableDate(journal.transaction_date) || "-";

    return (
        <Card className="p-2 sm:p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
                {/* Left: Metadata Chips (Date, Creator, Note) */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0 flex-1">
                    <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                        <IconCalendar size={13} className="text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tgl:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">{formattedDate}</span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                        <IconUser size={13} className="text-slate-400 shrink-0" />
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pembuat:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[140px]">
                            {journal.creator?.name || journal.creator?.username || "-"}
                        </span>
                    </div>

                    {journal.description ? (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800 text-xs min-w-0 max-w-full sm:max-w-[340px]">
                            <IconFileText size={13} className="text-slate-400 shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300 text-[11px] italic truncate" title={journal.description}>
                                {journal.description}
                            </span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                            <IconFileText size={13} className="text-slate-400 shrink-0" />
                            <span className="text-slate-400 text-[11px] italic">Tanpa catatan</span>
                        </div>
                    )}
                </div>

                {/* Right: Balance Status & Debit/Credit Metrics */}
                <div className="flex items-center gap-3 sm:gap-4 justify-between lg:justify-end shrink-0 border-t lg:border-t-0 pt-1.5 lg:pt-0 border-slate-100 dark:border-slate-800">
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                        <div
                            className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0",
                                isBalanced
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                            )}
                        >
                            {isBalanced ? (
                                <IconCircleCheck className="w-3.5 h-3.5" />
                            ) : (
                                <IconAlertCircle className="w-3.5 h-3.5 animate-pulse" />
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase tracking-wider border",
                                isBalanced
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                                    : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40"
                            )}
                        >
                            {isBalanced ? "Seimbang" : `Selisih: ${formatRupiah(difference)}`}
                        </span>
                    </div>

                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                    {/* Debit & Credit Metrics */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none">
                                Total Debit
                            </span>
                            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono tabular-nums leading-tight">
                                {formatRupiah(totalDebit)}
                            </span>
                        </div>

                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-800" />

                        <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block leading-none">
                                Total Kredit
                            </span>
                            <span
                                className={cn(
                                    "text-xs sm:text-sm font-black font-mono tabular-nums leading-tight",
                                    isBalanced
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-rose-600 dark:text-rose-400"
                                )}
                            >
                                {formatRupiah(totalCredit)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
