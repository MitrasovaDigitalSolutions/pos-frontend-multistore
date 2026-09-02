"use client";

import { Controller, type Control, type UseFormSetValue, type FieldErrors, type FieldArrayWithId } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CoaPickerTrigger } from "@/features/accounting/components/shared";
import { NumberInput } from "@/components/ui/number-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconAlertCircle, IconCircleCheck, IconPlus, IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ChartOfAccount } from "@/features/accounting/types";
import type { ManualJournalSchemaInput } from "@/features/accounting/schemas/manual-journal-schema";

interface JournalEditorMobileListProps {
    fields: FieldArrayWithId<ManualJournalSchemaInput, "lines", "id">[];
    control: Control<ManualJournalSchemaInput>;
    setValue: UseFormSetValue<ManualJournalSchemaInput>;
    flatAccounts?: ChartOfAccount[];
    watchedLines?: Partial<ManualJournalSchemaInput["lines"][number]>[];
    errors?: FieldErrors<ManualJournalSchemaInput>["lines"];
    totalDebit: number;
    totalCredit: number;
    difference: number;
    isBalanced: boolean;
    onAddLine: () => void;
    onAccountSelect: (index: number, coaUid: string) => void;
    onRemoveLine: (idx: number) => void;
}

export function JournalEditorMobileList({
    fields,
    control,
    flatAccounts = [],
    watchedLines = [],
    errors,
    totalDebit,
    totalCredit,
    difference,
    isBalanced,
    onAddLine,
    onAccountSelect,
    onRemoveLine,
}: JournalEditorMobileListProps) {
    return (
        <div className="block md:hidden p-3 space-y-2.5">
            {fields.map((field, idx) => {
                const rowErrors = Array.isArray(errors) ? errors[idx] : undefined;
                const accountError = rowErrors?.chart_of_account_uid?.message;
                const otherSelectedUids = (watchedLines || [])
                    .map((l, i) => (i !== idx ? l?.chart_of_account_uid : null))
                    .filter(Boolean) as string[];

                return (
                    <div
                        key={field.id}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/30 space-y-2"
                    >
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                                #{idx + 1}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={fields.length <= 2}
                                onClick={() => onRemoveLine(idx)}
                                className="h-6 px-2 text-[10px] font-bold text-rose-500 hover:bg-rose-50 rounded-md"
                            >
                                <IconTrash className="w-3 h-3 mr-1" />
                                Hapus
                            </Button>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">
                                Akun (CoA) *
                            </label>
                            <Controller
                                control={control}
                                name={`lines.${idx}.chart_of_account_uid`}
                                render={({ field: selectField }) => (
                                    <CoaPickerTrigger
                                        accounts={flatAccounts}
                                        value={selectField.value || ""}
                                        onChange={(val) => onAccountSelect(idx, val)}
                                        excludeUids={otherSelectedUids}
                                        placeholder="Pilih akun..."
                                        dialogTitle="Pilih Akun Baris Jurnal"
                                        size="sm"
                                        allowClear
                                        className={cn("w-full h-8 text-xs", accountError && "border-rose-400")}
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase">
                                Keterangan Baris
                            </label>
                            <Controller
                                control={control}
                                name={`lines.${idx}.description`}
                                render={({ field: descField }) => (
                                    <input
                                        type="text"
                                        value={descField.value || ""}
                                        onChange={descField.onChange}
                                        placeholder="Keterangan..."
                                        className="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none"
                                    />
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-0.5">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-emerald-600 uppercase">
                                    Debit (Rp)
                                </label>
                                <Controller
                                    control={control}
                                    name={`lines.${idx}.debit`}
                                    render={({ field: debitField }) => (
                                        <NumberInput
                                            value={debitField.value ? Number(debitField.value) : null}
                                            onChange={(val) => {
                                                debitField.onChange(val || 0);
                                            }}
                                            allowNegative={false}
                                            placeholder="0"
                                            className="h-8 text-xs text-right font-mono font-bold"
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-rose-600 uppercase">
                                    Kredit (Rp)
                                </label>
                                <Controller
                                    control={control}
                                    name={`lines.${idx}.credit`}
                                    render={({ field: creditField }) => (
                                        <NumberInput
                                            value={creditField.value ? Number(creditField.value) : null}
                                            onChange={(val) => {
                                                creditField.onChange(val || 0);
                                            }}
                                            allowNegative={false}
                                            placeholder="0"
                                            className="h-8 text-xs text-right font-mono font-bold"
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                );
            })}

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddLine}
                className="w-full h-8 text-xs font-bold text-indigo-600 border-dashed rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
                <IconPlus className="w-3.5 h-3.5" />
                Tambah Baris Akun
            </Button>

            {/* Mobile Summary Box */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between font-mono">
                    <span className="text-slate-500 font-bold">Total Debit:</span>
                    <span className="font-black text-emerald-600">{formatRupiah(totalDebit)}</span>
                </div>
                <div className="flex justify-between font-mono">
                    <span className="text-slate-500 font-bold">Total Kredit:</span>
                    <span className="font-black text-rose-600">{formatRupiah(totalCredit)}</span>
                </div>
                <div className="flex justify-between font-mono pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Selisih:</span>
                    <span
                        className={cn(
                            "font-black",
                            isBalanced ? "text-emerald-600" : "text-amber-600"
                        )}
                    >
                        {formatRupiah(difference)}
                    </span>
                </div>
                <div className="pt-1 text-center">
                    {isBalanced ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600">
                            <IconCircleCheck className="w-3.5 h-3.5" />
                            Seimbang (Siap Posting)
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-600">
                            <IconAlertCircle className="w-3.5 h-3.5" />
                            Belum Seimbang
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
