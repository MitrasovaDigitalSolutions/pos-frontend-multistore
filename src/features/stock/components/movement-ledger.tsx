"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { StockMovement } from "../types";
import { DataTable } from "@/components/ui/data-table";

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
}

export function MovementLedger({
    movements,
    meta,
    page,
    onPageChange,
    isLoading = false,
    isFetching = false,
}: MovementLedgerProps) {
    const columns = useMemo<ColumnDef<StockMovement>[]>(
        () => [
            {
                accessorKey: "created_at",
                header: "Waktu",
                cell: ({ row }) => (
                    <span className="text-[11px] text-slate-500">
                        {new Date(row.original.created_at).toLocaleString(
                            "id-ID",
                        )}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "product.nama",
                header: "Nama Produk",
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
                cell: ({ row }) => (
                    <span className="capitalize font-medium">
                        {row.original.tipe}
                    </span>
                ),
                size: 120,
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
                virtualize={true}
                estimateRowHeight={44}
            />
        </section>
    );
}
