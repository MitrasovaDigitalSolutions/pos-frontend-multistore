"use client";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import type { Product } from "@/features/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPlus } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
    useDeleteReceiving,
    useUpdateReceiving,
} from "../api/purchase-api";
import type { Receiving } from "../types";
import { ReceivingDetailDialog } from "./receiving-detail-dialog";

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
}

export function ReceivingList({
    receivings,
    meta,
    page,
    onPageChange,
    onAddClick,
    isLoading = false,
    isFetching = false,
}: ReceivingListProps) {
    const router = useRouter();
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
                    product_id: item.product_id,
                    kuantitas: item.kuantitas,
                    harga_beli: item.harga_beli || 0,
                    update_harga_jual: false,
                    harga_jual_baru: null,
                    margin_baru: null,
                }));

                updateReceiving.mutate(
                    {
                        id: receiving.id,
                        data: {
                            supplier_id: receiving.supplier_id,
                            nomor_faktur: receiving.nomor_faktur,
                            nilai_faktur: receiving.nilai_faktur,
                            status_pembayaran: receiving.status_pembayaran,
                            status: "completed",
                            catatan: receiving.catatan,
                            items: itemsInput,
                        },
                    },
                    {
                        onSuccess: () => {
                            toast.success("Penerimaan barang berhasil diselesaikan.");
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

    const handleDelete = (id: number) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Penerimaan",
            description: "Apakah Anda yakin ingin menghapus draft penerimaan ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteReceiving.mutate(id, {
                    onSuccess: () => {
                        toast.success("Draft penerimaan berhasil dihapus.");
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
        router.push(`/admin/purchase/receiving/${receiving.id}/items`);
    };

    const handleDetailClick = (receiving: Receiving) => {
        setSelectedReceiving(receiving);
        setIsDetailOpen(true);
    };

    const columns = useMemo<ColumnDef<Receiving>[]>(
        () => [
            {
                accessorKey: "created_at",
                header: "Tanggal",
                cell: ({ row }) => (
                    <span className="text-slate-600 font-medium text-xs">
                        {new Date(row.original.created_at).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                        })}
                    </span>
                ),
            },
            {
                accessorKey: "nomor_penerimaan",
                header: "No. Penerimaan",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900 text-xs">
                        {row.original.nomor_penerimaan}
                    </span>
                ),
            },
            {
                accessorKey: "supplier",
                header: "Supplier",
                cell: ({ row }) => {
                    const relation = row.original.supplier_relationship;
                    return (
                        <span className="font-semibold text-slate-800 text-xs">
                            {relation ? relation.nama : row.original.supplier || "-"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "nomor_faktur",
                header: "Faktur",
                cell: ({ row }) => (
                    <span className="text-slate-600 text-xs font-medium">
                        {row.original.nomor_faktur || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "nilai_faktur",
                header: "Nilai Faktur",
                cell: ({ row }) => (
                    <span className="text-slate-700 text-xs font-semibold">
                        {row.original.nilai_faktur !== null
                            ? formatRupiah(row.original.nilai_faktur)
                            : "-"}
                    </span>
                ),
            },
            {
                accessorKey: "status_pembayaran",
                header: "Pembayaran",
                cell: ({ row }) => {
                    const status = row.original.status_pembayaran;
                    return (
                        <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status === "paid"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : status === "partially_paid"
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100"
                                }`}
                        >
                            {status === "paid"
                                ? "Lunas"
                                : status === "partially_paid"
                                    ? "Sebagian"
                                    : "Pending"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    return (
                        <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${status === "completed"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                                }`}
                        >
                            {status === "completed" ? "Selesai" : "Draft"}
                        </span>
                    );
                },
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [canDeleteDraft, hasManagePurchase]
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6">
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
                virtualize={true}
                estimateRowHeight={44}
                onView={handleDetailClick}
                onEdit={handleEditClick}
                hideEdit={(rec) => !(rec.status === "draft" && hasManagePurchase)}
                onCheck={handleFinalize}
                hideCheck={(rec) => !(rec.status === "draft" && hasManagePurchase)}
                onDelete={(rec) => handleDelete(rec.id)}
                hideDelete={(rec) => !(rec.status === "draft" && canDeleteDraft)}
            />



            {/* Details & Logs Dialog */}
            <ReceivingDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                receivingId={selectedReceiving?.id || null}
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
