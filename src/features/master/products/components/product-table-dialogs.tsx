import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { BatchListDialog } from "@/features/pharmacy/components/batch/batch-list-dialog";
import { UnitConversionDialog } from "@/features/pharmacy/components/units/unit-conversion-dialog";
import type { Product } from "../types";
import { UnarchiveProductDialog } from "./unarchive-product-dialog";

interface ProductTableDialogsProps {
    isConfirmOpen: boolean;
    onConfirmOpenChange: (open: boolean) => void;
    productToDelete: Product | null;
    onConfirmDelete: () => void;
    isDeleting: boolean;
    isUnarchiveOpen: boolean;
    onUnarchiveOpenChange: (open: boolean) => void;
    productToUnarchive: Product | null;
    isPharmacy: boolean;
    batchDialogProduct: Product | null;
    onBatchDialogClose: () => void;
    unitDialogProduct: Product | null;
    onUnitDialogClose: () => void;
}

export function ProductTableDialogs({
    isConfirmOpen,
    onConfirmOpenChange,
    productToDelete,
    onConfirmDelete,
    isDeleting,
    isUnarchiveOpen,
    onUnarchiveOpenChange,
    productToUnarchive,
    isPharmacy,
    batchDialogProduct,
    onBatchDialogClose,
    unitDialogProduct,
    onUnitDialogClose,
}: ProductTableDialogsProps) {
    return (
        <>
            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={onConfirmOpenChange}
                title="Hapus Produk"
                description={
                    productToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus produk{" "}
                            <strong className="font-semibold text-slate-900 dark:text-slate-100">
                                {productToDelete.nama}
                            </strong>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menghapus produk ini?"
                    )
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={onConfirmDelete}
                isLoading={isDeleting}
                variant="danger"
            />

            <UnarchiveProductDialog
                open={isUnarchiveOpen}
                onOpenChange={onUnarchiveOpenChange}
                product={productToUnarchive}
            />

            {isPharmacy && batchDialogProduct && (
                <BatchListDialog
                    open={Boolean(batchDialogProduct)}
                    onOpenChange={(open) => {
                        if (!open) onBatchDialogClose();
                    }}
                    productUid={batchDialogProduct.uid}
                    productName={batchDialogProduct.nama}
                />
            )}

            {isPharmacy && unitDialogProduct && (
                <UnitConversionDialog
                    open={Boolean(unitDialogProduct)}
                    onOpenChange={(open) => {
                        if (!open) onUnitDialogClose();
                    }}
                    productUid={unitDialogProduct.uid}
                    productName={unitDialogProduct.nama}
                    baseUnit={unitDialogProduct.satuan || "Satuan"}
                />
            )}
        </>
    );
}
