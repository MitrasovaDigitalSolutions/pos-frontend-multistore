"use client";

import React from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import type { CashDrawerSession } from "@/features/checkout/types/cash-drawer";
import { IconClock, IconUser, IconNotes } from "@tabler/icons-react";

interface SessionSummaryTabProps {
    session: CashDrawerSession;
}

export function SessionSummaryTab({ session }: SessionSummaryTabProps) {
    const difference = session.difference ?? 0;

    const formattedTime = (dateStr?: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    const getClosedByName = (s: CashDrawerSession) => {
        if (!s.closed_by) return "-";
        if (typeof s.closed_by === "object" && s.closed_by !== null) {
            return s.closed_by.name;
        }
        if (s.closed_by === s.user_uid && s.user) {
            return s.user.name;
        }
        return `Petugas #${s.closed_by}`;
    };

    return (
        <div className="space-y-5">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconClock size={11} />
                        <span>Waktu Buka</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700">
                        {formattedTime(session.opened_at)}
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconClock size={11} />
                        <span>Waktu Tutup</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700">
                        {session.status === "open" ? (
                            <span className="text-emerald-600 font-bold italic">Sedang Berlangsung</span>
                        ) : (
                            formattedTime(session.closed_at ?? undefined)
                        )}
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconUser size={11} />
                        <span>Petugas Penutup</span>
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 truncate">
                        {session.status === "open" ? "-" : getClosedByName(session)}
                    </div>
                </div>
            </div>

            {/* Core Balances Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider">
                        Perkiraan Saldo (Expected Cash)
                    </span>
                    <span className="text-lg font-extrabold text-emerald-600 tracking-tight">
                        {formatRupiah(session.expected_cash)}
                    </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Saldo Aktual Laci (Closing Cash)
                    </span>
                    <span className="text-lg font-extrabold text-slate-700 tracking-tight">
                        {session.status === "open" ? (
                            <span className="text-slate-400 font-semibold italic text-xs">Belum Ditutup</span>
                        ) : (
                            formatRupiah(session.actual_closing_balance ?? 0)
                        )}
                    </span>
                </div>

                <div className={cn(
                    "border rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-1",
                    session.status === "open"
                        ? "bg-slate-50 border-slate-100"
                        : difference > 0
                            ? "bg-teal-50 border-teal-100/50"
                            : difference < 0
                                ? "bg-rose-50 border-rose-100/50"
                                : "bg-slate-50 border-slate-100"
                )}>
                    <span className={cn(
                        "text-[9px] font-extrabold uppercase tracking-wider",
                        session.status === "open"
                            ? "text-slate-500"
                            : difference > 0
                                ? "text-teal-700"
                                : difference < 0
                                    ? "text-rose-700"
                                    : "text-slate-500"
                    )}>
                        Selisih Kas (Difference)
                    </span>
                    {session.status === "open" ? (
                        <span className="text-slate-400 font-bold text-xs">-</span>
                    ) : (
                        <span className={cn(
                            "text-lg font-extrabold tracking-tight",
                            difference > 0
                                ? "text-teal-600"
                                : difference < 0
                                    ? "text-rose-600"
                                    : "text-slate-700"
                        )}>
                            {difference > 0 ? "+" : ""}
                            {formatRupiah(difference)}
                        </span>
                    )}
                </div>
            </div>

            {/* Detailed Flows breakdown */}
            <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/30">
                <div className="bg-slate-100/50 px-4 py-2 border-b border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                        Rincian Aliran Dana Kas
                    </span>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Modal Awal (Opening)</span>
                        <span className="text-slate-800 font-bold tabular-nums">
                            {formatRupiah(session.opening_balance)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 border-t border-slate-100/50 pt-2">
                        <span>Total Penjualan Tunai (Cash Sales)</span>
                        <span className="text-emerald-600 font-bold tabular-nums">
                            + {formatRupiah(session.cash_sales_total)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 border-t border-slate-100/50 pt-2">
                        <span>Total Uang Masuk (Cash In)</span>
                        <span className="text-emerald-600 font-bold tabular-nums">
                            + {formatRupiah(session.cash_in_total)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400 border-t border-slate-100/50 pt-2">
                        <span>Total Uang Keluar (Cash Out)</span>
                        <span className="text-rose-500 font-bold tabular-nums">
                            - {formatRupiah(session.cash_out_total)}
                        </span>
                    </div>
                    {session.cash_refunds_total > 0 && (
                        <div className="flex justify-between text-xs font-semibold text-slate-400 border-t border-slate-100/50 pt-2">
                            <span>Total Refund Tunai (Cash Refunds)</span>
                            <span className="text-rose-500 font-bold tabular-nums">
                                - {formatRupiah(session.cash_refunds_total)}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Session Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/10">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <IconNotes size={11} /> Catatan Buka
                    </span>
                    <p className="text-xs font-medium text-slate-600 mt-1.5 italic">
                        {session.opening_note ? `"${session.opening_note}"` : "Tidak ada catatan buka."}
                    </p>
                </div>

                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/10">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <IconNotes size={11} /> Catatan Tutup
                    </span>
                    <p className="text-xs font-medium text-slate-600 mt-1.5 italic">
                        {session.status === "open" ? (
                            <span className="text-slate-400 font-normal">Sesi kasir masih aktif/terbuka.</span>
                        ) : session.closing_note ? (
                            `"${session.closing_note}"`
                        ) : (
                            "Tidak ada catatan tutup."
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}
