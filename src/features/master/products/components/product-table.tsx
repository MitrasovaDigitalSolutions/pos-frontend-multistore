"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { useBranchPolicy } from "@/hooks/use-branch-policy";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useAppPreset } from "@/features/license/hooks/use-app-preset";
import { useDetachProductStore } from "../api/product-store-api";
import { useToggleProductStatus } from "../api/products-api";
import { useProductColumns } from "../hooks/use-product-columns";
import type { Product } from "../types";
import { ProductTableHeader } from "./product-table-header";
import { renderProductTableActions } from "./product-table-actions";
import { ProductTableDialogs } from "./product-table-dialogs";

interface ProductTableProps {
    products: Product[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    page: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    onEdit: (product: Product) => void;
    onManageStores?: (product: Product) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
    isConfirmOpen?: boolean;
    onConfirmOpenChange?: (open: boolean) => void;
    productToDelete?: Product | null;
    onProductToDeleteChange?: (product: Product | null) => void;
    isUnarchiveOpen?: boolean;
    onUnarchiveOpenChange?: (open: boolean) => void;
    productToUnarchive?: Product | null;
    onProductToUnarchiveChange?: (product: Product | null) => void;
    onAdjustmentClick?: (product: Product) => void;
}

export function ProductTable(props: ProductTableProps) {
    const {
        products,
        meta,
        page,
        perPage,
        onPageChange,
        onPerPageChange,
        onEdit,
        onAddClick,
        isLoading = false,
        isFetching = false,
        filterElement,
        sortBy,
        sortOrder,
        onSortChange,
        onAdjustmentClick,
    } = props;

    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageProducts =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_products");

    const activeStoreUid = useActiveStoreStore((s) => s.activeStoreUid);
    const userStores = session?.user?.stores || [];
    const activeStore = userStores.find((s) => s.uid === activeStoreUid) || userStores[0];
    const isCentralStore = activeStore?.is_central ?? false;

    const canCreateProduct = useBranchPolicy("branch_can_create_product");
    const canEditMasterData = useBranchPolicy("branch_can_edit_master_data");
    const canManualAdjustment = useBranchPolicy("branch_can_manual_stock_adjustment");
    const { isPharmacy } = useAppPreset();

    const [batchDialogProduct, setBatchDialogProduct] = useState<Product | null>(null);
    const [unitDialogProduct, setUnitDialogProduct] = useState<Product | null>(null);

    const detachStoreProduct = useDetachProductStore();
    const toggleStatus = useToggleProductStatus();

    const [localConfirmOpen, setLocalConfirmOpen] = useState(false);
    const [localProductToDelete, setLocalProductToDelete] = useState<Product | null>(null);
    const [localUnarchiveOpen, setLocalUnarchiveOpen] = useState(false);
    const [localProductToUnarchive, setLocalProductToUnarchive] = useState<Product | null>(null);

    const isConfirmOpen = props.isConfirmOpen !== undefined ? props.isConfirmOpen : localConfirmOpen;
    const setIsConfirmOpen = props.onConfirmOpenChange || setLocalConfirmOpen;
    const productToDelete = props.productToDelete !== undefined ? props.productToDelete : localProductToDelete;
    const setProductToDelete = props.onProductToDeleteChange || setLocalProductToDelete;

    const isUnarchiveOpen = props.isUnarchiveOpen !== undefined ? props.isUnarchiveOpen : localUnarchiveOpen;
    const setIsUnarchiveOpen = props.onUnarchiveOpenChange || setLocalUnarchiveOpen;
    const productToUnarchive = props.productToUnarchive !== undefined ? props.productToUnarchive : localProductToUnarchive;
    const setProductToUnarchive = props.onProductToUnarchiveChange || setLocalProductToUnarchive;

    const handleToggleStatus = useCallback(
        (p: Product) => {
            if (p.status === "archived") {
                setProductToUnarchive(p);
                setIsUnarchiveOpen(true);
                return;
            }

            const nextStatus = p.status === "active" ? "inactive" : "active";
            toggleStatus.mutate(
                { uid: p.uid, status: nextStatus },
                {
                    onSuccess: () => {
                        toast.success(`Status ${p.nama} diperbarui menjadi ${nextStatus}.`);
                    },
                    onError: () => {
                        toast.error("Gagal memperbarui status produk.");
                    },
                }
            );
        },
        [setProductToUnarchive, setIsUnarchiveOpen, toggleStatus]
    );

    const handleRemoveProduct = (p: Product) => {
        setProductToDelete(p);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!productToDelete) return;
        if (!activeStoreUid) {
            toast.error("Toko aktif tidak ditemukan untuk menghapus produk dari toko.");
            return;
        }

        detachStoreProduct.mutate(
            { productUid: productToDelete.uid, storeUid: activeStoreUid },
            {
                onSuccess: () => {
                    toast.success(`Produk "${productToDelete.nama}" berhasil dihapus dari toko.`);
                    setIsConfirmOpen(false);
                    setProductToDelete(null);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menghapus produk dari toko.");
                },
            }
        );
    };

    const columns = useProductColumns({
        hasManageProducts,
        isCentralStore,
        canEditMasterData,
        onToggleStatus: handleToggleStatus,
    });

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <ProductTableHeader
                hasManageProducts={hasManageProducts}
                canCreateProduct={canCreateProduct}
                isCentralStore={isCentralStore}
                onAddClick={onAddClick}
            />

            <div id="product-table-filters">
                {filterElement}
            </div>

            <DataTable
                columns={columns}
                data={products}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada produk ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="produk"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
                onEdit={hasManageProducts ? onEdit : undefined}
                onDelete={hasManageProducts && (isCentralStore || canEditMasterData) ? handleRemoveProduct : undefined}
                hideDelete={(row: Product) => row.status === "archived"}
                hideEdit={(row: Product) => row.status === "archived"}
                extraActions={
                    hasManageProducts
                        ? (row: Product) =>
                              renderProductTableActions({
                                  row,
                                  isPharmacy,
                                  canManualAdjustment,
                                  onUnarchive: (p) => {
                                      setProductToUnarchive(p);
                                      setIsUnarchiveOpen(true);
                                  },
                                  onOpenBatch: setBatchDialogProduct,
                                  onOpenUnits: setUnitDialogProduct,
                                  onAdjustmentClick,
                              })
                        : undefined
                }
            />

            <ProductTableDialogs
                isConfirmOpen={isConfirmOpen}
                onConfirmOpenChange={setIsConfirmOpen}
                productToDelete={productToDelete}
                onConfirmDelete={handleConfirmDelete}
                isDeleting={detachStoreProduct.isPending}
                isUnarchiveOpen={isUnarchiveOpen}
                onUnarchiveOpenChange={setIsUnarchiveOpen}
                productToUnarchive={productToUnarchive}
                isPharmacy={isPharmacy}
                batchDialogProduct={batchDialogProduct}
                onBatchDialogClose={() => setBatchDialogProduct(null)}
                unitDialogProduct={unitDialogProduct}
                onUnitDialogClose={() => setUnitDialogProduct(null)}
            />
        </section>
    );
}
