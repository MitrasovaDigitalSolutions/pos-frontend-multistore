"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useFinalizeOpname } from "../api/stock-api";
import { toast } from "sonner";
import type { Opname } from "../types";
import { DataTable } from "@/components/ui/data-table";

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
    const finalizeOpname = useFinalizeOpname();

    const handleFinalize = (op: Opname) => {
        if (
            confirm(
                "Finalisasi opname ini sekarang? Stok sistem akan dikoreksi.",
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
                    onError: () => {
                        toast.error("Gagal memfinalisasi opname.");
                    },
                },
            );
        }
    };

    const columns = useMemo<ColumnDef<Opname>[]>(
        () => [
            {
                accessorKey: "nomor_opname",
                header: "No. Opname",
                cell: ({ row }) => (
                    <span className="font-bold">
                        {row.original.nomor_opname}
                    </span>
                ),
            },
            {
                accessorKey: "created_at",
                header: "Tanggal",
                cell: ({ row }) => (
                    <span className="text-slate-500">
                        {new Date(row.original.created_at).toLocaleString(
                            "id-ID",
                        )}
                    </span>
                ),
            },
            {
                accessorKey: "catatan",
                header: "Catatan",
                cell: ({ row }) => (
                    <span className="text-slate-600">
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
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                op.status === "completed"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                            }`}
                        >
                            {op.status === "completed" ? "Completed" : "Draft"}
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
                    return (
                        <div className="flex justify-center gap-2">
                            <button
                                onClick={() => onViewDetail(op.id)}
                                className="text-xs font-bold text-emerald-600 hover:underline bg-transparent border-none cursor-pointer"
                            >
                                Detail
                            </button>
                            {op.status === "draft" && (
                                <button
                                    onClick={() => handleFinalize(op)}
                                    className="text-xs font-bold text-emerald-600 hover:underline bg-transparent border-none cursor-pointer"
                                >
                                    Finalisasi
                                </button>
                            )}
                        </div>
                    );
                },
            },
        ],
        [onViewDetail, handleFinalize],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 border-b border-slate-50 pb-2">
                Daftar Dokumen Stock Opname
            </h3>
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
        </section>
    );
}
