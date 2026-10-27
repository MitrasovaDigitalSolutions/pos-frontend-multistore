"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProductFormDialog } from "@/features/master/products/components/product-form-dialog";
import type { Product } from "@/features/master/products/types";
import { usePurchaseTutorialStore } from "@/stores/purchase-tutorial-store";
import type { ComparePricesResult } from "../../../api/purchase-api";
import type { PurchaseItemLocal, Receiving } from "../../../types";
import { ReceivingFinalizeDialog, type ReceivingFinalizeInput } from "../receiving-finalize-dialog";
import { PriceAlertDialog, type PriceAlertFormInput } from "./price-alert-dialog";

interface ReceivingItemsDialogsProps {
    receiving?: Receiving;
    isCurrentNew: boolean;
    isReceivingTutorial: boolean;
    effectiveFinalizeOpen: boolean;
    onFinalizeChange: (open: boolean) => void;
    onFinalizeConfirm: (data: ReceivingFinalizeInput) => void;
    supplierName: string;
    purchaseOrderUid: string | null;
    nomorFaktur: string;
    nilaiFaktur: number;
    catatan: string;
    items: PurchaseItemLocal[];
    isSubmitting: boolean;
    isFinalizing: boolean;
    effectiveAlertOpen: boolean;
    effectivePriceAlerts: ComparePricesResult[];
    onAlertChange: (open: boolean) => void;
    onCompleteWithoutPrices: () => void;
    onCompleteWithPrices: (formValues: PriceAlertFormInput) => void;
    isCreateDialogOpen: boolean;
    setIsCreateDialogOpen: (open: boolean) => void;
    notFoundQuery: string;
    onProductFound: (product: Product) => void;
    isResetDialogOpen: boolean;
    setIsResetDialogOpen: (open: boolean) => void;
    onResetConfirm: () => void;
}

export function ReceivingItemsDialogs({
    receiving,
    isCurrentNew,
    isReceivingTutorial,
    effectiveFinalizeOpen,
    onFinalizeChange,
    onFinalizeConfirm,
    supplierName,
    purchaseOrderUid,
    nomorFaktur,
    nilaiFaktur,
    catatan,
    items,
    isSubmitting,
    isFinalizing,
    effectiveAlertOpen,
    effectivePriceAlerts,
    onAlertChange,
    onCompleteWithoutPrices,
    onCompleteWithPrices,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    notFoundQuery,
    onProductFound,
    isResetDialogOpen,
    setIsResetDialogOpen,
    onResetConfirm,
}: ReceivingItemsDialogsProps) {
    const showFinalize = receiving || (isCurrentNew && effectiveFinalizeOpen);

    return (
        <>
            {showFinalize && (
                <ReceivingFinalizeDialog
                    open={effectiveFinalizeOpen}
                    onOpenChange={(val) => {
                        if (isReceivingTutorial) {
                            usePurchaseTutorialStore.getState().setActiveDialog(val ? "finalize" : null);
                        } else {
                            onFinalizeChange(val);
                        }
                    }}
                    receiving={
                        receiving ||
                        ({
                            nomor_penerimaan: isReceivingTutorial
                                ? "RCV-2024-001 (Simulasi)"
                                : "Akan Dibuat Otomatis",
                            supplier: isReceivingTutorial
                                ? "PT Sumber Makmur Distributor"
                                : supplierName || "—",
                            purchase_order_uid: isReceivingTutorial
                                ? "PO-2024-001"
                                : purchaseOrderUid,
                            nomor_faktur: isReceivingTutorial ? "INV-2024-089" : nomorFaktur,
                            nilai_faktur: nilaiFaktur,
                            catatan: catatan,
                        } as unknown as Receiving)
                    }
                    items={items}
                    isPending={isSubmitting}
                    onConfirm={isReceivingTutorial ? () => {} : onFinalizeConfirm}
                />
            )}

            <PriceAlertDialog
                open={effectiveAlertOpen}
                onOpenChange={(val) => {
                    if (isReceivingTutorial) {
                        usePurchaseTutorialStore.getState().setActiveDialog(val ? "price_alert" : null);
                    } else {
                        onAlertChange(val);
                    }
                }}
                priceAlerts={effectivePriceAlerts}
                isFinalizing={isFinalizing}
                onCompleteWithoutPrices={isReceivingTutorial ? () => {} : onCompleteWithoutPrices}
                onCompleteWithPrices={isReceivingTutorial ? () => {} : onCompleteWithPrices}
            />

            <ProductFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                editingProduct={null}
                onSuccess={(product) => {
                    onProductFound(product);
                }}
                infoMessage={
                    notFoundQuery
                        ? `Produk "${notFoundQuery}" tidak ditemukan. Silakan buat baru.`
                        : undefined
                }
            />

            <ConfirmDialog
                open={isResetDialogOpen}
                onOpenChange={setIsResetDialogOpen}
                title="Kosongkan Penerimaan"
                description="Apakah Anda yakin ingin mengosongkan seluruh data penerimaan? Semua barang yang telah dipindai dan informasi header yang telah diisi akan hilang."
                confirmText="Ya, Kosongkan"
                cancelText="Batal"
                variant="warning"
                onConfirm={onResetConfirm}
            />
        </>
    );
}
