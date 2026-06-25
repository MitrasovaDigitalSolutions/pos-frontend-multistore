"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus, IconRefresh, IconCalendarEvent } from "@tabler/icons-react";
import type { ExpenseCategory } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { useDeleteExpenseCategory } from "../api/expenses-api";
import { toast } from "sonner";

interface CategoryListProps {
    categories: ExpenseCategory[];
    onEdit: (category: ExpenseCategory) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

export function CategoryList({
    categories,
    onEdit,
    onAddClick,
    isLoading = false,
    isFetching = false,
}: CategoryListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageExpenses =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_expenses");

    const deleteCategory = useDeleteExpenseCategory();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategory | null>(null);

    const handleDelete = (c: ExpenseCategory) => {
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

    const columns = useMemo<ColumnDef<ExpenseCategory>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Nama Kategori",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900 text-xs">
                        {row.original.nama}
                    </span>
                ),
                size: 200,
            },
            {
                accessorKey: "is_recurring",
                header: "Tipe Pengeluaran",
                cell: ({ row }) => {
                    const rec = row.original.is_recurring;
                    return (
                        <div className="flex items-center gap-1.5 text-xs">
                            {rec ? (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 shrink-0">
                                    <IconRefresh size={10} className="animate-spin-slow" />
                                    Berulang / Rutin
                                </span>
                            ) : (
                                <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0">
                                    Sekali Bayar / Insidentil
                                </span>
                            )}
                        </div>
                    );
                },
                size: 180,
            },
            {
                accessorKey: "hari_jatuh_tempo",
                header: "Jatuh Tempo",
                cell: ({ row }) => {
                    const day = row.original.hari_jatuh_tempo;
                    if (!row.original.is_recurring || !day) return <span className="text-slate-400">-</span>;
                    return (
                        <span className="font-semibold text-slate-700 text-xs flex items-center gap-1">
                            <IconCalendarEvent size={12} className="text-slate-400" />
                            Tanggal {day}
                        </span>
                    );
                },
                size: 150,
            },
            {
                accessorKey: "keterangan",
                header: "Keterangan",
                cell: ({ row }) => (
                    <span className="text-slate-500 text-xs">
                        {row.original.keterangan || "-"}
                    </span>
                ),
                size: 300,
            },
        ],
        [],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Kategori Pengeluaran Toko
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar pos-pos pengeluaran kas (seperti Listrik, Sewa, Gaji Karyawan).
                    </p>
                </div>
                {hasManageExpenses && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer border-none"
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
                emptyMessage="Tidak ada kategori pengeluaran ditemukan."
                entityName="kategori"
                virtualize={true}
                estimateRowHeight={44}
                onEdit={hasManageExpenses ? onEdit : undefined}
                onDelete={hasManageExpenses ? handleDelete : undefined}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Kategori Pengeluaran"
                description={
                    categoryToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus kategori{" "}
                            <strong className="font-semibold text-slate-900">
                                {categoryToDelete.nama}
                            </strong>
                            ? Tindakan ini hanya dapat dilakukan jika kategori belum memiliki catatan transaksi.
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
