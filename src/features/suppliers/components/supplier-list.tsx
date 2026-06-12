"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus } from "@tabler/icons-react";
import type { Supplier } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { useDeleteSupplier } from "../api/suppliers-api";
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
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageSuppliers =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_suppliers");

    const deleteSupplier = useDeleteSupplier();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    const handleDelete = (s: Supplier) => {
        setSupplierToDelete(s);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!supplierToDelete) return;
        deleteSupplier.mutate(supplierToDelete.id, {
            onSuccess: () => {
                toast.success(`Supplier "${supplierToDelete.nama}" berhasil dihapus.`);
                setIsConfirmOpen(false);
                setSupplierToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus supplier.");
            },
        });
    };

    const columns = useMemo<ColumnDef<Supplier>[]>(
        () => {
            const baseColumns: ColumnDef<Supplier>[] = [
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
            ];

            return baseColumns;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [hasManageSuppliers],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Supplier
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar nama, kontak, dan alamat distributor pemasok barang dagangan.
                    </p>
                </div>
                {hasManageSuppliers && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Supplier
                    </Button>
                )}
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
                onEdit={hasManageSuppliers ? onEdit : undefined}
                onDelete={hasManageSuppliers ? handleDelete : undefined}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Supplier"
                description={
                    supplierToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus supplier{" "}
                            <strong className="font-semibold text-slate-900">
                                {supplierToDelete.nama}
                            </strong>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menghapus supplier ini?"
                    )
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                isLoading={deleteSupplier.isPending}
                variant="danger"
            />
        </section>
    );
}
