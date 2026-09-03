"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableActionButton } from "@/components/ui/data-table-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasPermission, hasRole } from "@/constants/roles";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconArchiveOff, IconPlus } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useToggleProductStatus } from "../api/products-api";
import { useDetachProductStore } from "../api/product-store-api";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Show } from "@/components/ui/show";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { UnarchiveProductDialog } from "./unarchive-product-dialog";
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
    onEdit: (product: Product) => void;
    onManageStores?: (product: Product) => void;
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
    onManageStores,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filterElement,
    sortBy,
    sortOrder,
    onSortChange,
}: ProductTableProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageProducts =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_products");

    const hasManageStores =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_stores") ||
        hasPermission(userRoles, userPermissions, "manage_stores");

    const activeStoreUid = useActiveStoreStore((s) => s.activeStoreUid);
    const userStores = session?.user?.stores || [];
    const activeStore = userStores.find((s) => s.uid === activeStoreUid) || userStores[0];
    const isCentralStore = activeStore?.is_central ?? false;

    const branchCanCreateSetting = useSettingsStore((s) => s.getSetting("branch_can_create_product", "true"));
    const canBranchCreateProduct = branchCanCreateSetting === "true";
    const canCreateProduct = isCentralStore || canBranchCreateProduct;

    const detachStoreProduct = useDetachProductStore();
    const toggleStatus = useToggleProductStatus();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isUnarchiveOpen, setIsUnarchiveOpen] = useState(false);
    const [productToUnarchive, setProductToUnarchive] = useState<Product | null>(null);

    const handleToggleStatus = (p: Product) => {
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

    const columns = useMemo<ColumnDef<Product>[]>(
        () => {
            const baseColumns: ColumnDef<Product>[] = [
                {
                    accessorKey: "barcode",
                    header: "Barcode / SKU",
                    cell: ({ row }) => {
                        const barcode = row.original.barcode || "-";
                        return (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="font-bold text-slate-900 truncate block max-w-[130px] cursor-default font-mono">
                                            {barcode}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="font-mono text-xs">{barcode}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    },
                    size: 130,
                },
                {
                    accessorKey: "nama",
                    header: "Nama Produk",
                    cell: ({ row }) => (
                        <div className="flex flex-col gap-0.5 max-w-[260px] min-w-0">
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="font-semibold text-slate-800 truncate block cursor-default">
                                            {row.original.nama}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-xs">
                                        <p className="text-xs">{row.original.nama}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <div className="flex items-center gap-1">
                                {row.original.is_jasa && (
                                    <span className="badge text-[9px] border-none bg-blue-50 text-blue-700 w-fit px-1.5 py-px rounded font-semibold">
                                        Jasa
                                    </span>
                                )}
                                {row.original.is_raw_material && (
                                    <span className="badge text-[9px] border-none bg-amber-50 text-amber-700 w-fit px-1.5 py-px rounded font-semibold">
                                        Bahan Baku
                                    </span>
                                )}
                            </div>
                        </div>
                    ),
                    size: 260,
                },
                {
                    id: "category",
                    accessorFn: (row) => row.category?.nama || "",
                    header: "Kategori",
                    cell: ({ row }) => {
                        const catName = row.original.category?.nama || "-";
                        return (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-slate-500 text-xs truncate block max-w-[130px] cursor-default">
                                            {catName}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">{catName}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    },
                    size: 140,
                },
                {
                    id: "merek",
                    accessorFn: (row) => row.brand?.nama || row.merek || "",
                    header: "Merek/Brand",
                    cell: ({ row }) => {
                        const brandName = row.original.brand?.nama || row.original.merek || "-";
                        return (
                            <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="text-slate-500 text-xs truncate block max-w-[130px] cursor-default">
                                            {brandName}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="text-xs">{brandName}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    },
                    size: 140,
                },
                {
                    accessorKey: "harga_beli",
                    header: "Harga Beli",
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
                    size: 140,
                    cell: ({ row }) => {
                        const p = row.original;
                        const storeProduct = p.product_stores?.[0];
                        const hargaGrosir = p.harga_grosir ?? storeProduct?.harga_grosir;
                        const minQtyGrosir = p.min_qty_grosir ?? storeProduct?.min_qty_grosir;
                        const isGrosirFlag = p.is_grosir ?? storeProduct?.is_grosir;
                        const hasGrosir = Boolean(isGrosirFlag === true && hargaGrosir && minQtyGrosir);
                        return (
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-slate-800">{formatRupiah(p.harga)}</span>
                                <Show.When isTrue={hasGrosir}>
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-1.5 py-0.5 rounded-md mt-0.5 whitespace-nowrap leading-none font-mono">
                                        Grosir: {formatRupiah(Number(hargaGrosir))}
                                    </span>
                                </Show.When>
                            </div>
                        );
                    },
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
                    meta: {
                        headerClassName: "text-center",
                        cellClassName: "text-center",
                    },
                    size: 80,
                    cell: ({ row }) => {
                        const p = row.original;
                        if (!hasManageProducts) {
                            return <StatusBadge status={p.status} />;
                        }
                        return (
                            <button
                                onClick={() => handleToggleStatus(p)}
                                className="bg-transparent border-none p-0 cursor-pointer focus:outline-none"
                            >
                                <StatusBadge status={p.status} />
                            </button>
                        );
                    },
                },
            ];

            return baseColumns;
        },
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
                <Show.When isTrue={Boolean(hasManageProducts && canCreateProduct)}>
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Produk
                    </Button>
                </Show.When>
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
                virtualize={true}
                estimateRowHeight={44}
                onEdit={hasManageProducts ? onEdit : undefined}
                onDelete={hasManageProducts ? handleRemoveProduct : undefined}
                hideDelete={(row: Product) => row.status === "archived"}
                hideEdit={(row: Product) => row.status === "archived"}
                extraActions={
                    hasManageProducts
                        ? (row: Product) => {
                            if (row.status === "archived") {
                                return (
                                    <DataTableActionButton
                                        variant="emerald"
                                        onClick={() => {
                                            setProductToUnarchive(row);
                                            setIsUnarchiveOpen(true);
                                        }}
                                        tooltip="Batalkan Hapus (Unarchive)"
                                    >
                                        <IconArchiveOff size={16} />
                                    </DataTableActionButton>
                                );
                            }
                            return null;
                        }
                        : undefined
                }
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
                isLoading={detachStoreProduct.isPending}
                variant="danger"
            />

            <UnarchiveProductDialog
                open={isUnarchiveOpen}
                onOpenChange={setIsUnarchiveOpen}
                product={productToUnarchive}
            />
        </section>
    );
}
