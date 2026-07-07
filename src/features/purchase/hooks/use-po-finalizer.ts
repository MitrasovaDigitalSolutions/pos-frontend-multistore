"use client";

import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { useAppRouter } from "@/hooks/use-app-router";
import { clearPurchaseItemsStore } from "@/stores/purchase-items-store";
import {
    useCreatePurchaseOrderHeader,
    useUpdatePurchaseOrder,
    useBulkReplacePurchaseOrderItems,
} from "@/features/purchase/api/purchase-api";
import type { PurchaseOrderHeaderInput } from "@/features/purchase/schemas/order-schema";
import type { PurchaseItemLocal, PurchaseOrder } from "@/features/purchase/types";

interface UsePoFinalizerProps {
    currentId: string;
    currentOrder?: PurchaseOrder;
    isCurrentNew: boolean;
    items: PurchaseItemLocal[];
    clearAll: () => void;
    headerForm: UseFormReturn<PurchaseOrderHeaderInput>;
}

export function usePoFinalizer({
    currentId,
    currentOrder: _currentOrder,
    isCurrentNew,
    items,
    clearAll,
    headerForm,
}: UsePoFinalizerProps) {
    const router = useAppRouter();

    const createHeader = useCreatePurchaseOrderHeader();
    const updateHeader = useUpdatePurchaseOrder();
    const bulkReplace = useBulkReplacePurchaseOrderItems();

    const handleSaveFlow = async (data: PurchaseOrderHeaderInput) => {
        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum menyimpan PO.");
            return;
        }

        const payloadHeader = {
            ...data,
            supplier_uid: data.supplier_uid,
            tanggal_po: data.tanggal_po,
            catatan: data.catatan || null,
        };

        try {
            if (isCurrentNew) {
                // 1. Create Purchase Order header
                const res = await createHeader.mutateAsync(payloadHeader);
                const newUid = res.data.uid;

                // 2. Submit items
                const itemsPayload = {
                    items: items.map((item) => ({
                        product_uid: item.product_uid,
                        kuantitas: item.kuantitas,
                        harga_estimasi: item.harga_estimasi,
                    })),
                };

                await bulkReplace.mutateAsync({
                    uid: newUid,
                    data: itemsPayload,
                });

                toast.success("Purchase Order dan daftar barang berhasil disimpan!");
                clearAll();
                clearPurchaseItemsStore("new", "po");
                router.push(`/admin/purchase/order/${newUid}`);
            } else {
                // 1. Update Purchase Order header
                await updateHeader.mutateAsync({
                    uid: currentId,
                    data: payloadHeader,
                });

                // 2. Submit items
                const itemsPayload = {
                    items: items.map((item) => ({
                        product_uid: item.product_uid,
                        kuantitas: item.kuantitas,
                        harga_estimasi: item.harga_estimasi,
                    })),
                };

                await bulkReplace.mutateAsync({
                    uid: currentId,
                    data: itemsPayload,
                });

                toast.success("Perubahan Purchase Order berhasil disimpan!");
                clearAll();
                clearPurchaseItemsStore(currentId, "po");
                router.push(`/admin/purchase/order/${currentId}`);
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyimpan Purchase Order.");
        }
    };

    const handleSaveClick = () => {
        headerForm.handleSubmit(handleSaveFlow, (errors) => {
            console.error("PO form validation errors:", errors);
            toast.error("Harap isi semua kolom wajib dengan benar.");
        })();
    };

    const isSubmitting =
        createHeader.isPending ||
        updateHeader.isPending ||
        bulkReplace.isPending;

    return {
        isSubmitting,
        handleSaveClick,
    };
}
