"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { todayStr, formatToISO } from "@/lib/date-utils";
import { useAllSuppliers } from "@/features/master/suppliers/api/suppliers-api";
import { useInfiniteReceivings } from "@/features/purchase/api/purchase-api";
import { purchaseReturnHeaderSchema, type PurchaseReturnHeaderInput } from "@/features/purchase/schemas/return-schema";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import type { PurchaseReturn } from "@/features/purchase/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { RECEIVING_STATUS } from "@/constants/purchase";
import { useDebounce } from "@/hooks/use-debounce";

interface UseReturnHeaderFormProps {
    currentId: string;
    currentReturn?: PurchaseReturn;
    isCurrentNew: boolean;
}

export function useReturnHeaderForm({
    currentId,
    currentReturn,
    isCurrentNew,
}: UseReturnHeaderFormProps) {
    const headerForm = useForm<PurchaseReturnHeaderInput>({
        resolver: zodResolver(purchaseReturnHeaderSchema) as unknown as Resolver<PurchaseReturnHeaderInput>,
        defaultValues: {
            receiving_uid: undefined,
            supplier_uid: undefined,
            tanggal_retur: todayStr(),
            catatan: "",
        },
    });

    const { reset: resetHeader, setValue: setHeaderValue, formState: { isDirty: isHeaderDirty } } = headerForm;

    const store = getPurchaseItemsStore(currentId, "return");
    const headerData = store((state) => state.headerData);
    const setHeaderData = store((state) => state.setHeaderData);

    const [receivingSearch, setReceivingSearch] = useState("");
    const debouncedReceivingSearch = useDebounce(receivingSearch, 400);

    const { data: suppliers = [], isLoading: suppliersLoading } = useAllSuppliers();
    const {
        data: receivingsInfiniteData,
        isLoading: receivingsLoading,
        isFetchingNextPage: receivingsLoadingMore,
        hasNextPage: receivingsHasMore,
        fetchNextPage: fetchNextReceivingsPage,
    } = useInfiniteReceivings({
        status: RECEIVING_STATUS.COMPLETED,
        search: debouncedReceivingSearch || undefined,
        per_page: 10,
    });

    const supplierOptions = suppliers.map((s) => ({
        value: String(s.uid),
        label: s.nama,
    }));

    const receivingsList = (receivingsInfiniteData?.pages || []).flatMap((page) => page.data || []);

    const receivingOptions = receivingsList.map((r) => ({
        value: String(r.uid),
        label: `${r.nomor_penerimaan} - ${r.supplier_relationship?.nama || r.supplier || "Supplier"}`,
        description: `Faktur: ${r.nomor_faktur || "-"} • Total: ${formatRupiah(r.nilai_faktur || 0)}`,
    }));

    if (currentReturn?.stock_receiving_uid) {
        const hasCurrent = receivingOptions.some((r) => r.value === String(currentReturn.stock_receiving_uid));
        if (!hasCurrent && currentReturn.stock_receiving) {
            receivingOptions.unshift({
                value: String(currentReturn.stock_receiving_uid),
                label: `${currentReturn.stock_receiving.nomor_penerimaan || `Penerimaan ID: ${currentReturn.stock_receiving_uid}`}`,
                description: `Faktur: ${currentReturn.stock_receiving.nomor_faktur || "-"} • Terkait`,
            });
        }
    }

    const hasInitializedRef = useRef(false);
    const isClearedRef = useRef(false);

    // ─── Header Form Sync Effects ─────────────────────────────────────────────

    // 1. Detect when headerData is cleared externally (e.g. via reset/clearAll)
    useEffect(() => {
        if (isCurrentNew && headerData === null) {
            resetHeader({
                receiving_uid: undefined as unknown as string,
                supplier_uid: undefined as unknown as string,
                tanggal_retur: todayStr(),
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
                purchase_order_uid: watchedHeaderValues.receiving_uid || null, // we map receiving_uid to purchase_order_uid for Zustand store compatibility
                supplier_uid: watchedHeaderValues.supplier_uid || null,
                tanggal_terima: watchedHeaderValues.tanggal_retur || null,
                catatan: watchedHeaderValues.catatan || null,
            });
        }
    }, [watchedHeaderValues, isCurrentNew, isHeaderDirty, setHeaderData]);

    // 3. Load initial defaults from Zustand store (if they exist) when creating a new Return
    useEffect(() => {
        if (isCurrentNew && headerData && !hasInitializedRef.current) {
            hasInitializedRef.current = true;
            resetHeader({
                receiving_uid: headerData.purchase_order_uid ? String(headerData.purchase_order_uid) : (undefined as unknown as string),
                supplier_uid: headerData.supplier_uid ? String(headerData.supplier_uid) : (undefined as unknown as string),
                tanggal_retur: headerData.tanggal_terima || todayStr(),
                catatan: headerData.catatan || "",
            });
        }
    }, [isCurrentNew, headerData, resetHeader]);

    // 4. Synchronize default values when Return draft loads/changes from backend
    useEffect(() => {
        if (!isCurrentNew && currentReturn) {
            resetHeader({
                receiving_uid: currentReturn.stock_receiving_uid ? String(currentReturn.stock_receiving_uid) : (undefined as unknown as string),
                supplier_uid: currentReturn.supplier_uid ? String(currentReturn.supplier_uid) : (undefined as unknown as string),
                tanggal_retur: currentReturn.tanggal_retur ? formatToISO(currentReturn.tanggal_retur) : todayStr(),
                catatan: currentReturn.catatan || "",
            });
        }
    }, [isCurrentNew, currentReturn, resetHeader]);

    // 5. Auto-select and lock supplier if Receiving reference is chosen
    const receivingId = useWatch({ name: "receiving_uid", control: headerForm.control });
    const currentSupplierId = useWatch({ name: "supplier_uid", control: headerForm.control });
    useEffect(() => {
        if (receivingId) {
            let targetSupplierId: string | null = null;
            const selectedReceiving = receivingsList.find(
                (r) => String(r.uid) === receivingId
            );
            if (selectedReceiving && selectedReceiving.supplier_uid) {
                targetSupplierId = String(selectedReceiving.supplier_uid);
            }

            if (targetSupplierId && currentSupplierId !== targetSupplierId) {
                setHeaderValue("supplier_uid", targetSupplierId);
            }
        }
    }, [receivingId, currentSupplierId, receivingsList, setHeaderValue]);

    return {
        headerForm,
        suppliersLoading,
        supplierOptions,
        receivingsLoading,
        receivingsLoadingMore,
        receivingsHasMore,
        fetchNextReceivingsPage,
        setReceivingSearch,
        receivingOptions,
        receivingId,
    };
}
