"use client";

import React from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Transaction } from "@/types/common";

interface SessionTransactionsTabProps {
    transactions: Transaction[];
}

export function SessionTransactionsTab({ transactions }: SessionTransactionsTabProps) {
    const sortedTransactions = React.useMemo(() => {
        return [...transactions].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
        });
    }, [transactions]);

    return (
        <div className="space-y-3">
            {sortedTransactions.length > 0 ? (
                <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                <th className="py-2.5 px-4">No. Transaksi</th>
                                <th className="py-2.5 px-4">Waktu</th>
                                <th className="py-2.5 px-4 text-center">Metode</th>
                                <th className="py-2.5 px-4 text-center">Item</th>
                                <th className="py-2.5 px-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                            {sortedTransactions.map((tx) => {
                                const itemsCount = tx.items?.reduce((acc, item) => acc + item.kuantitas, 0) || 0;
                                return (
                                    <tr key={tx.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors font-medium">
                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                                            {tx.nomor_transaksi}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                                            {new Date(tx.created_at).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {(() => {
                                                const method = tx.metode_pembayaran?.toLowerCase();
                                                if (method === "cash") {
                                                    return (
                                                        <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-450 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30 uppercase">
                                                            Tunai
                                                        </span>
                                                    );
                                                }
                                                if (method === "card") {
                                                    return (
                                                        <span className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-450 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 uppercase">
                                                            Kartu
                                                        </span>
                                                    );
                                                }
                                                if (method === "debt") {
                                                    return (
                                                        <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-450 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900/30 uppercase">
                                                            Hutang
                                                        </span>
                                                    );
                                                }
                                                if (method === "split") {
                                                    return (
                                                        <span className="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-450 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-100 dark:border-orange-900/30 uppercase">
                                                            Split
                                                        </span>
                                                    );
                                                }
                                                return (
                                                    <span className="bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800/30 uppercase">
                                                        {tx.metode_pembayaran || "Draft"}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="py-3 px-4 text-center text-slate-500 dark:text-slate-400 font-bold">
                                            {itemsCount}
                                        </td>
                                        <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                                            {formatRupiah(tx.total)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-400 dark:text-slate-550 text-xs font-semibold">
                    Belum ada transaksi penjualan yang dicatat dalam sesi ini.
                </div>
            )}
        </div>
    );
}
