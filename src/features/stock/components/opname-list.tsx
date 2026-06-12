"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { useFinalizeOpname, useDeleteOpname } from "../api/stock-api";
import { toast } from "sonner";
import type { Opname } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { hasRole, hasPermission } from "@/constants/roles";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface OpnameListProps {
    opnames: Opname[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    page: number;
    onPageChange: (page: number) => void;
    onViewDetail: (id: number) => void;
    isLoading?: boolean;
    isFetching?: boolean;
}

export function OpnameList({
    opnames,
    meta,
    page,
    onPageChange,
    onViewDetail,
    isLoading = false,
    isFetching = false,
}: OpnameListProps) {
    const { data: session } = useSession();
    const finalizeOpname = useFinalizeOpname();
    const deleteOpname = useDeleteOpname();

    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];
    const hasManageInventory =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "manage_inventory");
    const canDeleteDraft = hasManageInventory;

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
        onConfirm: () => {},
    });

    const handleFinalize = (op: Opname) => {
        setConfirmDialog({
            open: true,
            title: "Finalisasi Stock Opname",
            description: "Finalisasi opname ini sekarang? Stok sistem akan dikoreksi secara permanen.",
            confirmText: "Ya, Finalisasi",
            cancelText: "Batal",
            variant: "warning",
            onConfirm: () => {
                const itemsPayload = (op.items || []).map((it) => ({
                    product_id: it.product_id,
                    stok_fisik: it.stok_fisik,
                    alasan: it.alasan || "Finalisasi opname",
                }));

                finalizeOpname.mutate(
                    {
                        id: op.id,
                        data: {
                            status: "completed",
                            items: itemsPayload,
                        },
                    },
                    {
                        onSuccess: () => {
                            toast.success("Stock opname berhasil difinalisasi!");
                            setConfirmDialog((prev) => ({ ...prev, open: false }));
                        },
                        onError: (err) => {
                            toast.error(
                                err.message || "Gagal memfinalisasi opname.",
                            );
                        },
                    },
                );
            },
        });
    };

    const handleDelete = (id: number) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Opname",
            description: "Apakah Anda yakin ingin menghapus draft opname ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteOpname.mutate(id, {
                    onSuccess: () => {
                        toast.success("Draft opname berhasil dihapus.");
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal menghapus draft opname.");
                    },
                });
            },
        });
    };

    const columns = useMemo<ColumnDef<Opname>[]>(
        () => [
            {
                accessorKey: "nomor_opname",
                header: "No. Opname",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900 text-xs">
                        {row.original.nomor_opname}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "created_at",
                header: "Tanggal",
                cell: ({ row }) => (
                    <span className="text-slate-500 font-medium text-xs">
                        {new Date(row.original.created_at).toLocaleString(
                            "id-ID",
                            {
                                dateStyle: "medium",
                                timeStyle: "short",
                            },
                        )}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "catatan",
                header: "Catatan",
                cell: ({ row }) => (
                    <span className="text-slate-600 text-xs">
                        {row.original.catatan || "-"}
                    </span>
                ),
                size: 320,
            },
            {
                accessorKey: "status",
                header: "Status",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const op = row.original;
                    return (
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                op.status === "completed"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                            }`}
                        >
                            {op.status === "completed" ? "Selesai" : "Draft"}
                        </span>
                    );
                },
                size: 80,
            },
        ],
        [],
    );

    return (
        <>
            <DataTable
                columns={columns}
                data={opnames}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Belum ada rekaman stock opname."
                page={page}
                onPageChange={onPageChange}
                meta={meta}
                entityName="dokumen"
                virtualize={true}
                estimateRowHeight={44}
                onView={(op) => onViewDetail(op.id)}
                onCheck={handleFinalize}
                hideCheck={(op) => !(op.status === "draft" && hasManageInventory)}
                onDelete={(op) => handleDelete(op.id)}
                hideDelete={(op) => !(op.status === "draft" && canDeleteDraft)}
            />

            <ConfirmDialog
                open={confirmDialog.open}
                onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
                title={confirmDialog.title}
                description={confirmDialog.description}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
                variant={confirmDialog.variant}
                onConfirm={confirmDialog.onConfirm}
                isLoading={finalizeOpname.isPending || deleteOpname.isPending}
            />
        </>
    );
}
