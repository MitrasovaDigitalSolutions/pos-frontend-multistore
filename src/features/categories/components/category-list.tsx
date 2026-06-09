"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconEdit, IconTrash, IconPlus } from "@tabler/icons-react";
import type { Category } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { useDeleteCategory } from "../api/categories-api";
import { toast } from "sonner";

interface CategoryListProps {
    categories: Category[];
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
    onEdit: (category: Category) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

export function CategoryList({
    categories,
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
}: CategoryListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageProducts =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_products");

    const deleteCategory = useDeleteCategory();

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
            deleteCategory.mutate(id, {
                onSuccess: () => {
                    toast.success("Kategori berhasil dihapus.");
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menghapus kategori.");
                },
            });
        }
    };

    const columns = useMemo<ColumnDef<Category>[]>(
        () => {
            const baseColumns: ColumnDef<Category>[] = [
                {
                    accessorKey: "nama",
                    header: "Nama Kategori",
                    cell: ({ row }) => (
                        <span className="font-bold text-slate-900 text-xs">
                            {row.original.nama}
                        </span>
                    ),
                },
                {
                    accessorKey: "deskripsi",
                    header: "Deskripsi",
                    cell: ({ row }) => (
                        <span className="text-slate-500 text-xs line-clamp-1">
                            {row.original.deskripsi || "-"}
                        </span>
                    ),
                },
            ];

            if (hasManageProducts) {
                baseColumns.push({
                    id: "actions",
                    header: "Aksi",
                    enableSorting: false,
                    meta: {
                        headerClassName: "text-center w-28",
                        cellClassName: "text-center",
                    },
                    cell: ({ row }) => {
                        const cat = row.original;
                        return (
                            <div className="flex justify-center gap-1.5">
                                <button
                                    onClick={() => onEdit(cat)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    <IconEdit size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                >
                                    <IconTrash size={16} />
                                </button>
                            </div>
                        );
                    },
                });
            }

            return baseColumns;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hasManageProducts, onEdit],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Kelola Kategori Produk
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar kategori untuk mengelompokkan produk dagangan Anda.
                    </p>
                </div>
                {hasManageProducts && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Kategori
                    </Button>
                )}
            </div>

            <DataTable
                columns={columns}
                data={categories}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada kategori ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="kategori"
                search={search}
                onSearchChange={onSearchChange}
                searchPlaceholder="Cari kategori berdasarkan nama..."
                virtualize={true}
                estimateRowHeight={44}
            />
        </section>
    );
}
