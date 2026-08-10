"use client";

import { useState, useCallback } from "react";
import { SupplierDialog } from "../components/supplier-dialog";
import type { Supplier } from "../types";

export interface UseSupplierCreateModalOptions {
    onSupplierCreated?: (supplier: Supplier) => void;
}

export function useSupplierCreateModal(options?: UseSupplierCreateModalOptions) {
    const [isOpen, setIsOpen] = useState(false);
    const [initialName, setInitialName] = useState("");

    const openSupplierModal = useCallback((searchName?: string) => {
        setInitialName(searchName || "");
        setIsOpen(true);
    }, []);

    const handleSuccess = useCallback((supplier: Supplier) => {
        options?.onSupplierCreated?.(supplier);
    }, [options]);

    const SupplierModal = (
        <SupplierDialog
            open={isOpen}
            onOpenChange={setIsOpen}
            initialName={initialName}
            onSuccess={handleSuccess}
        />
    );

    return {
        openSupplierModal,
        isSupplierModalOpen: isOpen,
        setIsSupplierModalOpen: setIsOpen,
        SupplierModal,
    };
}
