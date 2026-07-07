"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseOrder } from "../../types";
import { formatDate } from "@/lib/date-utils";
import {
    PO_STATUS_LABELS,
    PO_STATUS_CLASSES,
    type POStatus,
} from "@/constants/purchase";

export const poColumns: ColumnDef<PurchaseOrder>[] = [
    {
        accessorKey: "tanggal_po",
        header: "Tanggal PO",
        cell: ({ row }) => (
            <span className="text-slate-600 font-medium text-xs">
                {formatDate(row.original.tanggal_po, "dd MMM yyyy")}
            </span>
        ),
        size: 120,
    },
    {
        accessorKey: "nomor_po",
        header: "No. PO",
        cell: ({ row }) => (
            <span className="font-bold text-slate-900 text-xs font-mono">
                {row.original.nomor_po}
            </span>
        ),
        size: 160,
    },
    {
        accessorKey: "supplier",
        header: "Supplier",
        enableSorting: false,
        cell: ({ row }) => {
            const supplierObj = row.original.supplier;
            return (
                <span className="font-semibold text-slate-800 text-xs">
                    {supplierObj ? supplierObj.nama : row.original.supplier_name || "-"}
                </span>
            );
        },
        size: 240,
    },
    {
        accessorKey: "nilai_estimasi",
        header: "Nilai Estimasi",
        cell: ({ row }) => (
            <span className="text-slate-700 text-xs font-bold font-mono">
                {formatRupiah(row.original.nilai_estimasi)}
            </span>
        ),
        size: 160,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status as POStatus;
            const colorClass = PO_STATUS_CLASSES[status] || "bg-amber-50 text-amber-700 border-amber-100";
            const label = PO_STATUS_LABELS[status] || status;
            return (
                <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}
                >
                    {label}
                </span>
            );
        },
        size: 160,
    },
];
