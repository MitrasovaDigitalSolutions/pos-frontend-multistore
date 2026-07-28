import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { PurchaseOrderItem } from "../../../types";
import { IconPackage } from "@tabler/icons-react";

interface POItemsTabProps {
    items?: PurchaseOrderItem[];
}

export function POItemsTab({ items }: POItemsTabProps) {
    if (!items || items.length === 0) {
        return (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
                Tidak ada item barang tercatat untuk Purchase Order ini.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Desktop / Tablet Table View */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="p-3">Nama Produk</th>
                            <th className="p-3 text-right">Harga Estimasi</th>
                            <th className="p-3 text-right">Qty PO</th>
                            <th className="p-3 text-right">Qty Diterima</th>
                            <th className="p-3 text-right">Subtotal</th>
                            <th className="p-3 text-center">Progress</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 font-medium">
                        {items.map((item) => {
                            const subtotal = (item.harga_estimasi || 0) * (item.kuantitas || 0);
                            const progressPercent = Math.min(
                                100,
                                Math.max(0, (item.kuantitas_diterima / item.kuantitas) * 100)
                            );

                            return (
                                <tr key={item.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                                    <td className="p-3">
                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                            {item.product?.nama || "Produk dihapus"}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                            {item.product?.barcode || "-"}
                                        </p>
                                    </td>
                                    <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-mono">
                                        {formatRupiah(item.harga_estimasi)}
                                    </td>
                                    <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-mono">
                                        {item.kuantitas} pcs
                                    </td>
                                    <td className="p-3 text-right font-mono">
                                        <span className={item.kuantitas_diterima > 0 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}>
                                            {item.kuantitas_diterima} pcs
                                        </span>
                                    </td>
                                    <td className="p-3 text-right text-slate-900 dark:text-slate-100 font-bold font-mono">
                                        {formatRupiah(subtotal)}
                                    </td>
                                    <td className="p-3 text-center whitespace-nowrap">
                                        <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden inline-block mr-1.5 align-middle">
                                            <div
                                                className={`h-full ${
                                                    progressPercent === 100 ? "bg-emerald-500" : progressPercent > 0 ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
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
                    </tbody>
                </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="block sm:hidden space-y-2.5">
                {items.map((item) => {
                    const subtotal = (item.harga_estimasi || 0) * (item.kuantitas || 0);
                    const progressPercent = Math.min(
                        100,
                        Math.max(0, (item.kuantitas_diterima / item.kuantitas) * 100)
                    );

                    return (
                        <div
                            key={item.uid}
                            className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2 shadow-2xs"
                        >
                            {/* Header: Nama Produk & Qty */}
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                        <IconPackage size={14} className="stroke-[2]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs truncate">
                                            {item.product?.nama || "Produk dihapus"}
                                        </h4>
                                        <p className="text-[10px] text-slate-400 font-mono truncate">
                                            {item.product?.barcode || "-"}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-extrabold font-mono shrink-0">
                                    {item.kuantitas} pcs
                                </span>
                            </div>

                            {/* Body: Prices & Progress */}
                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-medium">Harga Estimasi</span>
                                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                                        {formatRupiah(item.harga_estimasi)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-400 block font-medium">Subtotal</span>
                                    <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                                        {formatRupiah(subtotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Footer: Progress Bar */}
                            <div className="flex items-center justify-between gap-2 border-t border-dashed border-slate-100 dark:border-slate-800/80 pt-2 text-[10px]">
                                <span className="text-slate-400 font-medium">
                                    Diterima: <strong className={item.kuantitas_diterima > 0 ? "text-emerald-600 font-bold" : "text-slate-500"}>{item.kuantitas_diterima} / {item.kuantitas} pcs</strong>
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-14 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${
                                                progressPercent === 100 ? "bg-emerald-500" : progressPercent > 0 ? "bg-amber-500" : "bg-slate-200 dark:bg-slate-700"
                                            }`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <span className="font-bold font-mono text-slate-600 dark:text-slate-300">
                                        {progressPercent.toFixed(0)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
