import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    RECEIVING_STATUS_CLASSES,
    RECEIVING_STATUS_LABELS,
    PAYMENT_STATUS_CLASSES,
    PAYMENT_STATUS_LABELS,
    type ReceivingStatus,
    type PaymentStatus,
} from "@/constants/purchase";
import type { Receiving } from "../../../types";
import { formatDate } from "@/lib/date-utils";
import { IconChevronRight } from "@tabler/icons-react";

interface POReceivingsTabProps {
    receivings: Receiving[];
    receivingsLoading: boolean;
    onViewDetail: (uid: string) => void;
}

export function POReceivingsTab({ receivings, receivingsLoading, onViewDetail }: POReceivingsTabProps) {
    if (receivings.length === 0 && !receivingsLoading) {
        return (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Belum ada dokumen penerimaan barang yang mereferensikan PO ini.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="p-3">No. Penerimaan</th>
                            <th className="p-3">Tanggal Terima</th>
                            <th className="p-3 text-right">Nilai Faktur</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Pembayaran</th>
                            <th className="p-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 font-medium">
                        {receivings.map((rec) => (
                            <tr key={rec.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                                <td className="p-3 font-semibold text-slate-900 dark:text-slate-100 font-mono">
                                    {rec.nomor_penerimaan}
                                </td>
                                <td className="p-3 text-slate-700 dark:text-slate-300">
                                    {formatDate(rec.created_at, "dd MMM yyyy")}
                                </td>
                                <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-mono">
                                    {rec.nilai_faktur !== null ? formatRupiah(rec.nilai_faktur) : "-"}
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                            RECEIVING_STATUS_CLASSES[rec.status as ReceivingStatus] || "bg-slate-50 text-slate-700 border-slate-100"
                                        }`}
                                    >
                                        {RECEIVING_STATUS_LABELS[rec.status as ReceivingStatus] || rec.status}
                                    </span>
                                </td>
                                <td className="p-3">
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                            PAYMENT_STATUS_CLASSES[rec.status_pembayaran as PaymentStatus] || "bg-slate-50 text-slate-700 border-slate-100"
                                        }`}
                                    >
                                        {PAYMENT_STATUS_LABELS[rec.status_pembayaran as PaymentStatus] || rec.status_pembayaran}
                                    </span>
                                </td>
                                <td className="p-3 text-center">
                                    <Button
                                        onClick={() => onViewDetail(rec.uid)}
                                        variant="outline"
                                        className="h-7 px-2.5 text-[10px] border-slate-200 text-slate-600 rounded-lg hover:text-slate-900 bg-white cursor-pointer"
                                    >
                                        Lihat Detail
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block sm:hidden space-y-2.5">
                {receivings.map((rec) => (
                    <div
                        key={rec.uid}
                        onClick={() => onViewDetail(rec.uid)}
                        className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2.5 shadow-2xs hover:border-emerald-500/50 transition-all cursor-pointer"
                    >
                        {/* Header: No. Penerimaan & Tanggal */}
                        <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs font-mono">
                                    {rec.nomor_penerimaan}
                                </h4>
                                <p className="text-[10px] text-slate-400">
                                    {formatDate(rec.created_at, "dd MMM yyyy")}
                                </p>
                            </div>
                            <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                    RECEIVING_STATUS_CLASSES[rec.status as ReceivingStatus] || "bg-slate-50 text-slate-700 border-slate-100"
                                }`}
                            >
                                {RECEIVING_STATUS_LABELS[rec.status as ReceivingStatus] || rec.status}
                            </span>
                        </div>

                        {/* Body: Nilai Faktur & Pembayaran */}
                        <div className="flex items-center justify-between gap-2 text-[11px]">
                            <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Nilai Faktur</span>
                                <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                                    {rec.nilai_faktur !== null ? formatRupiah(rec.nilai_faktur) : "-"}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-medium mb-0.5">Status Bayar</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                        PAYMENT_STATUS_CLASSES[rec.status_pembayaran as PaymentStatus] || "bg-slate-50 text-slate-700 border-slate-100"
                                    }`}
                                >
                                    {PAYMENT_STATUS_LABELS[rec.status_pembayaran as PaymentStatus] || rec.status_pembayaran}
                                </span>
                            </div>
                        </div>

                        {/* Footer: Detail CTA */}
                        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onViewDetail(rec.uid);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs shadow-emerald-600/20"
                            >
                                <span>Detail</span>
                                <IconChevronRight size={14} className="stroke-[2.5]" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
