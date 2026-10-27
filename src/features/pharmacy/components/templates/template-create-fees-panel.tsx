"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconCalculator } from "@tabler/icons-react";
import type { TemplateFormValues } from "../../hooks/use-template-form";
import { useFormContext, useWatch } from "react-hook-form";

interface TemplateCreateFeesPanelProps {
    subtotalIngredients: number;
    totalEstimasi: number;
}

export function TemplateCreateFeesPanel({
    subtotalIngredients,
    totalEstimasi,
}: TemplateCreateFeesPanelProps) {
    const { setValue, control } = useFormContext<TemplateFormValues>();

    const currentTuslah = useWatch({ control, name: "tuslah_fee" });
    const currentEmbalase = useWatch({ control, name: "embalase_fee" });

    const TUSLAH_PRESETS = [0, 2500, 5000];
    const EMBALASE_PRESETS = [0, 1000, 2000];

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                <div className="w-6 h-6 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0">
                    <IconCalculator size={15} />
                </div>
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        2. Biaya Standar & Estimasi Harga
                    </h3>
                    <p className="text-[10px] text-slate-500">
                        Tarif tuslah dan embalase yang otomatis terpasang saat template ini dipilih
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                    <FormNominalInput<TemplateFormValues>
                        name="tuslah_fee"
                        label="Jasa Peracikan (Tuslah)"
                        placeholder="Rp 5.000"
                    />
                    <div className="flex items-center gap-1 pt-0.5">
                        <span className="text-[9.5px] text-slate-400">Pilihan:</span>
                        {TUSLAH_PRESETS.map((fee) => {
                            const isActive = Number(currentTuslah) === fee;
                            return (
                                <button
                                    key={fee}
                                    type="button"
                                    onClick={() => setValue("tuslah_fee", fee, { shouldValidate: true })}
                                    className={`text-[9.5px] px-1.5 py-0.5 rounded transition-colors cursor-pointer border ${
                                        isActive
                                            ? "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 font-bold"
                                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 hover:bg-slate-100"
                                    }`}
                                >
                                    {fee === 0 ? "Gratis" : formatRupiah(fee)}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-1">
                    <FormNominalInput<TemplateFormValues>
                        name="embalase_fee"
                        label="Kemasan / Wadah (Embalase)"
                        placeholder="Rp 2.000"
                    />
                    <div className="flex items-center gap-1 pt-0.5">
                        <span className="text-[9.5px] text-slate-400">Pilihan:</span>
                        {EMBALASE_PRESETS.map((fee) => {
                            const isActive = Number(currentEmbalase) === fee;
                            return (
                                <button
                                    key={fee}
                                    type="button"
                                    onClick={() => setValue("embalase_fee", fee, { shouldValidate: true })}
                                    className={`text-[9.5px] px-1.5 py-0.5 rounded transition-colors cursor-pointer border ${
                                        isActive
                                            ? "bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border-amber-300 font-bold"
                                            : "bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 hover:bg-slate-100"
                                    }`}
                                >
                                    {fee === 0 ? "Gratis" : formatRupiah(fee)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Price Breakdown Summary */}
            <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-xl p-2.5 space-y-1 border border-slate-200/80 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                    <span>Estimasi Subtotal Bahan:</span>
                    <span className="font-bold tabular-nums font-mono">{formatRupiah(subtotalIngredients)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                    <span>Jasa Peracikan (Tuslah):</span>
                    <span className="font-bold tabular-nums font-mono">{formatRupiah(Number(currentTuslah) || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                    <span>Biaya Wadah (Embalase):</span>
                    <span className="font-bold tabular-nums font-mono">{formatRupiah(Number(currentEmbalase) || 0)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        Total Estimasi Harga Formula:
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                        {formatRupiah(totalEstimasi)}
                    </span>
                </div>
            </div>
        </div>
    );
}
