"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPlus } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeleteProduct, useToggleProductStatus } from "../api/products-api";
import type { Product } from "../types";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { ProductImportExport } from "./product-import-export";

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
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function ProductTable({
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
}: ProductTableProps) {
    const queryClient = useQueryClient();
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageProducts =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_products");

    const handleImportSuccess = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    };

    const deleteProduct = useDeleteProduct();
    const toggleStatus = useToggleProductStatus();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const handleToggleStatus = (p: Product) => {
        const nextStatus = p.status === "active" ? "inactive" : "active";
        toggleStatus.mutate(
            { uid: p.uid, status: nextStatus },
            {
                onSuccess: () => {
                    toast.success(
                        `Status ${p.nama} diperbarui menjadi ${nextStatus}.`,
                    );
                },
                onError: () => {
                    toast.error("Gagal memperbarui status produk.");
                },
            },
        );
    };

    const handleRemoveProduct = (p: Product) => {
        setProductToDelete(p);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!productToDelete) return;
        deleteProduct.mutate(productToDelete.uid, {
            onSuccess: () => {
                toast.success(`Produk "${productToDelete.nama}" berhasil dihapus.`);
                setIsConfirmOpen(false);
                setProductToDelete(null);
            },
            onError: () => {
                toast.error("Gagal menghapus produk.");
            },
        });
    };

    const columns = useMemo<ColumnDef<Product>[]>(
        () => {
            const baseColumns: ColumnDef<Product>[] = [
                {
                    accessorKey: "barcode",
                    header: "Barcode / SKU",
                    enableSorting: false,
                    cell: ({ row }) => (
                        <span className="font-bold text-slate-900">
                            {row.original.barcode || "-"}
                        </span>
                    ),
                    size: 120,
                },
                {
                    accessorKey: "nama",
                    header: "Nama Produk",
                    cell: ({ row }) => (
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-800">
                                {row.original.nama}
                            </span>
                            {row.original.is_jasa && (
                                <span className="badge text-[9px] border-none bg-blue-50 text-blue-700 w-fit px-1.5 py-px rounded font-semibold">
                                    Jasa
                                </span>
                            )}
                        </div>
                    ),
                    size: 240
                },
                {
                    accessorKey: "category",
                    header: "Kategori",
                    enableSorting: false,
                    cell: ({ row }) => (
                        <span className="text-slate-500 text-xs">
                            {row.original.category?.nama || "-"}
                        </span>
                    ),
                    size: 120
                },
                {
                    accessorKey: "merek",
                    header: "Merek/Brand",
                    enableSorting: false,
                    cell: ({ row }) => (
                        <span className="text-slate-500 text-xs">
                            {row.original.brand?.nama || row.original.merek || "-"}
                        </span>
                    ),
                    size: 120
                },
                {
                    accessorKey: "harga_beli",
                    header: "Harga Beli",
                    enableSorting: false,
                    meta: {
                        headerClassName: "text-right",
                        cellClassName: "text-right text-slate-500 text-xs",
                    },
                    size: 120,
                    cell: ({ row }) => row.original.harga_beli !== null && row.original.harga_beli !== undefined
                        ? formatRupiah(row.original.harga_beli)
                        : "-",
                },
                {
                    accessorKey: "harga",
                    header: "Harga Jual",
                    meta: {
                        headerClassName: "text-right",
                        cellClassName: "text-right font-bold text-slate-800",
                    },
                    size: 120,
                    cell: ({ row }) => formatRupiah(row.original.harga),
                },
                {
                    accessorKey: "margin",
                    header: "Margin",
                    meta: {
                        headerClassName: "text-right",
                        cellClassName: "text-right text-slate-500 text-xs",
                    },
                    size: 120,
                    cell: ({ row }) => row.original.margin !== null && row.original.margin !== undefined
                        ? `${row.original.margin}%`
                        : "-",
                },
                {
                    accessorKey: "stok",
                    header: "Stok",
                    meta: {
                        headerClassName: "text-right",
                        cellClassName: "text-right",
                    },
                    size: 80,
                    cell: ({ row }) => {
                        const p = row.original;
                        return (
                            <span
                                className={`font-bold ${p.stok <= 10
                                    ? "text-amber-500"
                                    : "text-slate-800"
                                    }`}
                            >
                                {p.stok} pcs
                            </span>
                        );
                    },
                },
                {
                    accessorKey: "status",
                    header: "Status",
                    enableSorting: false,
                    meta: {
                        headerClassName: "text-center",
                        cellClassName: "text-center",
                    },
                    size: 80,
                    cell: ({ row }) => {
                        const p = row.original;
                        if (!hasManageProducts) {
                            return (
                                <span
                                    className={`badge text-[10px] border-none ${p.status === "active"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-rose-50 text-rose-700"
                                        }`}
                                >
                                    {p.status === "active" ? "Aktif" : "Nonaktif"}
                                </span>
                            );
                        }
                        return (
                            <button
                                onClick={() => handleToggleStatus(p)}
                                className={`badge text-[10px] border-none cursor-pointer ${p.status === "active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                    }`}
                            >
                                {p.status === "active" ? "Aktif" : "Nonaktif"}
                            </button>
                        );
                    },
                },
            ];

            return baseColumns;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hasManageProducts],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Produk
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Manajemen inventori produk aktif dan SKU.
                    </p>
                </div>
                {hasManageProducts && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Produk
                    </Button>
                )}
            </div>

            {filterElement}

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
                extraToolbarActions={
                    hasManageProducts ? (
                        <ProductImportExport onImportSuccess={handleImportSuccess} />
                    ) : null
                }
                virtualize={true}
                estimateRowHeight={44}
                onEdit={hasManageProducts ? onEdit : undefined}
                onDelete={hasManageProducts ? handleRemoveProduct : undefined}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
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
                onConfirm={handleConfirmDelete}
                isLoading={deleteProduct.isPending}
                variant="danger"
            />
        </section>
    );
}
