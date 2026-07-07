"use client";

import { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { useFinalizeOpname, useDeleteOpname, useOpnameProgress } from "../api/stock-api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type { Opname } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { hasRole, hasPermission } from "@/constants/roles";
import { formatToReadableDateTime } from "@/lib/date-utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppRouter } from "@/hooks/use-app-router";
import { OPNAME_STATUS, OPNAME_STATUS_LABELS, OPNAME_STATUS_CLASSES } from "@/constants/stock";

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
    onViewDetail: (uid: string) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function OpnameList({
    opnames,
    meta,
    page,
    onPageChange,
    onViewDetail,
    isLoading = false,
    isFetching = false,
    sortBy,
    sortOrder,
    onSortChange,
}: OpnameListProps) {
    const router = useAppRouter();
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
        onConfirm: () => { },
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
                finalizeOpname.mutate(
                    op.uid,
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

    const handleDelete = (uid: string) => {
        setConfirmDialog({
            open: true,
            title: "Hapus Draft Opname",
            description: "Apakah Anda yakin ingin menghapus draft opname ini?",
            confirmText: "Ya, Hapus",
            cancelText: "Batal",
            variant: "danger",
            onConfirm: () => {
                deleteOpname.mutate(uid, {
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
                        {formatToReadableDateTime(row.original.created_at)}
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
                    if (op.status === OPNAME_STATUS.PROCESSING) {
                        return <OpnameProgressBadge uid={op.uid} />;
                    }
                    const statusClass = OPNAME_STATUS_CLASSES[op.status] || "bg-slate-50 text-slate-700 border-slate-100";
                    const statusLabel = OPNAME_STATUS_LABELS[op.status] || op.status;
                    return (
                        <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusClass}`}
                        >
                            {statusLabel}
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
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
                onView={(op) => onViewDetail(op.uid)}
                onEdit={(op) => router.push(`/admin/inventory/stock-opname/${op.uid}/items`)}
                hideEdit={(op) => !(op.status === OPNAME_STATUS.DRAFT && hasManageInventory)}
                onCheck={handleFinalize}
                hideCheck={(op) => !(op.status === OPNAME_STATUS.DRAFT && hasManageInventory)}
                onDelete={(op) => handleDelete(op.uid)}
                hideDelete={(op) => !(op.status === OPNAME_STATUS.DRAFT && canDeleteDraft)}
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

function OpnameProgressBadge({ uid }: { uid: string }) {
    const queryClient = useQueryClient();
    const { data: progressData } = useOpnameProgress(uid);

    useEffect(() => {
        if (progressData?.status === "completed" || progressData?.status === "failed") {
            queryClient.invalidateQueries({
                queryKey: queryKeys.inventory.opnames(),
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.products.all,
            });
        }
    }, [progressData?.status, uid, queryClient]);

    const percentage = progressData?.progress ?? 0;

    return (
        <div className="flex flex-col items-center gap-1.5 min-w-24">
            <span
                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100 animate-pulse animate-transition"
            >
                Diproses: {percentage}%
            </span>
            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
