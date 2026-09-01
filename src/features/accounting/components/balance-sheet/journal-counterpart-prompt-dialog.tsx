"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconLayersLinked, IconArrowRight, IconCheck, IconPlus } from "@tabler/icons-react";
import type { ChartOfAccount } from "@/features/accounting/types";

interface JournalCounterpartPromptDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sourceAccount: ChartOfAccount | null;
    counterparts: ChartOfAccount[];
    onSelectOne: (counterpartUid: string) => void;
    onApplyAll: () => void;
}

export function JournalCounterpartPromptDialog({
    open,
    onOpenChange,
    sourceAccount,
    counterparts,
    onSelectOne,
    onApplyAll,
}: JournalCounterpartPromptDialogProps) {
    if (!sourceAccount) return null;

    const dialogTitle = (
        <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 shadow-xs">
                <IconLayersLinked className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Pilihan Lawan Akun
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                    Akun ini memiliki {counterparts.length} pasangan lawan akun terdaftar
                </p>
            </div>
        </div>
    );

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={dialogTitle}
            className="sm:max-w-xl"
        >
            <div className="space-y-4 pt-2">
                {/* Source Account Info Card */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Akun Utama yang Dipilih:
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-850 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-750">
                            {sourceAccount.kode}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {sourceAccount.nama}
                        </span>
                        <Badge variant="outline" className="text-[10px] capitalize ml-auto">
                            {sourceAccount.tipe}
                        </Badge>
                    </div>
                </div>

                {/* Counterparts Selection List */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                            Pilih Salah Satu Lawan Akun:
                        </span>
                        <span className="text-[11px] text-slate-400">
                            Klik &quot;Pilih&quot; untuk mengisi baris berikutnya
                        </span>
                    </div>

                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {counterparts.map((cp) => (
                            <div
                                key={cp.uid}
                                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-all group"
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                        <IconArrowRight className="w-3.5 h-3.5" />
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                                                {cp.kode}
                                            </span>
                                            <Badge variant="outline" className="text-[9px] capitalize py-0 px-1.5">
                                                {cp.tipe}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                            {cp.nama}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => onSelectOne(cp.uid)}
                                    className="h-7 px-3 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer shrink-0"
                                >
                                    <IconCheck className="w-3.5 h-3.5 mr-1" />
                                    Pilih
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compound Journal Option (Jurnal Majemuk) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
                        Ingin memecah transaksi ke seluruh lawan akun di atas?
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onApplyAll}
                        className="w-full sm:w-auto h-8 px-3.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                        <IconPlus className="w-3.5 h-3.5" />
                        <span>Terapkan Semua (Jurnal Majemuk)</span>
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
}
