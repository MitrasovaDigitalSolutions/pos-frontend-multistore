"use client";

import { FormProvider } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { FormSelect } from "@/components/forms/form-select";
import { FormInput } from "@/components/forms/form-input";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { AppButton } from "@/components/shared/app-button";
import { IconClipboardPlus } from "@tabler/icons-react";
import { COMPOUNDED_TYPES } from "../../constants/pharmacy-constants";
import { useTemplateForm, type TemplateFormValues } from "../../hooks/use-template-form";
import { TemplateIngredientEditor } from "./template-ingredient-editor";

interface TemplateFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function TemplateFormDialog({
    open,
    onOpenChange,
    onSuccess,
}: TemplateFormDialogProps) {
    const {
        methods,
        ingredients,
        handleAddProduct,
        handleUpdateQty,
        handleUpdateDosis,
        handleRemove,
        onSubmit,
        isPending,
    } = useTemplateForm(onSuccess, () => onOpenChange(false));

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            className="sm:max-w-2xl"
            title={
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <IconClipboardPlus size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                            Tambah Template Racikan Master
                        </h2>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Simpan formula racikan standar untuk kemudahan dan kecepatan kasir apotek
                        </p>
                    </div>
                </div>
            }
        >
            <FormProvider {...methods}>
                <form onSubmit={onSubmit} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <FormInput<TemplateFormValues>
                            name="nama_racikan"
                            label="Nama Racikan *"
                            placeholder="Contoh: Puyer Batuk Anak Standar"
                        />

                        <FormSelect<TemplateFormValues>
                            name="jenis_racikan"
                            label="Bentuk Sediaan"
                            placeholder="Pilih bentuk sediaan"
                            options={COMPOUNDED_TYPES.map((t) => ({
                                value: t.value,
                                label: t.label,
                            }))}
                        />
                    </div>

                    <FormInput<TemplateFormValues>
                        name="aturan_pakai"
                        label="Aturan Pakai Standar (Signa)"
                        placeholder="Contoh: 3x1 bungkus sesudah makan"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <FormNominalInput<TemplateFormValues>
                            name="tuslah_fee"
                            label="Biaya Jasa Tuslah (Rp)"
                            placeholder="0"
                        />
                        <FormNominalInput<TemplateFormValues>
                            name="embalase_fee"
                            label="Biaya Kemasan Embalase (Rp)"
                            placeholder="0"
                        />
                    </div>

                    {/* Ingredients Section */}
                    <TemplateIngredientEditor
                        ingredients={ingredients}
                        onAddProduct={handleAddProduct}
                        onUpdateQty={handleUpdateQty}
                        onUpdateDosis={handleUpdateDosis}
                        onRemove={handleRemove}
                    />

                    {/* Dialog Actions */}
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <AppButton
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            Batal
                        </AppButton>
                        <AppButton
                            type="submit"
                            size="sm"
                            isLoading={isPending}
                        >
                            Simpan Template Racikan
                        </AppButton>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
