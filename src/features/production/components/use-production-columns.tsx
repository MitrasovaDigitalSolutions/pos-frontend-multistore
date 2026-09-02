"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import type { Production } from "../types";

export function useProductionColumns(): ColumnDef<Production>[] {
    return useMemo<ColumnDef<Production>[]>(
        () => [
            {
                accessorKey: "nomor_produksi",
                header: "No. Produksi",
                cell: ({ row }) => (
                    <span className="font-mono font-bold text-slate-800 text-xs">
                        {row.original.nomor_produksi}
                    </span>
                ),
                size: 160,
            },
            {
                accessorKey: "tanggal",
                header: "Tanggal",
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600">
                        {formatToReadableDate(row.original.tanggal)}
                    </span>
                ),
                size: 130,
            },
            {
                id: "materials_summary",
                header: "Bahan Terpakai",
                cell: ({ row }) => {
                    const materials = row.original.materials || [];
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-800 text-xs">
                                {materials.length} Jenis Bahan
                            </span>
                            <span className="text-[10px] text-slate-400">
                                Biaya: {formatRupiah(row.original.total_biaya_bahan)}
                            </span>
                        </div>
                    );
                },
                size: 180,
            },
            {
                id: "outputs_summary",
                header: "Hasil Barang Jadi",
                cell: ({ row }) => {
                    const outputs = row.original.outputs || [];
                    const totalQty = outputs.reduce((sum, o) => sum + Number(o.kuantitas), 0);
                    return (
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-emerald-700 text-xs">
                                {totalQty} Pcs
                            </span>
                            <span className="text-[10px] text-slate-400">
                                {outputs.length} Varian Produk
                            </span>
                        </div>
                    );
                },
                size: 160,
            },
            {
                id: "operator",
                header: "Operator",
                cell: ({ row }) => (
                    <span className="text-xs text-slate-600">
                        {row.original.user?.name || "-"}
                    </span>
                ),
                size: 140,
            },
            {
                accessorKey: "status",
                header: "Status",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => <StatusBadge status={row.original.status} />,
                size: 110,
            },
        ],
        []
    );
}
