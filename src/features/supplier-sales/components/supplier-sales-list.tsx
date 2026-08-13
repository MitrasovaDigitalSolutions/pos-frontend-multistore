"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { hasPermission, hasRole } from "@/constants/roles";
import type { ColumnDef } from "@tanstack/react-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { IconBoxSeam, IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/ui/data-table";
import { DataTableActionButton } from "@/components/ui/data-table-actions";
import { toast } from "sonner";
import type { SupplierSale } from "../types";
import { useDeleteSupplierSale } from "../api/supplier-sales-api";
import { Button } from "@/components/ui/button";

interface SupplierSalesListProps {
    sales: SupplierSale[];
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
    onEdit: (sale: SupplierSale) => void;
    onManageItems: (sale: SupplierSale) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
}

export function SupplierSalesList({
    sales,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    onEdit,
    onManageItems,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filterElement,
}: SupplierSalesListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const canManage =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_request_transfers");

    const deleteSale = useDeleteSupplierSale();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [saleToDelete, setSaleToDelete] = useState<SupplierSale | null>(null);

    const handleDelete = (s: SupplierSale) => {
        setSaleToDelete(s);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!saleToDelete) return;
        deleteSale.mutate(saleToDelete.uid, {
            onSuccess: () => {
                toast.success(`Sales "${saleToDelete.nama}" berhasil dihapus.`);
                setIsConfirmOpen(false);
                setSaleToDelete(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal menghapus sales.");
            },
        });
    };

    const columns = useMemo<ColumnDef<SupplierSale>[]>(
        () => [
            {
                accessorKey: "nama",
                header: "Nama Sales",
                cell: ({ row }) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-900 text-xs">{row.original.nama}</span>
                        {row.original.keterangan && (
                            <span className="text-[10px] text-slate-400">{row.original.keterangan}</span>
                        )}
                    </div>
                ),
                size: 320,
            },
            {
                accessorKey: "supplier.nama",
                header: "Supplier",
                cell: ({ row }) => (
                    <span className="text-xs text-slate-700">{row.original.supplier?.nama || "-"}</span>
                ),
                size: 200,
            },
            {
                accessorKey: "items",
                header: "Jumlah Produk",
                cell: ({ row }) => (
                    <span className="text-xs font-semibold text-slate-700">
                        {row.original.items?.length ?? 0} produk
                    </span>
                ),
                size: 140,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => (
                    <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${row.original.status === "active"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                            : "text-slate-500 bg-slate-50 border-slate-200"
                            }`}
                    >
                        {row.original.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                ),
                size: 110,
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [canManage],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">Sales </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar produk + harga estimasi per supplier untuk mempermudah permintaan stok antar cabang.
                    </p>
                </div>
                {canManage && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Tambah Sales
                    </Button>
                )}
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={sales}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada sales supplier ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="sales"
                virtualize={true}
                estimateRowHeight={44}
                onEdit={canManage ? (sale) => onEdit(sale as SupplierSale) : undefined}
                onDelete={canManage ? (sale) => handleDelete(sale as SupplierSale) : undefined}
                extraActions={(sale) => (
                    <DataTableActionButton
                        variant="emerald"
                        tooltip="Kelola Produk"
                        onClick={() => onManageItems(sale as SupplierSale)}
                    >
                        <IconBoxSeam size={15} />
                    </DataTableActionButton>
                )}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Hapus Sales"
                description={
                    saleToDelete ? (
                        <span>
                            Apakah Anda yakin ingin menghapus sales{" "}
                            <strong className="font-semibold text-slate-900">{saleToDelete.nama}</strong>?
                            Produk di dalamnya ikut terhapus.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin menghapus sales ini?"
                    )
                }
                confirmText="Ya, Hapus"
                cancelText="Batal"
                onConfirm={handleConfirmDelete}
                isLoading={deleteSale.isPending}
                variant="danger"
            />
        </section>
    );
}
