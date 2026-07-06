import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PurchaseOrder } from "../../../types";
import { formatDate } from "@/lib/date-utils";

interface POSummaryCardProps {
    order: PurchaseOrder;
    getStatusClass: (status: string) => string;
    getStatusLabel: (status: string) => string;
}

export function POSummaryCard({ order, getStatusClass, getStatusLabel }: POSummaryCardProps) {
    return (
        <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-50">
                Ringkasan Dokumen
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">No. PO</span>
                    <p className="font-bold text-slate-900">{order.nomor_po}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tanggal PO</span>
                    <p className="font-semibold text-slate-700">
                        {formatDate(order.tanggal_po, "dd MMM yyyy")}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Supplier</span>
                    <p className="font-semibold text-slate-800">
                        {order.supplier ? order.supplier.nama : order.supplier_name || "-"}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Dibuat Oleh</span>
                    <p className="font-semibold text-slate-700">{order.user?.name || "-"}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Estimasi Total PO</span>
                    <p className="font-bold text-slate-900 text-sm text-emerald-600 font-mono">
                        {formatRupiah(order.nilai_estimasi)}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Diterima</span>
                    <p className="font-bold text-slate-900 font-mono">
                        {formatRupiah(order.total_diterima || 0)}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status PO</span>
                    <div>
                        <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusClass(
                                order.status
                            )}`}
                        >
                            {getStatusLabel(order.status)}
                        </span>
                    </div>
                </div>
                <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Jumlah Penerimaan</span>
                    <p className="font-semibold text-slate-700">{order.receivings_count || 0} kali</p>
                </div>
                <div className="space-y-1 col-span-2 pt-2 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Catatan / Keterangan</span>
                    <p className="text-slate-600 font-medium">{order.catatan || "-"}</p>
                </div>
            </div>
        </section>
    );
}
