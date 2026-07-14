"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DataTable } from "@/components/ui/data-table";
import { hasPermission, hasRole } from "@/constants/roles";
import { IconPlus } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDeleteManualJournal } from "../../api/manual-journal-api";
import type { ManualJournal } from "../../types/manual-journal";

interface JournalListProps {
    journals: ManualJournal[];
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
    onView: (journal: ManualJournal) => void;
    onEdit: (journal: ManualJournal) => void;
    onAddClick: () => void;
    isLoading?: boolean;
    isFetching?: boolean;
    filterElement?: React.ReactNode;
}

export function JournalList({
    journals,
    meta,
    page,
    perPage,
    onPageChange,
    onPerPageChange,
    onView,
    onEdit,
    onAddClick,
    isLoading = false,
    isFetching = false,
    filterElement,
}: JournalListProps) {
    const { data: session } = useSession();
    const userRoles = session?.user?.roles || [];
    const userPermissions = session?.user?.permissions || [];

    // Admins or users with view_reports can view, and manage_reports can create/edit/void.
    const canManageJournals =
        hasRole(userRoles, "admin") ||
        hasPermission(userRoles, userPermissions, "view_reports");

    const voidMutation = useDeleteManualJournal();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [journalToVoid, setJournalToVoid] = useState<ManualJournal | null>(null);

    const handleVoidClick = (j: ManualJournal) => {
        setJournalToVoid(j);
        setIsConfirmOpen(true);
    };

    const handleConfirmVoid = () => {
        if (!journalToVoid) return;
        voidMutation.mutate(journalToVoid.uid, {
            onSuccess: () => {
                toast.success(`Jurnal "${journalToVoid.reference_number}" berhasil dibatalkan (voided).`);
                setIsConfirmOpen(false);
                setJournalToVoid(null);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal membatalkan jurnal.");
            },
        });
    };

    const statusBadgeStyles: Record<ManualJournal["status"], string> = {
        draft: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-400 dark:border-slate-800",
        posted: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
        voided: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50",
    };

    const statusLabelMap: Record<ManualJournal["status"], string> = {
        draft: "Draft",
        posted: "Posted",
        voided: "Voided (Batal)",
    };

    const columns = useMemo<ColumnDef<ManualJournal>[]>(
        () => [
            {
                accessorKey: "reference_number",
                header: "No. Referensi",
                cell: ({ row }) => (
                    <span className="font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                        {row.original.reference_number}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "transaction_date",
                header: "Tanggal",
                cell: ({ row }) => {
                    const d = new Date(row.original.transaction_date);
                    return (
                        <span className="text-slate-600 text-xs whitespace-nowrap">
                            {format(d, "dd MMM yyyy", { locale: localeId })}
                        </span>
                    );
                },
                size: 130,
            },
            {
                accessorKey: "description",
                header: "Keterangan",
                cell: ({ row }) => (
                    <span className="text-slate-800 text-xs line-clamp-2">
                        {row.original.description || "-"}
                    </span>
                ),
                size: 300,
            },
            {
                accessorKey: "creator.name",
                header: "Pembuat",
                cell: ({ row }) => (
                    <span className="text-slate-500 text-xs whitespace-nowrap">
                        {row.original.creator?.name || row.original.creator?.username || "-"}
                    </span>
                ),
                size: 150,
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }) => {
                    const status = row.original.status;
                    return (
                        <Badge
                            className={`${statusBadgeStyles[status]} px-2 py-0.5 border text-[10px] font-semibold`}
                            variant="outline"
                        >
                            {statusLabelMap[status]}
                        </Badge>
                    );
                },
                size: 120,
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-slate-900">
                        Jurnal Manual
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        Daftar riwayat jurnal transaksi manual keuangan perusahaan Anda.
                    </p>
                </div>
                {canManageJournals && (
                    <Button
                        onClick={onAddClick}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                    >
                        <IconPlus size={16} /> Buat Jurnal Baru
                    </Button>
                )}
            </div>

            {filterElement}

            <DataTable
                columns={columns}
                data={journals}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Tidak ada data jurnal manual ditemukan."
                page={page}
                perPage={perPage}
                onPageChange={onPageChange}
                onPerPageChange={onPerPageChange}
                meta={meta}
                entityName="jurnal manual"
                virtualize={true}
                estimateRowHeight={44}
                // Custom action overrides so that we can pass details, drafts edit, and custom void dialog
                hideEdit={(row) => row.status !== "draft"}
                hideDelete={(row) => row.status === "voided"}
                onEdit={onEdit}
                onDelete={handleVoidClick}
                onView={onView}
            />

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Batalkan Jurnal Manual (Void)"
                description={
                    journalToVoid ? (
                        <span>
                            Apakah Anda yakin ingin membatalkan jurnal{" "}
                            <strong className="font-semibold text-slate-900">
                                {journalToVoid.reference_number}
                            </strong>
                            ? Tindakan ini akan mengubah status jurnal menjadi voided (batal) dan tidak dapat dibalikkan kembali.
                        </span>
                    ) : (
                        "Apakah Anda yakin ingin membatalkan jurnal ini?"
                    )
                }
                onConfirm={handleConfirmVoid}
                confirmText="Ya, Batalkan Jurnal"
                cancelText="Kembali"
                isLoading={voidMutation.isPending}
            />
        </section>
    );
}
