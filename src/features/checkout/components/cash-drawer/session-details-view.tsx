"use client";

import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CashDrawerSession } from "../../types/cash-drawer";
import {
    IconCash,
    IconClock,
    IconUser,
    IconNotes,
    IconHistory,
    IconArrowDownLeft,
    IconArrowUpRight,
    IconDoorExit,
    IconLoader2,
} from "@tabler/icons-react";

interface SessionDetailsViewProps {
    activeSession: CashDrawerSession | undefined;
    isLoading: boolean;
    onAction: (view: "cash_in" | "cash_out" | "close_shift") => void;
}

export function SessionDetailsView({
    activeSession,
    isLoading,
    onAction,
}: SessionDetailsViewProps) {
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

    if (isLoading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <IconLoader2 size={32} className="animate-spin text-emerald-500" />
                <span className="text-xs font-semibold">Memuat data sesi laci...</span>
            </div>
        );
    }

    if (!activeSession) {
        return (
            <div className="py-8 text-center text-slate-400 text-xs">
                Sesi tidak ditemukan. Silakan muat ulang halaman.
            </div>
        );
    }

    const movements = activeSession.movements || [];
    const cashInTotal = movements
        .filter((m) => m.type === "cash_in")
        .reduce((sum, m) => sum + m.amount, 0);
    const cashOutTotal = movements
        .filter((m) => m.type === "cash_out")
        .reduce((sum, m) => sum + m.amount, 0);

    return (
        <div className="space-y-4">
            <DialogHeader className="pb-4 border-b border-slate-100">
                <DialogTitle className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                            <IconCash size={18} />
                        </div>
                        <div>
                            <span className="block text-sm font-extrabold">Informasi Laci Kasir (Shift Aktif)</span>
                            <span className="block text-[11px] font-medium text-slate-400 mt-0.5">
                                Status: <span className="text-emerald-600 font-bold uppercase">Sesi Terbuka</span>
                            </span>
                        </div>
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ID Sesi: #{activeSession.id}
                    </span>
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            <IconClock size={12} />
                            <span>Waktu Buka</span>
                        </div>
                        <div className="text-[12px] font-bold text-slate-700">
                            {formattedTime(activeSession.opened_at)}
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                            <IconUser size={12} />
                            <span>Kasir / Operator</span>
                        </div>
                        <div className="text-[12px] font-bold text-slate-700 truncate">
                            {activeSession.user?.name || "Kasir"}
                        </div>
                    </div>
                </div>

                {/* Main Expected Cash */}
                <div className="bg-emerald-50 border border-emerald-100/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                        Perkiraan Saldo Laci (Expected Cash)
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                        {formatRupiah(activeSession.expected_cash)}
                    </span>
                    {activeSession.opening_note && (
                        <span className="text-[10px] text-slate-400 font-semibold italic mt-1.5 flex items-center gap-1">
                            <IconNotes size={11} /> Catatan Buka: "{activeSession.opening_note}"
                        </span>
                    )}
                </div>

                {/* Cash flow breakdown */}
                <div className="border border-slate-100 rounded-xl p-4 space-y-2.5 bg-slate-50/50">
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Modal Awal (Opening)</span>
                        <span className="text-slate-800 font-bold tabular-nums">
                            {formatRupiah(activeSession.opening_balance)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Total Uang Masuk (Cash In)</span>
                        <span className="text-emerald-600 font-bold tabular-nums">
                            {formatRupiah(cashInTotal)}
                        </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-slate-400">
                        <span>Total Uang Keluar (Cash Out)</span>
                        <span className="text-rose-500 font-bold tabular-nums">
                            {formatRupiah(cashOutTotal)}
                        </span>
                    </div>
                </div>

                {/* History list */}
                {movements.length > 0 && (
                    <div className="space-y-1.5">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <IconHistory size={12} /> Riwayat Arus Kas Shift
                        </span>
                        <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-36 overflow-y-auto bg-white pr-1">
                            {movements.map((movement) => (
                                <div key={movement.id} className="p-2.5 flex justify-between items-center text-xs">
                                    <div className="space-y-0.5">
                                        <div className="font-bold text-slate-700 flex items-center gap-1">
                                            {movement.type === "initial" && (
                                                <span className="bg-slate-100 text-slate-600 text-[8px] font-extrabold px-1 py-0.5 rounded">
                                                    Mulai
                                                </span>
                                            )}
                                            {movement.type === "cash_in" && (
                                                <span className="bg-emerald-100 text-emerald-700 text-[8px] font-extrabold px-1 py-0.5 rounded flex items-center gap-0.5">
                                                    <IconArrowDownLeft size={8} /> Masuk
                                                </span>
                                            )}
                                            {movement.type === "cash_out" && (
                                                <span className="bg-rose-100 text-rose-700 text-[8px] font-extrabold px-1 py-0.5 rounded flex items-center gap-0.5">
                                                    <IconArrowUpRight size={8} /> Keluar
                                                </span>
                                            )}
                                            <span className="truncate max-w-[180px]">
                                                {movement.note || "Arus kas laci"}
                                            </span>
                                        </div>
                                        <div className="text-[9px] text-slate-400 font-medium">
                                            {new Date(movement.created_at).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: false,
                                            })}
                                        </div>
                                    </div>
                                    <span className={`font-bold tabular-nums ${
                                        movement.type === "cash_out" ? "text-rose-500" : "text-emerald-600"
                                    }`}>
                                        {movement.type === "cash_out" ? "-" : "+"} {formatRupiah(movement.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => onAction("cash_in")}
                        className="h-11 border-dashed border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                    >
                        <IconArrowDownLeft size={16} />
                        <span>Cash In (Uang Masuk)</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onAction("cash_out")}
                        className="h-11 border-dashed border-rose-500 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                    >
                        <IconArrowUpRight size={16} />
                        <span>Cash Out (Uang Keluar)</span>
                    </Button>

                    <Button
                        onClick={() => onAction("close_shift")}
                        className="col-span-2 h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/10 active:scale-[0.99] transition-all border-none"
                    >
                        <IconDoorExit size={16} />
                        <span>Tutup Shift Laci Kasir</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
