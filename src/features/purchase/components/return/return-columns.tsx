import type { ColumnDef } from "@tanstack/react-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PurchaseReturn } from "../../types";
import { formatDate } from "@/lib/date-utils";
import {
    RETURN_STATUS_LABELS,
    RETURN_STATUS_CLASSES,
    type ReturnStatus,
} from "@/constants/purchase";

export const returnColumns: ColumnDef<PurchaseReturn>[] = [
    {
        accessorKey: "tanggal_retur",
        header: "Tanggal Retur",
        cell: ({ row }) => (
            <span className="text-slate-600 font-medium text-xs">
                {formatDate(row.original.tanggal_retur, "dd MMM yyyy")}
            </span>
        ),
        size: 120,
    },
    {
        accessorKey: "nomor_retur",
        header: "No. Retur",
        cell: ({ row }) => (
            <span className="font-bold text-slate-900 text-xs font-mono">
                {row.original.nomor_retur}
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
                    {supplierObj ? supplierObj.nama : "-"}
                </span>
            );
        },
        size: 240,
    },
    {
        accessorKey: "total_nominal",
        header: "Total Nominal",
        cell: ({ row }) => (
            <span className="text-slate-700 text-xs font-bold font-mono">
                {formatRupiah(row.original.total_nominal)}
            </span>
        ),
        size: 160,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status as ReturnStatus;
            const colorClass = RETURN_STATUS_CLASSES[status] || "bg-amber-50 text-amber-700 border-amber-100";
            const label = RETURN_STATUS_LABELS[status] || status;
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
