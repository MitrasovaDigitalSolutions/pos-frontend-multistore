"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import type { Product } from "@/features/products/types";
import { IconPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeletePurchaseReturn } from "../../api/purchase-api";
import type { PurchaseReturn } from "../../types";
import { ReturnDetailDialog } from "./return-detail-dialog";
import { ReturnFinalizeDialog } from "./return-finalize-dialog";
import { useAppRouter } from "@/hooks/use-app-router";
import {
    RETURN_STATUS,
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
    filterElement?: React.ReactNode;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
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
    filterElement,
    sortBy,
    sortOrder,
    onSortChange,
}: ReturnListProps) {
    const { data: session } = useSession();
    const router = useAppRouter();
    const deleteReturn = useDeletePurchaseReturn();
    const [selectedReturn, setSelectedReturn] = useState<PurchaseReturn | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);

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

    const handleDelete = (uid: string) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Retur Pembelian",
            description: "Apakah Anda yakin ingin menghapus draft retur pembelian ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteReturn.mutate(uid, {
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
        router.push(`/admin/purchase/return/${ret.uid}/items`);
    };

    const handleDetailClick = (ret: PurchaseReturn) => {
        setSelectedReturn(ret);
        setIsDetailOpen(true);
    };

    const handleFinalizeClick = (ret: PurchaseReturn) => {
        setSelectedReturn(ret);
        setIsFinalizeOpen(true);
    };

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
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

            {filterElement}

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
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
                onView={handleDetailClick}
                onEdit={handleEditClick}
                hideEdit={(r) => !(r.status === RETURN_STATUS.DRAFT && hasManagePurchase)}
                onCheck={handleFinalizeClick}
                hideCheck={(r) => !(r.status === RETURN_STATUS.DRAFT && hasManagePurchase)}
                onDelete={(r) => handleDelete(r.uid)}
                hideDelete={(r) => !(r.status === RETURN_STATUS.DRAFT && hasManagePurchase)}
            />

            {/* Details & Logs Dialog */}
            <ReturnDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                returnId={selectedReturn?.uid || null}
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
