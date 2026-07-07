"use client";

import type { CashDrawerSession } from "@/features/checkout/types/cash-drawer";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import {
    IconAlertCircle,
    IconAlertTriangle,
    IconCash,
    IconCheck,
    IconClock,
    IconHourglass,
    IconInfoCircle,
    IconLockOpen,
    IconNotes,
    IconReceipt,
    IconTag,
    IconTax,
    IconTrendingDown,
    IconTrendingUp,
    IconUser
} from "@tabler/icons-react";
import React from "react";

interface SessionSummaryTabProps {
    session: CashDrawerSession;
}

export function SessionSummaryTab({ session }: SessionSummaryTabProps) {
    const difference = session.difference ?? 0;

    const formattedTime = (dateStr?: string) => {
        if (!dateStr) return "-";
        return formatDate(dateStr, "d MMM yyyy, HH:mm");
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

    const getSessionDuration = () => {
        const start = new Date(session.opened_at);
        const end = session.closed_at ? new Date(session.closed_at) : new Date();
        const diffMs = end.getTime() - start.getTime();
        if (diffMs < 0) return "-";
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        const parts = [];
        if (diffHrs > 0) parts.push(`${diffHrs} Jam`);
        if (diffMins > 0 || parts.length === 0) parts.push(`${diffMins} Menit`);
        return parts.join(" ");
    };

    // Calculate detailed sales summary (excluding voided transactions)
    const salesSummary = React.useMemo(() => {
        const txs = session.transactions || [];
        const activeTxs = txs.filter((tx) => tx.status !== "void");
        const voidedTxs = txs.filter((tx) => tx.status === "void");

        let grossSales = 0;
        let totalDiscount = 0;
        let totalTax = 0;
        let netSales = 0;

        let cashTotal = 0;
        let cardTotal = 0;
        let debtTotal = 0;
        let splitTotal = 0;
        let splitCardTotal = 0;
        let splitCashTotal = 0;

        // DP details from debt transactions
        let debtCashDpTotal = 0;
        let debtCardDpTotal = 0;
        let debtTotalBill = 0;

        activeTxs.forEach((tx) => {
            grossSales += tx.subtotal;
            totalDiscount += tx.diskon || 0;
            totalTax += tx.pajak || 0;
            netSales += tx.total;

            const method = tx.metode_pembayaran?.toLowerCase();
            if (method === "cash") {
                cashTotal += tx.total;
            } else if (method === "card") {
                cardTotal += tx.total;
            } else if (method === "debt") {
                debtTotalBill += tx.total;
                const unpaidDebt = tx.debt_amount ?? 0;
                debtTotal += unpaidDebt;

                // Determine DP (Uang Muka)
                if (tx.card_amount && tx.card_amount > 0) {
                    const cashDp = tx.cash_amount ?? 0;
                    const cardDp = tx.card_amount;
                    debtCashDpTotal += cashDp;
                    debtCardDpTotal += cardDp;
                    cashTotal += cashDp;
                    cardTotal += cardDp;
                } else {
                    const cashDp = tx.cash_received ?? (tx.total - unpaidDebt);
                    const actualCashDp = Math.max(0, Math.min(tx.total, cashDp));
                    debtCashDpTotal += actualCashDp;
                    cashTotal += actualCashDp;
                }
            } else if (method === "split") {
                splitTotal += tx.total;

                const cashPaid = tx.cash_received || tx.cash_amount || 0;
                const change = tx.kembalian || 0;
                const cashPortion = Math.max(0, cashPaid - change);
                const cardPortion = Math.max(0, tx.total - cashPortion);

                splitCardTotal += cardPortion;
                splitCashTotal += cashPortion;
            }
        });

        const totalVoidAmount = voidedTxs.reduce((acc, tx) => acc + tx.total, 0);

        return {
            activeCount: activeTxs.length,
            voidedCount: voidedTxs.length,
            totalVoidAmount,
            grossSales,
            totalDiscount,
            totalTax,
            netSales,
            cashTotal: cashTotal + splitCashTotal,
            cardTotal: cardTotal + splitCardTotal,
            debtTotal,
            debtCashDpTotal,
            debtCardDpTotal,
            debtTotalBill,
            splitTotal,
            splitCardTotal,
            splitCashTotal,
            hasNonCash: (cardTotal + splitCardTotal > 0) || debtTotal > 0 || splitTotal > 0 || debtCardDpTotal > 0,
        };
    }, [session.transactions]);

    const totalInflow = session.opening_balance + session.cash_sales_total + session.cash_in_total;
    const totalOutflow = session.cash_out_total + session.cash_refunds_total;

    // Payment percentage calculation for active sales
    const totalPayments = salesSummary.cashTotal + salesSummary.cardTotal + salesSummary.debtTotal;
    const cashPct = totalPayments > 0 ? (salesSummary.cashTotal / totalPayments) * 100 : 0;
    const cardPct = totalPayments > 0 ? (salesSummary.cardTotal / totalPayments) * 100 : 0;
    const debtPct = totalPayments > 0 ? (salesSummary.debtTotal / totalPayments) * 100 : 0;

    return (
        <div className="space-y-5">
            {/* Session Status Banner */}
            {session.status === "open" ? (
                <div className="bg-gradient-to-r from-emerald-50/80 via-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-transparent border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
                    <div className="relative flex shrink-0 h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <div className="text-xs">
                        <span className="font-extrabold text-emerald-900 block">Sesi Shift Sedang Berjalan</span>
                        <span className="text-slate-500 font-medium mt-0.5 block leading-normal">
                            Laci kasir sedang aktif digunakan oleh <span className="font-bold text-slate-700">{session.user?.name}</span>. Perkiraan saldo laci diupdate secara otomatis setiap ada transaksi tunai.
                        </span>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200/80 dark:bg-slate-900/20 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
                    <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0" />
                    <div className="text-xs">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block">Sesi Shift Telah Ditutup</span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium mt-0.5 block leading-normal">
                            Sesi shift kasir telah diakhiri oleh <span className="font-bold text-slate-750">{getClosedByName(session)}</span>. Seluruh saldo fisik laci telah dilaporkan dan divalidasi sistem.
                        </span>
                    </div>
                </div>
            )}

            {/* Metadata Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 shadow-xs rounded-xl p-3.5 space-y-1.5 hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconClock size={12} />
                        <span>Waktu Buka</span>
                    </div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {formattedTime(session.opened_at)}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 shadow-xs rounded-xl p-3.5 space-y-1.5 hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconClock size={12} />
                        <span>Waktu Tutup</span>
                    </div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {session.status === "open" ? (
                            <span className="text-emerald-600 dark:text-emerald-450 font-bold bg-emerald-50/50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100/50">
                                Aktif
                            </span>
                        ) : (
                            formattedTime(session.closed_at ?? undefined)
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 shadow-xs rounded-xl p-3.5 space-y-1.5 hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconHourglass size={12} />
                        <span>Durasi Shift</span>
                    </div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>{getSessionDuration()}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 shadow-xs rounded-xl p-3.5 space-y-1.5 hover:border-slate-200 transition-all col-span-2 md:col-span-1">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconUser size={12} />
                        <span>Petugas Shift</span>
                    </div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">
                        {session.user?.name || "Kasir"}
                    </div>
                </div>
            </div>

            {/* Reconciliation Dashboard Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                    <div className="flex items-center gap-1.5">
                        <IconInfoCircle size={16} className="text-slate-400 dark:text-slate-500" />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Rekonsiliasi Kas Laci (Drawer Cash)
                        </span>
                    </div>
                    {session.status !== "open" && (
                        <span className={cn(
                            "text-[10px] font-black px-3 py-0.5 rounded-full border uppercase tracking-wide flex items-center gap-1 shadow-xs",
                            difference === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30" :
                                difference > 0 ? "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/20 dark:text-teal-450 dark:border-teal-900/30" :
                                    "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-450 dark:border-rose-900/30"
                        )}>
                            {difference === 0 ? (
                                <>
                                    <IconCheck size={11} /> Seimbang
                                </>
                            ) : difference > 0 ? (
                                <>
                                    <IconAlertCircle size={11} /> Kelebihan Kas
                                </>
                            ) : (
                                <>
                                    <IconAlertCircle size={11} /> Kekurangan Kas
                                </>
                            )}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Expected Cash */}
                    <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Ekspektasi Kas Sistem
                        </span>
                        <span className="text-xl font-black text-slate-900 dark:text-slate-100 block tabular-nums tracking-tight">
                            {formatRupiah(session.expected_cash)}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block">
                            Berdasarkan modal + arus kas masuk/keluar
                        </span>
                    </div>

                    {/* Actual Cash */}
                    <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-850 p-4 rounded-xl">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Uang Fisik Dilaporkan
                        </span>
                        <span className="text-xl font-black text-slate-900 dark:text-slate-100 block tabular-nums tracking-tight">
                            {session.status === "open" ? (
                                <span className="text-slate-400 dark:text-slate-500 font-bold italic text-xs bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-150 dark:border-slate-800">
                                    Aktif
                                </span>
                            ) : (
                                formatRupiah(session.actual_closing_balance ?? 0)
                            )}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block">
                            Jumlah kas fisik dihitung di akhir shift
                        </span>
                    </div>

                    {/* Difference */}
                    <div className={cn(
                        "space-y-1.5 p-4 rounded-xl border transition-colors",
                        session.status === "open" ? "bg-slate-50/50 border-slate-100 dark:bg-slate-900/20 dark:border-slate-850" :
                            difference === 0 ? "bg-emerald-50/40 border-emerald-100/60 dark:bg-emerald-950/10 dark:border-emerald-900/20" :
                                difference > 0 ? "bg-teal-50/40 border-teal-100/60 dark:bg-teal-950/10 dark:border-teal-900/20" :
                                    "bg-rose-50/40 border-rose-100/60 dark:bg-rose-950/10 dark:border-rose-900/20"
                    )}>
                        <span className={cn(
                            "text-[10px] font-extrabold uppercase tracking-wider block",
                            session.status === "open" ? "text-slate-400" :
                                difference === 0 ? "text-emerald-700 dark:text-emerald-400" :
                                    difference > 0 ? "text-teal-700 dark:text-teal-400" :
                                        "text-rose-700 dark:text-rose-450"
                        )}>
                            Selisih Kas
                        </span>
                        <span className={cn(
                            "text-xl font-black block tabular-nums tracking-tight",
                            session.status === "open" ? "text-slate-400" :
                                difference > 0 ? "text-teal-600 dark:text-teal-400" :
                                    difference < 0 ? "text-rose-600 dark:text-rose-400" :
                                        "text-emerald-600 dark:text-emerald-450"
                        )}>
                            {session.status === "open" ? "-" : (difference > 0 ? `+${formatRupiah(difference)}` : formatRupiah(difference))}
                        </span>
                        <span className={cn(
                            "text-[9px] font-bold block",
                            session.status === "open" ? "text-slate-400" :
                                difference === 0 ? "text-emerald-600 dark:text-emerald-500" :
                                    difference > 0 ? "text-teal-600 dark:text-teal-500" :
                                        "text-rose-600 dark:text-rose-500"
                        )}>
                            {session.status === "open" ? "Menunggu shift selesai" :
                                difference === 0 ? "Sempurna, saldo kas pas" :
                                    difference > 0 ? "Kas fisik berlebih di laci" :
                                        "Kas fisik kurang di laci"}
                        </span>
                    </div>
                </div>

                {/* Explainer Banners for Differences */}
                {session.status !== "open" && difference !== 0 && (
                    <div className={cn(
                        "p-4 rounded-xl border flex gap-3 text-xs leading-relaxed shadow-xs",
                        difference < 0 ? "bg-rose-50/30 border-rose-100 text-rose-900 dark:bg-rose-950/10 dark:border-rose-900/20 dark:text-rose-300" : "bg-teal-50/30 border-teal-100 text-teal-900 dark:bg-teal-950/10 dark:border-teal-900/20 dark:text-teal-300"
                    )}>
                        <IconAlertCircle size={18} className={cn("shrink-0 mt-0.5", difference < 0 ? "text-rose-500" : "text-teal-500")} />
                        <div>
                            {difference < 0 ? (
                                <p>
                                    <strong className="font-extrabold block mb-0.5">Selisih Kurang (Shortage)</strong>
                                    Laci kas kekurangan uang sebesar <strong className="font-extrabold">{formatRupiah(Math.abs(difference))}</strong>. Silakan periksa apakah kasir lupa menginput pengeluaran tunai (Cash Out) operasional, atau ada kesalahan kembalian.
                                </p>
                            ) : (
                                <p>
                                    <strong className="font-extrabold block mb-0.5">Selisih Lebih (Surplus)</strong>
                                    Laci kas kelebihan uang sebesar <strong className="font-extrabold">{formatRupiah(difference)}</strong>. Mohon periksa apakah ada transaksi penjualan tunai yang tidak terinput di POS, atau modal awal yang dihitung tidak sesuai.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Inflows vs Outflows Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cash Inflows Box */}
                <div className="border border-slate-100 dark:border-slate-850 rounded-2xl shadow-xs bg-white dark:bg-slate-950 overflow-hidden">
                    <div className="bg-emerald-50/20 px-4 py-3.5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <IconTrendingUp size={16} /> Aliran Kas Masuk (Inflow)
                        </span>
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 font-mono">
                            {formatRupiah(totalInflow)}
                        </span>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                        <div className="flex justify-between items-center text-slate-500 font-semibold">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 flex items-center justify-center text-slate-500 shrink-0">
                                    <IconLockOpen size={12} />
                                </span>
                                <span>Modal Awal (Opening)</span>
                            </div>
                            <span className="text-slate-800 dark:text-slate-200 font-extrabold tabular-nums">
                                {formatRupiah(session.opening_balance)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-semibold border-t border-slate-50 dark:border-slate-900/40 pt-2.5">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <IconCash size={12} />
                                </span>
                                <span>Penjualan Tunai (Cash Sales)</span>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-450 font-extrabold tabular-nums">
                                + {formatRupiah(session.cash_sales_total)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-semibold border-t border-slate-50 dark:border-slate-900/40 pt-2.5">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                    <IconTrendingUp size={12} />
                                </span>
                                <span>Uang Masuk Lainnya (Cash In)</span>
                            </div>
                            <span className="text-emerald-600 dark:text-emerald-450 font-extrabold tabular-nums">
                                + {formatRupiah(session.cash_in_total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cash Outflows Box */}
                <div className="border border-slate-100 dark:border-slate-850 rounded-2xl shadow-xs bg-white dark:bg-slate-950 overflow-hidden">
                    <div className="bg-rose-50/20 px-4 py-3.5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-rose-800 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                            <IconTrendingDown size={16} /> Aliran Kas Keluar (Outflow)
                        </span>
                        <span className="text-xs font-black text-rose-700 dark:text-rose-455 font-mono">
                            {formatRupiah(totalOutflow)}
                        </span>
                    </div>
                    <div className="p-4 space-y-3 text-xs">
                        <div className="flex justify-between items-center text-slate-500 font-semibold">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                    <IconTrendingDown size={12} />
                                </span>
                                <span>Uang Keluar Operasional (Cash Out)</span>
                            </div>
                            <span className="text-rose-600 dark:text-rose-450 font-extrabold tabular-nums">
                                - {formatRupiah(session.cash_out_total)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-semibold border-t border-slate-50 dark:border-slate-900/40 pt-2.5">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded bg-rose-50 dark:bg-rose-950/20 border border-rose-100/50 dark:border-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                    <IconTrendingDown size={12} />
                                </span>
                                <span>Refund Tunai (Cash Refund)</span>
                            </div>
                            <span className="text-rose-600 dark:text-rose-450 font-extrabold tabular-nums">
                                {session.cash_refunds_total > 0 ? `- ${formatRupiah(session.cash_refunds_total)}` : "Rp 0"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shift Business Sales Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <IconReceipt size={16} className="text-slate-400" /> Ikhtisar Penjualan Shift (Semua Transaksi)
                    </span>
                    <div className="flex gap-2">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 font-bold px-2 py-0.5 rounded-full shadow-2xs">
                            {salesSummary.activeCount} Selesai
                        </span>
                        {salesSummary.voidedCount > 0 && (
                            <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                                <IconAlertTriangle size={10} /> {salesSummary.voidedCount} Void ({formatRupiah(salesSummary.totalVoidAmount)})
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {/* Gross Sales */}
                    <div className="bg-slate-50/30 dark:bg-slate-900/10 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/80 space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <IconReceipt size={11} /> Penjualan Kotor
                        </span>
                        <span className="text-base font-black text-slate-850 dark:text-slate-200 block tabular-nums">
                            {formatRupiah(salesSummary.grossSales)}
                        </span>
                    </div>

                    {/* Total Discount */}
                    <div className="bg-slate-50/30 dark:bg-slate-900/10 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/80 space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <IconTag size={11} className="text-rose-400" /> Total Diskon
                        </span>
                        <span className="text-base font-black text-rose-600 dark:text-rose-400 block tabular-nums">
                            {salesSummary.totalDiscount > 0 ? `- ${formatRupiah(salesSummary.totalDiscount)}` : "Rp 0"}
                        </span>
                    </div>

                    {/* Total Tax */}
                    <div className="bg-slate-50/30 dark:bg-slate-900/10 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850/80 space-y-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            <IconTax size={11} /> Pajak
                        </span>
                        <span className="text-base font-black text-slate-850 dark:text-slate-200 block tabular-nums">
                            {formatRupiah(salesSummary.totalTax)}
                        </span>
                    </div>

                    {/* Net Sales */}
                    <div className="bg-emerald-50/20 dark:bg-emerald-950/5 p-3.5 rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 space-y-1">
                        <span className="text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                            <IconCheck size={11} /> Penjualan Bersih
                        </span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-450 block tabular-nums">
                            {formatRupiah(salesSummary.netSales)}
                        </span>
                    </div>
                </div>

                {/* Progress Bar Payment Method Breakdown */}
                {totalPayments > 0 && (
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                            <span>Rasio Metode Pembayaran</span>
                            <span>{formatRupiah(totalPayments)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden flex shadow-inner">
                            {cashPct > 0 && (
                                <div
                                    style={{ width: `${cashPct}%` }}
                                    className="bg-emerald-500 h-full transition-all duration-500"
                                    title={`Tunai: ${cashPct.toFixed(0)}%`}
                                />
                            )}
                            {cardPct > 0 && (
                                <div
                                    style={{ width: `${cardPct}%` }}
                                    className="bg-blue-500 h-full transition-all duration-500"
                                    title={`EDC/Card: ${cardPct.toFixed(0)}%`}
                                />
                            )}
                            {debtPct > 0 && (
                                <div
                                    style={{ width: `${debtPct}%` }}
                                    className="bg-rose-500 h-full transition-all duration-500"
                                    title={`Piutang: ${debtPct.toFixed(0)}%`}
                                />
                            )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-[10px] font-extrabold text-slate-500 dark:text-slate-400 pt-1">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                                <span>Tunai ({cashPct.toFixed(0)}%): <span className="text-slate-700 dark:text-slate-200">{formatRupiah(salesSummary.cashTotal)}</span></span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
                                <span>Card ({cardPct.toFixed(0)}%): <span className="text-slate-700 dark:text-slate-200">{formatRupiah(salesSummary.cardTotal)}</span></span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
                                <span>Piutang ({debtPct.toFixed(0)}%): <span className="text-slate-700 dark:text-slate-200">{formatRupiah(salesSummary.debtTotal)}</span></span>
                            </span>
                        </div>
                        {(salesSummary.debtCashDpTotal > 0 || salesSummary.debtCardDpTotal > 0) && (
                            <div className="mt-3 p-3 bg-slate-50/80 dark:bg-slate-900/40 rounded-xl border border-slate-150 dark:border-slate-800/80 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                <span className="font-extrabold text-slate-750 dark:text-slate-350 block mb-1">
                                    Detail Transaksi Tempo dan Uang Muka (DP):
                                </span>
                                Terdapat transaksi piutang dengan total nilai penjualan sebesar{" "}
                                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                                    {formatRupiah(salesSummary.debtTotalBill)}
                                </span>
                                . Dari jumlah tersebut:
                                <ul className="list-disc list-inside mt-1 ml-1 space-y-1 font-medium">
                                    {salesSummary.debtCashDpTotal > 0 && (
                                        <li>
                                            Diterima Tunai (DP):{" "}
                                            <span className="font-bold text-emerald-600 dark:text-emerald-450">
                                                {formatRupiah(salesSummary.debtCashDpTotal)}
                                            </span>{" "}
                                            (termasuk pada total Tunai dan saldo laci kas)
                                        </li>
                                    )}
                                    {salesSummary.debtCardDpTotal > 0 && (
                                        <li>
                                            Diterima Card/Transfer (DP):{" "}
                                            <span className="font-bold text-blue-600 dark:text-blue-450">
                                                {formatRupiah(salesSummary.debtCardDpTotal)}
                                            </span>{" "}
                                            (termasuk pada total Card)
                                        </li>
                                    )}
                                    <li>
                                        Sisa dicatat sebagai Piutang berjalan:{" "}
                                        <span className="font-bold text-rose-600 dark:text-rose-455">
                                            {formatRupiah(salesSummary.debtTotal)}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Session Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Note Buka */}
                <div className="border border-slate-100 dark:border-slate-850 rounded-xl p-4 bg-slate-50/20 dark:bg-slate-900/10 relative">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <IconNotes size={13} className="text-slate-400" /> Catatan Buka Shift
                    </span>
                    <div className="relative pl-3.5 border-l-2 border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            {session.opening_note ? `"${session.opening_note}"` : "Tidak ada catatan saat membuka shift."}
                        </p>
                    </div>
                </div>

                {/* Note Tutup */}
                <div className="border border-slate-100 dark:border-slate-850 rounded-xl p-4 bg-slate-50/20 dark:bg-slate-900/10 relative">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <IconNotes size={13} className="text-slate-400" /> Catatan Tutup Shift
                    </span>
                    <div className="relative pl-3.5 border-l-2 border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            {session.status === "open" ? (
                                <span className="text-slate-400 dark:text-slate-500 font-medium">Sesi kasir masih aktif/terbuka. Belum ada catatan tutup.</span>
                            ) : session.closing_note ? (
                                `"${session.closing_note}"`
                            ) : (
                                "Tidak ada catatan saat menutup shift."
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
