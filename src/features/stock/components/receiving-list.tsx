"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import type { Receiving } from "../types";
import { DataTable } from "@/components/ui/data-table";

interface ReceivingListProps {
    receivings: Receiving[];
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
    const columns = useMemo<ColumnDef<Receiving>[]>(
        () => [
            {
                accessorKey: "created_at",
                header: "Tanggal",
                cell: ({ row }) => (
                    <span className="text-slate-600 font-medium">
                        {new Date(row.original.created_at).toLocaleString(
                            "id-ID",
                        )}
                    </span>
                ),
            },
            {
                accessorKey: "nomor_penerimaan",
                header: "No. Penerimaan",
                cell: ({ row }) => (
                    <span className="font-bold text-slate-900">
                        {row.original.nomor_penerimaan}
                    </span>
                ),
            },
            {
                accessorKey: "supplier",
                header: "Supplier",
                cell: ({ row }) => (
                    <span className="font-semibold text-slate-800">
                        {row.original.supplier || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "nomor_faktur",
                header: "Faktur",
                cell: ({ row }) => (
                    <span className="text-slate-600">
                        {row.original.nomor_faktur || "-"}
                    </span>
                ),
            },
            {
                accessorKey: "catatan",
                header: "Catatan",
                cell: ({ row }) => (
                    <span className="text-slate-500">
                        {row.original.catatan || "-"}
                    </span>
                ),
            },
        ],
        [],
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
                <Button
                    onClick={onAddClick}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 rounded-xl flex gap-1.5 cursor-pointer"
                >
                    <IconPlus size={16} /> Terima Barang Masuk
                </Button>
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
        </section>
    );
}
