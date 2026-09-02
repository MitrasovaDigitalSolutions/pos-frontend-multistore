"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { formatToReadableDate } from "@/lib/date-utils";
import { IconBook } from "@tabler/icons-react";
import type { ManualJournal } from "@/features/accounting/types/manual-journal";

interface BalanceSheetJournalInfoProps {
    journal: ManualJournal;
    showDebitCredit?: boolean;
    onShowDebitCreditChange?: (val: boolean) => void;
}

export function BalanceSheetJournalInfo({
    journal,
    showDebitCredit = true,
    onShowDebitCreditChange,
}: BalanceSheetJournalInfoProps) {
    const formattedDate = formatToReadableDate(journal.transaction_date) || "-";

    return (
        <Card className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        <IconBook className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
                        Informasi Jurnal Penyesuaian
                    </h3>
                </div>

                {onShowDebitCreditChange && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                        <span className="text-[11px] font-semibold">Detail D/K</span>
                        <Switch
                            size="sm"
                            checked={showDebitCredit}
                            onCheckedChange={onShowDebitCreditChange}
                        />
                    </label>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        No. Referensi
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        {journal.reference_number || "-"}
                    </span>
                </div>
                <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        Tanggal Transaksi
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        {formattedDate}
                    </span>
                </div>
                <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                        Pembuat
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate block">
                        {journal.creator?.name || journal.creator?.username || "-"}
                    </span>
                </div>
                <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                        Status
                    </span>
                    <Badge
                        className={cn(
                            "px-2 py-0 text-[10px] font-semibold",
                            journal.status === "draft" &&
                                "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-850 dark:text-slate-300 dark:border-slate-800",
                            journal.status === "posted" &&
                                "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
                            journal.status === "voided" &&
                                "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30"
                        )}
                        variant="outline"
                    >
                        {journal.status === "draft" && "Draft"}
                        {journal.status === "posted" && "Posted"}
                        {journal.status === "voided" && "Voided (Batal)"}
                    </Badge>
                </div>
            </div>

            {journal.description && (
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block mb-0.5">
                        Keterangan
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium bg-slate-50/70 dark:bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-850 text-xs">
                        {journal.description}
                    </p>
                </div>
            )}
        </Card>
    );
}
