import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PurchaseOrderItem } from "../../../types";

interface POItemsTabProps {
    items?: PurchaseOrderItem[];
}

export function POItemsTab({ items }: POItemsTabProps) {
    return (
        <table className="w-full text-left border-collapse text-xs">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-3">Nama Produk</th>
                    <th className="p-3 text-right">Harga Estimasi</th>
                    <th className="p-3 text-right">Qty PO</th>
                    <th className="p-3 text-right">Qty Diterima</th>
                    <th className="p-3 text-right">Subtotal</th>
                    <th className="p-3 text-center">Progress</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
                {items?.map((item) => {
                    const subtotal = (item.harga_estimasi || 0) * (item.kuantitas || 0);
                    const progressPercent = Math.min(
                        100,
                        Math.max(0, (item.kuantitas_diterima / item.kuantitas) * 100)
                    );

                    return (
                        <tr key={item.uid} className="hover:bg-slate-50/50">
                            <td className="p-3">
                                <p className="font-semibold text-slate-900">
                                    {item.product?.nama || "Produk dihapus"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {item.product?.barcode || "-"}
                                </p>
                            </td>
                            <td className="p-3 text-right text-slate-700 font-mono">
                                {formatRupiah(item.harga_estimasi)}
                            </td>
                            <td className="p-3 text-right text-slate-700 font-mono">
                                {item.kuantitas} pcs
                            </td>
                            <td className="p-3 text-right font-mono">
                                <span className={item.kuantitas_diterima > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                                    {item.kuantitas_diterima} pcs
                                </span>
                            </td>
                            <td className="p-3 text-right text-slate-900 font-bold font-mono">
                                {formatRupiah(subtotal)}
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden inline-block mr-1.5 align-middle">
                                    <div
                                        className={`h-full ${
                                            progressPercent === 100 ? "bg-emerald-500" : progressPercent > 0 ? "bg-amber-500" : "bg-slate-200"
                                        }`}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold font-mono">
                                    {progressPercent.toFixed(0)}%
                                </span>
                            </td>
                        </tr>
                    );
                })}
                {(!items || items.length === 0) && (
                    <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
                            Tidak ada item barang tercatat untuk Purchase Order ini.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}
