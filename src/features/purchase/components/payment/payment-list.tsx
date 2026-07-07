"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAppRouter } from "@/hooks/use-app-router";
import {
    useDeletePayment,
} from "../../api/purchase-api";
import type { ReceivingPayment } from "../../types";
import {
    PAYMENT_TRANSACTION_STATUS,
} from "@/constants/purchase";
import { paymentColumns } from "./payment-columns";

interface PaymentListProps {
    payments: ReceivingPayment[];
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

export function PaymentList({
    payments,
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
}: PaymentListProps) {
    const { data: session } = useSession();
    const router = useAppRouter();
    const deletePayment = useDeletePayment();

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

    const handleDelete = (payment: ReceivingPayment) => {
        const alasan = prompt("Masukkan alasan pembatalan pembayaran (void):");
        if (alasan === null) return; // user cancelled prompt
        if (!alasan.trim()) {
            toast.error("Alasan pembatalan wajib diisi.");
            return;
        }

        setConfirmDialog({
            open: true,
            title: "Batalkan Pembayaran (Void)",
            description: `Apakah Anda yakin ingin membatalkan transaksi pembayaran '${payment.nomor_transaksi}' senilai ${formatRupiah(payment.total)}? Alasan: "${alasan}"`,
            confirmText: "Ya, Batalkan",
            cancelText: "Kembali",
            variant: "danger",
            onConfirm: () => {
                deletePayment.mutate(
                    { uid: payment.uid, alasan },
                    {
                        onSuccess: () => {
                            toast.success("Transaksi pembayaran berhasil dibatalkan (void).");
                            setConfirmDialog((prev) => ({ ...prev, open: false }));
                        },
                        onError: (err) => {
                            toast.error(err.message || "Gagal membatalkan pembayaran.");
                        },
                    }
                );
            },
        });
    };

    const handleEditClick = (payment: ReceivingPayment) => {
        router.push(`/admin/purchase/payment/new?edit=${payment.uid}`);
    };

    const handleDetailClick = (payment: ReceivingPayment) => {
        router.push(`/admin/purchase/payment/${payment.uid}`);
    };

    const columns = useMemo(
        () => paymentColumns,
        []
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Pembayaran Invoices
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar riwayat pembayaran transaksi pembelian barang masuk ke supplier.
                    </p>
                </div>
                {hasManagePurchase && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Catat Pembayaran
                    </Button>
                )}
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={payments}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Belum ada transaksi pembayaran supplier."
                page={page}
                onPageChange={onPageChange}
                meta={meta}
                entityName="transaksi pembayaran"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
                onView={handleDetailClick}
                onEdit={handleEditClick}
                hideEdit={() => true}
                onDelete={handleDelete}
                hideDelete={(p) => !(p.status === PAYMENT_TRANSACTION_STATUS.COMPLETED && hasManagePurchase)}
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
                isLoading={deletePayment.isPending}
            />
        </section>
    );
}
