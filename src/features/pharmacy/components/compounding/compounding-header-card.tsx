"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { IconClipboardCheck } from "@tabler/icons-react";
import { useFormContext, useWatch } from "react-hook-form";
import {
    COMPOUNDED_TYPES,
    FREQUENT_SIGNA_PRESETS,
} from "../../constants/pharmacy-constants";
import type { CompoundedItemFormValues } from "../../schemas/compounded-item-schema";

export interface CompoundingHeaderCardProps {
    onUpdateJumlahKemasan?: (cnt: number) => void;
}

export function CompoundingHeaderCard({
    onUpdateJumlahKemasan,
}: CompoundingHeaderCardProps = {}) {
    const { setValue, control } = useFormContext<CompoundedItemFormValues>();

    const currentSigna = useWatch({ control, name: "aturan_pakai" });
    const currentJenis = useWatch({ control, name: "jenis_racikan" });
    const currentKemasan = useWatch({ control, name: "jumlah_kemasan" });

    const selectOptions = COMPOUNDED_TYPES.map((t) => ({
        value: t.value,
        label: t.label,
    }));

    const PACK_PRESETS = [5, 10, 12, 15, 20];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                    <IconClipboardCheck size={15} />
                </div>
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        1. Informasi Racikan Obat
                    </h3>
                    <p className="text-[10px] text-slate-500">
                        Nama formula, bentuk sediaan, jumlah kemasan, dan aturan pakai
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="sm:col-span-2">
                    <FormInput<CompoundedItemFormValues>
                        name="nama_racikan"
                        label="Nama Racikan *"
                        placeholder="Contoh: Puyer Batuk & Flu Anak"
                    />
                </div>

                <div className="space-y-1">
                    <FormSelect<CompoundedItemFormValues>
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
                    <FormNumberInput<CompoundedItemFormValues>
                        name="jumlah_kemasan"
                        label="Jumlah Kemasan"
                        placeholder="10"
                        min={1}
                        onValueChange={(val) => {
                            if (val && val > 0) {
                                onUpdateJumlahKemasan?.(val);
                            }
                        }}
                    />
                    {/* Quick Stepper Presets */}
                    <div className="flex flex-wrap items-center gap-1 pt-0.5">
                        <span className="text-[9.5px] text-slate-400">Pilihan:</span>
                        {PACK_PRESETS.map((cnt) => {
                            const isActive = Number(currentKemasan) === cnt;
                            return (
                                <button
                                    key={cnt}
                                    type="button"
                                    onClick={() => {
                                        setValue("jumlah_kemasan", cnt, { shouldValidate: true });
                                        onUpdateJumlahKemasan?.(cnt);
                                    }}
                                    className={`text-[9.5px] px-1.5 py-0.5 rounded transition-colors cursor-pointer border ${
                                        isActive
                                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-bold"
                                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 hover:bg-slate-100"
                                    }`}
                                >
                                    {cnt}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="sm:col-span-2 space-y-1">
                    <FormInput<CompoundedItemFormValues>
                        name="aturan_pakai"
                        label="Aturan Pakai (Signa) *"
                        placeholder="Contoh: 3 x 1 bungkus sehari sesudah makan"
                    />
                    {/* Quick Signa Suggestions with Active Highlight */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                        {FREQUENT_SIGNA_PRESETS.slice(0, 5).map((preset) => {
                            const isActive = currentSigna === preset;
                            return (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => setValue("aturan_pakai", preset, { shouldValidate: true })}
                                    className={`text-[9.5px] px-2 py-0.5 rounded-full transition-colors cursor-pointer border ${
                                        isActive
                                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 font-semibold"
                                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 hover:bg-slate-100"
                                    }`}
                                >
                                    {preset}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="sm:col-span-2">
                    <FormInput<CompoundedItemFormValues>
                        name="notes"
                        label="Catatan Khusus (Opsional)"
                        placeholder="Contoh: simpan di tempat kering / habiskan"
                    />
                </div>
            </div>
        </div>
    );
}

