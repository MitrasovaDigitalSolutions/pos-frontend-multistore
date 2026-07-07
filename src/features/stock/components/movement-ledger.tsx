"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { StockMovement } from "../types";
import { DataTable } from "@/components/ui/data-table";
import { formatToReadableDateTime } from "@/lib/date-utils";

const TIPE_CLASSES: Record<string, string> = {
    receive: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30",
    void: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30",
    sale_void: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30",
    sale: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30",
    retur: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30",
    penyesuaian: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800",
    adjustment: "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800",
    opname: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30",
    masuk: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30",
    keluar: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30",
    mutasi: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30",
};

const TIPE_LABELS: Record<string, string> = {
    receive: "Penerimaan",
    void: "Pembatalan",
    sale_void: "Pembatalan Penjualan",
    sale: "Penjualan",
    retur: "Retur",
    penyesuaian: "Penyesuaian",
    adjustment: "Penyesuaian",
    opname: "Opname",
    masuk: "Masuk",
    keluar: "Keluar",
    mutasi: "Mutasi",
};

interface MovementLedgerProps {
    movements: StockMovement[];
    meta?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    page: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    isFetching?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    onSortChange?: (sortBy: string | undefined, sortOrder: "asc" | "desc" | undefined) => void;
}

export function MovementLedger({
    movements,
    meta,
    page,
    onPageChange,
    isLoading = false,
    isFetching = false,
    sortBy,
    sortOrder,
    onSortChange,
}: MovementLedgerProps) {
    const columns = useMemo<ColumnDef<StockMovement>[]>(
        () => [
            {
                accessorKey: "created_at",
                header: "Waktu",
                cell: ({ row }) => (
                    <span className="text-[11px] text-slate-500">
                        {formatToReadableDateTime(row.original.created_at)}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "product.nama",
                header: "Nama Produk",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="font-semibold text-slate-800">
                        {row.original.product?.nama || "-"}
                    </span>
                ),
                size: 240,
            },
            {
                accessorKey: "tipe",
                header: "Tipe",
                cell: ({ row }) => {
                    const tipe = row.original.tipe;
                    const label = TIPE_LABELS[tipe] || tipe;
                    const badgeClass = TIPE_CLASSES[tipe] || "bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800";
                    return (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${badgeClass}`}>
                            {label}
                        </span>
                    );
                },
                size: 130,
            },
            {
                accessorKey: "kuantitas",
                header: "Perubahan",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right font-bold",
                },
                cell: ({ row }) => {
                    const mv = row.original;
                    const isPositive = mv.kuantitas > 0;
                    return (
                        <span
                            className={
                                isPositive
                                    ? "text-emerald-600"
                                    : "text-rose-500"
                            }
                        >
                            {isPositive ? `+${mv.kuantitas}` : mv.kuantitas}
                        </span>
                    );
                },
                size: 96,
            },
            {
                accessorKey: "stok_sebelum",
                header: "Sebelum",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right text-slate-500",
                },
                cell: ({ row }) => row.original.stok_sebelum,
                size: 80,
            },
            {
                accessorKey: "stok_sesudah",
                header: "Sesudah",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right text-slate-800 font-bold",
                },
                cell: ({ row }) => row.original.stok_sesudah,
                size: 80,
            },
            {
                accessorKey: "alasan",
                header: "Alasan / Referensi",
                cell: ({ row }) => (
                    <span className="text-[11px] text-slate-600">
                        {row.original.alasan || "-"}
                    </span>
                ),
                size: 240,
            },
            {
                accessorKey: "user",
                header: "Petugas",
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="text-[11px] font-semibold text-slate-700">
                        {row.original.user?.name || "System"}
                    </span>
                ),
                size: 120,
            },
        ],
        [],
    );

    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-2">
                Kartu Kendali Mutasi Stok (Terbaru)
            </h3>
            <DataTable
                columns={columns}
                data={movements}
                isLoading={isLoading}
                isFetching={isFetching}
                emptyMessage="Belum ada log pergerakan stok."
                page={page}
                onPageChange={onPageChange}
                meta={meta}
                entityName="log"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
                virtualize={true}
                estimateRowHeight={44}
            />
        </section>
    );
}
