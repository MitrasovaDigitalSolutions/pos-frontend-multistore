"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useBranchPolicy } from "@/hooks/use-branch-policy";
import { useIsCentralStore } from "@/hooks/use-active-store";
import { useStockTutorialStore } from "@/stores/stock-tutorial-store";
import { useCreateAdjustment } from "@/features/stock/api/stock-api";
import type { AdjustmentInput } from "@/features/stock/schemas/adjustment-schema";
import type { Product } from "@/features/master/products/types";
import type { AdjustmentDirection, AdjustmentFormValues } from "../types";

interface UseProductAdjustmentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onSuccess?: () => void;
}

export function useProductAdjustment({
    open,
    onOpenChange,
    product,
    onSuccess,
}: UseProductAdjustmentProps) {
    const createAdjustment = useCreateAdjustment();
    const isCentralStore = useIsCentralStore();
    const canManualAdjustmentPolicy = useBranchPolicy("branch_can_manual_stock_adjustment");
    const canManualAdjustment = isCentralStore || canManualAdjustmentPolicy;

    const [adjustmentType, setAdjustmentType] = useState<AdjustmentDirection>("add");

    // Reset adjustment type during render when open changes
    const [prevOpen, setPrevOpen] = useState(open);
    if (open !== prevOpen) {
        setPrevOpen(open);
        if (open) {
            setAdjustmentType("add");
        }
    }

    const methods = useForm<AdjustmentFormValues>({
        defaultValues: {
            amount: 1,
            alasan: "Koreksi Stok Fisik",
        },
    });

    const { handleSubmit, reset, control, setValue } = methods;
    const watchAmount = useWatch({ control, name: "amount" });
    const watchAlasan = useWatch({ control, name: "alasan" });

    // Reset form values when dialog opens with product
    useEffect(() => {
        if (open && product) {
            reset({
                amount: 1,
                alasan: "Koreksi Stok Fisik",
            });
        }
    }, [open, product, reset]);

    const currentStock = Number(product?.stok ?? 0);
    const unitLabel = product?.unit?.simbol || product?.satuan || "Unit";
    const rawAmount = Number(watchAmount) || 0;
    const numericAmount = Math.abs(rawAmount);

    // If input is negative (e.g. from tutorial typing -2), automatically derive subtract direction
    const effectiveAdjustmentType: AdjustmentDirection = rawAmount < 0 ? "subtract" : adjustmentType;

    const handleDirectionChange = (type: AdjustmentDirection) => {
        setAdjustmentType(type);
        if (type === "add" && rawAmount < 0) {
            setValue("amount", Math.abs(rawAmount));
        }
    };

    const calculatedDelta = effectiveAdjustmentType === "add" ? numericAmount : -numericAmount;
    const previewFinalStock = currentStock + calculatedDelta;

    const onSubmit = handleSubmit((data) => {
        if (!canManualAdjustment) {
            toast.error("Penyesuaian stok manual di toko cabang dinonaktifkan oleh Pusat.");
            return;
        }

        if (!product?.uid) {
            toast.error("Data produk tidak valid.");
            return;
        }

        const delta = effectiveAdjustmentType === "add" ? Math.abs(data.amount) : -Math.abs(data.amount);
        if (delta === 0) {
            toast.error("Kuantitas perubahan stok tidak boleh 0.");
            return;
        }

        if (!data.alasan?.trim()) {
            toast.error("Alasan penyesuaian wajib diisi.");
            return;
        }

        if (useStockTutorialStore.getState().isRunning) {
            toast.success("Penyesuaian stok manual berhasil disimpan!");
            onOpenChange(false);
            onSuccess?.();
            return;
        }

        const payload: AdjustmentInput = {
            product_uid: product.uid,
            kuantitas: delta,
            alasan: data.alasan.trim(),
        };

        createAdjustment.mutate(payload, {
            onSuccess: () => {
                toast.success(
                    `Stok ${product.nama} berhasil disesuaikan (${delta > 0 ? `+${delta}` : delta} ${unitLabel}).`
                );
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (err: unknown) => {
                const message = err instanceof Error ? err.message : "Gagal menyesuaikan stok produk.";
                toast.error(message);
            },
        });
    });

    return {
        methods,
        setValue,
        watchAlasan,
        currentStock,
        unitLabel,
        numericAmount,
        calculatedDelta,
        previewFinalStock,
        adjustmentType: effectiveAdjustmentType,
        setAdjustmentType: handleDirectionChange,
        canManualAdjustment,
        isPending: createAdjustment.isPending,
        onSubmit,
    };
}
