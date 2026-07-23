import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";

import { useSupplierSelectConfig } from "@/features/master/suppliers/hooks/use-supplier-select";
import { useReceivingDetail } from "@/features/purchase/api/purchase-api";
import { purchaseReturnHeaderSchema, type PurchaseReturnHeaderInput } from "@/features/purchase/schemas/return-schema";
import type { PurchaseReturn } from "@/features/purchase/types";
import { formatToISO, todayStr } from "@/lib/date-utils";
import { getPurchaseItemsStore } from "@/stores/purchase-items-store";
import { useReceivingSelectConfig } from "./use-receiving-select";

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

    const receivingId = useWatch({ name: "receiving_uid", control: headerForm.control });
    const currentSupplierId = useWatch({ name: "supplier_uid", control: headerForm.control });
    const { data: selectedReceiving } = useReceivingDetail(receivingId || null);

    const receivingSelectProps = useReceivingSelectConfig({
        targetUid: currentReturn?.stock_receiving_uid,
        targetReceiving: currentReturn?.stock_receiving,
    });

    const supplierSelectProps = useSupplierSelectConfig({
        targetUid: currentReturn?.supplier_uid || (selectedReceiving?.supplier_uid ? String(selectedReceiving.supplier_uid) : null),
        targetSupplier: currentReturn?.supplier || selectedReceiving?.supplier_relationship,
    });

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
                purchase_order_uid: watchedHeaderValues.receiving_uid || null,
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

    // 4. Load initial values when editing existing Return
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
    useEffect(() => {
        if (selectedReceiving && selectedReceiving.supplier_uid) {
            const targetSupplierId = String(selectedReceiving.supplier_uid);
            if (currentSupplierId !== targetSupplierId) {
                setHeaderValue("supplier_uid", targetSupplierId);
            }
        }
    }, [selectedReceiving, currentSupplierId, setHeaderValue]);

    return {
        headerForm,
        supplierSelectProps,
        receivingSelectProps,
        receivingId,
    };
}
