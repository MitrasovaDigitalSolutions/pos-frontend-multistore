"use client";

import { FormProvider } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { IconLock } from "@tabler/icons-react";
import { useProductAdjustment } from "./hooks/use-product-adjustment";
import { AdjustmentHeader } from "./components/adjustment-header";
import { AdjustmentProductCard } from "./components/adjustment-product-card";
import { AdjustmentDirectionControl } from "./components/adjustment-direction-control";
import { AdjustmentAmountSection } from "./components/adjustment-amount-section";
import { AdjustmentReasonSection } from "./components/adjustment-reason-section";
import { AdjustmentDialogFooter } from "./components/adjustment-dialog-footer";
import { DEFAULT_ADJUSTMENT_ELEMENT_IDS } from "./constants";
import type { ProductAdjustmentDialogProps } from "./types";

export function ProductAdjustmentDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
    elementIds,
}: ProductAdjustmentDialogProps) {
    const {
        methods,
        setValue,
        watchAlasan,
        currentStock,
        unitLabel,
        numericAmount,
        calculatedDelta,
        previewFinalStock,
        adjustmentType,
        setAdjustmentType,
        canManualAdjustment,
        isPending,
        onSubmit,
    } = useProductAdjustment({
        open,
        onOpenChange,
        product,
        onSuccess,
    });

    if (!product) return null;

    const ids = {
        card: elementIds?.card || DEFAULT_ADJUSTMENT_ELEMENT_IDS.card,
        quantityField: elementIds?.quantityField || DEFAULT_ADJUSTMENT_ELEMENT_IDS.quantityField,
        quantityInput: elementIds?.quantityInput || DEFAULT_ADJUSTMENT_ELEMENT_IDS.quantityInput,
        reasonField: elementIds?.reasonField || DEFAULT_ADJUSTMENT_ELEMENT_IDS.reasonField,
        reasonInput: elementIds?.reasonInput || DEFAULT_ADJUSTMENT_ELEMENT_IDS.reasonInput,
        submitButton: elementIds?.submitButton || DEFAULT_ADJUSTMENT_ELEMENT_IDS.submitButton,
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            scrollable={false}
            title={<AdjustmentHeader canManualAdjustment={canManualAdjustment} />}
            className="sm:max-w-md"
        >
            <FormProvider {...methods}>
                <form onSubmit={onSubmit} className="space-y-3 pt-0.5">
                    {/* Policy Disabled Banner */}
                    {!canManualAdjustment && (
                        <div className="p-2.5 bg-amber-50/90 border border-amber-200/80 rounded-xl flex items-start gap-2 text-amber-900 text-xs">
                            <IconLock size={15} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                                <p className="font-bold text-[11px] text-amber-950">Fitur Penyesuaian Dinonaktifkan</p>
                                <p className="text-[10px] text-amber-800">
                                    Toko cabang dilarang mengubah stok manual. Perubahan stok harus melalui Stok Opname atau Penerimaan Pembelian.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Product & Current Stock Compact Card */}
                    <AdjustmentProductCard
                        id={ids.card}
                        product={product}
                        currentStock={currentStock}
                        unitLabel={unitLabel}
                    />

                    {/* Direction Selection (Segmented Control) */}
                    <AdjustmentDirectionControl
                        value={adjustmentType}
                        onChange={setAdjustmentType}
                        disabled={!canManualAdjustment || isPending}
                    />

                    {/* Quantity Input & Live Preview Bento Grid */}
                    <AdjustmentAmountSection
                        fieldId={ids.quantityField}
                        inputId={ids.quantityInput}
                        disabled={!canManualAdjustment || isPending}
                        previewFinalStock={previewFinalStock}
                        calculatedDelta={calculatedDelta}
                        unitLabel={unitLabel}
                    />

                    {/* Alasan Penyesuaian with Quick Selection Chips */}
                    <AdjustmentReasonSection
                        fieldId={ids.reasonField}
                        inputId={ids.reasonInput}
                        value={watchAlasan}
                        onChange={(val) => setValue("alasan", val)}
                        disabled={!canManualAdjustment || isPending}
                    />

                    {/* Action Buttons */}
                    <AdjustmentDialogFooter
                        canManualAdjustment={canManualAdjustment}
                        isPending={isPending}
                        numericAmount={numericAmount}
                        hasReason={Boolean(watchAlasan?.trim())}
                        onClose={() => onOpenChange(false)}
                        submitButtonId={ids.submitButton}
                    />
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
