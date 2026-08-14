"use client";

import { IconPackage } from "@tabler/icons-react";
import type { RequestTransferGroupedItem } from "../../types";

interface RequestTransferGroupedItemsProps {
    items: RequestTransferGroupedItem[];
}

export function RequestTransferGroupedItems({ items }: RequestTransferGroupedItemsProps) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
                    <IconPackage size={15} />
                </div>
                <span>Item Gabungan ({items.length})</span>
            </h3>

            {items.length > 0 ? (
                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-2xs">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-slate-600">
                            <tr>
                                <th className="px-3.5 py-2.5">Produk</th>
                                <th className="px-3.5 py-2.5 text-right w-24">Qty Request</th>
                                <th className="px-3.5 py-2.5 text-right w-24">Stok Sumber</th>
                                <th className="px-3 py-2.5 text-center w-24">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {items.map((item) => (
                                <tr key={item.product_uid} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-3.5 py-2.5">
                                        <span className="font-bold text-slate-900 text-xs block">
                                            {item.nama || item.product_uid}
                                        </span>
                                        {item.barcode && (
                                            <span className="text-[10px] text-slate-400 font-mono block">
                                                {item.barcode}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-3.5 py-2.5 text-right font-semibold text-slate-700">
                                        {Number(item.kuantitas).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-3.5 py-2.5 text-right text-slate-600">
                                        {Number(item.stok_source ?? 0).toLocaleString("id-ID")}
                                    </td>

                                    <td className="px-3 py-2.5 text-center">
                                        <span
                                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                item.cukup
                                                    ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                                                    : "text-rose-700 bg-rose-50 border-rose-200/60"
                                            }`}
                                        >
                                            {item.cukup ? "Cukup" : "Kurang"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                    Tidak ada item pada summary ini.
                </p>
            )}
        </div>
    );
}
