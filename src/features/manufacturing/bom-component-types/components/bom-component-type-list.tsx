"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { hasRole, hasPermission } from "@/constants/roles";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconPlus, IconTags } from "@tabler/icons-react";
import type { BomComponentType } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { useDeleteBomComponentType } from "../api/bom-component-types-api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface BomComponentTypeListProps {
    types: BomComponentType[];
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
    onEdit: (type: BomComponentType) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function BomComponentTypeList({
    types,
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
}: BomComponentTypeListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const canManage =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_production");

    const deleteMutation = useDeleteBomComponentType();
    const [deletingType, setDeletingType] = useState<BomComponentType | null>(null);

    const handleDelete = async () => {
        if (!deletingType) return;
        try {
            await deleteMutation.mutateAsync(deletingType.uid);
            toast.success(`Tipe komponen "${deletingType.nama}" berhasil dihapus.`);
            setDeletingType(null);
        } catch (err: unknown) {
            const error = err as { message?: string };
            toast.error(error?.message || "Gagal menghapus tipe komponen BoM.");
        }
    };

    const columns = useMemo<ColumnDef<BomComponentType>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Tipe Komponen",
                cell: ({ row }) => (
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-200/60 shrink-0">
                            <IconTags size={14} />
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 text-xs block">
                                {row.original.nama}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                                kode: {row.original.kode}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                accessorKey: "kategori_bisnis",
                header: "Kategori Bisnis",
                cell: ({ row }) => (
                    <span className="text-xs font-medium text-slate-600 capitalize">
                        {row.original.kategori_bisnis || "general"}
                    </span>
                ),
                size: 140,
            },
            {
                accessorKey: "is_main_driver",
                header: "Klasifikasi Bahan",
                cell: ({ row }) => {
                    const isMain = row.original.is_main_driver;
                    return isMain ? (
                        <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200/90 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-lg w-fit shadow-2xs"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span>Bahan Baku Utama</span>
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="bg-sky-50 text-sky-700 border-sky-200/90 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800 text-[11px] font-semibold flex items-center gap-1.5 px-2 py-0.5 rounded-lg w-fit shadow-2xs"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                            <span>Bahan Pendukung</span>
                        </Badge>
                    );
                },
                size: 160,
            },
            {
                accessorKey: "deskripsi",
                header: "Deskripsi",
                cell: ({ row }) => (
                    <span className="text-xs text-slate-500 line-clamp-1">
                        {row.original.deskripsi || "-"}
                    </span>
                ),
            },
        ],
        []
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Daftar Tipe Komponen BoM
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Kelola klasifikasi komponen bahan pada resep BoM dan driver alokasi HPP hybrid.
                    </p>
                </div>
                {canManage && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Tipe Komponen
                    </Button>
                )}
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={types}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada tipe komponen BoM ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="tipe komponen"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                onEdit={canManage ? onEdit : undefined}
                onDelete={canManage ? (item) => setDeletingType(item) : undefined}
            />

            <ConfirmDialog
                open={!!deletingType}
                onOpenChange={(open) => !open && setDeletingType(null)}
                title="Hapus Tipe Komponen BoM?"
                description={
                    <span>
                        Apakah Anda yakin ingin menghapus tipe komponen{" "}
                        <strong>{deletingType?.nama} ({deletingType?.kode})</strong>? Tipe yang masih digunakan pada resep BoM produk tidak dapat dihapus.
                    </span>
                }
                variant="danger"
                confirmText="Hapus Tipe Komponen"
                cancelText="Batal"
                isLoading={deleteMutation.isPending}
                onConfirm={handleDelete}
            />
        </section>
    );
}
