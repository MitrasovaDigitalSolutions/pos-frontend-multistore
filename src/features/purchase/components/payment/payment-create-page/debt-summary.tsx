import { IconCoins, IconInfoCircle, IconReceipt2 } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { PAYMENT_STATUS } from "@/constants/purchase";
import type { PaymentSummary } from "../../../types";
import { formatToISO } from "@/lib/date-utils";

interface DebtSummaryProps {
    selectedReceivingId: number | string | undefined;
    summaryLoading: boolean;
    summary: PaymentSummary | undefined;
    isEdit: boolean;
    editId: string | null;
    sisaHutangLimit: number;
}

export function DebtSummary({
    selectedReceivingId,
    summaryLoading,
    summary,
    isEdit,
    editId,
    sisaHutangLimit,
}: DebtSummaryProps) {
    if (!selectedReceivingId) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm text-center py-10 space-y-3">
                <div className="bg-slate-50 text-slate-400 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <IconInfoCircle size={24} />
                </div>
                <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-700">Rincian Hutang Belum Tersedia</h4>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto">
                        Silakan pilih salah satu faktur penerimaan barang terlebih dahulu untuk melihat histori pembayaran & sisa hutang.
                    </p>
                </div>
            </div>
        );
    }

    if (summaryLoading) {
        return (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded" />
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-[150px] w-full rounded" />
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg border border-amber-100/30">
                    <IconCoins size={16} />
                </div>
                <h4 className="text-xs font-bold text-slate-800">Ringkasan Hutang</h4>
            </div>

            {/* Large Sisa Hutang Card */}
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isEdit ? "Sisa Hutang Tanpa Pembayaran Ini" : "Sisa Hutang Saat Ini"}
                </span>
                <div className="text-lg font-extrabold text-rose-600">
                    {formatRupiah(sisaHutangLimit)}
                </div>
                {isEdit && (
                    <p className="text-[9px] text-slate-400 italic">
                        Sisa hutang saat ini: {formatRupiah(summary.sisa_hutang)}
                    </p>
                )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                    <span>No. Penerimaan:</span>
                    <span className="font-semibold text-slate-800">{summary.nomor_penerimaan}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                    <span>Total Nilai Faktur:</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(summary.total_faktur)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                    <span>Total Sudah Dibayar:</span>
                    <span className="font-semibold text-emerald-600">{formatRupiah(summary.total_dibayar)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                    <span>Sisa Hutang:</span>
                    <span className="font-semibold text-rose-600">{formatRupiah(summary.sisa_hutang)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 pt-2 border-t border-slate-50">
                    <span>Status Pembayaran:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${summary.status_pembayaran === PAYMENT_STATUS.PAID
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100/30"
                        : summary.status_pembayaran === PAYMENT_STATUS.PARTIAL
                            ? "bg-amber-50 text-amber-700 border-amber-100/30"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                        {summary.status_pembayaran === PAYMENT_STATUS.PAID
                            ? "LUNAS"
                            : summary.status_pembayaran === PAYMENT_STATUS.PARTIAL
                                ? "SEBAGIAN"
                                : summary.status_pembayaran === PAYMENT_STATUS.UNPAID
                                    ? "BELUM DIBAYAR"
                                    : "TEMPO"}
                    </span>
                </div>
            </div>

            {/* Riwayat Pembayaran Sebelumnya */}
            {summary.payments && summary.payments.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <IconReceipt2 size={12} />
                        <span>Riwayat Pembayaran</span>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[160px] overflow-y-auto pr-1">
                        {summary.payments.map((p) => {
                            const isCurrentEdit = isEdit && p.uid === editId;
                            return (
                                <div
                                    key={p.uid}
                                    className={`py-2 text-[11px] flex justify-between items-center ${isCurrentEdit ? "bg-amber-50/50 px-2 rounded-lg" : ""
                                        }`}
                                >
                                    <div className="space-y-0.5">
                                        <div className="font-semibold text-slate-700 flex items-center gap-1">
                                            <span>{p.metode}</span>
                                            {isCurrentEdit && (
                                                <span className="text-[9px] font-bold text-amber-600 px-1 py-0.2 bg-amber-100 rounded">
                                                    Sedang Diubah
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-slate-400 text-[9px]">
                                            {formatToISO(p.tanggal)}
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-800">
                                        {formatRupiah(p.jumlah)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
