"use client";

import React from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import type { CashDrawerMovement } from "@/features/checkout/types/cash-drawer";
import { formatDate } from "@/lib/date-utils";
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
        return formatDate(dateStr, "d MMM yyyy, HH:mm");
    };

    // Sort movements by newest first (as requested)
    const sortedMovements = React.useMemo(() => {
        return [...movements].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
        });
    }, [movements]);

    return (
        <div className="py-1">
            {sortedMovements.length > 0 ? (
                <div className="relative pl-1">
                    {/* Vertical timeline track line */}
                    <div className="absolute left-4.5 top-3 bottom-3 w-0.5 bg-slate-100 dark:bg-slate-800/80" />

                    <div className="space-y-4 relative">
                        {sortedMovements.map((movement) => {
                            const isOutflow =
                                movement.type === "cash_out" ||
                                movement.type === "cash_refund";

                            // Configure icon and styles based on movement type
                            let iconElement = <IconInfoCircle size={12} />;
                            let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
                            let iconStyle = "border-slate-200 text-slate-500 bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:bg-slate-900";
                            let typeLabel = "Aktivitas";

                            if (movement.type === "opening" || movement.type === "initial") {
                                iconElement = <IconLockOpen size={12} className="stroke-[2.5]" />;
                                iconStyle = "border-sky-200 text-sky-600 bg-sky-50 dark:border-sky-900/30 dark:text-sky-400 dark:bg-sky-950/20";
                                badgeStyle = "bg-sky-50 text-sky-705 font-black border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/30";
                                typeLabel = "Mulai Shift";
                            } else if (movement.type === "cash_sale") {
                                iconElement = <IconCash size={12} className="stroke-[2.5]" />;
                                iconStyle = "border-emerald-200 text-emerald-500 bg-emerald-50/50 dark:border-emerald-900/30 dark:text-emerald-400 dark:bg-emerald-950/20";
                                badgeStyle = "bg-emerald-50 text-emerald-700 font-black border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-405 dark:border-emerald-900/30";
                                typeLabel = "Penjualan";
                            } else if (movement.type === "cash_in") {
                                iconElement = <IconArrowDownLeft size={12} className="stroke-[2.5]" />;
                                iconStyle = "border-emerald-250 text-emerald-650 bg-emerald-50 dark:border-emerald-900/35 dark:text-emerald-400 dark:bg-emerald-950/20";
                                badgeStyle = "bg-emerald-50 text-emerald-700 font-black border border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-405 dark:border-emerald-900/30";
                                typeLabel = "Kas Masuk";
                            } else if (movement.type === "cash_out") {
                                iconElement = <IconArrowUpRight size={12} className="stroke-[2.5]" />;
                                iconStyle = "border-rose-200 text-rose-500 bg-rose-50 dark:border-rose-900/30 dark:text-rose-400 dark:bg-rose-950/20";
                                badgeStyle = "bg-rose-50 text-rose-700 font-black border border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30";
                                typeLabel = "Kas Keluar";
                            } else if (movement.type === "cash_refund") {
                                iconElement = <IconArrowUpRight size={12} className="stroke-[2.5]" />;
                                iconStyle = "border-amber-200 text-amber-500 bg-amber-50 dark:border-amber-900/30 dark:text-amber-400 dark:bg-amber-950/20";
                                badgeStyle = "bg-amber-50 text-amber-700 font-black border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30";
                                typeLabel = "Refund";
                            } else if (movement.type === "close") {
                                iconElement = <IconLock size={12} className="stroke-[2.5]" />;
                                iconStyle = "border-slate-300 text-slate-600 bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:bg-slate-900";
                                badgeStyle = "bg-slate-100 text-slate-700 font-black border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
                                typeLabel = "Tutup Shift";
                            }

                            return (
                                <div key={movement.uid} className="relative flex items-start group">
                                    {/* Timeline Dot Indicator */}
                                    <div className={cn(
                                        "absolute left-4.5 w-6 h-6 rounded-full border bg-white dark:bg-slate-950 flex items-center justify-center -translate-x-1/2 z-10 transition-all duration-200 shadow-sm group-hover:scale-110",
                                        iconStyle
                                    )}>
                                        {iconElement}
                                    </div>

                                    {/* Event Card */}
                                    <div className="pl-8 w-full">
                                        <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl p-3.5 shadow-2xs hover:border-slate-200 dark:hover:border-slate-800 hover:shadow-xs transition-all duration-200">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                {/* Left details */}
                                                <div className="space-y-1.5 flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={cn("text-[8px] px-1.5 py-0.5 rounded-sm font-black uppercase tracking-wider border shadow-2xs", badgeStyle)}>
                                                            {typeLabel}
                                                        </span>
                                                        <span className="text-[9px] text-slate-450 dark:text-slate-500 font-mono font-bold">
                                                            {formattedTime(movement.created_at)}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-normal" title={movement.note || getFallbackNote(movement.type)}>
                                                        {movement.note || getFallbackNote(movement.type)}
                                                    </p>
                                                    
                                                    <div className="flex items-center gap-1 text-[9px] text-slate-400 dark:text-slate-500 font-bold">
                                                        <IconUser size={11} className="shrink-0" />
                                                        <span>
                                                            Oleh: <span className="text-slate-600 dark:text-slate-400 font-extrabold">{movement.user?.name || "Sistem"}</span>
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right cash display */}
                                                <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1.5 border-t sm:border-none pt-2.5 sm:pt-0 border-slate-50 dark:border-slate-900/40 shrink-0">
                                                    <span className={cn(
                                                        "text-sm font-black tabular-nums tracking-tight block",
                                                        isOutflow ? "text-rose-600 dark:text-rose-500" : "text-emerald-600 dark:text-emerald-450"
                                                    )}>
                                                        {isOutflow ? "-" : "+"} {formatRupiah(movement.amount)}
                                                    </span>
                                                    <span className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-450 text-[9px] font-bold px-2 py-0.5 rounded border border-slate-100/60 dark:border-slate-850 font-mono tracking-tight">
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
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-slate-400 dark:text-slate-500 text-xs font-bold bg-white dark:bg-slate-950">
                    Belum ada riwayat aktivitas kas laci pada sesi ini.
                </div>
            )}
        </div>
    );
}
