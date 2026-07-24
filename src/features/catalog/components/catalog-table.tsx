"use client";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { getImageUrl } from "@/lib/utils";
import { IconBuildingStore, IconPackage, IconUser } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeleteCatalogProduct } from "../api/catalog-api";
import type { CatalogProduct } from "../types";

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
                enableSorting: false,
                size: 130,
                cell: ({ row }) => (
                    <span className="font-mono text-xs text-slate-600">
                        {row.original.barcode || "—"}
                    </span>
                ),
            },
            {
                accessorKey: "nama",
                header: "Nama Produk",
                size: 280,
                cell: ({ row }) => {
                    const p = row.original;
                    const imgUrl = getImageUrl(p.image_url || p.image_path);
                    const tokoNama = p.created_by_toko?.nama;
                    const userName = p.created_by_user?.name;

                    return (
                        <div className="flex items-center gap-3 py-1">
                            {imgUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={imgUrl}
                                    alt={p.nama}
                                    className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0 shadow-2xs"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                    <IconPackage size={20} />
                                </div>
                            )}

                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-sm leading-tight truncate">
                                        {p.nama}
                                    </span>
                                    {p.is_jasa && (
                                        <Badge className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-100 shrink-0">
                                            Jasa
                                        </Badge>
                                    )}
                                </div>

                                {/* Baris baru khusus untuk Toko Asal & Pembuat Produk */}
                                {(tokoNama || userName) && (
                                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium flex-wrap">
                                        {tokoNama && (
                                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/70 font-semibold text-[10px] shrink-0">
                                                <IconBuildingStore size={12} className="text-slate-500" />
                                                Toko: {tokoNama}
                                            </span>
                                        )}
                                        {userName && (
                                            <span className="inline-flex items-center gap-1 text-slate-500 text-[10px] shrink-0">
                                                <IconUser size={12} className="text-slate-400" />
                                                Oleh: {userName}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "category.nama",
                header: "Kategori",
                enableSorting: false,
                size: 130,
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600 font-medium">
                        {row.original.category?.nama || "—"}
                    </span>
                ),
            },
            {
                accessorKey: "merek",
                header: "Merek / Brand",
                enableSorting: false,
                size: 120,
                cell: ({ row }) => (
                    <span className="text-xs text-slate-500">
                        {row.original.brand?.nama || row.original.merek || "—"}
                    </span>
                ),
            },
            {
                accessorKey: "harga_beli",
                header: "Harga Beli",
                enableSorting: false,
                size: 120,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right text-slate-500 text-xs",
                },
                cell: ({ row }) =>
                    row.original.harga_beli != null
                        ? formatRupiah(row.original.harga_beli)
                        : "—",
            },
            {
                accessorKey: "harga",
                header: "Harga Jual (Master)",
                size: 140,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-bold text-slate-800",
                },
                cell: ({ row }) => {
                    const price = row.original.harga_jual ?? row.original.harga;
                    return formatRupiah(price);
                },
            },
            {
                accessorKey: "margin",
                header: "Margin",
                enableSorting: false,
                size: 100,
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right text-slate-500 text-xs",
                },
                cell: ({ row }) =>
                    row.original.margin != null
                        ? `${row.original.margin}%`
                        : "—",
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: false,
                size: 90,
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const s = row.original.status;
                    const label =
                        s === "active" ? "Aktif" : s === "inactive" ? "Nonaktif" : "Diarsipkan";
                    const cls =
                        s === "active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : s === "inactive"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : "bg-slate-50 text-slate-500 border-slate-200";
                    return (
                        <span className={`badge text-[10px] border ${cls}`}>{label}</span>
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
                estimateRowHeight={52}
                onEdit={isAdmin ? onEdit : undefined}
                onDelete={isAdmin ? handleRemoveProduct : undefined}
                extraActions={(item) =>
                    isAdmin ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => onAssign(item)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    <IconBuildingStore size={16} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Kelola Distribusi Toko</TooltipContent>
                        </Tooltip>
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
