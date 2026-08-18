"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { useAppRouter } from "@/hooks/use-app-router";
import { clearPurchaseItemsStore } from "@/stores/purchase-items-store";
import { toLocalISOString } from "@/lib/date-utils";
import {
    useCreatePurchaseOrderHeader,
    useUpdatePurchaseOrder,
    useBulkReplacePurchaseOrderItems,
    useBulkCreatePurchaseOrder,
    useFinalizePurchaseOrder,
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
    onSaveSuccess: (uid: string, responseData?: PurchaseOrder) => void;
}

export function usePoFinalizer({
    currentId,
    currentOrder: _currentOrder,
    isCurrentNew,
    items,
    clearAll,
    headerForm,
    onSaveSuccess,
}: UsePoFinalizerProps) {
    const router = useAppRouter();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const createHeader = useCreatePurchaseOrderHeader();
    const updateHeader = useUpdatePurchaseOrder();
    const bulkReplace = useBulkReplacePurchaseOrderItems();
    const bulkCreatePO = useBulkCreatePurchaseOrder();
    const finalizeOrder = useFinalizePurchaseOrder();

    const isAnyMutationPending =
        createHeader.isPending ||
        updateHeader.isPending ||
        bulkReplace.isPending ||
        bulkCreatePO.isPending ||
        finalizeOrder.isPending;

    const isConfirmLoading =
        isFinalizing ||
        bulkCreatePO.isPending ||
        updateHeader.isPending ||
        bulkReplace.isPending ||
        finalizeOrder.isPending;

    const isSubmitting = isValidating || isFinalizing || isAnyMutationPending;

    const handleSaveFlow = async (data: PurchaseOrderHeaderInput) => {
        if (isSaving || isFinalizing || isValidating) return;

        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum menyimpan PO.");
            return;
        }

        const payloadHeader = {
            ...data,
            supplier_uid: data.supplier_uid,
            tanggal_po: toLocalISOString(data.tanggal_po),
            catatan: data.catatan || null,
        };

        setIsSaving(true);
        try {
            if (isCurrentNew) {
                // 1. Create Purchase Order header draft
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

                const replaceRes = await bulkReplace.mutateAsync({
                    uid: newUid,
                    data: itemsPayload,
                });

                toast.success("Purchase Order draft berhasil disimpan!");
                clearPurchaseItemsStore("new", "po");
                onSaveSuccess(newUid, replaceRes.data);
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

                const replaceRes = await bulkReplace.mutateAsync({
                    uid: currentId,
                    data: itemsPayload,
                });

                toast.success("Perubahan Purchase Order berhasil disimpan!");
                onSaveSuccess(currentId, replaceRes.data);
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyimpan Purchase Order.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFinalizeConfirm = async () => {
        if (isSaving) return;

        setIsFinalizing(true);
        const headerData = headerForm.getValues();
        const payloadHeader = {
            supplier_uid: headerData.supplier_uid,
            tanggal_po: toLocalISOString(headerData.tanggal_po),
            catatan: headerData.catatan || null,
        };

        try {
            if (isCurrentNew) {
                const payload = {
                    ...payloadHeader,
                    status: "ordered",
                    items: items.map((item) => ({
                        product_uid: item.product_uid,
                        kuantitas: item.kuantitas,
                        harga_estimasi: item.harga_estimasi,
                    })),
                };

                await bulkCreatePO.mutateAsync(payload);

                toast.success("Purchase Order berhasil diproses & dikirim!");
                setIsConfirmOpen(false);
                clearAll();
                clearPurchaseItemsStore("new", "po");
                router.push("/admin/purchase/order");
            } else {
                // 1. Update draft header & items
                await updateHeader.mutateAsync({
                    uid: currentId,
                    data: payloadHeader,
                });

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

                // 2. Finalize
                await finalizeOrder.mutateAsync(currentId);

                toast.success("Purchase Order berhasil diproses & dikirim!");
                setIsConfirmOpen(false);
                clearAll();
                clearPurchaseItemsStore(currentId, "po");
                router.push("/admin/purchase/order");
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal memproses Purchase Order.");
            setIsFinalizing(false);
            setIsConfirmOpen(false);
        }
    };

    const handleSaveClick = () => {
        if (isSaving || isFinalizing || isValidating) return;
        headerForm.handleSubmit(handleSaveFlow, () => {
            toast.error("Harap isi semua kolom wajib dengan benar.");
        })();
    };

    const onProcessClick = async () => {
        if (isValidating || isFinalizing || isSaving) return;

        if (items.length === 0) {
            toast.error("Harap tambahkan minimal 1 barang sebelum memproses PO.");
            return;
        }

        setIsValidating(true);
        try {
            const isHeaderValid = await headerForm.trigger();
            if (!isHeaderValid) {
                toast.error("Harap isi semua kolom wajib dengan benar.");
                setIsValidating(false);
                return;
            }

            setIsValidating(false);
            setIsConfirmOpen(true);
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal memvalidasi Purchase Order.");
            setIsValidating(false);
        }
    };

    const handleConfirmClose = (open: boolean) => {
        setIsConfirmOpen(open);
        if (!open && !isConfirmLoading) {
            setIsFinalizing(false);
            setIsValidating(false);
        }
    };

    return {
        isSubmitting,
        isValidating,
        isFinalizing,
        isConfirmLoading,
        isSaving,
        isConfirmOpen,
        setIsConfirmOpen,
        handleConfirmClose,
        handleSaveClick,
        onProcessClick,
        handleFinalizeConfirm,
    };
}
