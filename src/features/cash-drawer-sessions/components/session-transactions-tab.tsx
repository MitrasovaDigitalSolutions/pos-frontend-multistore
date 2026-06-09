"use client";

import React from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Transaction } from "@/types/common";

interface SessionTransactionsTabProps {
    transactions: Transaction[];
}

export function SessionTransactionsTab({ transactions }: SessionTransactionsTabProps) {
    return (
        <div className="space-y-3">
            {transactions.length > 0 ? (
                <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                <th className="py-2.5 px-4">No. Transaksi</th>
                                <th className="py-2.5 px-4">Waktu</th>
                                <th className="py-2.5 px-4 text-center">Metode</th>
                                <th className="py-2.5 px-4 text-center">Item</th>
                                <th className="py-2.5 px-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                            {transactions.map((tx) => {
                                const itemsCount = tx.items?.reduce((acc, item) => acc + item.kuantitas, 0) || 0;
                                return (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                                        <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                                            #{tx.id}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500">
                                            {new Date(tx.created_at).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {tx.metode_pembayaran === "cash" ? (
                                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase">
                                                    Tunai
                                                </span>
                                            ) : (
                                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 uppercase">
                                                    Kartu
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-center text-slate-500 font-bold">
                                            {itemsCount}
                                        </td>
                                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 tabular-nums">
                                            {formatRupiah(tx.total)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs font-semibold">
                    Belum ada transaksi penjualan yang dicatat dalam sesi ini.
                </div>
            )}
        </div>
    );
}
