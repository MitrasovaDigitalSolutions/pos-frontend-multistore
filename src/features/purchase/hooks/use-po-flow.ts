"use client";

import { useEffect, useRef, useState } from "react";
import { getPurchaseItemsStore, clearPurchaseItemsStore, selectItemCount, selectTotal } from "@/stores/purchase-items-store";
import type { PurchaseOrder } from "@/features/purchase/types";

import { usePoHeaderForm } from "./use-po-header-form";
import { usePoScanner } from "./use-po-scanner";
import { usePoFinalizer } from "./use-po-finalizer";

interface UsePoFlowProps {
    poId: string;
    order?: PurchaseOrder;
    onSaveSuccess: (uid: string, responseData?: PurchaseOrder) => void;
}

export function usePoFlow({ poId, order, onSaveSuccess }: UsePoFlowProps) {
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

    // ─── Clear Stale Local Store on Mount for New PO ───────────────────────────
    const isInitialMountRef = useRef(true);
    useEffect(() => {
        if (isCurrentNew && isInitialMountRef.current) {
            isInitialMountRef.current = false;
            clearPurchaseItemsStore("new", "po");
        }
    }, [isCurrentNew]);

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
