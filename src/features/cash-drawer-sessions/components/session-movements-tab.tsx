"use client";

import React from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import type { CashDrawerMovement } from "@/features/checkout/types/cash-drawer";
import { IconCash, IconArrowDownLeft, IconArrowUpRight, IconX } from "@tabler/icons-react";

interface SessionMovementsTabProps {
    movements: CashDrawerMovement[];
}

export function SessionMovementsTab({ movements }: SessionMovementsTabProps) {
    return (
        <div className="space-y-3">
            {movements.length > 0 ? (
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
                    {movements.map((movement) => {
                        const isOutflow =
                            movement.type === "cash_out" ||
                            movement.type === "cash_refund";
                        return (
                            <div key={movement.id} className="p-3.5 flex justify-between items-center text-xs hover:bg-slate-50/50 transition-colors">
                                <div className="space-y-1">
                                    <div className="font-bold text-slate-700 flex items-center gap-2">
                                        {(movement.type === "opening" || movement.type === "initial") && (
                                            <span className="bg-slate-100 text-slate-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded border border-slate-200">
                                                Mulai
                                            </span>
                                        )}
                                        {movement.type === "cash_sale" && (
                                            <span className="bg-indigo-50 text-indigo-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-indigo-100">
                                                <IconCash size={8} /> Penjualan
                                            </span>
                                        )}
                                        {movement.type === "cash_in" && (
                                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                                <IconArrowDownLeft size={8} /> Uang Masuk
                                            </span>
                                        )}
                                        {movement.type === "cash_out" && (
                                            <span className="bg-rose-50 text-rose-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-rose-100">
                                                <IconArrowUpRight size={8} /> Uang Keluar
                                            </span>
                                        )}
                                        {movement.type === "cash_refund" && (
                                            <span className="bg-amber-50 text-amber-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-100">
                                                <IconArrowUpRight size={8} /> Refund
                                            </span>
                                        )}
                                        {movement.type === "close" && (
                                            <span className="bg-slate-100 text-slate-700 text-[8px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-slate-300">
                                                <IconX size={8} /> Tutup
                                            </span>
                                        )}
                                        <span className="text-slate-800 font-semibold max-w-[280px] truncate" title={movement.note || ""}>
                                            {movement.note || "Transaksi laci kas"}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-medium flex items-center gap-2 font-mono">
                                        <span>Petugas: {movement.user?.name || "Sistem"}</span>
                                        <span>•</span>
                                        <span>{new Date(movement.created_at).toLocaleString("id-ID", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            day: "numeric",
                                            month: "short",
                                        })}</span>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end gap-0.5">
                                    <span className={cn(
                                        "font-extrabold tabular-nums text-xs",
                                        isOutflow ? "text-rose-500" : "text-emerald-600"
                                    )}>
                                        {isOutflow ? "-" : "+"} {formatRupiah(movement.amount)}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-medium font-mono">
                                        Saldo: {formatRupiah(movement.balance_after)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs font-semibold">
                    Belum ada riwayat arus kas di laci pada sesi ini.
                </div>
            )}
        </div>
    );
}
