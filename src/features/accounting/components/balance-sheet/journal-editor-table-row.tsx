"use client";

import { Controller, type Control, type UseFormSetValue, type FieldErrors } from "react-hook-form";
import { TableRow, TableCell } from "@/components/ui/table";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { NumberInput } from "@/components/ui/number-input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { ManualJournalSchemaInput } from "@/features/accounting/schemas/manual-journal-schema";

interface JournalEditorTableRowProps {
    index: number;
    control: Control<ManualJournalSchemaInput>;
    setValue: UseFormSetValue<ManualJournalSchemaInput>;
    accountOptions: CommandOption[];
    errors?: FieldErrors<ManualJournalSchemaInput>["lines"];
    canDelete: boolean;
    onRemove: (idx: number) => void;
}

export function JournalEditorTableRow({
    index,
    control,
    accountOptions,
    errors,
    canDelete,
    onRemove,
}: JournalEditorTableRowProps) {
    const rowErrors = Array.isArray(errors) ? errors[index] : undefined;
    const accountError = rowErrors?.chart_of_account_uid?.message;

    return (
        <TableRow className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
            {/* Row Number */}
            <TableCell className="py-2 px-3 text-center text-xs font-mono text-slate-400">
                {index + 1}
            </TableCell>

            {/* COA Searchable Select */}
            <TableCell className="py-1.5 px-3">
                <Controller
                    control={control}
                    name={`lines.${index}.chart_of_account_uid`}
                    render={({ field: selectField }) => (
                        <CommandSelect
                            options={accountOptions}
                            value={selectField.value || ""}
                            onChange={selectField.onChange}
                            placeholder="Pilih akun..."
                            searchPlaceholder="Cari kode/nama akun..."
                            size="sm"
                            className={cn(
                                "h-8 text-xs rounded-lg",
                                accountError && "border-rose-400 focus:border-rose-500"
                            )}
                        />
                    )}
                />
            </TableCell>

            {/* Line Description */}
            <TableCell className="py-1.5 px-3">
                <Controller
                    control={control}
                    name={`lines.${index}.description`}
                    render={({ field: descField }) => (
                        <input
                            type="text"
                            value={descField.value || ""}
                            onChange={descField.onChange}
                            placeholder="Keterangan baris..."
                            className="w-full h-8 px-2.5 text-xs rounded-lg bg-transparent border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400"
                        />
                    )}
                />
            </TableCell>

            {/* Debit Input */}
            <TableCell className="py-1.5 px-3">
                <Controller
                    control={control}
                    name={`lines.${index}.debit`}
                    render={({ field: debitField }) => {
                        const numVal = Number(debitField.value) || 0;
                        return (
                            <NumberInput
                                value={numVal || null}
                                onChange={(val) => {
                                    debitField.onChange(val || 0);
                                }}
                                allowNegative={false}
                                placeholder="0"
                                className={cn(
                                    "h-8 text-xs text-right font-mono font-bold rounded-lg border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500",
                                    numVal > 0 &&
                                        "text-emerald-700 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60"
                                )}
                            />
                        );
                    }}
                />
            </TableCell>

            {/* Credit Input */}
            <TableCell className="py-1.5 px-3">
                <Controller
                    control={control}
                    name={`lines.${index}.credit`}
                    render={({ field: creditField }) => {
                        const numVal = Number(creditField.value) || 0;
                        return (
                            <NumberInput
                                value={numVal || null}
                                onChange={(val) => {
                                    creditField.onChange(val || 0);
                                }}
                                allowNegative={false}
                                placeholder="0"
                                className={cn(
                                    "h-8 text-xs text-right font-mono font-bold rounded-lg border-slate-200 dark:border-slate-800 focus-visible:ring-rose-500",
                                    numVal > 0 &&
                                        "text-rose-700 dark:text-rose-400 bg-rose-50/40 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/60"
                                )}
                            />
                        );
                    }}
                />
            </TableCell>

            {/* Action Remove */}
            <TableCell className="py-1.5 px-3 text-center">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            type="button"
                            disabled={!canDelete}
                            onClick={() => onRemove(index)}
                            className={cn(
                                "p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded transition-colors border-none bg-transparent cursor-pointer",
                                !canDelete && "opacity-40 cursor-not-allowed hover:bg-transparent"
                            )}
                        >
                            <IconTrash size={16} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {!canDelete ? "Minimal harus ada 2 baris akun" : "Hapus baris akun"}
                    </TooltipContent>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}
