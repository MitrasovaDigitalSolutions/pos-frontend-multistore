"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getPurchaseItemsStore, selectItemCount, selectTotal } from "@/stores/purchase-items-store";
import type { PurchaseItemLocal, PurchaseOrder } from "@/features/purchase/types";

import { usePoHeaderForm } from "./use-po-header-form";
import { usePoScanner } from "./use-po-scanner";
import { usePoFinalizer } from "./use-po-finalizer";

interface UsePoFlowProps {
    poId: string;
    order?: PurchaseOrder;
    onSaveSuccess: (uid: string, responseData?: PurchaseOrder) => void;
}

export function usePoFlow({ poId, order, onSaveSuccess }: UsePoFlowProps) {
    const searchParams = useSearchParams();
    const summaryUid = searchParams?.get("summary_uid");

    const [currentId, setCurrentId] = useState(poId);
    const [currentOrder, setCurrentOrder] = useState<PurchaseOrder | undefined>(order);
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    // Sync incoming props
    const [prevPropId, setPrevPropId] = useState(poId);
    const [prevPropOrder, setPrevPropOrder] = useState<PurchaseOrder | undefined>(order);

    if (poId !== prevPropId) {
        setPrevPropId(poId);
        setCurrentId(poId);
    }
    if (order !== prevPropOrder) {
        setPrevPropOrder(order);
        setCurrentOrder(order);
    }

    const isCurrentNew = !currentId || currentId === "new";

    // ─── Clear / Prefill Local Store on Mount for New PO ─────────────────────
    const isInitialMountRef = useRef(true);
    useEffect(() => {
        if (isCurrentNew && isInitialMountRef.current) {
            isInitialMountRef.current = false;
            const poStore = getPurchaseItemsStore("new", "po");

            if (summaryUid) {
                try {
                    const rawPrefill = sessionStorage.getItem(`po-prefill-${summaryUid}`);
                    if (rawPrefill) {
                        const parsed = JSON.parse(rawPrefill);

                        const prefilledItems: PurchaseItemLocal[] = (parsed.items || []).map(
                            (
                                item: {
                                    product_uid: string;
                                    barcode?: string | null;
                                    nama?: string | null;
                                    kuantitas?: number | null;
                                    harga_estimasi?: number | null;
                                    harga_beli?: number | null;
                                },
                                idx: number,
                            ) => ({
                                temp_uid: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
                                product_uid: item.product_uid,
                                barcode: item.barcode || null,
                                nama: item.nama || item.product_uid,
                                kuantitas: Number(item.kuantitas || 0),
                                harga_estimasi: Number(item.harga_estimasi ?? item.harga_beli ?? 0),
                            }),
                        );

                        poStore.setState({
                            items: prefilledItems,
                            headerData: {
                                supplier_uid: parsed.supplier_uid || null,
                                supplier_nama: parsed.supplier_nama || null,
                                supplier_sales_uid: parsed.supplier_sales_uid || null,
                                supplier_sales_nama: parsed.supplier_sales_nama || null,
                            },
                            lastUpdated: Date.now(),
                        });

                        sessionStorage.removeItem(`po-prefill-${summaryUid}`);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to parse po-prefill:", e);
                }
            }

            poStore.getState().clearAll();
        }
    }, [isCurrentNew, summaryUid]);


    // ─── Zustand Store ────────────────────────────────────────────────────────
    const store = getPurchaseItemsStore(currentId, "po");
    const items = store((state) => state.items);
    const addItem = store((state) => state.addItem);
    const clearAll = store((state) => state.clearAll);
    const updateItem = store((state) => state.updateItem);
    const removeItem = store((state) => state.removeItem);

    const itemCount = store(selectItemCount);
    const totalValue = store(selectTotal);
    const uniqueProductCount = items.length;

    // 1. Header Form
    const headerState = usePoHeaderForm({
        currentId,
        currentOrder,
        isCurrentNew,
    });

    // 2. Scanner
    const scannerState = usePoScanner({
        currentId,
        currentOrder,
        items,
        addItem,
    });

    // 3. Finalizer
    const finalizerState = usePoFinalizer({
        currentId,
        currentOrder,
        isCurrentNew,
        items,
        clearAll,
        headerForm: headerState.headerForm,
        onSaveSuccess,
    });

    const handleReset = () => {
        setIsResetDialogOpen(true);
    };

    return {
        // States
        currentId,
        currentOrder,
        isCurrentNew,
        items,
        itemCount,
        totalValue,
        uniqueProductCount,
        isResetDialogOpen,
        setIsResetDialogOpen,
        notFoundQuery: scannerState.notFoundQuery,
        setNotFoundQuery: scannerState.setNotFoundQuery,
        isCreateDialogOpen: scannerState.isCreateDialogOpen,
        setIsCreateDialogOpen: scannerState.setIsCreateDialogOpen,

        // Lookup Loading States / Options
        suppliersLoading: headerState.suppliersLoading,
        supplierOptions: headerState.supplierOptions,
        supplierSelectProps: headerState.supplierSelectProps,

        // Submission
        isSubmitting: finalizerState.isSubmitting,
        isConfirmOpen: finalizerState.isConfirmOpen,
        setIsConfirmOpen: finalizerState.setIsConfirmOpen,
        onProcessClick: finalizerState.onProcessClick,
        handleFinalizeConfirm: finalizerState.handleFinalizeConfirm,

        // Forms
        productForm: scannerState.productForm,
        headerForm: headerState.headerForm,

        // Handlers
        handleProductFound: scannerState.handleProductFound,
        handleOpenCreateDialog: scannerState.handleOpenCreateDialog,
        handleReset,
        handleSaveClick: finalizerState.handleSaveClick,
        getProductInfo: scannerState.getProductInfo,
        clearAll,
        updateItem,
        removeItem,
    };
}
