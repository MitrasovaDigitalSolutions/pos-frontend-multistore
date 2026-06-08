"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { useFinalizeOpname, useDeleteOpname } from "../api/stock-api";
import { toast } from "sonner";
import type { Opname } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { IconEye, IconCheck, IconTrash } from "@tabler/icons-react";
import { hasRole } from "@/constants/roles";

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
    const canDeleteDraft =
        hasRole(userRoles, "admin") ||
        hasRole(userRoles, "manajer_toko") ||
        hasRole(userRoles, "supervisor");

    const handleFinalize = (op: Opname) => {
        if (
            confirm(
                "Finalisasi opname ini sekarang? Stok sistem akan dikoreksi secara permanen.",
            )
        ) {
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
                    },
                    onError: (err) => {
                        toast.error(
                            err.message || "Gagal memfinalisasi opname.",
                        );
                    },
                },
            );
        }
    };

    const handleDelete = (id: number) => {
        if (confirm("Apakah Anda yakin ingin menghapus draft opname ini?")) {
            deleteOpname.mutate(id, {
                onSuccess: () => {
                    toast.success("Draft opname berhasil dihapus.");
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menghapus draft opname.");
                },
            });
        }
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
            },
            {
                accessorKey: "catatan",
                header: "Catatan",
                cell: ({ row }) => (
                    <span className="text-slate-600 text-xs">
                        {row.original.catatan || "-"}
                    </span>
                ),
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
            },
            {
                id: "actions",
                header: "Aksi",
                enableSorting: false,
                meta: {
                    headerClassName: "text-center w-28",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const op = row.original;
                    const isDraft = op.status === "draft";
                    return (
                        <div className="flex justify-center gap-1">
                            <button
                                onClick={() => onViewDetail(op.id)}
                                className="p-1.5 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                title="Lihat Detail"
                            >
                                <IconEye size={16} />
                            </button>
                            {isDraft && (
                                <button
                                    onClick={() => handleFinalize(op)}
                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                                    title="Finalisasi"
                                >
                                    <IconCheck size={16} />
                                </button>
                            )}
                            {isDraft && canDeleteDraft && (
                                <button
                                    onClick={() => handleDelete(op.id)}
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
        [onViewDetail, canDeleteDraft],
    );

    return (
        // <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
        //     <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-2">
        //         Daftar Dokumen Stock Opname
        //     </h3>
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
        />
        // </section>
    );
}
