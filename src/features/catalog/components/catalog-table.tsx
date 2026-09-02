"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { DataTableActionButton } from "@/components/ui/data-table-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBuildingStore, IconCopy, IconPlus, IconUser } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeleteCatalogProduct } from "../api/catalog-api";
import type { CatalogProduct } from "../types";
import { STORE_BADGE_HQ } from "@/constants/store";
import { Show } from "@/components/ui/show";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface CatalogTableProps {
    products: CatalogProduct[];
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
    onAssign: (product: CatalogProduct) => void;
    onEdit?: (product: CatalogProduct) => void;
    onCopy?: (product: CatalogProduct) => void;
    onAddClick?: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (
        sortBy: string | undefined,
        sortOrder: "asc" | "desc" | undefined
    ) => void;
    isAdmin: boolean;
}

export function CatalogTable({
    products,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    onAssign,
    onEdit,
    onCopy,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filterElement,
    sortBy,
    sortOrder,
    onSortChange,
    isAdmin,
}: CatalogTableProps) {
    const deleteCatalogProduct = useDeleteCatalogProduct();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<CatalogProduct | null>(null);

    const handleRemoveProduct = (p: CatalogProduct) => {
        setProductToDelete(p);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!productToDelete) return;
        deleteCatalogProduct.mutate(productToDelete.uid, {
            onSuccess: () => {
                toast.success(`Master produk "${productToDelete.nama}" berhasil dihapus.`);
                setIsConfirmOpen(false);
                setProductToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus produk master.");
            },
        });
    };

    const columns = useMemo<ColumnDef<CatalogProduct>[]>(
        () => [
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
                cell: ({ row }) =>
                    row.original.harga_beli !== null && row.original.harga_beli !== undefined
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
                    const price = p.harga_jual ?? p.harga;
                    const storeProduct = p.product_stores?.[0];
                    const hargaGrosir = p.harga_grosir ?? storeProduct?.harga_grosir;
                    const minQtyGrosir = p.min_qty_grosir ?? storeProduct?.min_qty_grosir;
                    const isGrosirFlag = p.is_grosir ?? storeProduct?.is_grosir;
                    const hasGrosir = Boolean(isGrosirFlag === true && hargaGrosir && minQtyGrosir);
                    return (
                        <div className="flex flex-col items-end">
                            <span className="font-bold text-slate-800">{formatRupiah(price)}</span>
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
                cell: ({ row }) =>
                    row.original.margin !== null && row.original.margin !== undefined
                        ? `${row.original.margin}%`
                        : "-",
            },
            {
                accessorKey: "status",
                header: "Status",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                size: 80,
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
            },
            {
                accessorKey: "created_by_toko",
                header: "Toko & Pembuat",
                enableSorting: false,
                size: 160,
                cell: ({ row }) => {
                    const p = row.original;
                    const tokoNama = p.created_by_toko?.nama || STORE_BADGE_HQ;
                    const userName = p.created_by_user?.name || "Sistem";

                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1.5 font-bold text-xs text-slate-800">
                                <IconBuildingStore size={13} className="text-emerald-600 shrink-0" />
                                {tokoNama}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                <IconUser size={12} className="text-slate-400 shrink-0" />
                                {userName}
                            </span>
                        </div>
                    );
                },
            },
        ],
        []
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconBuildingStore size={16} className="text-brand-600" />
                        Katalog Keseluruhan Produk
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Produk master — kelola distribusi harga ke seluruh toko &amp; cabang.
                    </p>
                </div>
                {isAdmin && onAddClick && (
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
                virtualize={true}
                estimateRowHeight={44}
                onEdit={isAdmin ? onEdit : undefined}
                onDelete={isAdmin ? handleRemoveProduct : undefined}
                extraActions={(item) =>
                    isAdmin ? (
                        <>
                            {onCopy && (
                                <DataTableActionButton
                                    variant="sky"
                                    onClick={() => onCopy(item)}
                                    tooltip="Salin / Duplikat Produk"
                                >
                                    <IconCopy size={16} />
                                </DataTableActionButton>
                            )}
                            <DataTableActionButton
                                variant="emerald"
                                onClick={() => onAssign(item)}
                                tooltip="Kelola Distribusi Toko"
                            >
                                <IconBuildingStore size={16} />
                            </DataTableActionButton>
                        </>
                    ) : null
                }
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Produk Master"
                description={
                    productToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus produk master{" "}
                            <strong className="font-semibold text-slate-900">
                                {productToDelete.nama}
                            </strong>
                            ? Produk ini akan terhapus permanen dari Katalog Master.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menghapus produk master ini?"
                    )
                }
                confirmText="Ya, Hapus Master"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                isLoading={deleteCatalogProduct.isPending}
                variant="danger"
            />
        </section>
    );
}
