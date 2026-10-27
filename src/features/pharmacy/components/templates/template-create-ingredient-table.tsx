"use client";

import type { FieldPath } from "react-hook-form";
import { FormNumberStepperInput } from "@/components/forms/form-number-stepper-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDosisKalkulasi } from "../../utils/pharmacy-calc";
import { IconBottle, IconCalculator, IconPill, IconTrash } from "@tabler/icons-react";
import type { TemplateFormValues, TemplateIngredientFormItem } from "../../hooks/use-template-form";

interface TemplateCreateIngredientTableProps {
    ingredients: TemplateIngredientFormItem[];
    onUpdateQty: (index: number, kuantitas: number) => void;
    onUpdateDosis?: (index: number, dosis: string) => void;
    onRemove: (index: number) => void;
}

export function TemplateCreateIngredientTable({
    ingredients,
    onUpdateQty,
    onRemove,
}: TemplateCreateIngredientTableProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs flex flex-col min-h-0 flex-1 overflow-hidden">
            {/* Header Title */}
            <div className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                        <IconBottle size={15} />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                            Komposisi Formula Master per 1 Kemasan ({ingredients.length})
                        </h3>
                        <p className="text-[10px] text-slate-500">
                            Formula standar per 1 kemasan (puyer/kapsul). Jumlah obat otomatis dikalikan kemasan saat dipakai di kasir.
                        </p>
                    </div>
                </div>
            </div>

            {/* Ingredient Cards Workspace */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
                {ingredients.length === 0 ? (
                    <div className="py-12 sm:py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <IconPill size={24} />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                                    Belum Ada Bahan Obat di Template
                                </p>
                                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                                    Pindai barcode obat atau gunakan kolom pencarian di atas untuk menambahkan bahan formula racikan master.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    ingredients.map((item, idx) => {
                        const calculatedDosis = formatDosisKalkulasi(item.kuantitas, 1, item.satuan);

                        return (
                            <div
                                key={item.product_uid}
                                className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/90 dark:border-slate-700/70 rounded-xl p-3 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all flex flex-col gap-2.5"
                            >
                                {/* Top Row: Nama Obat, Harga Satuan & Tombol Hapus */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-7 h-7 rounded-lg bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                                            <IconPill size={15} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                                {item.nama_produk}
                                            </h4>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                                {item.satuan && <span>Satuan: {item.satuan}</span>}
                                                <span>•</span>
                                                <span>{formatRupiah(item.harga || 0)} / {item.satuan || "item"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => onRemove(idx)}
                                        title="Hapus bahan dari template"
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors cursor-pointer shrink-0"
                                    >
                                        <IconTrash size={15} />
                                    </button>
                                </div>

                                {/* Bottom Row: Kalkulasi Takaran Otomatis, FormNumberInput, Subtotal */}
                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 items-center">
                                    {/* 1. Takaran Dosis (Auto-Calculated Badge) */}
                                    <div className="sm:col-span-6 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-emerald-200/90 dark:border-emerald-800/60 shadow-2xs">
                                        <IconCalculator size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                Takaran per 1 Kemasan
                                            </span>
                                            <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 font-mono truncate">
                                                {calculatedDosis}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 2. Kuantitas Digunakan (FormNumberStepperInput) */}
                                    <div className="sm:col-span-3 flex items-center gap-1.5 justify-between sm:justify-center">
                                        <span className="text-[10px] font-semibold text-slate-400 sm:hidden">Kuantitas:</span>
                                        <div className="flex items-center gap-1.5">
                                            <FormNumberStepperInput<TemplateFormValues>
                                                name={`ingredients.${idx}.kuantitas` as FieldPath<TemplateFormValues>}
                                                min={0.01}
                                                step={1}
                                                allowDecimal={true}
                                                size="sm"
                                                onValueChange={(val) => {
                                                    onUpdateQty(idx, val ?? 1);
                                                }}
                                            />
                                            {item.satuan && (
                                                <span className="text-[10px] text-slate-400 font-mono hidden xs:inline shrink-0">
                                                    {item.satuan}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. Subtotal Harga */}
                                    <div className="sm:col-span-3 text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider sm:block">
                                            Subtotal Bahan
                                        </span>
                                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                                            {formatRupiah(item.subtotal ?? (item.harga || 0) * item.kuantitas)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
