"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useDeleteProduct, useToggleProductStatus } from "../api/products-api";
import type { Product } from "../types";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { CommandSelect } from "@/components/ui/command-select";

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
    onEdit,
    onAddClick,
    isLoading = false,
    isFetching = false,
}: ProductTableProps) {
    const deleteProduct = useDeleteProduct();
    const toggleStatus = useToggleProductStatus();
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

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

    const handleRemoveProduct = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            deleteProduct.mutate(id, {
                onSuccess: () => {
                    toast.success("Produk berhasil dihapus.");
                },
                onError: () => {
                    toast.error("Gagal menghapus produk.");
                },
            });
        }
    };

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            if (statusFilter === "all") return true;
            return p.status === statusFilter;
        });
    }, [products, statusFilter]);

    const columns = useMemo<ColumnDef<Product>[]>(
        () => [
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
                accessorKey: "merek",
                header: "Merek",
                cell: ({ row }) => (
                    <span className="text-slate-500">
                        {row.original.merek}
                    </span>
                ),
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
                            className={`font-bold ${
                                p.stok <= 10
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
                    return (
                        <button
                            onClick={() => handleToggleStatus(p)}
                            className={`badge text-[10px] border-none cursor-pointer ${
                                p.status === "active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                            }`}
                        >
                            {p.status === "active" ? "Aktif" : "Nonaktif"}
                        </button>
                    );
                },
            },
            {
                id: "actions",
                header: "Aksi",
                enableSorting: false,
                meta: {
                    headerClassName: "text-center w-28",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const p = row.original;
                    return (
                        <div className="flex justify-center gap-1.5">
                            <button
                                onClick={() => onEdit(p)}
                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                            >
                                <IconEdit size={16} />
                            </button>
                            <button
                                onClick={() => handleRemoveProduct(p.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded transition-colors border-none bg-transparent cursor-pointer"
                            >
                                <IconTrash size={16} />
                            </button>
                        </div>
                    );
                },
            },
        ],
        [],
    );

    const filtersSlot = (
        <CommandSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as any)}
            options={[
                { value: "all", label: "Semua Status" },
                { value: "active", label: "Aktif" },
                { value: "inactive", label: "Nonaktif" },
            ]}
            wrapperClassName="w-36"
            searchPlaceholder="Cari status..."
            placeholder="Pilih status"
        />
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Produk Toko
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Manajemen inventori produk aktif dan SKU.
                    </p>
                </div>
                <Button
                    onClick={onAddClick}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                >
                    <IconPlus size={16} /> Tambah Produk
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredProducts}
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
            />
        </section>
    );
}
