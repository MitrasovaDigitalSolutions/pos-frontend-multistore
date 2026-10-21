import type { Product } from "@/features/master/products/types";

export interface AdjustmentElementIds {
    card?: string;
    quantityField?: string;
    quantityInput?: string;
    reasonField?: string;
    reasonInput?: string;
    submitButton?: string;
}

export interface ProductAdjustmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    onSuccess?: () => void;
    elementIds?: AdjustmentElementIds;
}

export interface AdjustmentFormValues {
    amount: number;
    alasan: string;
}

export type AdjustmentDirection = "add" | "subtract";
