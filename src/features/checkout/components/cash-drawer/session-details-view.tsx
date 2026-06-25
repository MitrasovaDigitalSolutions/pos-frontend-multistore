"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
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
    IconX,
} from "@tabler/icons-react";

interface SessionDetailsViewProps {
    activeSession: CashDrawerSession | undefined;
    isLoading: boolean;
    onAction: (view: "cash_in" | "cash_out" | "close_shift") => void;
    showHistory: boolean;
    setShowHistory: (show: boolean) => void;
    onClose: () => void;
    isOnline?: boolean;
}

export function SessionDetailsView({
    activeSession,
    isLoading,
    onAction,
    showHistory,
    setShowHistory,
    onClose,
    isOnline = true,
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

    return (
        <div className="space-y-4">
            {/* ── Symmetric Header ── */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                {/* Left: icon + title */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <IconCash size={16} />
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-slate-900">Laci Kasir — Shift Aktif</span>
                        <span className="block text-[10px] font-medium text-slate-400 mt-0.5">
                            Sesi <span className="text-emerald-600 font-bold">#{activeSession.uid}</span> &bull; Status:{" "}
                            <span className="text-emerald-600 font-bold uppercase">Terbuka</span>
                        </span>
                    </div>
                </div>

                {/* Right: history toggle + close */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                        className={cn(
                            "h-7 px-2.5 text-[10px] rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all border",
                            showHistory
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 border-emerald-200 bg-white"
                        )}
                    >
                        <IconHistory size={13} />
                        <span>{showHistory ? "Sembunyikan" : "Riwayat"}</span>
                    </Button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer border-none bg-transparent shrink-0"
                    >
                        <IconX size={16} />
                        <span className="sr-only">Tutup</span>
                    </button>
                </div>
            </div>

            {!isOnline && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl text-xs font-semibold">
                    Koneksi internet terputus. Penyesuaian kas laci (Cash In/Out) dan Akhiri Shift dinonaktifkan hingga Anda kembali online.
                </div>
            )}

            <div className={cn("grid gap-6 transition-all duration-300", showHistory ? "grid-cols-[1.3fr_1fr]" : "grid-cols-1")}>
                {/* Left Column (Main details) */}
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
                                <IconNotes size={11} /> Catatan Buka: &quot;{activeSession.opening_note}&quot;
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
                            <span>Penjualan Tunai (Cash Sales)</span>
                            <span className="text-emerald-600 font-bold tabular-nums">
                                {formatRupiah(activeSession.cash_sales_total)}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                            <span>Uang Masuk (Cash In)</span>
                            <span className="text-emerald-600 font-bold tabular-nums">
                                {formatRupiah(activeSession.cash_in_total)}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold text-slate-400">
                            <span>Uang Keluar (Cash Out)</span>
                            <span className="text-rose-500 font-bold tabular-nums">
                                {formatRupiah(activeSession.cash_out_total)}
                            </span>
                        </div>
                        {activeSession.cash_refunds_total > 0 && (
                            <div className="flex justify-between text-xs font-semibold text-slate-400">
                                <span>Refund Tunai (Cash Refunds)</span>
                                <span className="text-rose-500 font-bold tabular-nums">
                                    {formatRupiah(activeSession.cash_refunds_total)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => onAction("cash_in")}
                            disabled={!isOnline}
                            className={cn(
                                "h-11 border-dashed border-emerald-500 hover:bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white",
                                !isOnline && "opacity-50 cursor-not-allowed border-slate-200 text-slate-400 hover:bg-white hover:text-slate-400"
                            )}
                        >
                            <IconArrowDownLeft size={16} />
                            <span>Cash In (Uang Masuk)</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onAction("cash_out")}
                            disabled={!isOnline}
                            className={cn(
                                "h-11 border-dashed border-rose-500 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white",
                                !isOnline && "opacity-50 cursor-not-allowed border-slate-200 text-slate-400 hover:bg-white hover:text-slate-400"
                            )}
                        >
                            <IconArrowUpRight size={16} />
                            <span>Cash Out (Uang Keluar)</span>
                        </Button>

                        <Button
                            onClick={() => onAction("close_shift")}
                            disabled={!isOnline}
                            className={cn(
                                "col-span-2 h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/10 active:scale-[0.99] transition-all border-none",
                                !isOnline && "bg-slate-200 hover:bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                            )}
                        >
                            <IconDoorExit size={16} />
                            <span>Akhiri Shift Kasir</span>
                        </Button>
                    </div>
                </div>

                {/* Right Column (History) */}
                {showHistory && (
                    <div className="space-y-3 border-l border-slate-100 pl-6 flex flex-col h-full">
                        <div className="space-y-3 grow">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <IconHistory size={12} /> Riwayat Arus Kas Shift
                            </span>
                            {movements.length > 0 ? (
                                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-y-auto bg-white pr-1 max-h-[300px]">
                                    {movements.map((movement) => {
                                        const isOutflow = movement.type === "cash_out" || movement.type === "cash_refund";
                                        return (
                                            <div key={movement.uid} className="p-2.5 flex justify-between items-center text-xs">
                                                <div className="space-y-0.5">
                                                    <div className="font-bold text-slate-700 flex items-center gap-1">
                                                        {(movement.type === "opening" || movement.type === "initial") && (
                                                            <span className="bg-slate-100 text-slate-600 text-[8px] font-extrabold px-1 py-0.5 rounded">
                                                                Mulai
                                                            </span>
                                                        )}
                                                        {movement.type === "cash_sale" && (
                                                            <span className="bg-indigo-50 text-indigo-700 text-[8px] font-extrabold px-1 py-0.5 rounded flex items-center gap-0.5 border border-indigo-100">
                                                                <IconCash size={8} /> Penjualan
                                                            </span>
                                                        )}
                                                        {movement.type === "cash_in" && (
                                                            <span className="bg-emerald-50 text-emerald-700 text-[8px] font-extrabold px-1 py-0.5 rounded flex items-center gap-0.5 border border-emerald-100">
                                                                <IconArrowDownLeft size={8} /> Masuk
                                                            </span>
                                                        )}
                                                        {movement.type === "cash_out" && (
                                                            <span className="bg-rose-50 text-rose-700 text-[8px] font-extrabold px-1 py-0.5 rounded flex items-center gap-0.5 border border-rose-100">
                                                                <IconArrowUpRight size={8} /> Keluar
                                                            </span>
                                                        )}
                                                        {movement.type === "cash_refund" && (
                                                            <span className="bg-amber-50 text-amber-700 text-[8px] font-extrabold px-1 py-0.5 rounded flex items-center gap-0.5 border border-amber-100">
                                                                <IconArrowUpRight size={8} /> Refund
                                                            </span>
                                                        )}
                                                        <span className="truncate max-w-[130px]" title={movement.note || ""}>
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
                                                <span className={cn(
                                                    "font-bold tabular-nums",
                                                    isOutflow ? "text-rose-500" : "text-emerald-600"
                                                )}>
                                                    {isOutflow ? "-" : "+"} {formatRupiah(movement.amount)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                                    Belum ada riwayat arus kas shift ini.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
