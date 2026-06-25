"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import type { Product } from "@/features/products/types";
import { IconPlus } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useAppRouter } from "@/hooks/use-app-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    useDeleteReceiving,
    useUpdateReceiving,
} from "../../api/purchase-api";
import { ReceivingDetailDialog } from "./receiving-detail-dialog";
import { clearPurchaseItemsStore } from "@/stores/purchase-items-store";
import type { Receiving } from "../../types";
import {
    RECEIVING_STATUS,
} from "@/constants/purchase";
import { receivingColumns } from "./receiving-columns";

interface ReceivingListProps {
    receivings: Receiving[];
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

export function ReceivingList({
    receivings,
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
}: ReceivingListProps) {
    const router = useAppRouter();
    const { data: session } = useSession();
    const deleteReceiving = useDeleteReceiving();
    const updateReceiving = useUpdateReceiving();

    const [selectedReceiving, setSelectedReceiving] = useState<Receiving | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    const canDeleteDraft = hasManagePurchase;

    const handleFinalize = (receiving: Receiving) => {
        setConfirmDialog({
            open: true,
            title: "Selesaikan Penerimaan",
            description: "Apakah Anda yakin ingin menyelesaikan penerimaan ini? Stok produk akan langsung ditambahkan ke inventori dan tidak dapat diubah lagi.",
            confirmText: "Ya, Selesaikan",
            cancelText: "Batal",
            variant: "warning",
            onConfirm: () => {
                const itemsInput = (receiving.items || []).map((item) => ({
                    product_uid: item.product_uid,
                    kuantitas: item.kuantitas,
                    harga_beli: item.harga_beli || 0,
                    update_harga_jual: false,
                    harga_jual_baru: null,
                    margin_baru: null,
                }));

                updateReceiving.mutate(
                    {
                        uid: receiving.uid,
                        data: {
                            supplier_uid: receiving.supplier_uid,
                            nomor_faktur: receiving.nomor_faktur,
                            nilai_faktur: receiving.nilai_faktur,
                            status_pembayaran: receiving.status_pembayaran,
                            status: RECEIVING_STATUS.COMPLETED,
                            catatan: receiving.catatan,
                            items: itemsInput,
                        },
                    },
                    {
                        onSuccess: () => {
                            toast.success("Penerimaan barang berhasil diselesaikan.");
                            clearPurchaseItemsStore(receiving.uid, "receiving");
                            setConfirmDialog((prev) => ({ ...prev, open: false }));
                        },
                        onError: (err) => {
                            toast.error(err.message || "Gagal menyelesaikan penerimaan.");
                        },
                    }
                );
            },
        });
    };

    const handleDelete = (uid: string) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Penerimaan",
            description: "Apakah Anda yakin ingin menghapus draft penerimaan ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteReceiving.mutate(uid, {
                    onSuccess: () => {
                        toast.success("Draft penerimaan berhasil dihapus.");
                        clearPurchaseItemsStore(uid, "receiving");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menghapus draft.");
                    },
                });
            },
        });
    };

    const handleEditClick = (receiving: Receiving) => {
        router.push(`/admin/purchase/receiving/${receiving.uid}/items`);
    };

    const handleDetailClick = (receiving: Receiving) => {
        setSelectedReceiving(receiving);
        setIsDetailOpen(true);
    };

    const columns = useMemo(
        () => receivingColumns,
        []
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Penerimaan Barang Masuk
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar riwayat pasokan barang masuk dari distributor.
                    </p>
                </div>
                {hasManagePurchase && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Terima Barang Masuk
                    </Button>
                )}
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={receivings}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Belum ada pasokan barang masuk yang tercatat."
                page={page}
                onPageChange={onPageChange}
                meta={meta}
                entityName="transaksi masuk"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
                onView={handleDetailClick}
                onEdit={handleEditClick}
                hideEdit={(rec) => !(rec.status === RECEIVING_STATUS.DRAFT && hasManagePurchase)}
                onCheck={handleFinalize}
                hideCheck={(rec) => !(rec.status === RECEIVING_STATUS.DRAFT && hasManagePurchase)}
                onDelete={(rec) => handleDelete(rec.uid)}
                hideDelete={(rec) => !(rec.status === RECEIVING_STATUS.DRAFT && canDeleteDraft)}
            />

            {/* Details & Logs Dialog */}
            <ReceivingDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                receivingId={selectedReceiving?.uid || null}
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
                isLoading={updateReceiving.isPending || deleteReceiving.isPending}
            />
        </section>
    );
}
