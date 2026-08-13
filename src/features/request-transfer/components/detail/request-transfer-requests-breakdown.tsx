"use client";

import type { RequestTransferDetailRequest } from "../../types";

interface RequestTransferRequestsBreakdownProps {
    requests: RequestTransferDetailRequest[];
}

export function RequestTransferRequestsBreakdown({ requests }: RequestTransferRequestsBreakdownProps) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rincian Request ({requests.length})
            </h3>

            {requests.map((r) => (
                <div
                    key={r.uid}
                    className="border border-slate-100 rounded-xl p-4 space-y-2"
                >
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900 text-xs">{r.nomor_request}</span>
                            <span className="text-[10px] text-slate-400">
                                {r.store_nama ? `Toko: ${r.store_nama}` : ""}
                                {r.user ? ` · ${r.user}` : ""}
                            </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {r.tanggal_request || ""}
                        </span>
                    </div>
                    <table className="w-full text-xs text-left">
                        <tbody className="divide-y divide-slate-50">
                            {r.items.map((i) => (
                                <tr key={i.product_uid}>
                                    <td className="py-1.5 text-slate-700">{i.nama || i.product_uid}</td>
                                    <td className="py-1.5 text-right font-semibold text-slate-700">
                                        {Number(i.kuantitas).toLocaleString("id-ID")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
}
