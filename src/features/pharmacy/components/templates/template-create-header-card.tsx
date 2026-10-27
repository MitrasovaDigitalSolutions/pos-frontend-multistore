"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { IconClipboardCheck } from "@tabler/icons-react";
import { useFormContext, useWatch } from "react-hook-form";
import {
    COMPOUNDED_TYPES,
    FREQUENT_SIGNA_PRESETS,
} from "../../constants/pharmacy-constants";
import type { TemplateFormValues } from "../../hooks/use-template-form";

export function TemplateCreateHeaderCard() {
    const { setValue, control } = useFormContext<TemplateFormValues>();

    const currentSigna = useWatch({ control, name: "aturan_pakai" });
    const currentJenis = useWatch({ control, name: "jenis_racikan" });

    const selectOptions = COMPOUNDED_TYPES.map((t) => ({
        value: t.value,
        label: t.label,
    }));

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                    <IconClipboardCheck size={15} />
                </div>
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        1. Informasi Formula Racikan Master
                    </h3>
                    <p className="text-[10px] text-slate-500">
                        Nama template, bentuk sediaan standar, dan aturan pakai (signa)
                    </p>
                </div>
            </div>

            <div className="space-y-2.5">
                <div>
                    <FormInput<TemplateFormValues>
                        name="nama_racikan"
                        label="Nama Template Racikan *"
                        placeholder="Contoh: Puyer Batuk Anak Standar, Kapsul Lambung Dewasa..."
                    />
                </div>

                <div className="space-y-1">
                    <FormSelect<TemplateFormValues>
                        name="jenis_racikan"
                        label="Bentuk Sediaan"
                        placeholder="Pilih bentuk sediaan"
                        options={selectOptions}
                    />
                    {/* Quick Pills for common dosage forms */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                        {COMPOUNDED_TYPES.slice(0, 4).map((type) => {
                            const isActive = currentJenis === type.value;
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setValue("jenis_racikan", type.value, { shouldValidate: true })}
                                    className={`text-[9.5px] px-1.5 py-0.5 rounded transition-colors cursor-pointer border ${
                                        isActive
                                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-bold"
                                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 hover:bg-slate-100"
                                    }`}
                                >
                                    {type.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-1">
                    <FormInput<TemplateFormValues>
                        name="aturan_pakai"
                        label="Aturan Pakai Standar (Signa)"
                        placeholder="Contoh: 3x1 sehari sesudah makan"
                    />

                    {/* Quick Signa Presets */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                        {FREQUENT_SIGNA_PRESETS.slice(0, 4).map((preset) => {
                            const isActive = currentSigna === preset;
                            return (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setValue("aturan_pakai", preset, { shouldValidate: true })}
                                    className={`text-[9.5px] px-1.5 py-0.5 rounded transition-colors cursor-pointer border ${
                                        isActive
                                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-bold"
                                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 hover:bg-slate-100"
                                    }`}
                                >
                                    {preset}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
