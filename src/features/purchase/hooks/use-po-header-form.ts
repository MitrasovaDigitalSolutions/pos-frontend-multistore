"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { todayStr, formatToISO } from "@/lib/date-utils";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { purchaseOrderHeaderSchema, type PurchaseOrderHeaderInput } from "@/features/purchase/schemas/order-schema";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import type { PurchaseOrder } from "@/features/purchase/types";

interface UsePoHeaderFormProps {
    currentId: string;
    currentOrder?: PurchaseOrder;
    isCurrentNew: boolean;
}

export function usePoHeaderForm({
    currentId,
    currentOrder,
    isCurrentNew,
}: UsePoHeaderFormProps) {
    const headerForm = useForm<PurchaseOrderHeaderInput>({
        resolver: zodResolver(purchaseOrderHeaderSchema) as unknown as Resolver<PurchaseOrderHeaderInput>,
        defaultValues: {
            supplier_uid: undefined,
            tanggal_po: todayStr(),
            catatan: "",
        },
    });

    const { reset: resetHeader, formState: { isDirty: isHeaderDirty } } = headerForm;

    const store = getPurchaseItemsStore(currentId, "po");
    const headerData = store((state) => state.headerData);
    const setHeaderData = store((state) => state.setHeaderData);

    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.uid),
        label: s.nama,
    }));

    const hasInitializedRef = useRef(false);
    const isClearedRef = useRef(false);

    // ─── Header Form Sync Effects ─────────────────────────────────────────────
    
    // 1. Detect when headerData is cleared externally (e.g. via reset/clearAll)
    useEffect(() => {
        if (isCurrentNew && headerData === null) {
            resetHeader({
                supplier_uid: undefined as unknown as string,
                tanggal_po: todayStr(),
                catatan: "",
            });
            hasInitializedRef.current = false;
            isClearedRef.current = false;
        }
    }, [isCurrentNew, headerData, resetHeader]);

    // 2. Save to Zustand store on any change to form values (only when new, not cleared, and form is dirty)
    const watchedHeaderValues = useWatch({ control: headerForm.control });
    useEffect(() => {
        if (isCurrentNew && isHeaderDirty && !isClearedRef.current) {
            setHeaderData({
                supplier_uid: watchedHeaderValues.supplier_uid || null,
                tanggal_terima: watchedHeaderValues.tanggal_po || null,
                catatan: watchedHeaderValues.catatan || null,
            });
        }
    }, [watchedHeaderValues, isCurrentNew, isHeaderDirty, setHeaderData]);

    // 3. Load initial defaults from Zustand store (if they exist) when creating a new PO
    useEffect(() => {
        if (isCurrentNew && headerData && !hasInitializedRef.current) {
            hasInitializedRef.current = true;
            resetHeader({
                supplier_uid: headerData.supplier_uid ? String(headerData.supplier_uid) : (undefined as unknown as string),
                tanggal_po: headerData.tanggal_terima || todayStr(),
                catatan: headerData.catatan || "",
            });
        }
    }, [isCurrentNew, headerData, resetHeader]);

    // 4. Synchronize default values when order loads/changes from backend draft
    useEffect(() => {
        if (!isCurrentNew && currentOrder) {
            resetHeader({
                supplier_uid: currentOrder.supplier_uid ? String(currentOrder.supplier_uid) : (undefined as unknown as string),
                tanggal_po: currentOrder.tanggal_po ? formatToISO(currentOrder.tanggal_po) : todayStr(),
                catatan: currentOrder.catatan || "",
            });
        }
    }, [isCurrentNew, currentOrder, resetHeader]);

    return {
        headerForm,
        suppliersLoading,
        supplierOptions,
    };
}
