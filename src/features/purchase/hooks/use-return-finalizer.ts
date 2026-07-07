"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { useAppRouter } from "@/hooks/use-app-router";
import { clearPurchaseItemsStore } from "@/stores/purchase-items-store";
import {
    useCreatePurchaseReturnHeader,
    useUpdatePurchaseReturn,
    useBulkReplacePurchaseReturnItems,
} from "@/features/purchase/api/purchase-api";
import type { PurchaseReturnHeaderInput } from "@/features/purchase/schemas/return-schema";
import type { PurchaseItemLocal, PurchaseReturn } from "@/features/purchase/types";

interface UseReturnFinalizerProps {
    currentId: string;
    currentReturn?: PurchaseReturn;
    isCurrentNew: boolean;
    items: PurchaseItemLocal[];
    clearAll: () => void;
    headerForm: UseFormReturn<PurchaseReturnHeaderInput>;
    returnLimitsMap: Record<string, { sisa: number; nama: string; harga: number }>;
    onSaveSuccess: (uid: string, responseData?: PurchaseReturn) => void;
}

export function useReturnFinalizer({
    currentId,
    currentReturn: _currentReturn,
    isCurrentNew,
    items,
    clearAll,
    headerForm,
    returnLimitsMap,
    onSaveSuccess,
}: UseReturnFinalizerProps) {
    const router = useAppRouter();
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
    const [isSavingForFinalize, setIsSavingForFinalize] = useState(false);

    const createHeader = useCreatePurchaseReturnHeader();
    const updateReturn = useUpdatePurchaseReturn();
    const bulkReplace = useBulkReplacePurchaseReturnItems();

    const validateItems = (activeItems: PurchaseItemLocal[]) => {
        if (activeItems.length === 0) {
            toast.error("Harap isi kuantitas minimal 1 pcs pada salah satu barang yang ingin diretur.");
            return false;
        }

        // Validate max return limits
        for (const item of activeItems) {
            const limit = returnLimitsMap[item.product_uid];
            if (limit && item.kuantitas > limit.sisa) {
                toast.error(`Jumlah retur "${item.nama}" (${item.kuantitas} pcs) melebihi batas yang dapat diretur (${limit.sisa} pcs).`);
                return false;
            }
            if (!item.alasan) {
                toast.error(`Harap pilih alasan retur untuk "${item.nama}".`);
                return false;
            }
        }
        return true;
    };

    const handleSaveFlow = async (data: PurchaseReturnHeaderInput) => {
        const activeItems = items.filter((i) => i.kuantitas > 0);
        if (!validateItems(activeItems)) return;

        const payloadHeader = {
            receiving_uid: data.receiving_uid,
            supplier_uid: data.supplier_uid,
            tanggal_retur: data.tanggal_retur,
            catatan: data.catatan || null,
        };

        const payloadItems = {
            items: activeItems.map((i) => ({
                product_uid: i.product_uid,
                kuantitas: i.kuantitas,
                harga_beli: i.harga_estimasi,
                alasan: i.alasan || "damaged",
            })),
        };

        try {
            if (isCurrentNew) {
                // 1. Create Return Header
                const res = await createHeader.mutateAsync(payloadHeader);
                const newUid = res.data.uid;

                // 2. Submit items
                const replaceRes = await bulkReplace.mutateAsync({
                    uid: newUid,
                    data: payloadItems,
                });

                toast.success("Daftar barang retur berhasil disimpan ke server!");
                clearAll();
                clearPurchaseItemsStore("new", "return");
                onSaveSuccess(newUid, replaceRes.data);
                router.push("/admin/purchase/return");
            } else {
                // 1. Update Return Header
                await updateReturn.mutateAsync({
                    uid: currentId,
                    data: payloadHeader,
                });

                // 2. Submit items
                const replaceRes = await bulkReplace.mutateAsync({
                    uid: currentId,
                    data: payloadItems,
                });

                toast.success("Perubahan barang retur berhasil disimpan!");
                clearAll();
                clearPurchaseItemsStore(currentId, "return");
                onSaveSuccess(currentId, replaceRes.data);
                router.push("/admin/purchase/return");
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyimpan barang retur.");
        }
    };

    const handleFinalizeClick = async () => {
        const activeItems = items.filter((i) => i.kuantitas > 0);
        if (!validateItems(activeItems)) return;

        const isHeaderValid = await headerForm.trigger();
        if (!isHeaderValid) {
            toast.error("Harap lengkapi kolom wajib pada informasi retur.");
            return;
        }

        const data = headerForm.getValues();
        const payloadHeader = {
            receiving_uid: data.receiving_uid,
            supplier_uid: data.supplier_uid,
            tanggal_retur: data.tanggal_retur,
            catatan: data.catatan || null,
        };

        const payloadItems = {
            items: activeItems.map((i) => ({
                product_uid: i.product_uid,
                kuantitas: i.kuantitas,
                harga_beli: i.harga_estimasi,
                alasan: i.alasan || "damaged",
            })),
        };

        setIsSavingForFinalize(true);

        try {
            if (isCurrentNew) {
                // 1. Create Return Header
                const res = await createHeader.mutateAsync(payloadHeader);
                const newUid = res.data.uid;

                // 2. Submit items
                const replaceRes = await bulkReplace.mutateAsync({
                    uid: newUid,
                    data: payloadItems,
                });

                clearAll();
                clearPurchaseItemsStore("new", "return");
                onSaveSuccess(newUid, replaceRes.data);
                setIsFinalizeOpen(true);
            } else {
                // 1. Update Return Header
                await updateReturn.mutateAsync({
                    uid: currentId,
                    data: payloadHeader,
                });

                // 2. Submit items
                const replaceRes = await bulkReplace.mutateAsync({
                    uid: currentId,
                    data: payloadItems,
                });

                onSaveSuccess(currentId, replaceRes.data);
                setIsFinalizeOpen(true);
            }
        } catch (err: unknown) {
            const errorObj = err as { message?: string };
            toast.error(errorObj.message || "Gagal menyimpan barang retur sebelum finalisasi.");
        } finally {
            setIsSavingForFinalize(false);
        }
    };

    const handleSaveClick = () => {
        headerForm.handleSubmit(handleSaveFlow, (errors) => {
            console.error("Return form validation errors:", errors);
            toast.error("Harap isi semua kolom wajib dengan benar.");
        })();
    };

    const isPending =
        createHeader.isPending ||
        updateReturn.isPending ||
        bulkReplace.isPending ||
        isSavingForFinalize;

    return {
        isFinalizeOpen,
        setIsFinalizeOpen,
        isSavingForFinalize,
        isPending,
        handleSaveClick,
        handleFinalizeClick,
    };
}
