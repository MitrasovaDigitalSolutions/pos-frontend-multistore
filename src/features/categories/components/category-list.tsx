"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus } from "@tabler/icons-react";
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
    onEdit: (category: Category) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function CategoryList({
    categories,
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
}: CategoryListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageProducts =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_products");

    const deleteCategory = useDeleteCategory();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    const handleDelete = (c: Category) => {
        setCategoryToDelete(c);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!categoryToDelete) return;
        deleteCategory.mutate(categoryToDelete.uid, {
            onSuccess: () => {
                toast.success(`Kategori "${categoryToDelete.nama}" berhasil dihapus.`);
                setIsConfirmOpen(false);
                setCategoryToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus kategori.");
            },
        });
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
                    size: 320,
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
                        Daftar Kategori Produk
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

            {filterElement}

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
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
                onEdit={hasManageProducts ? onEdit : undefined}
                onDelete={hasManageProducts ? handleDelete : undefined}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Kategori Produk"
                description={
                    categoryToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus kategori{" "}
                            <strong className="font-semibold text-slate-900">
                                {categoryToDelete.nama}
                            </strong>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menghapus kategori ini?"
                    )
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                isLoading={deleteCategory.isPending}
                variant="danger"
            />
        </section>
    );
}
