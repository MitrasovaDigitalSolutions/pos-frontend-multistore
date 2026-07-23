"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getPurchaseItemsStore, clearPurchaseItemsStore } from "@/stores/purchase-items-store";
import type { PurchaseReturn } from "@/features/purchase/types";
import { useReturnableItems } from "@/features/purchase/api/purchase-api";

import { useReturnHeaderForm } from "./use-return-header-form";
import { useReturnScanner } from "./use-return-scanner";
import { useReturnFinalizer } from "./use-return-finalizer";

interface UseReturnFlowProps {
    returnId: string;
    returnObj?: PurchaseReturn;
    onSaveSuccess: (uid: string, responseData?: PurchaseReturn) => void;
}

export function useReturnFlow({
    returnId,
    returnObj,
    onSaveSuccess,
}: UseReturnFlowProps) {
    const [currentId, setCurrentId] = useState(returnId);
    const [currentReturn, setCurrentReturn] = useState<PurchaseReturn | undefined>(returnObj);

    // Sync incoming props
    const [prevPropId, setPrevPropId] = useState(returnId);
    const [prevPropReturn, setPrevPropReturn] = useState<PurchaseReturn | undefined>(returnObj);

    if (returnId !== prevPropId) {
        setPrevPropId(returnId);
        setCurrentId(returnId);
    }
    if (returnObj !== prevPropReturn) {
        setPrevPropReturn(returnObj);
        setCurrentReturn(returnObj);
    }

    const isCurrentNew = !currentId || currentId === "new";

    // ─── Clear Stale Local Store on Mount for New Return ───────────────────────
    const isInitialMountRef = useRef(true);
    useEffect(() => {
        if (isCurrentNew && isInitialMountRef.current) {
            isInitialMountRef.current = false;
            clearPurchaseItemsStore("new", "return");
        }
    }, [isCurrentNew]);

    // ─── Zustand Store ────────────────────────────────────────────────────────
    const store = getPurchaseItemsStore(currentId, "return");
    const items = store((state) => state.items);
    const addItem = store((state) => state.addItem);
    const clearAll = store((state) => state.clearAll);
    const updateItem = store((state) => state.updateItem);
    const removeItem = store((state) => state.removeItem);

    // 1. Header Form
    const headerState = useReturnHeaderForm({
        currentId,
        currentReturn,
        isCurrentNew,
    });

    // 2. Fetch returnable items based on selected receiving doc
    const { data: returnableItems = [], isLoading: returnableLoading } = useReturnableItems(
        headerState.receivingId
    );

    const lastInitializedReceivingIdRef = useRef<string | null>(null);

    // Sync returnable items to Zustand store when receivingId is loaded/changed
    useEffect(() => {
        if (!headerState.receivingId) {
            // If receivingId is cleared or empty, clear items
            if (lastInitializedReceivingIdRef.current !== null) {
                store.setState({ items: [] });
                lastInitializedReceivingIdRef.current = null;
            }
            return;
        }

        // Wait until returnable items are loaded
        if (returnableLoading || returnableItems.length === 0) {
            return;
        }

        // Wait until draft return is loaded if editing
        if (!isCurrentNew && !currentReturn) {
            return;
        }

        // Avoid overwriting manual user input if this receivingId has already been initialized
        if (headerState.receivingId === lastInitializedReceivingIdRef.current) {
            return;
        }

        if (isCurrentNew) {
            const storeItems = returnableItems.map((item) => ({
                temp_uid: `ret-${item.product_uid}-${Math.random().toString(36).substring(2, 5)}`,
                product_uid: String(item.product_uid),
                barcode: item.product?.barcode || null,
                nama: item.product?.nama || "Produk",
                kuantitas: 0,
                harga_estimasi: item.harga_beli,
                alasan: "damaged",
            }));
            store.setState({ items: storeItems });
            lastInitializedReceivingIdRef.current = headerState.receivingId;
        } else if (currentReturn && currentReturn.items) {
            // For editing draft: merge DB return items with other invoice items (setting their qty to 0)
            const dbItemsMap = new Map(
                currentReturn.items.map((item) => [String(item.product_uid), item])
            );

            const mergedItems = returnableItems.map((item) => {
                const dbItem = dbItemsMap.get(String(item.product_uid));
                if (dbItem) {
                    return {
                        temp_uid: `${Date.now()}-${dbItem.uid}-${Math.random().toString(36).substring(2, 5)}`,
                        product_uid: String(dbItem.product_uid),
                        barcode: dbItem.product?.barcode || null,
                        nama: dbItem.product?.nama || "Produk",
                        kuantitas: dbItem.kuantitas,
                        harga_estimasi: dbItem.harga_beli,
                        alasan: dbItem.alasan || "damaged",
                    };
                } else {
                    return {
                        temp_uid: `ret-${item.product_uid}-${Math.random().toString(36).substring(2, 5)}`,
                        product_uid: String(item.product_uid),
                        barcode: item.product?.barcode || null,
                        nama: item.product?.nama || "Produk",
                        kuantitas: 0,
                        harga_estimasi: item.harga_beli,
                        alasan: "damaged",
                    };
                }
            });
            store.setState({ items: mergedItems });
            lastInitializedReceivingIdRef.current = headerState.receivingId;
        }
    }, [
        headerState.receivingId,
        returnableItems,
        returnableLoading,
        isCurrentNew,
        currentReturn,
        store,
    ]);

    // 3. Build returnable limits map for validation
    const returnLimitsMap = useMemo(() => {
        const map: Record<string, { sisa: number; nama: string; harga: number }> = {};
        if (returnableItems) {
            returnableItems.forEach((item) => {
                map[String(item.product_uid)] = {
                    sisa: item.kuantitas_sisa,
                    nama: item.product?.nama || "Produk",
                    harga: item.harga_beli,
                };
            });
        }
        return map;
    }, [returnableItems]);

    // 4. Scanner
    const scannerState = useReturnScanner({
        receivingId: headerState.receivingId,
        items,
        addItem,
        updateItem,
    });

    // 5. Finalizer
    const finalizerState = useReturnFinalizer({
        currentId,
        currentReturn,
        isCurrentNew,
        items,
        clearAll,
        headerForm: headerState.headerForm,
        returnLimitsMap,
        onSaveSuccess,
    });

    // Calculate sum of active return items (where quantity > 0)
    const activeItems = items.filter((i) => i.kuantitas > 0);
    const activeTotalValue = activeItems.reduce((sum, i) => sum + i.kuantitas * i.harga_estimasi, 0);

    return {
        // States
        currentId,
        currentReturn,
        isCurrentNew,
        items,
        activeItems,
        activeTotalValue,
        returnLimitsMap,
        returnableItems,
        returnableLoading,

        // Scanner States
        isScanningPending: scannerState.isPending,

        // Header Form States
        suppliersLoading: headerState.suppliersLoading,
        supplierOptions: headerState.supplierOptions,
        receivingsLoading: headerState.receivingsLoading,
        receivingsLoadingMore: headerState.receivingsLoadingMore,
        receivingsHasMore: headerState.receivingsHasMore,
        fetchNextReceivingsPage: headerState.fetchNextReceivingsPage,
        setReceivingSearch: headerState.setReceivingSearch,
        receivingOptions: headerState.receivingOptions,
        receivingId: headerState.receivingId,

        // Finalizer States
        isFinalizeOpen: finalizerState.isFinalizeOpen,
        setIsFinalizeOpen: finalizerState.setIsFinalizeOpen,
        isSavingForFinalize: finalizerState.isSavingForFinalize,
        isPending: finalizerState.isPending,

        // Forms
        headerForm: headerState.headerForm,

        // Handlers
        handleProductFound: scannerState.handleProductFound,
        handleSaveClick: finalizerState.handleSaveClick,
        handleFinalizeClick: finalizerState.handleFinalizeClick,
        handleFinalizeConfirm: finalizerState.handleFinalizeConfirm,
        clearAll,
        updateItem,
        removeItem,
    };
}
