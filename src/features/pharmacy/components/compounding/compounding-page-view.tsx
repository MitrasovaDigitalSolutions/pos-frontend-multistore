"use client";

import { useEffect } from "react";
import {
    IconArrowLeft,
    IconBookmarks,
    IconBottle,
    IconPill,
    IconShoppingCartPlus,
    IconX,
} from "@tabler/icons-react";
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Scrollable } from "@/components/ui/scrollable";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useCompoundingForm } from "../../hooks/use-compounding-form";
import { CompoundingFeesPanel } from "./compounding-fees-panel";
import { CompoundingHeaderCard } from "./compounding-header-card";
import { CompoundingIngredientPicker } from "./compounding-ingredient-picker";
import { CompoundingIngredientTable } from "./compounding-ingredient-table";
import { TemplatePickerDialog } from "../templates/template-picker-dialog";

interface CompoundingPageViewProps {
    draftId?: string;
    templateId?: string;
}

export function CompoundingPageView({ draftId, templateId }: CompoundingPageViewProps) {
    const {
        methods,
        ingredients,
        jumlahKemasan,
        tuslahFee,
        embalaseFee,
        subtotalIngredients,
        totalHarga,
        isSaveDisabled,
        isSavingToMaster,
        appliedTemplate,
        isLockedToTemplate,
        isTemplatePickerOpen,
        setIsTemplatePickerOpen,
        handleSelectProduct,
        handleUpdateKuantitas,
        handleUpdateDosis,
        handleRemoveIngredient,
        handleSelectTemplate,
        handleUpdateJumlahKemasan,
        handleUnlockTemplate,
        handleRelockTemplate,
        onSave,
        onSaveToMaster,
        onCancel,
        isEditing,
    } = useCompoundingForm(draftId, templateId);

    // Global keyboard shortcuts for fast cashier interaction
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (!isSaveDisabled) {
                    onSave();
                }
            } else if (e.key === "Escape" && !isTemplatePickerOpen) {
                e.preventDefault();
                onCancel();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isSaveDisabled, onSave, onCancel, isTemplatePickerOpen]);

    return (
        <FormProvider {...methods}>
            <div className="h-[100dvh] max-h-[100dvh] bg-slate-100/70 dark:bg-slate-950 flex flex-col overflow-hidden">
                {/* Top Bar Header */}
                <header className="bg-slate-900 text-white h-11 px-3 sm:px-4 flex items-center justify-between border-b border-slate-800 shrink-0 z-50 shadow-xs">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            title="Kembali ke Layar Kasir (Esc)"
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                        >
                            <IconArrowLeft size={16} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                                <IconPill size={14} />
                            </div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xs sm:text-sm font-bold tracking-wide">
                                    {isEditing ? "Edit Racikan Obat" : "Peracikan Obat (Apotek)"}
                                </h1>
                                <span className="hidden md:inline-block text-[10px] text-slate-400 border-l border-slate-700 pl-2">
                                    Pemotongan stok otomatis FEFO saat checkout
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsTemplatePickerOpen(true)}
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                            <IconBookmarks size={14} />
                            <span>Gunakan Template</span>
                        </button>
                    </div>
                </header>

                {/* Main Content Workspace - Compact, Responsive 2 Columns */}
                <main className="flex-1 min-h-0 p-2 sm:p-3 max-w-[1440px] mx-auto w-full overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 h-full min-h-0 items-stretch">
                        {/* Left Column (Info Racikan & Biaya Jasa) - 5 cols */}
                        <div className="lg:col-span-5 h-full min-h-0 flex flex-col">
                            <Scrollable className="flex-1 min-h-0 pr-1 sm:pr-1.5" scrollbarClassName="z-20">
                                <div className="space-y-2.5 pb-2">
                                    <CompoundingHeaderCard
                                        onUpdateJumlahKemasan={handleUpdateJumlahKemasan}
                                    />

                                    <CompoundingFeesPanel
                                        subtotalIngredients={subtotalIngredients}
                                        tuslahFee={tuslahFee}
                                        embalaseFee={embalaseFee}
                                        totalHarga={totalHarga}
                                    />
                                </div>
                            </Scrollable>
                        </div>

                        {/* Right Column (Barcode Scanner & Komposisi Bahan Cards) - 7 cols */}
                        <div className="lg:col-span-7 h-full min-h-0 flex flex-col gap-2">
                            {/* Barcode Search at the top */}
                            <div className="shrink-0">
                                <CompoundingIngredientPicker
                                    onSelectProduct={handleSelectProduct}
                                    disabled={isLockedToTemplate}
                                    disabledMessage="Formula menggunakan template standar terkunci. Klik 'Kustomisasi Formula' untuk menambah obat lain."
                                    onUnlock={handleUnlockTemplate}
                                />
                            </div>

                            {/* Ingredients Card List */}
                            <div className="flex-1 min-h-0 flex flex-col">
                                <CompoundingIngredientTable
                                    ingredients={ingredients}
                                    jumlahKemasan={jumlahKemasan}
                                    onUpdateKuantitas={handleUpdateKuantitas}
                                    onUpdateDosis={handleUpdateDosis}
                                    isLocked={isLockedToTemplate}
                                    templateName={appliedTemplate?.nama_racikan}
                                    onUnlock={handleUnlockTemplate}
                                    onRelock={handleRelockTemplate}
                                    onDelete={(row) => {
                                        const idx = ingredients.findIndex((it) => it.product_uid === row.product_uid);
                                        if (idx !== -1) {
                                            handleRemoveIngredient(idx);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Floating Bottom Action Bar — Always Visible Like in Fitur Pembelian */}
                <footer className="sticky bottom-0 shrink-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-2.5 sm:px-4 shadow-xl">
                    <div className="max-w-[1440px] mx-auto flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5 sm:gap-4">
                        {/* Left: Quick Stats Summary */}
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                                <IconBottle size={14} className="shrink-0" />
                                <span className="text-[10px] font-bold tracking-wider">
                                    {ingredients.length} Bahan ({jumlahKemasan} Kemasan)
                                </span>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                    <span>Jasa & Wadah:</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                                        {formatRupiah(tuslahFee + embalaseFee)}
                                    </span>
                                </div>
                                <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-500">Total Harga:</span>
                                    <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                                        {formatRupiah(totalHarga)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Floating Actions (Batal, Simpan ke Master, Masukkan ke Keranjang) */}
                        <div className="flex items-center gap-2 self-end xs:self-auto w-full xs:w-auto">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="h-9 px-3.5 rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex-1 xs:flex-initial"
                            >
                                <IconX size={15} />
                                <span>Batal</span>
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onSaveToMaster}
                                disabled={isSaveDisabled || isSavingToMaster}
                                className="h-9 px-3.5 rounded-xl text-xs font-bold border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 cursor-pointer flex items-center justify-center gap-1.5 flex-1 xs:flex-initial"
                                title="Simpan formula racikan ini ke Master Template"
                            >
                                <IconBookmarks size={15} className="text-emerald-600" />
                                <span>{isSavingToMaster ? "Menyimpan..." : "Simpan ke Master"}</span>
                            </Button>
                            <Button
                                type="button"
                                onClick={onSave}
                                disabled={isSaveDisabled}
                                className="h-9 px-4 sm:px-5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-1.5 flex-2 xs:flex-initial"
                            >
                                <IconShoppingCartPlus size={16} />
                                <span>{isEditing ? "Perbarui Racikan" : "Masukkan ke Keranjang"}</span>
                                <kbd className="hidden sm:inline-block text-[9px] bg-emerald-700/80 px-1 py-0.5 rounded font-mono">
                                    Ctrl+Enter
                                </kbd>
                            </Button>
                        </div>
                    </div>
                </footer>

                {/* Template Picker Dialog */}
                <TemplatePickerDialog
                    open={isTemplatePickerOpen}
                    onOpenChange={setIsTemplatePickerOpen}
                    onSelectTemplate={handleSelectTemplate}
                />
            </div>
        </FormProvider>
    );
}
