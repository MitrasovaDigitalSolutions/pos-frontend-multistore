import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { ColumnDef } from "@tanstack/react-table";
import type { PurchaseOrder } from "../../types";
import { formatDate } from "@/lib/date-utils";
import {
    PO_STATUS_LABELS,
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
            const label = PO_STATUS_LABELS[status] || status;
            return <StatusBadge status={status} label={label} />;
        },
        size: 160,
    },
];
