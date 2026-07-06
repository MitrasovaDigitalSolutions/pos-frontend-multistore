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

interface POReceivingsTabProps {
    receivings: Receiving[];
    receivingsLoading: boolean;
    onViewDetail: (uid: string) => void;
}

export function POReceivingsTab({ receivings, receivingsLoading, onViewDetail }: POReceivingsTabProps) {
    return (
        <table className="w-full text-left border-collapse text-xs">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-3">No. Penerimaan</th>
                    <th className="p-3">Tanggal Terima</th>
                    <th className="p-3 text-right">Nilai Faktur</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Pembayaran</th>
                    <th className="p-3 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
                {receivings.map((rec) => (
                    <tr key={rec.uid} className="hover:bg-slate-50/50">
                        <td className="p-3 font-semibold text-slate-900">
                            {rec.nomor_penerimaan}
                        </td>
                        <td className="p-3 text-slate-700">
                             {formatDate(rec.created_at, "dd MMM yyyy")}
                        </td>
                        <td className="p-3 text-right text-slate-700 font-mono">
                            {rec.nilai_faktur ? formatRupiah(rec.nilai_faktur) : "-"}
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
                                className="h-7 px-2.5 text-[10px] border-slate-200 text-slate-600 rounded-lg hover:text-slate-900 bg-white"
                            >
                                Lihat Detail
                            </Button>
                        </td>
                    </tr>
                ))}
                {receivings.length === 0 && !receivingsLoading && (
                    <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
                            Belum ada dokumen penerimaan barang yang mereferensikan PO ini.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
