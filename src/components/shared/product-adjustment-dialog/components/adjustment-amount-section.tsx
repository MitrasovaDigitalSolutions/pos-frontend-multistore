"use client";

import { FormNumberInput } from "@/components/forms/form-number-input";
import { IconArrowDownRight, IconArrowUpRight, IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AdjustmentFormValues } from "../types";

interface AdjustmentAmountSectionProps {
    fieldId?: string;
    inputId?: string;
    disabled?: boolean;
    previewFinalStock: number;
    calculatedDelta: number;
    unitLabel: string;
}

export function AdjustmentAmountSection({
    fieldId,
    inputId,
    disabled = false,
    previewFinalStock,
    calculatedDelta,
    unitLabel,
}: AdjustmentAmountSectionProps) {
    return (
        <div className="space-y-2">
            <div id={fieldId} className="grid grid-cols-2 gap-2 items-end">
                <FormNumberInput<AdjustmentFormValues>
                    id={inputId}
                    name="amount"
                    label="Jumlah Kuantitas"
                    placeholder="1"
                    min={1}
                    disabled={disabled}
                    autoFocus
                />

                {/* Resulting Stock Preview Card */}
                <div
                    className={cn(
                        "p-2 rounded-xl border flex flex-col justify-center h-[54px] transition-colors",
                        previewFinalStock < 0
                            ? "bg-rose-50/80 border-rose-200"
                            : "bg-slate-50/80 border-slate-200/80"
                    )}
                >
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none">
                        Estimasi Stok Akhir
                    </span>
                    <div className="flex items-center justify-between mt-1 leading-none">
                        <div className="flex items-center gap-1 font-mono">
                            {calculatedDelta >= 0 ? (
                                <IconArrowUpRight size={14} className="text-emerald-600 shrink-0" />
                            ) : (
                                <IconArrowDownRight size={14} className="text-rose-600 shrink-0" />
                            )}
                            <span
                                className={cn(
                                    "font-black text-sm",
                                    previewFinalStock < 0 ? "text-rose-600" : "text-slate-900"
                                )}
                            >
                                {previewFinalStock}
                            </span>
                            <span className="text-[9px] text-slate-500 font-sans font-semibold">
                                {unitLabel}
                            </span>
                        </div>
                        <span
                            className={cn(
                                "text-[9px] font-bold px-1.5 py-0.5 rounded-md font-mono leading-none",
                                calculatedDelta >= 0
                                    ? "bg-emerald-100/90 text-emerald-800"
                                    : "bg-rose-100/90 text-rose-800"
                            )}
                        >
                            {calculatedDelta >= 0 ? `+${calculatedDelta}` : calculatedDelta}
                        </span>
                    </div>
                </div>
            </div>

            {/* Negative Stock Warning */}
            {previewFinalStock < 0 && (
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-[10px] flex items-center gap-1.5">
                    <IconInfoCircle size={14} className="shrink-0 text-amber-600" />
                    <span>
                        <strong>Peringatan:</strong> Penyesuaian ini menyebabkan stok menjadi minus ({previewFinalStock} {unitLabel}).
                    </span>
                </div>
            )}
        </div>
    );
}
