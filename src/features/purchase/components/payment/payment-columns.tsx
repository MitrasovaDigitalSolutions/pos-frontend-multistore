import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReceivingPayment } from "../../types";
import { formatDate } from "@/lib/date-utils";
import {
    PAYMENT_TRANSACTION_STATUS_LABELS,
    PAYMENT_TRANSACTION_STATUS_CLASSES,
    type PaymentTransactionStatus,
} from "@/constants/purchase";

export const paymentColumns: ColumnDef<ReceivingPayment>[] = [
    {
        accessorKey: "created_at",
        header: "Tanggal Bayar",
        cell: ({ row }) => (
            <span className="text-slate-600 font-medium text-xs">
                {formatDate(row.original.created_at, "dd MMM yyyy")}
            </span>
        ),
        size: 120,
    },
    {
        accessorKey: "nomor_transaksi",
        header: "No. Transaksi",
        cell: ({ row }) => (
            <span className="font-bold text-slate-900 text-xs font-mono">
                {row.original.nomor_transaksi}
            </span>
        ),
        size: 160,
    },
    {
        id: "nomor_penerimaan",
        header: "No. Penerimaan",
        enableSorting: false,
        cell: ({ row }) => (
            <span className="font-semibold text-slate-700 text-xs font-mono">
                {row.original.stock_receiving?.nomor_penerimaan || "-"}
            </span>
        ),
        size: 160,
    },
    {
        id: "supplier",
        header: "Supplier",
        enableSorting: false,
        cell: ({ row }) => (
            <span className="text-slate-600 text-xs font-medium">
                {row.original.stock_receiving?.supplier_relationship?.nama || row.original.stock_receiving?.supplier || "-"}
            </span>
        ),
        size: 240,
    },
    {
        accessorKey: "metode_pembayaran",
        header: "Metode",
        cell: ({ row }) => (
            <span className="text-slate-600 text-xs font-medium">
                {row.original.metode_pembayaran}
            </span>
        ),
        size: 96,
    },
    {
        accessorKey: "total",
        header: "Nominal",
        cell: ({ row }) => (
            <span className="text-slate-955 text-xs font-extrabold font-mono">
                {formatRupiah(row.original.total)}
            </span>
        ),
        size: 120,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status as PaymentTransactionStatus;
            const colorClass = PAYMENT_TRANSACTION_STATUS_CLASSES[status] || "bg-slate-50 text-slate-700 border-slate-100";
            const label = PAYMENT_TRANSACTION_STATUS_LABELS[status] || status;
            return (
                <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClass}`}
                >
                    {label}
                </span>
            );
        },
        size: 120,
    },
];
