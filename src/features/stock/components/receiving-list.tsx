"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconPlus, IconEye, IconEdit, IconTrash, IconCheck } from "@tabler/icons-react";
import type { Receiving } from "../types";
import type { Product } from "@/features/products/types";
import { DataTable } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { hasRole, hasPermission } from "@/constants/roles";
import { toast } from "sonner";
import {
    useDeleteReceiving,
    useUpdateReceiving,
    useUpdateReceivingPaymentStatus,
} from "../api/stock-api";
import { ReceivingDialog } from "./receiving-dialog";
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
    products,
    meta,
    page,
    onPageChange,
    onAddClick,
    isLoading = false,
    isFetching = false,
}: ReceivingListProps) {
    const { data: session } = useSession();
    const deleteReceiving = useDeleteReceiving();
    const updateReceiving = useUpdateReceiving();
    const updatePaymentStatus = useUpdateReceivingPaymentStatus();

    const [selectedReceiving, setSelectedReceiving] = useState<Receiving | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageInventory =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_inventory");
    const canDeleteDraft = hasManageInventory;

    const handleTogglePaymentStatus = (id: number, currentStatus: "pending" | "paid") => {
        const nextStatus = currentStatus === "paid" ? "pending" : "paid";
        updatePaymentStatus.mutate(
            { id, status_pembayaran: nextStatus },
            {
                onSuccess: () => {
                    toast.success("Status pembayaran faktur berhasil diperbarui.");
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mengubah status pembayaran.");
                },
            },
        );
    };

    const handleFinalize = (receiving: Receiving) => {
        if (
            confirm(
                "Apakah Anda yakin ingin menyelesaikan penerimaan ini? Stok produk akan langsung ditambahkan ke inventori dan tidak dapat diubah lagi."
            )
        ) {
            const itemsInput = (receiving.items || []).map((item) => ({
                product_id: item.product_id,
                kuantitas: item.kuantitas,
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
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menyelesaikan penerimaan.");
                    },
                }
            );
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus draft penerimaan ini?")) {
            deleteReceiving.mutate(id, {
                onSuccess: () => {
                    toast.success("Draft penerimaan berhasil dihapus.");
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menghapus draft.");
                },
            });
        }
    };

    const handleEditClick = (receiving: Receiving) => {
        setSelectedReceiving(receiving);
        setIsEditOpen(true);
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
                    if (!hasManageInventory) {
                        return (
                            <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status === "paid"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}
                            >
                                {status === "paid" ? "Lunas" : "Pending"}
                            </span>
                        );
                    }
                    return (
                        <button
                            onClick={() =>
                                handleTogglePaymentStatus(row.original.id, status)
                            }
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${status === "paid"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                                    : "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100"
                                }`}
                        >
                            {status === "paid" ? "Lunas" : "Pending"}
                        </button>
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
            {
                id: "actions",
                header: "Aksi",
                enableSorting: false,
                meta: {
                    headerClassName: "text-center w-32",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const rec = row.original;
                    const isDraft = rec.status === "draft";
                    return (
                        <div className="flex justify-center gap-1">
                            <button
                                onClick={() => handleDetailClick(rec)}
                                className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                title="Lihat Detail"
                            >
                                <IconEye size={16} />
                            </button>
                            {isDraft && hasManageInventory && (
                                <>
                                    <button
                                        onClick={() => handleEditClick(rec)}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                        title="Ubah Draft"
                                    >
                                        <IconEdit size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleFinalize(rec)}
                                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                        title="Finalisasi"
                                    >
                                        <IconCheck size={16} />
                                    </button>
                                </>
                            )}
                            {isDraft && canDeleteDraft && (
                                <button
                                    onClick={() => handleDelete(rec.id)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                    title="Hapus Draft"
                                >
                                    <IconTrash size={16} />
                                </button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [canDeleteDraft, hasManageInventory]
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
                {hasManageInventory && (
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
            />

            {/* Edit Draft Dialog */}
            <ReceivingDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                products={products}
                editingReceiving={selectedReceiving}
            />

            {/* Details & Logs Dialog */}
            <ReceivingDetailDialog
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                receivingId={selectedReceiving?.id || null}
            />
        </section>
    );
}
