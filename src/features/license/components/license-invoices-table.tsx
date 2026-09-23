"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableActionButton } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import {
    IconBuildingBank,
    IconCheck,
    IconClock,
    IconDownload,
    IconFileInvoice,
    IconReceipt,
} from "@tabler/icons-react";
import type { Invoice } from "../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { useLicenseInvoices } from "../hooks/use-license-invoices";
import { LicenseInvoiceDetailDialog } from "./license-invoice-detail-dialog";
import { cn } from "@/lib/utils";

interface LicenseInvoicesTableProps {
    invoices: Invoice[];
    isLoading?: boolean;
}

const STATUS_BADGE: Record<
    string,
    { bg: string; text: string; border: string; icon: typeof IconCheck }
> = {
    paid: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200/80",
        icon: IconCheck,
    },
    unpaid: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200/80",
        icon: IconClock,
    },
    cancelled: {
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-200/80",
        icon: IconReceipt,
    },
};

const STATUS_LABELS: Record<string, string> = {
    paid: "Lunas",
    unpaid: "Menunggu Pembayaran",
    cancelled: "Dibatalkan",
};

export function LicenseInvoicesTable({
    invoices,
    isLoading = false,
}: LicenseInvoicesTableProps) {
    const {
        stats,
        selectedInvoice,
        setSelectedInvoice,
        downloadingId,
        handleDownloadPdf,
    } = useLicenseInvoices(invoices);

    // Columns configuration for DataTable
    const columns: ColumnDef<Invoice, unknown>[] = useMemo(
        () => [
            {
                accessorKey: "invoice_number",
                header: "No. Faktur",
                cell: ({ row }) => {
                    const inv = row.original;
                    return (
                        <div className="flex flex-col">
                            <span className="font-mono text-xs font-bold text-slate-800">
                                {inv.invoice_number}
                            </span>
                            {inv.notes && (
                                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[160px]">
                                    {inv.notes}
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "created_at",
                header: "Tanggal Terbit",
                cell: ({ row }) => {
                    const inv = row.original;
                    const formatted =
                        formatDate(inv.created_at || inv.issued_at, "d MMM yyyy") ||
                        "-";
                    const time =
                        formatDate(inv.created_at || inv.issued_at, "HH:mm") || "";

                    return (
                        <div className="text-xs text-slate-600">
                            <span className="block font-medium">{formatted}</span>
                            {time && (
                                <span className="text-[10px] text-slate-400 block">
                                    {time} WIB
                                </span>
                            )}
                        </div>
                    );
                },
            },
            {
                id: "items_count",
                header: "Layanan",
                cell: ({ row }) => {
                    const count = row.original.items?.length ?? 0;
                    return (
                        <Badge
                            variant="secondary"
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/70"
                        >
                            {count} Layanan
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "payment_method",
                header: "Metode Bayar",
                cell: ({ row }) => {
                    const method = row.original.payment_method;
                    if (method) {
                        return (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                <IconBuildingBank
                                    size={14}
                                    className="text-emerald-600 shrink-0"
                                />
                                <span className="truncate max-w-[140px]">{method}</span>
                            </span>
                        );
                    }
                    return (
                        <span className="text-xs text-slate-400 italic">
                            Belum Dipilih
                        </span>
                    );
                },
            },
            {
                accessorKey: "total_amount",
                header: "Total Tagihan",
                meta: {
                    headerClassName: "text-right",
                    cellClassName: "text-right",
                },
                cell: ({ row }) => {
                    const amount =
                        row.original.total_amount ?? row.original.amount ?? 0;
                    return (
                        <span className="text-xs font-extrabold text-slate-900">
                            {formatRupiah(amount)}
                        </span>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Status",
                meta: {
                    headerClassName: "text-center",
                    cellClassName: "text-center",
                },
                cell: ({ row }) => {
                    const status = row.original.status;
                    const badge = STATUS_BADGE[status] ?? STATUS_BADGE.unpaid;
                    const Icon = badge.icon;

                    return (
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] font-bold py-0.5 px-2 rounded-full inline-flex items-center gap-1 border",
                                badge.bg,
                                badge.text,
                                badge.border,
                            )}
                        >
                            <Icon size={11} />
                            <span>{STATUS_LABELS[status] ?? status}</span>
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "due_date",
                header: "Batas Bayar",
                cell: ({ row }) => {
                    const inv = row.original;
                    if (inv.status === "paid") {
                        const paidDate = inv.paid_at
                            ? formatDate(inv.paid_at, "d MMM yyyy")
                            : null;
                        return (
                            <span className="text-xs text-emerald-700 font-semibold">
                                {paidDate ? `Lunas (${paidDate})` : "Lunas"}
                            </span>
                        );
                    }
                    const due = inv.due_date
                        ? formatDate(inv.due_date, "d MMM yyyy")
                        : inv.due_at
                            ? formatDate(inv.due_at, "d MMM yyyy")
                            : "-";
                    return (
                        <span className="text-xs text-amber-700 font-semibold">
                            {due}
                        </span>
                    );
                },
            },
        ],
        [],
    );

    return (
        <div className="space-y-4">
            {/* Header Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/70">
                        <IconFileInvoice size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                Riwayat Tagihan & Faktur
                            </h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {invoices.length} Faktur
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">
                            Daftar tagihan resmi perpanjangan add-on dan add-on aplikasi POS
                        </p>
                    </div>
                </div>

                {/* Financial KPI Chips */}
                {invoices.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <div className="px-2.5 py-1 rounded-lg bg-emerald-50/70 border border-emerald-200/60 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px] font-bold text-emerald-800">
                                Lunas ({stats.paidCount}):
                            </span>
                            <span className="text-[11px] font-extrabold text-emerald-700">
                                {formatRupiah(stats.totalPaid)}
                            </span>
                        </div>
                        {stats.unpaidCount > 0 && (
                            <div className="px-2.5 py-1 rounded-lg bg-amber-50/70 border border-amber-200/60 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[11px] font-bold text-amber-800">
                                    Menunggu ({stats.unpaidCount}):
                                </span>
                                <span className="text-[11px] font-extrabold text-amber-700">
                                    {formatRupiah(stats.totalUnpaid)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reusable DataTable Component */}
            <DataTable
                columns={columns}
                data={invoices}
                isLoading={isLoading}
                clientPagination={true}
                perPage={10}
                entityName="tagihan"
                emptyMessage="Belum ada riwayat faktur tagihan."
                virtualize={false}
                actionColumnWidth="96px"
                onView={(invoice) => setSelectedInvoice(invoice)}
                extraActions={(invoice) => (
                    <DataTableActionButton
                        variant="sky"
                        onClick={() => void handleDownloadPdf(invoice.invoice_number)}
                        disabled={downloadingId === invoice.invoice_number}
                        tooltip="Unduh Faktur PDF"
                    >
                        <IconDownload size={15} />
                    </DataTableActionButton>
                )}
                renderCardItem={(row) => {
                    const inv = row.original;
                    const badge = STATUS_BADGE[inv.status] ?? STATUS_BADGE.unpaid;
                    const Icon = badge.icon;
                    const amount = inv.total_amount ?? inv.amount ?? 0;

                    return (
                        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <span className="font-mono text-xs font-bold text-slate-900 block">
                                        {inv.invoice_number}
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                        {formatDate(
                                            inv.created_at || inv.issued_at,
                                            "d MMM yyyy",
                                        ) || "-"}
                                    </span>
                                </div>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] font-bold py-0.5 px-2 rounded-full gap-1 border",
                                        badge.bg,
                                        badge.text,
                                        badge.border,
                                    )}
                                >
                                    <Icon size={11} />
                                    <span>{STATUS_LABELS[inv.status] ?? inv.status}</span>
                                </Badge>
                            </div>

                            <div className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                                        Total Tagihan
                                    </span>
                                    <span className="text-sm font-black text-slate-900">
                                        {formatRupiah(amount)}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                    {inv.items?.length ?? 0} Layanan
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div>
                                    <span className="text-slate-400 block text-[10px]">
                                        Metode Bayar
                                    </span>
                                    <span className="font-semibold text-slate-700">
                                        {inv.payment_method || "Belum dipilih"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-400 block text-[10px]">
                                        {inv.status === "paid" ? "Status Bayar" : "Jatuh Tempo"}
                                    </span>
                                    <span
                                        className={cn(
                                            "font-semibold",
                                            inv.status === "paid"
                                                ? "text-emerald-700"
                                                : "text-amber-700",
                                        )}
                                    >
                                        {inv.status === "paid"
                                            ? formatDate(inv.paid_at, "d MMM yyyy") || "Lunas"
                                            : formatDate(
                                                inv.due_date || inv.due_at,
                                                "d MMM yyyy",
                                            ) || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                }}
            />

            {/* Dedicated Detail Dialog */}
            <LicenseInvoiceDetailDialog
                invoice={selectedInvoice}
                open={!!selectedInvoice}
                onOpenChange={(isOpen) => !isOpen && setSelectedInvoice(null)}
                onDownloadPdf={(num) => void handleDownloadPdf(num)}
                isDownloading={downloadingId === selectedInvoice?.invoice_number}
            />
        </div>
    );
}
