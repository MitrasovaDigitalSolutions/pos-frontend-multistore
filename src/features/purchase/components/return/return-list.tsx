"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { CommandSelect } from "@/components/ui/command-select";
import { DatePicker } from "@/components/ui/date-picker";
import { useAllSuppliers } from "@/features/suppliers/api/suppliers-api";
import { hasPermission, hasRole } from "@/constants/roles";
import type { Product } from "@/features/products/types";
import { IconPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeletePurchaseReturn } from "../../api/purchase-api";
import type { PurchaseReturn } from "../../types";
import { ReturnDetailDialog } from "./return-detail-dialog";
import { ReturnFinalizeDialog } from "./return-finalize-dialog";
import { useAppRouter } from "@/hooks/use-app-router";
import {
    RETURN_STATUS,
    RETURN_STATUS_LABELS,
} from "@/constants/purchase";
import { returnColumns } from "./return-columns";

interface ReturnListProps {
    returns: PurchaseReturn[];
    products: Product[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    page: number;
    onPageChange: (page: number) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filters: {
        search: string;
        status: string;
        supplier_id: string;
        start_date: string;
        end_date: string;
    };
    setFilters: React.Dispatch<React.SetStateAction<{
        search: string;
        status: string;
        supplier_id: string;
        start_date: string;
        end_date: string;
    }>>;
}

export function ReturnList({
    returns,
    products: _products,
    meta,
    page,
    onPageChange,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filters,
    setFilters,
}: ReturnListProps) {
    const { data: session } = useSession();
    const router = useAppRouter();
    const deleteReturn = useDeletePurchaseReturn();
    const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);
    const { data: suppliers = [] } = useAllSuppliers();

    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        title: string;
        description: React.ReactNode;
        confirmText: string;
        cancelText?: string;
        variant: "danger" | "warning" | "info" | "success";
        onConfirm: () => void;
    }>({
        open: false,
        title: "",
        description: "",
        confirmText: "",
        variant: "warning",
        onConfirm: () => { },
    });

    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManagePurchase =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_purchase");

    const handleDelete = (id: number) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Retur Pembelian",
            description: "Apakah Anda yakin ingin menghapus draft retur pembelian ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteReturn.mutate(id, {
                    onSuccess: () => {
                        toast.success("Draft retur pembelian berhasil dihapus.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menghapus draft retur.");
                    },
                });
            },
        });
    };

    const handleEditClick = (ret: PurchaseReturn) => {
        router.push(`/admin/purchase/return/${ret.id}/items`);
    };

    const handleDetailClick = (ret: PurchaseReturn) => {
        setSelectedReturn(ret);
        setIsDetailOpen(true);
    };

    const handleFinalizeClick = (ret: PurchaseReturn) => {
        setSelectedReturn(ret);
        setIsFinalizeOpen(true);
    };

    // Status options for CommandSelect
    const statusOptions = [
        { value: "all", label: "Semua Status" },
        ...Object.values(RETURN_STATUS).map((status) => ({
            value: status,
            label: RETURN_STATUS_LABELS[status],
        })),
    ];

    // Supplier options for CommandSelect
    const supplierOptions = useMemo(() => {
        return [
            { value: "all", label: "Semua Supplier" },
            ...suppliers.map((sup) => ({
                value: String(sup.id),
                label: sup.nama,
            })),
        ];
    }, [suppliers]);

    const filtersBar = (
        <div className="grid grid-cols-4 gap-2.5 w-full">
            {/* Status Select */}
            <CommandSelect
                options={statusOptions}
                value={filters.status}
                onChange={(val) => setFilters((prev) => ({ ...prev, status: val || "all" }))}
                placeholder="Semua Status"
                className="w-full h-9 text-xs"
            />

            {/* Supplier Select */}
            <CommandSelect
                options={supplierOptions}
                value={filters.supplier_id}
                onChange={(val) => setFilters((prev) => ({ ...prev, supplier_id: val || "all" }))}
                placeholder="Semua Supplier"
                className="w-full h-9 text-xs"
            />

            {/* Date Range Inputs */}
            <div className="col-span-2 flex items-center gap-2">
                <DatePicker
                    value={filters.start_date}
                    onChange={(date) => setFilters((prev) => ({ ...prev, start_date: date }))}
                    placeholder="Dari Tanggal"
                    className="w-full"
                />
                <span className="text-xs text-slate-400 font-medium">s/d</span>
                <DatePicker
                    value={filters.end_date}
                    onChange={(date) => setFilters((prev) => ({ ...prev, end_date: date }))}
                    placeholder="Sampai Tanggal"
                    className="w-full"
                />
            </div>
        </div>
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Retur Pembelian (Purchase Return)
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar dokumen pengembalian barang rusak atau tidak sesuai ke supplier.
                    </p>
                </div>
                {hasManagePurchase && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Buat Retur Pembelian
                    </Button>
                )}
            </div>

            <DataTable
                columns={returnColumns}
                data={returns}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Belum ada Retur Pembelian yang tercatat."
                page={page}
                onPageChange={onPageChange}
                meta={meta}
                entityName="dokumen retur"
                virtualize={true}
                estimateRowHeight={44}
                onView={handleDetailClick}
                onEdit={handleEditClick}
                hideEdit={(r) => !(r.status === RETURN_STATUS.DRAFT && hasManagePurchase)}
                onCheck={handleFinalizeClick}
                hideCheck={(r) => !(r.status === RETURN_STATUS.DRAFT && hasManagePurchase)}
                onDelete={(r) => handleDelete(r.id)}
                hideDelete={(r) => !(r.status === RETURN_STATUS.DRAFT && hasManagePurchase)}
                search={filters.search}
                onSearchChange={(searchVal) => setFilters((prev) => ({ ...prev, search: searchVal }))}
                searchPlaceholder="Cari nomor retur atau nama supplier..."
                filters={filtersBar}
            />

            {/* Details & Logs Dialog */}
            <ReturnDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                returnId={selectedReturn?.id || null}
            />

            {/* Finalize Dialog */}
            <ReturnFinalizeDialog
                open={isFinalizeOpen}
                onOpenChange={setIsFinalizeOpen}
                returnObj={selectedReturn}
            />

            {/* Confirm Dialog */}
            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                variant={confirmDialog.variant}
                onConfirm={confirmDialog.onConfirm}
                isLoading={deleteReturn.isPending}
            />
        </section>
    );
}
