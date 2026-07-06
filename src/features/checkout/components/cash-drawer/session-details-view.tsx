"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import type { CashDrawerSession } from "../../types/cash-drawer";
import type { Transaction } from "@/features/transactions/types";
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
    IconCreditCard,
    IconNotebook,
    IconLayersIntersect,
    IconLockOpen,
    IconLock,
    IconTrendingUp,
    IconTrendingDown,
    IconInfoCircle,
} from "@tabler/icons-react";
import { Scrollable } from "@/components/ui/scrollable";
import { formatDate, formatToTime } from "@/lib/date-utils";

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
    const [activeTab, setActiveTab] = React.useState<'cash' | 'noncash'>('cash');

    const nonCashTransactions = React.useMemo(() => {
        const txs = activeSession?.transactions || [];
        return txs
            .filter((t: Transaction) => {
                const method = t.metode_pembayaran?.toLowerCase();
                return method === "card" || method === "debt" || method === "split";
            })
            .sort((a: Transaction, b: Transaction) => {
                const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return timeB - timeA;
            });
    }, [activeSession?.transactions]);

    const formattedTime = (dateStr?: string) => {
        if (!dateStr) return "-";
        return formatDate(dateStr, "d MMM yyyy, HH:mm");
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

    // Newest first for quick access in the sidebar
    const movements = [...(activeSession.movements || [])].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
    });

    const totalInflow = activeSession.opening_balance + activeSession.cash_sales_total + activeSession.cash_in_total;
    const totalOutflow = activeSession.cash_out_total + activeSession.cash_refunds_total;

    return (
        <div className="space-y-4">
            {/* ── Header ── */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                {/* Left: icon + title */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <IconLockOpen size={18} />
                    </div>
                    <div>
                        <span className="block text-sm font-extrabold text-slate-900 leading-tight">Laci Kasir — Shift Aktif</span>
                        <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">
                            Sesi <span className="text-emerald-600 font-bold">@{activeSession.user?.username}</span> &bull; Status:{" "}
                            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-extrabold uppercase text-[8px] border border-emerald-100">Aktif</span>
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
                            "h-7 px-2.5 text-[10px] rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-all border text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 border-emerald-250",
                            showHistory && "bg-emerald-50 border-emerald-300"
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
                <div className="bg-amber-50 border border-amber-250 text-amber-800 p-3.5 rounded-xl text-xs font-semibold shadow-sm flex gap-2">
                    <IconInfoCircle size={16} className="shrink-0 mt-0.5" />
                    <span>Koneksi internet terputus. Penyesuaian kas laci (Cash In/Out) dan Akhiri Shift dinonaktifkan hingga Anda kembali online.</span>
                </div>
            )}

            <div className="flex gap-0 transition-all duration-300 overflow-hidden w-full">
                {/* Left Column (Main details) */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Summary Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 space-y-1">
                            <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                                <IconClock size={11} />
                                <span>Waktu Buka Shift</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-700">
                                {formattedTime(activeSession.opened_at)}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 space-y-1">
                            <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                                <IconUser size={11} />
                                <span>Kasir / Operator</span>
                            </div>
                            <div className="text-[11px] font-bold text-slate-700 truncate">
                                {activeSession.user?.name || "Kasir"}
                            </div>
                        </div>
                    </div>

                    {/* Main Expected Cash */}
                    <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-1 shadow-sm">
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                            Perkiraan Saldo Laci Saat Ini (Expected Cash)
                        </span>
                        <span className="text-2xl font-black text-emerald-600 tracking-tight block tabular-nums">
                            {formatRupiah(activeSession.expected_cash)}
                        </span>
                        {activeSession.opening_note && (
                            <span className="text-[9px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-100 shadow-sm mt-2 flex items-center gap-1">
                                <IconNotes size={10} className="text-slate-400" /> &quot;{activeSession.opening_note}&quot;
                            </span>
                        )}
                    </div>

                    {/* Compact Cash flow breakdown */}
                    <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm text-xs">
                        <div className="grid grid-cols-2 divide-x divide-slate-100">
                            {/* Inflow Summary */}
                            <div className="p-3.5 space-y-2">
                                <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                                    <IconTrendingUp size={11} /> Pemasukan
                                </span>
                                <div className="space-y-1.5 font-semibold text-slate-500">
                                    <div className="flex justify-between text-[11px]">
                                        <span>Modal Awal</span>
                                        <span className="text-slate-800 font-bold">{formatRupiah(activeSession.opening_balance)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span>Penjualan</span>
                                        <span className="text-emerald-600 font-bold">+{formatRupiah(activeSession.cash_sales_total)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span>Cash In</span>
                                        <span className="text-emerald-600 font-bold">+{formatRupiah(activeSession.cash_in_total)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-55 border-slate-50 pt-1.5 font-bold text-slate-700 text-[11px]">
                                        <span>Total Masuk</span>
                                        <span className="font-extrabold font-mono">{formatRupiah(totalInflow)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Outflow Summary */}
                            <div className="p-3.5 space-y-2">
                                <span className="text-[9px] font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                                    <IconTrendingDown size={11} /> Pengeluaran
                                </span>
                                <div className="space-y-1.5 font-semibold text-slate-500">
                                    <div className="flex justify-between text-[11px]">
                                        <span>Cash Out</span>
                                        <span className="text-rose-500 font-bold">-{formatRupiah(activeSession.cash_out_total)}</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span>Refund Tunai</span>
                                        <span className="text-rose-500 font-bold">-{formatRupiah(activeSession.cash_refunds_total)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-50 pt-1.5 font-bold text-slate-700 text-[11px]">
                                        <span>Total Keluar</span>
                                        <span className="font-extrabold font-mono text-rose-600">-{formatRupiah(totalOutflow)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <Button
                            variant="outline"
                            onClick={() => onAction("cash_in")}
                            disabled={!isOnline}
                            className="h-10 border-dashed border-emerald-500 hover:bg-emerald-50/50 text-emerald-600 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                        >
                            <IconArrowDownLeft size={15} />
                            <span>Cash In (Uang Masuk)</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onAction("cash_out")}
                            disabled={!isOnline}
                            className="h-10 border-dashed border-rose-500 hover:bg-rose-50/50 text-rose-600 font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                        >
                            <IconArrowUpRight size={15} />
                            <span>Cash Out (Uang Keluar)</span>
                        </Button>

                        <Button
                            onClick={() => onAction("close_shift")}
                            disabled={!isOnline}
                            className={cn(
                                "col-span-2 h-11 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[11px] rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-600/10 active:scale-[0.99] transition-all border-none",
                                !isOnline && "bg-slate-200 hover:bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                            )}
                        >
                            <IconDoorExit size={15} />
                            <span>Akhiri Shift Kasir (Tutup Sesi)</span>
                        </Button>
                    </div>
                </div>

                {/* Right Column (History Timeline Sidebar) */}
                <div
                    className={cn(
                        "transition-all duration-300 ease-in-out flex flex-col max-h-[420px] shrink-0",
                        showHistory
                            ? "w-[300px] opacity-100 pl-5 border-l border-slate-100 ml-5"
                            : "w-0 opacity-0 pl-0 border-l-0 ml-0 overflow-hidden"
                    )}
                >
                    <div className="w-[275px] flex flex-col h-full">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mb-2.5 whitespace-nowrap">
                            <IconHistory size={12} /> Log Aktivitas Sesi
                        </span>
                        
                        {/* Tab Switcher */}
                        <div className="bg-slate-100 p-0.5 rounded-lg grid grid-cols-2 select-none border border-slate-200/40 mb-3.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab("cash")}
                                className={cn(
                                    "py-1 rounded text-[10px] font-bold transition-all cursor-pointer border-none",
                                    activeTab === "cash"
                                        ? "bg-white text-slate-900 shadow-sm font-extrabold"
                                        : "bg-transparent text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Tunai ({movements.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("noncash")}
                                className={cn(
                                    "py-1 rounded text-[10px] font-bold transition-all cursor-pointer border-none",
                                    activeTab === "noncash"
                                        ? "bg-white text-slate-900 shadow-sm font-extrabold"
                                        : "bg-transparent text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Non-Tunai ({nonCashTransactions.length})
                            </button>
                        </div>

                        {/* Scrollable Timeline */}
                        <Scrollable className="flex-1 min-h-0 pr-1">
                            {activeTab === "cash" ? (
                                movements.length > 0 ? (
                                    <div className="relative pl-1">
                                        {/* Vertical line indicator */}
                                        <div className="absolute left-[14.5px] -translate-x-1/2 top-2 bottom-2 w-0.5 bg-slate-100" />
                                        
                                        <div className="space-y-4 relative">
                                            {movements.map((movement) => {
                                                const isOutflow = movement.type === "cash_out" || movement.type === "cash_refund";
                                                
                                                // Icon and Badge style configs
                                                let iconElement = <IconInfoCircle size={10} />;
                                                let iconBgColor = "bg-slate-100 text-slate-500 border-slate-200";
                                                let badgeStyle = "bg-slate-50 text-slate-650 border-slate-150";
                                                let badgeLabel = "Kas";

                                                if (movement.type === "opening" || movement.type === "initial") {
                                                    iconElement = <IconLockOpen size={10} />;
                                                    iconBgColor = "bg-slate-50 text-slate-600 border-slate-350";
                                                    badgeStyle = "bg-slate-100 text-slate-700 font-extrabold border-slate-300";
                                                    badgeLabel = "Buka";
                                                } else if (movement.type === "cash_sale") {
                                                    iconElement = <IconCash size={10} />;
                                                    iconBgColor = "bg-emerald-50 text-emerald-600 border-emerald-200";
                                                    badgeStyle = "bg-emerald-50 text-emerald-700 font-extrabold border-emerald-150";
                                                    badgeLabel = "Jual";
                                                } else if (movement.type === "cash_in") {
                                                    iconElement = <IconArrowDownLeft size={10} />;
                                                    iconBgColor = "bg-emerald-55 bg-emerald-50 text-emerald-700 border-emerald-200";
                                                    badgeStyle = "bg-emerald-50 text-emerald-700 font-extrabold border-emerald-150";
                                                    badgeLabel = "Masuk";
                                                } else if (movement.type === "cash_out") {
                                                    iconElement = <IconArrowUpRight size={10} />;
                                                    iconBgColor = "bg-rose-50 text-rose-700 border-rose-200";
                                                    badgeStyle = "bg-rose-50 text-rose-700 font-extrabold border-rose-150";
                                                    badgeLabel = "Keluar";
                                                } else if (movement.type === "cash_refund") {
                                                    iconElement = <IconArrowUpRight size={10} />;
                                                    iconBgColor = "bg-amber-50 text-amber-700 border-amber-200";
                                                    badgeStyle = "bg-amber-50 text-amber-700 font-extrabold border-amber-150";
                                                    badgeLabel = "Refund";
                                                } else if (movement.type === "close") {
                                                    iconElement = <IconLock size={10} />;
                                                    iconBgColor = "bg-slate-100 text-slate-700 border-slate-300";
                                                    badgeStyle = "bg-slate-100 text-slate-700 font-extrabold border-slate-300";
                                                    badgeLabel = "Tutup";
                                                }

                                                return (
                                                    <div key={movement.uid} className="relative pl-7 flex flex-col group">
                                                        {/* Small Timeline Dot Icon */}
                                                        <div className={cn(
                                                            "absolute left-[5.5px] w-5 h-5 rounded-full border bg-white flex items-center justify-center -translate-x-[5px] z-10 shadow-sm",
                                                            iconBgColor
                                                        )}>
                                                            {iconElement}
                                                        </div>

                                                        {/* Movement item detail */}
                                                        <div className="bg-white border border-slate-100 rounded-lg p-2.5 space-y-1 hover:border-slate-200 shadow-sm transition-all duration-150">
                                                            <div className="flex justify-between items-center text-[10px]">
                                                                <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                                                                    <span className={cn("text-[8px] px-1 py-0.5 rounded font-extrabold uppercase border", badgeStyle)}>
                                                                        {badgeLabel}
                                                                    </span>
                                                                    <span className="truncate max-w-[90px]" title={movement.note || ""}>
                                                                        {movement.note || "Transaksi kas"}
                                                                    </span>
                                                                </span>
                                                                <span className="text-slate-400 font-bold font-mono">
                                                                    {formatToTime(movement.created_at)}
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-between items-end border-t border-slate-50 pt-1.5 mt-1">
                                                                <span className="text-[8px] text-slate-400 font-bold font-mono">
                                                                    Saldo: {formatRupiah(movement.balance_after)}
                                                                </span>
                                                                <span className={cn(
                                                                    "font-extrabold text-[11px] tabular-nums",
                                                                    isOutflow ? "text-rose-500" : "text-emerald-600"
                                                                )}>
                                                                    {isOutflow ? "-" : "+"} {formatRupiah(movement.amount)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                                        Belum ada riwayat kas laci.
                                    </div>
                                )
                            ) : (
                                nonCashTransactions.length > 0 ? (
                                    <div className="relative pl-1">
                                        {/* Vertical line indicator */}
                                        <div className="absolute left-[14.5px] -translate-x-1/2 top-2 bottom-2 w-0.5 bg-slate-100" />
                                        
                                        <div className="space-y-4 relative">
                                            {nonCashTransactions.map((tx: Transaction) => {
                                                const method = tx.metode_pembayaran?.toLowerCase();
                                                const isDebt = method === "debt";
                                                const isSplit = method === "split";

                                                let badgeIcon = <IconCreditCard size={10} />;
                                                let badgeClass = "bg-blue-50 text-blue-700 border-blue-100";
                                                let badgeLabel = "EDC";
                                                if (isDebt) {
                                                    badgeIcon = <IconNotebook size={10} />;
                                                    badgeClass = "bg-amber-50 text-amber-700 border-amber-100";
                                                    badgeLabel = "Hutang";
                                                } else if (isSplit) {
                                                    badgeIcon = <IconLayersIntersect size={10} />;
                                                    badgeClass = "bg-purple-50 text-purple-700 border-purple-100";
                                                    badgeLabel = "Split";
                                                }

                                                let detailText = "";
                                                if (isSplit) {
                                                    const cashPaid = tx.nominal_bayar || 0;
                                                    const change = tx.kembalian || 0;
                                                    const cashPortion = Math.max(0, cashPaid - change);
                                                    const cardPortion = Math.max(0, tx.total - cashPortion);
                                                    detailText = `EDC: ${formatRupiah(cardPortion)}`;
                                                } else if (isDebt) {
                                                    const totalDp = (tx.cash_amount || 0) + (tx.card_amount || 0);
                                                    if (totalDp > 0) {
                                                        detailText = `DP: ${formatRupiah(totalDp)}`;
                                                    }
                                                }

                                                return (
                                                    <div key={tx.uid} className="relative pl-7 flex flex-col group">
                                                        {/* Timeline Dot Icon */}
                                                        <div className={cn(
                                                            "absolute left-[5.5px] w-5 h-5 rounded-full border bg-white flex items-center justify-center -translate-x-[5px] z-10 shadow-sm",
                                                            badgeClass
                                                        )}>
                                                            {badgeIcon}
                                                        </div>

                                                        {/* Non-cash item details card */}
                                                        <div className="bg-white border border-slate-100 rounded-lg p-2.5 space-y-1 hover:border-slate-200 shadow-sm transition-all duration-150">
                                                            <div className="flex justify-between items-start gap-1 text-[10px] min-w-0">
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="font-extrabold text-slate-800 truncate" title={tx.nomor_transaksi}>
                                                                        {tx.nomor_transaksi}
                                                                    </span>
                                                                    {tx.nama_transaksi && (
                                                                        <span className="text-[9px] text-slate-500 font-semibold truncate leading-normal" title={tx.nama_transaksi}>
                                                                            {tx.nama_transaksi}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-slate-400 font-bold font-mono shrink-0">
                                                                    {formatToTime(tx.created_at)}
                                                                </span>
                                                            </div>

                                                            <div className="flex justify-between items-end border-t border-slate-55 border-slate-50 pt-1.5 mt-1 text-[10px]">
                                                                <span className="text-[8px] text-slate-400 font-extrabold tracking-tight">
                                                                    {detailText || `Metode: ${badgeLabel}`}
                                                                </span>
                                                                <span className="font-extrabold text-slate-800 tabular-nums">
                                                                    {formatRupiah(tx.total)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                                        Belum ada transaksi non-tunai.
                                    </div>
                                )
                            )}
                        </Scrollable>
                    </div>
                </div>
            </div>
        </div>
    );
}
