"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Badge } from "@/components/ui/badge";
import { AppButton } from "@/components/shared/app-button";
import { IconDownload } from "@tabler/icons-react";
import type { Invoice } from "../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

interface LicenseInvoiceDetailDialogProps {
    invoice: Invoice | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDownloadPdf: (invoiceNumber: string) => void;
    isDownloading: boolean;
}

const STATUS_BADGE: Record<
    string,
    { bg: string; text: string; border: string }
> = {
    paid: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200/80",
    },
    unpaid: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200/80",
    },
    cancelled: {
        bg: "bg-slate-50",
        text: "text-slate-600",
        border: "border-slate-200/80",
    },
};

const STATUS_LABELS: Record<string, string> = {
    paid: "Lunas",
    unpaid: "Menunggu Pembayaran",
    cancelled: "Dibatalkan",
};

export function LicenseInvoiceDetailDialog({
    invoice,
    open,
    onOpenChange,
    onDownloadPdf,
    isDownloading,
}: LicenseInvoiceDetailDialogProps) {
    if (!invoice) return null;

    const badgeStyle = STATUS_BADGE[invoice.status] ?? STATUS_BADGE.unpaid;
    const amount = invoice.total_amount ?? invoice.amount ?? 0;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={`Faktur #${invoice.invoice_number}`}
            className="sm:max-w-2xl"
            scrollable={false}
        >
            <div className="space-y-4 pt-1">
                {/* Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Status
                        </span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] font-bold py-0.5 px-2 rounded-full inline-flex items-center gap-1 border mt-0.5",
                                badgeStyle.bg,
                                badgeStyle.text,
                                badgeStyle.border,
                            )}
                        >
                            <span>{STATUS_LABELS[invoice.status] ?? invoice.status}</span>
                        </Badge>
                    </div>

                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Tanggal Terbit
                        </span>
                        <span className="font-semibold text-slate-800 block mt-0.5">
                            {formatDate(
                                invoice.created_at || invoice.issued_at,
                                "d MMM yyyy, HH:mm",
                            )}{" "}
                            WIB
                        </span>
                    </div>

                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            {invoice.status === "paid"
                                ? "Tanggal Lunas"
                                : "Batas Pembayaran"}
                        </span>
                        <span
                            className={cn(
                                "font-semibold block mt-0.5",
                                invoice.status === "paid"
                                    ? "text-emerald-700"
                                    : "text-amber-700",
                            )}
                        >
                            {invoice.status === "paid"
                                ? formatDate(invoice.paid_at, "d MMM yyyy") || "Lunas"
                                : formatDate(
                                    invoice.due_date || invoice.due_at,
                                    "d MMM yyyy",
                                ) || "-"}
                        </span>
                    </div>

                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Metode Pembayaran
                        </span>
                        <span className="font-semibold text-slate-800 block mt-0.5">
                            {invoice.payment_method || "Belum dipilih"}
                        </span>
                    </div>

                    <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Catatan Pesanan
                        </span>
                        <span className="font-medium text-slate-700 block mt-0.5">
                            {invoice.notes || "-"}
                        </span>
                    </div>
                </div>

                {/* Itemized Table */}
                <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Rincian Add-on & Layanan ({invoice.items?.length ?? 0} Item)
                    </span>

                    {invoice.items && invoice.items.length > 0 ? (
                        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white max-h-[260px] overflow-y-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky top-0 bg-slate-50 z-10">
                                    <tr>
                                        <th className="py-2.5 pl-3">Nama Layanan</th>
                                        <th className="py-2.5 px-2">Tipe</th>
                                        <th className="py-2.5 px-2 text-center">Durasi</th>
                                        <th className="py-2.5 px-2 text-center">Qty</th>
                                        <th className="py-2.5 px-2 text-right">Harga Satuan</th>
                                        <th className="py-2.5 pr-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {invoice.items.map((item, idx) => (
                                        <tr
                                            key={`${item.code}-${idx}`}
                                            className="hover:bg-slate-50/50"
                                        >
                                            <td className="py-2.5 pl-3 font-semibold text-slate-800">
                                                {item.name}
                                            </td>
                                            <td className="py-2.5 px-2">
                                                <span
                                                    className={cn(
                                                        "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                                        item.type === "base_product"
                                                            ? "bg-purple-50 text-purple-700 border border-purple-200/60"
                                                            : "bg-blue-50 text-blue-700 border border-blue-200/60",
                                                    )}
                                                >
                                                    {item.type === "base_product"
                                                        ? "Add-on Utama"
                                                        : "Add-on"}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-2 text-center text-[11px] text-slate-600">
                                                {item.period_months === 12
                                                    ? "1 Tahun"
                                                    : `${item.period_months} Bulan`}
                                            </td>
                                            <td className="py-2.5 px-2 text-center text-slate-600 font-medium">
                                                {item.qty}x
                                            </td>
                                            <td className="py-2.5 px-2 text-right text-slate-600">
                                                {formatRupiah(item.price)}
                                            </td>
                                            <td className="py-2.5 pr-3 text-right font-bold text-slate-900">
                                                {formatRupiah(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic py-2">
                            Rincian item tidak tersedia untuk faktur ini.
                        </p>
                    )}
                </div>

                {/* Dialog Bottom Action & Total */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                    <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Total Tagihan
                        </span>
                        <span className="text-base font-black text-slate-900">
                            {formatRupiah(amount)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <AppButton
                            size="sm"
                            onClick={() => onDownloadPdf(invoice.invoice_number)}
                            isLoading={isDownloading}
                            className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg gap-1.5 cursor-pointer shadow-2xs"
                        >
                            <IconDownload size={14} />
                            <span>Unduh PDF</span>
                        </AppButton>
                    </div>
                </div>
            </div>
        </BaseDialog>
    );
}
