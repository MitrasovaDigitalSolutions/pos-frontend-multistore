"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import type { Supplier } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { useDeleteSupplier } from "../api/stock-api";
import { toast } from "sonner";

interface SupplierListProps {
    suppliers: Supplier[];
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
    onEdit: (supplier: Supplier) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

export function SupplierList({
    suppliers,
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
}: SupplierListProps) {
    const deleteSupplier = useDeleteSupplier();

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus data supplier ini?")) {
            deleteSupplier.mutate(id, {
                onSuccess: () => {
                    toast.success("Supplier berhasil dihapus.");
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menghapus supplier.");
                },
            });
        }
    };

    const columns = useMemo<ColumnDef<Supplier>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Nama Supplier",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900 text-xs">
                        {row.original.nama}
                    </span>
                ),
            },
            {
                accessorKey: "nomor_telepon",
                header: "No. Telepon / HP",
                cell: ({ row }) => (
                    <span className="text-slate-600 font-medium text-xs font-mono">
                        {row.original.nomor_telepon || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => (
                    <span className="text-slate-600 text-xs">
                        {row.original.email || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "alamat",
                header: "Alamat",
                cell: ({ row }) => (
                    <span className="text-slate-500 text-xs line-clamp-1">
                        {row.original.alamat || "-"}
                    </span>
                ),
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
                    const sup = row.original;
                    return (
                        <div className="flex justify-center gap-1.5">
                            <button
                                onClick={() => onEdit(sup)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                            >
                                <IconEdit size={16} />
                            </button>
                            <button
                                onClick={() => handleDelete(sup.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
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

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Kelola Supplier Master Data
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar nama, kontak, dan alamat distributor pemasok barang dagangan.
                    </p>
                </div>
                <Button
                    onClick={onAddClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                >
                    <IconPlus size={16} /> Tambah Supplier
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={suppliers}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada supplier ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="supplier"
                search={search}
                onSearchChange={onSearchChange}
                searchPlaceholder="Cari supplier berdasarkan nama..."
                virtualize={true}
                estimateRowHeight={44}
            />
        </section>
    );
}
