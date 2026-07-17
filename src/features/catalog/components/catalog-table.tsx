"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBuildingStore } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
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
    isLoading = false,
    isFetching = false,
    filterElement,
    sortBy,
    sortOrder,
    onSortChange,
    isAdmin,
}: CatalogTableProps) {
    const columns = useMemo<ColumnDef<CatalogProduct>[]>(
        () => [
            {
                accessorKey: "barcode",
                header: "Barcode / SKU",
                enableSorting: false,
                size: 120,
                cell: ({ row }) => (
                    <span className="font-mono text-xs text-slate-600">
                        {row.original.barcode || "—"}
                    </span>
                ),
            },
            {
                accessorKey: "nama",
                header: "Nama Produk",
                size: 240,
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800 text-sm leading-tight">
                            {row.original.nama}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {row.original.category && (
                                <span className="text-[10px] text-slate-400">
                                    {row.original.category.nama}
                                </span>
                            )}
                            {row.original.is_jasa && (
                                <Badge className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-100">
                                    Jasa
                                </Badge>
                            )}
                        </div>
                    </div>
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
                cell: ({ row }) => formatRupiah(row.original.harga),
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
            ...(isAdmin
                ? ([
                    {
                        id: "actions",
                        header: "Distribusi",
                        enableSorting: false,
                        size: 100,
                        meta: {
                            headerClassName: "text-center",
                            cellClassName: "text-center",
                        },
                        cell: ({ row }) => (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 gap-1.5 text-brand-600 border-brand-200 hover:bg-brand-50 hover:border-brand-400 font-semibold text-xs"
                                onClick={() => onAssign(row.original)}
                            >
                                <IconBuildingStore size={13} />
                                Kelola
                            </Button>
                        ),
                    },
                ] as ColumnDef<CatalogProduct>[])
                : []),
        ],
        [isAdmin, onAssign]
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <IconBuildingStore size={16} className="text-brand-600" />
                        Katalog Produk (Multi-Toko)
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
            />
        </section>
    );
}
