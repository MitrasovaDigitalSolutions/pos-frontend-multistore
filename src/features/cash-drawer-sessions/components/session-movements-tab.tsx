"use client";

import React from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import type { CashDrawerMovement } from "@/features/checkout/types/cash-drawer";
import {
    IconCash,
    IconArrowDownLeft,
    IconArrowUpRight,
    IconLockOpen,
    IconLock,
    IconUser,
    IconInfoCircle,
} from "@tabler/icons-react";

interface SessionMovementsTabProps {
    movements: CashDrawerMovement[];
}

export function SessionMovementsTab({ movements }: SessionMovementsTabProps) {
    const getFallbackNote = (type: string) => {
        switch (type) {
            case "opening":
                return "Pembukaan modal awal laci kasir";
            case "cash_sale":
                return "Penjualan tunai (Point of Sale)";
            case "cash_in":
                return "Penambahan kas masuk operasional";
            case "cash_out":
                return "Penarikan kas keluar operasional / biaya";
            case "cash_refund":
                return "Pengembalian dana tunai (Refund)";
            case "close":
                return "Penutupan shift dan laci kasir";
            default:
                return "Aktivitas kas laci";
        }
    };

    const formattedTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    // Sort movements chronologically (oldest first or newest first? Let's keep existing order, which is typically chronological. 
    // Wait, let's look at the original session-movements-tab.tsx: it just mapped movements. Usually chronological order is best for timeline.)
    // Let's sort them in chronological order so it flows from opening to close (top to bottom).
    const sortedMovements = React.useMemo(() => {
        return [...movements].sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
    }, [movements]);

    return (
        <div className="py-2">
            {sortedMovements.length > 0 ? (
                <div className="relative pl-1">
                    {/* Vertical timeline track line */}
                    <div className="absolute left-6 top-3 bottom-3 w-0.5 bg-slate-100" />

                    <div className="space-y-6 relative">
                        {sortedMovements.map((movement) => {
                            const isOutflow =
                                movement.type === "cash_out" ||
                                movement.type === "cash_refund";

                            // Configure icon and styles based on movement type
                            let iconElement = <IconInfoCircle size={14} />;
                            let badgeStyle = "bg-slate-150 border-slate-200 text-slate-700";
                            let iconStyle = "border-slate-200 text-slate-500";
                            let typeLabel = "Aktivitas";

                            if (movement.type === "opening" || movement.type === "initial") {
                                iconElement = <IconLockOpen size={14} />;
                                iconStyle = "border-slate-300 text-slate-550 bg-slate-50 text-slate-600";
                                badgeStyle = "bg-slate-100 text-slate-650 font-extrabold border border-slate-200";
                                typeLabel = "Mulai Shift";
                            } else if (movement.type === "cash_sale") {
                                iconElement = <IconCash size={14} />;
                                iconStyle = "border-emerald-200 text-emerald-500 bg-emerald-50/50";
                                badgeStyle = "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100";
                                typeLabel = "Penjualan";
                            } else if (movement.type === "cash_in") {
                                iconElement = <IconArrowDownLeft size={14} />;
                                iconStyle = "border-emerald-250 text-emerald-550 bg-emerald-50/50 text-emerald-600 border-emerald-200";
                                badgeStyle = "bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-100";
                                typeLabel = "Uang Masuk";
                            } else if (movement.type === "cash_out") {
                                iconElement = <IconArrowUpRight size={14} />;
                                iconStyle = "border-rose-250 text-rose-550 bg-rose-50/50 text-rose-600 border-rose-200";
                                badgeStyle = "bg-rose-50 text-rose-700 font-extrabold border border-rose-100";
                                typeLabel = "Uang Keluar";
                            } else if (movement.type === "cash_refund") {
                                iconElement = <IconArrowUpRight size={14} />;
                                iconStyle = "border-amber-250 text-amber-550 bg-amber-50/50 text-amber-600 border-amber-200";
                                badgeStyle = "bg-amber-50 text-amber-700 font-extrabold border border-amber-100";
                                typeLabel = "Refund";
                            } else if (movement.type === "close") {
                                iconElement = <IconLock size={14} />;
                                iconStyle = "border-slate-350 text-slate-600 bg-slate-100";
                                badgeStyle = "bg-slate-100 text-slate-700 font-extrabold border border-slate-300";
                                typeLabel = "Tutup Shift";
                            }

                            return (
                                <div key={movement.uid} className="relative flex items-start group">
                                    {/* Timeline Dot Indicator */}
                                    <div className={cn(
                                        "absolute left-6 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center -translate-x-[15px] z-10 transition-all shadow-sm group-hover:scale-105",
                                        iconStyle
                                    )}>
                                        {iconElement}
                                    </div>

                                    {/* Event Card */}
                                    <div className="pl-11 w-full">
                                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:border-slate-200 hover:shadow transition-all duration-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                {/* Left details */}
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={cn("text-[9px] px-2 py-0.5 rounded uppercase tracking-wider", badgeStyle)}>
                                                            {typeLabel}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                                                            {formattedTime(movement.created_at)}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-xs font-extrabold text-slate-800 leading-relaxed truncate" title={movement.note || getFallbackNote(movement.type)}>
                                                        {movement.note || getFallbackNote(movement.type)}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                                                        <IconUser size={11} className="text-slate-400" />
                                                        <span>Petugas: <span className="text-slate-650 font-bold">{movement.user?.name || "Sistem"}</span></span>
                                                    </div>
                                                </div>

                                                {/* Right cash display */}
                                                <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1.5 border-t sm:border-none pt-2 sm:pt-0 border-slate-50 shrink-0">
                                                    <span className={cn(
                                                        "text-sm font-black tabular-nums tracking-tight block",
                                                        isOutflow ? "text-rose-500" : "text-emerald-600"
                                                    )}>
                                                        {isOutflow ? "-" : "+"} {formatRupiah(movement.amount)}
                                                    </span>
                                                    <span className="bg-slate-50 text-slate-500 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-100 font-mono tracking-tight">
                                                        Saldo Laci: {formatRupiah(movement.balance_after)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs font-bold bg-white">
                    Belum ada riwayat aktivitas kas laci pada sesi ini.
                </div>
            )}
        </div>
    );
}
