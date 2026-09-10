"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus } from "@tabler/icons-react";
import type { Unit } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { useDeleteUnit } from "../api/units-api";
import { toast } from "sonner";

interface UnitListProps {
    units: Unit[];
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
    onEdit: (unit: Unit) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function UnitList({
    units,
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
}: UnitListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageProducts =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_products");

    const deleteUnit = useDeleteUnit();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

    const handleDelete = (u: Unit) => {
        setUnitToDelete(u);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!unitToDelete) return;
        deleteUnit.mutate(unitToDelete.uid, {
            onSuccess: () => {
                toast.success(`Satuan "${unitToDelete.nama}" berhasil dihapus.`);
                setIsConfirmOpen(false);
                setUnitToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus satuan.");
            },
        });
    };

    const columns = useMemo<ColumnDef<Unit>[]>(
        () => {
            const baseColumns: ColumnDef<Unit>[] = [
                {
                    accessorKey: "nama",
                    header: "Nama Satuan",
                    cell: ({ row }) => (
                        <span className="font-bold text-slate-900 text-xs">
                            {row.original.nama}
                        </span>
                    ),
                    size: 260,
                },
                {
                    accessorKey: "simbol",
                    header: "Simbol",
                    cell: ({ row }) => (
                        <span className="font-semibold text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block">
                            {row.original.simbol}
                        </span>
                    ),
                    size: 110,
                },
                {
                    accessorKey: "tipe",
                    header: "Tipe Satuan",
                    cell: ({ row }) => (
                        <span className="text-xs text-slate-600 capitalize">
                            {row.original.tipe || "kuantitas"}
                        </span>
                    ),
                    size: 140,
                },
                {
                    accessorKey: "deskripsi",
                    header: "Deskripsi",
                    cell: ({ row }) => (
                        <span className="text-xs text-slate-400 line-clamp-1">
                            {row.original.deskripsi || "—"}
                        </span>
                    ),
                },
            ];

            return baseColumns;
        },
        []
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Satuan Produk
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar satuan unit pengukuran untuk mengelompokkan takaran produk dan bahan baku Anda.
                    </p>
                </div>
                {hasManageProducts && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Satuan
                    </Button>
                )}
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={units}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada satuan ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="satuan"
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
                title="Hapus Satuan Produk"
                description={
                    unitToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus satuan{" "}
                            <strong className="font-semibold text-slate-900">
                                {unitToDelete.nama} ({unitToDelete.simbol})
                            </strong>
                            ? Tindakan ini tidak dapat dibatalkan.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menghapus satuan ini?"
                    )
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                isLoading={deleteUnit.isPending}
                variant="danger"
            />
        </section>
    );
}
