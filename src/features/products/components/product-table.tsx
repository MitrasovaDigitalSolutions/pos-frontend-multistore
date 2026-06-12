"use client";

import { Button } from "@/components/ui/button";
import { CommandSelect } from "@/components/ui/command-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import type { Brand } from "@/features/brands/types";
import type { Category } from "@/features/categories/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPlus } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeleteProduct, useToggleProductStatus } from "../api/products-api";
import type { Product } from "../types";


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
    search: string;
    onSearchChange: (search: string) => void;
    status: string;
    onStatusChange: (status: string) => void;
    categoryId: string;
    onCategoryChange: (categoryId: string) => void;
    brandId: string;
    onBrandChange: (brandId: string) => void;
    categories: Category[];
    brands: Brand[];
    onEdit: (product: Product) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

export function ProductTable({
    products,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    search,
    onSearchChange,
    status,
    onStatusChange,
    categoryId,
    onCategoryChange,
    brandId,
    onBrandChange,
    categories,
    brands,
    onEdit,
    onAddClick,
    isLoading = false,
    isFetching = false,
}: ProductTableProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageProducts =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_products");

    const deleteProduct = useDeleteProduct();
    const toggleStatus = useToggleProductStatus();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const handleToggleStatus = (p: Product) => {
        const nextStatus = p.status === "active" ? "inactive" : "active";
        toggleStatus.mutate(
            { id: p.id, status: nextStatus },
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
        deleteProduct.mutate(productToDelete.id, {
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
                    cell: ({ row }) => (
                        <span className="font-bold text-slate-900">
                            {row.original.barcode || "-"}
                        </span>
                    ),
                },
                {
                    accessorKey: "nama",
                    header: "Nama Produk",
                    cell: ({ row }) => (
                        <span className="font-semibold text-slate-800">
                            {row.original.nama}
                        </span>
                    ),
                },
                {
                    accessorKey: "category",
                    header: "Kategori",
                    cell: ({ row }) => (
                        <span className="text-slate-500 text-xs">
                            {row.original.category?.nama || "-"}
                        </span>
                    ),
                },
                {
                    accessorKey: "merek",
                    header: "Merek/Brand",
                    cell: ({ row }) => (
                        <span className="text-slate-500 text-xs">
                            {row.original.brand?.nama || row.original.merek || "-"}
                        </span>
                    ),
                },
                {
                    accessorKey: "harga_beli",
                    header: "Harga Beli",
                    meta: {
                        headerClassName: "text-right",
                        cellClassName: "text-right text-slate-500 text-xs",
                    },
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
                    cell: ({ row }) => formatRupiah(row.original.harga),
                },
                {
                    accessorKey: "margin",
                    header: "Margin",
                    meta: {
                        headerClassName: "text-right",
                        cellClassName: "text-right text-slate-500 text-xs",
                    },
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
                    meta: {
                        headerClassName: "text-center",
                        cellClassName: "text-center",
                    },
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

    const categoryOptions = useMemo(() => {
        return [
            { value: "all", label: "Semua Kategori" },
            ...categories.map((c) => ({ value: String(c.id), label: c.nama })),
        ];
    }, [categories]);

    const brandOptions = useMemo(() => {
        return [
            { value: "all", label: "Semua Brand" },
            ...brands.map((b) => ({ value: String(b.id), label: b.nama })),
        ];
    }, [brands]);

    const filtersSlot = (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full">


            {/* Kategori Select */}
            <CommandSelect
                value={categoryId}
                onChange={(val) => onCategoryChange(val || "all")}
                options={categoryOptions}
                searchPlaceholder="Cari kategori..."
                placeholder="Semua Kategori"
                className="w-full h-9 text-xs"
            />

            {/* Brand/Merek Select */}
            <CommandSelect
                value={brandId}
                onChange={(val) => onBrandChange(val || "all")}
                options={brandOptions}
                searchPlaceholder="Cari brand..."
                placeholder="Semua Brand"
                className="w-full h-9 text-xs"
            />

            {/* Status Select */}
            <CommandSelect
                value={status}
                onChange={(val) => onStatusChange(val || "all")}
                options={[
                    { value: "all", label: "Semua Status" },
                    { value: "active", label: "Aktif" },
                    { value: "inactive", label: "Nonaktif" },
                ]}
                searchPlaceholder="Cari status..."
                placeholder="Pilih status"
                className="w-full h-9 text-xs"
            />
        </div>
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50">
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
                search={search}
                onSearchChange={onSearchChange}
                searchPlaceholder="Cari produk berdasarkan barcode, nama, atau merek..."
                filters={filtersSlot}
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
