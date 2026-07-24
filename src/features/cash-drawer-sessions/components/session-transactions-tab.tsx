"use client";

import React from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Transaction } from "@/features/transactions/types";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    IconInfoCircle,
    IconUser,
    IconTag,
    IconAlertTriangle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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
                <div className="border border-slate-100 dark:border-slate-850 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-2xs">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-855 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                                <th className="py-3 px-4">No. Transaksi</th>
                                <th className="py-3 px-4">Waktu</th>
                                <th className="py-3 px-4 text-center">Metode</th>
                                <th className="py-3 px-4 text-center">Item</th>
                                <th className="py-3 px-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-slate-700 dark:text-slate-350">
                            {sortedTransactions.map((tx) => {
                                const itemsCount = tx.items?.reduce((acc, item) => acc + item.kuantitas, 0) || 0;
                                const isVoid = tx.status === "void";

                                return (
                                    <tr
                                        key={tx.uid}
                                        className={cn(
                                            "hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors font-medium align-middle",
                                            isVoid && "bg-rose-50/10 hover:bg-rose-50/20 text-slate-400 dark:bg-rose-950/5"
                                        )}
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className={cn(
                                                    "font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100",
                                                    isVoid && "line-through text-slate-400 dark:text-slate-500"
                                                )}>
                                                    {tx.nomor_transaksi}
                                                </span>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {tx.nama_transaksi && (
                                                        <span className="text-[9px] font-bold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                                            {tx.nama_transaksi}
                                                        </span>
                                                    )}
                                                    {tx.member && (
                                                        <span className="text-[9px] font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                                                            <IconUser size={10} />
                                                            {tx.member.nama}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-slate-505 dark:text-slate-450 font-semibold">
                                            {new Date(tx.created_at).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <StatusBadge status={isVoid ? "void" : tx.metode_pembayaran?.toLowerCase() || "draft"} />
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <TooltipProvider delayDuration={150}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border-none bg-transparent cursor-help focus:outline-none">
                                                            <span>{itemsCount} Item</span>
                                                            <IconInfoCircle size={12} className="text-slate-400 shrink-0" />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="p-3 max-w-xs shadow-md border border-slate-800 bg-slate-900 dark:bg-slate-900 text-white rounded-xl">
                                                        <div className="space-y-1.5 text-[11px]">
                                                            <div className="font-extrabold pb-1 border-b border-slate-800 text-slate-450">
                                                                Daftar Item Belanja
                                                            </div>
                                                            {tx.items && tx.items.length > 0 ? (
                                                                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                                                                    {tx.items.map((item, idx) => (
                                                                        <div key={item.uid || idx} className="flex justify-between gap-4">
                                                                            <span className="font-medium text-slate-200 truncate max-w-[140px]">
                                                                                {item.kuantitas}x {item.nama_produk}
                                                                            </span>
                                                                            <span className="font-bold text-slate-400 font-mono">
                                                                                {formatRupiah(item.subtotal)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-400 italic">Tidak ada item</span>
                                                            )}
                                                        </div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={cn(
                                                    "font-extrabold text-slate-900 dark:text-slate-100 tabular-nums",
                                                    isVoid && "line-through text-slate-400 dark:text-slate-505"
                                                )}>
                                                    {formatRupiah(tx.total)}
                                                </span>
                                                {!isVoid && tx.diskon > 0 && (
                                                    <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                                                        <IconTag size={9} />
                                                        <span>-{formatRupiah(tx.diskon)}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="border border-dashed border-slate-200 dark:border-slate-850 rounded-xl p-8 text-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
                    Belum ada transaksi penjualan yang dicatat dalam sesi ini.
                </div>
            )}
        </div>
    );
}
