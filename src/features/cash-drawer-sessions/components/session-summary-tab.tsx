"use client";

import React from "react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import type { CashDrawerSession } from "@/features/checkout/types/cash-drawer";
import {
    IconClock,
    IconUser,
    IconNotes,
    IconTrendingUp,
    IconTrendingDown,
    IconAlertCircle,
    IconCheck,
    IconInfoCircle,
    IconCreditCard,
    IconNotebook,
    IconLayersIntersect,
    IconLockOpen,
    IconCash,
} from "@tabler/icons-react";

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

    // Calculate Non-Cash Transactions Summary
    const nonCashSummary = React.useMemo(() => {
        const txs = session.transactions || [];

        let cardTotal = 0;
        let debtTotal = 0;
        let splitTotal = 0;
        let splitCardTotal = 0;
        let splitCashTotal = 0;

        txs.forEach((tx) => {
            const method = tx.metode_pembayaran?.toLowerCase();
            if (method === "card") {
                cardTotal += tx.total;
            } else if (method === "debt") {
                debtTotal += tx.total;
            } else if (method === "split") {
                splitTotal += tx.total;

                const cashPaid = (tx).nominal_bayar || 0;
                const change = (tx).kembalian || 0;
                const cashPortion = Math.max(0, cashPaid - change);
                const cardPortion = Math.max(0, tx.total - cashPortion);

                splitCardTotal += cardPortion;
                splitCashTotal += cashPortion;
            }
        });

        return {
            cardTotal,
            debtTotal,
            splitTotal,
            splitCardTotal,
            splitCashTotal,
            grandTotal: cardTotal + debtTotal + splitCardTotal,
            hasNonCash: txs.some(tx => {
                const method = tx.metode_pembayaran?.toLowerCase();
                return method === "card" || method === "debt" || method === "split";
            })
        };
    }, [session.transactions]);

    const totalInflow = session.opening_balance + session.cash_sales_total + session.cash_in_total;
    const totalOutflow = session.cash_out_total + session.cash_refunds_total;

    return (
        <div className="space-y-6">
            {/* Session Status Banner */}
            {session.status === "open" ? (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 animate-pulse shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <div className="text-xs">
                        <span className="font-extrabold text-emerald-800 block">Sesi Shift Sedang Berlangsung</span>
                        <span className="text-emerald-600/90 font-semibold mt-0.5 block">
                            Laci kasir sedang aktif digunakan oleh kasir. Perkiraan saldo laci diupdate otomatis saat ada penjualan.
                        </span>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-3 h-3 rounded-full bg-slate-400 shrink-0" />
                    <div className="text-xs">
                        <span className="font-extrabold text-slate-800 block">Sesi Shift Telah Ditutup</span>
                        <span className="text-slate-500 font-semibold mt-0.5 block">
                            Shift kasir telah diakhiri. Seluruh uang fisik di laci telah dihitung, dilaporkan, dan diverifikasi.
                        </span>
                    </div>
                </div>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3.5 space-y-1.5 transition-all hover:border-slate-200">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconClock size={12} className="text-slate-400" />
                        <span>Waktu Buka</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-700">
                        {formattedTime(session.opened_at)}
                    </div>
                </div>

                <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3.5 space-y-1.5 transition-all hover:border-slate-200">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconClock size={12} className="text-slate-400" />
                        <span>Waktu Tutup</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-700">
                        {session.status === "open" ? (
                            <span className="text-emerald-600 font-extrabold italic bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                Berlangsung
                            </span>
                        ) : (
                            formattedTime(session.closed_at ?? undefined)
                        )}
                    </div>
                </div>

                <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3.5 space-y-1.5 col-span-2 sm:col-span-1 transition-all hover:border-slate-200">
                    <div className="flex items-center gap-1 text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <IconUser size={12} className="text-slate-400" />
                        <span>Petugas Penutup</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-700 truncate">
                        {session.status === "open" ? (
                            <span className="text-slate-400 font-normal italic">-</span>
                        ) : (
                            getClosedByName(session)
                        )}
                    </div>
                </div>
            </div>

            {/* Reconciliation Dashboard Card */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                        <IconInfoCircle size={16} className="text-slate-400" />
                        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                            Rekonsiliasi Kas Laci
                        </span>
                    </div>
                    {session.status !== "open" && (
                        <span className={cn(
                            "text-[10px] font-extrabold px-3 py-0.5 rounded-full border uppercase tracking-wide flex items-center gap-1",
                            difference === 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                difference > 0 ? "bg-teal-50 text-teal-700 border-teal-200" :
                                    "bg-rose-50 text-rose-700 border-rose-200"
                        )}>
                            {difference === 0 ? (
                                <>
                                    <IconCheck size={11} /> Kas Sesuai
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
                    <div className="space-y-1.5 bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Perkiraan Kas Sistem
                        </span>
                        <span className="text-xl font-black text-slate-800 block tabular-nums tracking-tight">
                            {formatRupiah(session.expected_cash)}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block">
                            Saldo seharusnya berdasarkan sistem
                        </span>
                    </div>

                    {/* Actual Cash */}
                    <div className="space-y-1.5 bg-slate-50/50 border border-slate-100 p-4 rounded-xl">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            Uang Fisik Dihitung
                        </span>
                        <span className="text-xl font-black text-slate-800 block tabular-nums tracking-tight">
                            {session.status === "open" ? (
                                <span className="text-slate-400 font-bold italic text-xs bg-slate-100 px-2 py-1 rounded">
                                    Menunggu Penutupan
                                </span>
                            ) : (
                                formatRupiah(session.actual_closing_balance ?? 0)
                            )}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block">
                            Jumlah uang yang dihitung kasir
                        </span>
                    </div>

                    {/* Difference */}
                    <div className={cn(
                        "space-y-1.5 p-4 rounded-xl border transition-colors",
                        session.status === "open" ? "bg-slate-50/50 border-slate-100" :
                            difference === 0 ? "bg-emerald-50/40 border-emerald-100" :
                                difference > 0 ? "bg-teal-50/40 border-teal-150" :
                                    "bg-rose-50/40 border-rose-150"
                    )}>
                        <span className={cn(
                            "text-[10px] font-extrabold uppercase tracking-wider block",
                            session.status === "open" ? "text-slate-400" :
                                difference === 0 ? "text-emerald-700" :
                                    difference > 0 ? "text-teal-700" :
                                        "text-rose-700"
                        )}>
                            Selisih Kas
                        </span>
                        <span className={cn(
                            "text-xl font-black block tabular-nums tracking-tight",
                            session.status === "open" ? "text-slate-500" :
                                difference > 0 ? "text-teal-650" :
                                    difference < 0 ? "text-rose-600" :
                                        "text-emerald-600"
                        )}>
                            {session.status === "open" ? "-" : (difference > 0 ? `+${formatRupiah(difference)}` : formatRupiah(difference))}
                        </span>
                        <span className={cn(
                            "text-[9px] font-bold block",
                            session.status === "open" ? "text-slate-400" :
                                difference === 0 ? "text-emerald-600" :
                                    difference > 0 ? "text-teal-600" :
                                        "text-rose-600"
                        )}>
                            {session.status === "open" ? "Belum ada verifikasi selisih" :
                                difference === 0 ? "Sempurna, laci kas seimbang" :
                                    difference > 0 ? "Kas fisik berlebih di laci" :
                                        "Kas fisik kurang di laci"}
                        </span>
                    </div>
                </div>

                {/* Visual Alert Callout */}
                {session.status !== "open" && difference !== 0 && (
                    <div className={cn(
                        "p-3.5 rounded-xl border flex gap-3 text-xs font-medium items-start leading-relaxed shadow-sm",
                        difference < 0 ? "bg-rose-50/20 border-rose-100 text-rose-800" : "bg-teal-50/20 border-teal-100 text-teal-800"
                    )}>
                        <IconAlertCircle size={18} className="shrink-0 mt-0.5 text-rose-500" />
                        <div>
                            {difference < 0 ? (
                                <p>
                                    <strong className="font-extrabold text-rose-900 block mb-0.5">Selisih Kurang (Shortage)</strong>
                                    Terdapat kekurangan kas sebesar <strong className="text-rose-900 font-bold">{formatRupiah(Math.abs(difference))}</strong>. Kasir harus memeriksa apakah ada pengeluaran tunai/pembelian operasional yang lupa diinput ke kas, atau kesalahan saat memberikan uang kembalian ke pelanggan.
                                </p>
                            ) : (
                                <p>
                                    <strong className="font-extrabold text-teal-900 block mb-0.5">Selisih Lebih (Surplus)</strong>
                                    Terdapat kelebihan kas sebesar <strong className="text-teal-900 font-bold">{formatRupiah(difference)}</strong>. Pemilik toko atau admin harus memastikan seluruh penjualan tunai telah terinput dengan benar, atau apakah ada uang modal kasir yang tidak dihitung saat pembukaan.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Inflow vs Outflow Cash Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cash Inflows Box */}
                <div className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
                    <div className="bg-emerald-50/30 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <IconTrendingUp size={15} /> Aliran Kas Masuk (Inflows)
                        </span>
                        <span className="text-xs font-bold text-emerald-700 font-mono">
                            {formatRupiah(totalInflow)}
                        </span>
                    </div>
                    <div className="p-4 space-y-3.5 text-xs">
                        <div className="flex justify-between items-center text-slate-500 font-semibold">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-500">
                                    <IconLockOpen size={12} />
                                </span>
                                <span>Modal Awal (Opening)</span>
                            </div>
                            <span className="text-slate-800 font-extrabold tabular-nums">
                                {formatRupiah(session.opening_balance)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-semibold border-t border-slate-50 pt-3">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <IconCash size={12} />
                                </span>
                                <span>Penjualan Tunai (Cash Sales)</span>
                            </div>
                            <span className="text-emerald-600 font-extrabold tabular-nums">
                                + {formatRupiah(session.cash_sales_total)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-semibold border-t border-slate-50 pt-3">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <IconTrendingUp size={12} />
                                </span>
                                <span>Uang Masuk Tambahan (Cash In)</span>
                            </div>
                            <span className="text-emerald-600 font-extrabold tabular-nums">
                                + {formatRupiah(session.cash_in_total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cash Outflows Box */}
                <div className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
                    <div className="bg-rose-50/20 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                            <IconTrendingDown size={15} /> Aliran Uang Keluar (Outflows)
                        </span>
                        <span className="text-xs font-bold text-rose-600 font-mono">
                            {formatRupiah(totalOutflow)}
                        </span>
                    </div>
                    <div className="p-4 space-y-3.5 text-xs">
                        <div className="flex justify-between items-center text-slate-500 font-semibold">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-rose-50 flex items-center justify-center text-rose-600">
                                    <IconTrendingDown size={12} />
                                </span>
                                <span>Uang Keluar Laci (Cash Out)</span>
                            </div>
                            <span className="text-rose-500 font-extrabold tabular-nums">
                                - {formatRupiah(session.cash_out_total)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500 font-semibold border-t border-slate-50 pt-3">
                            <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-rose-50 flex items-center justify-center text-rose-600">
                                    <IconTrendingDown size={12} />
                                </span>
                                <span>Refund Tunai (Cash Refunds)</span>
                            </div>
                            <span className="text-rose-500 font-extrabold tabular-nums">
                                {session.cash_refunds_total > 0 ? `- ${formatRupiah(session.cash_refunds_total)}` : "Rp 0"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-slate-400 font-semibold border-t border-slate-50 pt-3 italic">
                            <span>Estimasi Rumus Laci:</span>
                            <span className="font-bold text-[10px]">
                                (Inflows) - (Outflows)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Non-Cash Transactions & Receivables */}
            {nonCashSummary.hasNonCash && (
                <div className="border border-slate-100 rounded-2xl shadow-sm bg-white overflow-hidden">
                    <div className="bg-blue-50/20 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                            <IconCreditCard size={15} /> Transaksi Non-Tunai & Piutang Shift
                        </span>
                        <span className="text-xs font-bold text-blue-700 font-mono">
                            {formatRupiah(nonCashSummary.grandTotal)}
                        </span>
                    </div>
                    <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* EDC/Card Total */}
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <IconCreditCard size={11} /> EDC / Debit / Kredit
                            </span>
                            <span className="text-sm font-black text-slate-700 block tabular-nums">
                                {formatRupiah(nonCashSummary.cardTotal + nonCashSummary.splitCardTotal)}
                            </span>
                            {nonCashSummary.splitCardTotal > 0 && (
                                <span className="text-[8px] text-slate-400 font-medium block">
                                    Termasuk porsi kartu split: {formatRupiah(nonCashSummary.splitCardTotal)}
                                </span>
                            )}
                        </div>

                        {/* Debt/Receivable Total */}
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <IconNotebook size={11} /> Piutang / Hutang
                            </span>
                            <span className="text-sm font-black text-slate-700 block tabular-nums">
                                {formatRupiah(nonCashSummary.debtTotal)}
                            </span>
                            <span className="text-[8px] text-slate-400 font-medium block">
                                Transaksi tempo/hutang kasir
                            </span>
                        </div>

                        {/* Split payments total */}
                        <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                <IconLayersIntersect size={11} /> Split Payment
                            </span>
                            <span className="text-sm font-black text-slate-700 block tabular-nums">
                                {formatRupiah(nonCashSummary.splitTotal)}
                            </span>
                            {nonCashSummary.splitCashTotal > 0 && (
                                <span className="text-[8px] text-slate-400 font-medium block">
                                    Porsi cash split masuk laci: {formatRupiah(nonCashSummary.splitCashTotal)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Session Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Note Buka */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 relative">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <IconNotes size={13} className="text-slate-400" /> Catatan Buka Shift
                    </span>
                    <div className="relative pl-3.5 border-l-2 border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
                            {session.opening_note ? `"${session.opening_note}"` : "Tidak ada catatan saat membuka shift."}
                        </p>
                    </div>
                </div>

                {/* Note Tutup */}
                <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/30 relative">
                    <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                        <IconNotes size={13} className="text-slate-400" /> Catatan Tutup Shift
                    </span>
                    <div className="relative pl-3.5 border-l-2 border-slate-200">
                        <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">
                            {session.status === "open" ? (
                                <span className="text-slate-400 font-medium">Sesi kasir masih aktif/terbuka. Belum ada catatan tutup.</span>
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
