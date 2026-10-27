"use client";

import { useEffect } from "react";
import { IconArrowLeft, IconBottle, IconClipboardPlus, IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { MedicineIngredientPicker } from "@/components/shared/medicine-ingredient-picker";
import { useTemplateForm } from "../../hooks/use-template-form";
import { TemplateCreateHeaderCard } from "./template-create-header-card";
import { TemplateCreateFeesPanel } from "./template-create-fees-panel";
import { TemplateCreateIngredientTable } from "./template-create-ingredient-table";

export function TemplateCreatePageView() {
    const {
        methods,
        ingredients,
        subtotalIngredients,
        totalEstimasi,
        isSaveDisabled,
        handleAddProduct,
        handleUpdateQty,
        handleUpdateDosis,
        handleRemove,
        onCancel,
        onSave,
        isPending,
    } = useTemplateForm();

    // Global keyboard shortcuts for rapid pharmacy data entry
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (!isSaveDisabled) {
                    onSave();
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSaveDisabled, onSave, onCancel]);

    return (
        <FormProvider {...methods}>
            <div className="space-y-3 pb-20 sm:pb-12">
                {/* Header Row */}
                <div className="flex items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            title="Kembali ke Daftar Template (Esc)"
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                            <IconArrowLeft size={16} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 flex items-center justify-center shrink-0">
                                <IconClipboardPlus size={18} />
                            </div>
                            <div>
                                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                    Tambah Template Racikan Master
                                </h2>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                    Master formula racikan standar untuk kemudahan kasir apotek
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Responsive Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                    {/* Left Column: Template Information & Fees Breakdown (5 Cols) */}
                    <div className="lg:col-span-5 space-y-3">
                        <TemplateCreateHeaderCard />

                        <TemplateCreateFeesPanel
                            subtotalIngredients={subtotalIngredients}
                            totalEstimasi={totalEstimasi}
                        />
                    </div>

                    {/* Right Column: Barcode Medicine Scanner & Ingredients Cards (7 Cols) */}
                    <div className="lg:col-span-7 space-y-3 flex flex-col min-h-[480px]">
                        {/* Barcode Search at the top */}
                        <MedicineIngredientPicker
                            onSelectProduct={handleAddProduct}
                        />

                        {/* Ingredients Card List */}
                        <div className="flex-1 min-h-[340px] flex flex-col">
                            <TemplateCreateIngredientTable
                                ingredients={ingredients}
                                onUpdateQty={handleUpdateQty}
                                onUpdateDosis={handleUpdateDosis}
                                onRemove={handleRemove}
                            />
                        </div>
                    </div>
                </div>

                {/* Floating Bottom Action Bar — Always Visible Like in Fitur Pembelian */}
                <div className="sticky bottom-2 sm:bottom-0 z-30 mt-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-900/10 p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                        {/* Left: Summary Stats */}
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                                <IconBottle size={14} className="shrink-0" />
                                <span className="text-[10px] font-bold tracking-wider">
                                    {ingredients.length} Bahan Formula
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <span>Bahan:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                                        {formatRupiah(subtotalIngredients)}
                                    </span>
                                </div>
                                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500">Total Estimasi:</span>
                                    <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                        {formatRupiah(totalEstimasi)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Floating Actions (Batal & Simpan Template) */}
                        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="h-9 px-3.5 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex-1 sm:flex-initial"
                            >
                                <IconX size={15} />
                                <span>Batal</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={onSave}
                                disabled={isSaveDisabled}
                                className="h-9 px-4 sm:px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5 flex-2 sm:flex-initial"
                            >
                                <IconDeviceFloppy size={16} />
                                <span>{isPending ? "Menyimpan..." : "Simpan Template Racikan"}</span>
                                <kbd className="hidden sm:inline-block text-[9px] bg-emerald-700/80 px-1 py-0.5 rounded font-mono">
                                    Ctrl+Enter
                                </kbd>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}
