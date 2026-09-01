"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconAlertCircle, IconCircleCheck, IconPlus } from "@tabler/icons-react";
import type { Control, UseFormSetValue, FieldErrors, FieldArrayWithId } from "react-hook-form";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { ManualJournalSchemaInput } from "@/features/accounting/schemas/manual-journal-schema";
import { JournalEditorTableRow } from "./journal-editor-table-row";

interface JournalEditorDesktopTableProps {
    fields: FieldArrayWithId<ManualJournalSchemaInput, "lines", "id">[];
    control: Control<ManualJournalSchemaInput>;
    setValue: UseFormSetValue<ManualJournalSchemaInput>;
    flatAccounts?: ChartOfAccount[];
    errors?: FieldErrors<ManualJournalSchemaInput>["lines"];
    totalDebit: number;
    totalCredit: number;
    difference: number;
    isBalanced: boolean;
    onAddLine: () => void;
    onAccountSelect: (index: number, coaUid: string) => void;
    onRemoveLine: (idx: number) => void;
}

export function JournalEditorDesktopTable({
    fields,
    control,
    setValue,
    flatAccounts = [],
    errors,
    totalDebit,
    totalCredit,
    difference,
    isBalanced,
    onAddLine,
    onAccountSelect,
    onRemoveLine,
}: JournalEditorDesktopTableProps) {
    return (
        <div className="hidden md:block overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
                <TableHeader>
                    <TableRow className="bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider select-none">
                        <TableHead className="py-2.5 px-3 text-center w-10">#</TableHead>
                        <TableHead className="py-2.5 px-3 w-[340px]">Akun (CoA) *</TableHead>
                        <TableHead className="py-2.5 px-3">Keterangan Baris (Opsional)</TableHead>
                        <TableHead className="py-2.5 px-3 text-right w-44">Debit (Rp)</TableHead>
                        <TableHead className="py-2.5 px-3 text-right w-44">Kredit (Rp)</TableHead>
                        <TableHead className="py-2.5 px-3 text-center w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                    {fields.map((field, idx) => (
                        <JournalEditorTableRow
                            key={field.id}
                            index={idx}
                            control={control}
                            setValue={setValue}
                            flatAccounts={flatAccounts}
                            errors={errors}
                            canDelete={fields.length > 2}
                            onAccountSelect={onAccountSelect}
                            onRemove={onRemoveLine}
                        />
                    ))}
                </TableBody>
                {/* Table Footer with Totals and Balance Status */}
                <tfoot>
                    {/* Inline Add Line & Totals Row */}
                    <TableRow className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 hover:bg-slate-50/70">
                        <TableCell colSpan={3} className="py-2 px-3">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onAddLine}
                                className="h-7 px-2.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                                <IconPlus className="w-3.5 h-3.5" />
                                <span>Tambah Baris Akun</span>
                            </Button>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Total Debit
                            </span>
                            <span className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                                {formatRupiah(totalDebit)}
                            </span>
                        </TableCell>
                        <TableCell className="py-2 px-3 text-right">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Total Kredit
                            </span>
                            <span className="text-xs font-black font-mono text-rose-700 dark:text-rose-400 tabular-nums">
                                {formatRupiah(totalCredit)}
                            </span>
                        </TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                    {/* Status Balancing Strip */}
                    <TableRow className="border-t border-slate-150 dark:border-slate-850 bg-white dark:bg-slate-900 hover:bg-white">
                        <TableCell colSpan={6} className="py-2.5 px-4">
                            <div className="flex items-center justify-between gap-3 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-slate-500">
                                        Status Jurnal:
                                    </span>
                                    {isBalanced ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                                            <IconCircleCheck className="w-3.5 h-3.5" />
                                            Seimbang (Balanced)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                                            <IconAlertCircle className="w-3.5 h-3.5" />
                                            Selisih: {formatRupiah(difference)}
                                        </span>
                                    )}
                                </div>
                                {!isBalanced && (
                                    <p className="text-[11px] text-slate-400 italic hidden sm:block">
                                        Total Debit dan Kredit wajib seimbang (selisih Rp 0) untuk posting.
                                    </p>
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                </tfoot>
            </Table>
        </div>
    );
}
