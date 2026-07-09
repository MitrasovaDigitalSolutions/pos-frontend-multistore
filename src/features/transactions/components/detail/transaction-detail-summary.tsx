"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconCalendar,
    IconCircleCheck,
    IconNotebook,
    IconReceipt,
    IconReceiptTax,
    IconTag,
    IconTrendingUp,
    IconUser
} from "@tabler/icons-react";
import type { Transaction } from "../../types";

interface TransactionDetailSummaryProps {
    transaction: Transaction;
    formattedDate: string;
}

export function TransactionDetailSummary({ transaction, formattedDate }: TransactionDetailSummaryProps) {
    const paymentMethod = transaction.metode_pembayaran?.toLowerCase() || "cash";

    // Split Payment math helper
    const getSplitPaymentBreakdown = () => {
        const cashPaid = transaction.nominal_bayar || 0;
        const change = transaction.kembalian || 0;
        const cashPortion = Math.max(0, cashPaid - change);
        const cardPortion = Math.max(0, transaction.total - cashPortion);
        return { cashPortion, cardPortion };
    };

    const { cashPortion, cardPortion } = getSplitPaymentBreakdown();

    const totalProfit = transaction.items.reduce(
        (sum, item) => sum + ((item.harga_satuan - (item.harga_beli ?? 0)) * item.kuantitas),
        0
    ) - transaction.diskon;

    const profitMargin = transaction.total > 0 ? (totalProfit / transaction.total) * 100 : 0;

    return (
        <div className="space-y-4">
            {/* 1. Unified Hero Metrics Card (Compact side-by-side) */}
            <div className="bg-white dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between divide-x divide-slate-200/60 dark:divide-slate-800/80 shadow-xs">
                {/* Total Jual Column */}
                <div className="flex-1 pr-3 flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0 border border-indigo-100/50 shadow-xs">
                        <IconReceipt size={15} className="stroke-[2.2]" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Jual</span>
                        <p className="text-xs sm:text-sm font-black tracking-tight text-slate-800 dark:text-slate-100 tabular-nums">
                            {formatRupiah(transaction.total)}
                        </p>
                        <span className="text-[8px] font-medium text-slate-400 block">
                            {transaction.items.length} item
                        </span>
                    </div>
                </div>

                {/* Keuntungan Column */}
                <div className="flex-1 pl-4 flex items-start gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${totalProfit >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}>
                        <IconTrendingUp size={15} className="stroke-[2.2]" />
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Keuntungan</span>
                        <p className={`text-xs sm:text-sm font-black tracking-tight tabular-nums ${totalProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}>
                            {formatRupiah(totalProfit)}
                        </p>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded w-fit block mt-0.5 ${totalProfit >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                            }`}>
                            {profitMargin.toFixed(1)}% margin
                        </span>
                    </div>
                </div>
            </div>

            {/* 2. Rincian Biaya & Aliran Pembayaran (Merged Card) */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 space-y-4 hover:shadow-md transition-shadow duration-200">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Rincian &amp; Pembayaran
                    </h3>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-500 font-medium">
                        <span>Subtotal</span>
                        <span className="font-semibold text-slate-800 tabular-nums">
                            {formatRupiah(transaction.subtotal)}
                        </span>
                    </div>

                    {transaction.diskon > 0 && (
                        <div className="flex justify-between items-center text-rose-600 bg-rose-50/30 px-2 py-1 rounded-lg border border-rose-100/40">
                            <span className="flex items-center gap-1 font-bold">
                                <IconTag size={12} /> Diskon Faktur
                            </span>
                            <span className="font-black tabular-nums">
                                -{formatRupiah(transaction.diskon)}
                            </span>
                        </div>
                    )}

                    {transaction.pajak > 0 && (
                        <div className="flex justify-between items-center text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                                <IconReceiptTax size={12} className="text-slate-400" /> PPN (Pajak)
                            </span>
                            <span className="font-semibold text-slate-800 tabular-nums">
                                {formatRupiah(transaction.pajak)}
                            </span>
                        </div>
                    )}

                    {/* Divider line */}
                    <div className="border-t border-slate-100 pt-3" />

                    {/* Payment badge & subdetails */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-500">Metode Pembayaran</span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-lg border ${paymentMethod === "cash" ? "bg-emerald-50 text-emerald-700 border-emerald-100/50" :
                            paymentMethod === "card" ? "bg-blue-50 text-blue-700 border-blue-100/50" :
                                paymentMethod === "debt" ? "bg-rose-50 text-rose-700 border-rose-100/50" :
                                    "bg-indigo-50 text-indigo-700 border-indigo-100/50"
                            }`}>
                            {paymentMethod === "cash" ? "Tunai" :
                                paymentMethod === "card" ? "Non-Tunai" :
                                    paymentMethod === "debt" ? "Tempo" : "Split"}
                        </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-100/80 p-3 rounded-xl space-y-2 text-xs">
                        {paymentMethod === "cash" && (
                            <div className="grid grid-cols-2 gap-3 divide-x divide-slate-200/50">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Diterima</span>
                                    <p className="font-bold text-slate-800 mt-0.5 tabular-nums text-xs">
                                        {formatRupiah(transaction.nominal_bayar || 0)}
                                    </p>
                                </div>
                                <div className="pl-3">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Kembalian</span>
                                    <p className="font-bold text-emerald-600 mt-0.5 tabular-nums text-xs">
                                        {formatRupiah(transaction.kembalian || 0)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {paymentMethod === "card" && (
                            <div className="grid grid-cols-2 gap-3 divide-x divide-slate-200/50">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Mesin EDC</span>
                                    <p className="font-bold text-slate-800 mt-0.5 uppercase text-xs">
                                        {transaction.jenis_kartu || "Debit"}
                                    </p>
                                </div>
                                <div className="pl-3">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">No. Kartu</span>
                                    <p className="font-mono text-slate-700 mt-0.5 text-xs">
                                        {transaction.nomor_kartu_akhir ? `**** ${transaction.nomor_kartu_akhir}` : "-"}
                                    </p>
                                </div>
                            </div>
                        )}

                        {paymentMethod === "debt" && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-3 divide-x divide-slate-200/50">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Uang Muka (DP)</span>
                                        <p className="font-bold text-slate-800 mt-0.5 tabular-nums text-xs">
                                            {formatRupiah(transaction.card_amount && transaction.card_amount > 0
                                                ? (transaction.cash_amount || 0) + transaction.card_amount
                                                : transaction.cash_received || 0)}
                                        </p>
                                    </div>
                                    <div className="pl-3">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sisa Hutang</span>
                                        <p className="font-black text-rose-600 mt-0.5 tabular-nums text-xs">
                                            {formatRupiah(transaction.debt_amount || 0)}
                                        </p>
                                    </div>
                                </div>
                                {transaction.card_amount && transaction.card_amount > 0 && (
                                    <div className="text-[9px] border-t border-slate-200/40 pt-1.5 text-slate-400 flex justify-between">
                                        <span>DP Transfer ({transaction.jenis_kartu || "Debit"})</span>
                                        <span className="font-mono">{transaction.nomor_kartu_akhir ? `**** ${transaction.nomor_kartu_akhir}` : "-"}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {paymentMethod === "split" && (
                            <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-3 divide-x divide-slate-200/50">
                                    <div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nominal Tunai</span>
                                        <p className="font-bold text-slate-800 mt-0.5 tabular-nums text-xs">
                                            {formatRupiah(cashPortion)}
                                        </p>
                                    </div>
                                    <div className="pl-3">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Nominal Transfer</span>
                                        <p className="font-bold text-slate-800 mt-0.5 tabular-nums text-xs">
                                            {formatRupiah(cardPortion)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-[9px] border-t border-slate-200/40 pt-1.5 text-slate-400 flex justify-between">
                                    <span>EDC / Bank</span>
                                    <span className="font-extrabold uppercase">{transaction.jenis_kartu || "-"}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. Otorisasi & Pelanggan (Metadata Card) */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 space-y-3.5 hover:shadow-md transition-shadow duration-200">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Otorisasi &amp; Waktu
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {/* Operator */}
                    <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100/60 flex items-center gap-2">
                        <IconUser size={13} className="text-slate-400 shrink-0" />
                        <div className="truncate">
                            <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Kasir</span>
                            <span className="font-bold text-slate-800 truncate block mt-0.5 text-[10px] leading-none">
                                {transaction.user?.name || "Kasir"}
                            </span>
                        </div>
                    </div>

                    {/* Waktu */}
                    <div className="bg-slate-50/70 p-2 rounded-xl border border-slate-100/60 flex items-center gap-2">
                        <IconCalendar size={13} className="text-slate-450 shrink-0" />
                        <div className="truncate">
                            <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Waktu</span>
                            <span className="font-semibold text-slate-800 truncate block mt-0.5 text-[10px] leading-none">
                                {formattedDate}
                            </span>
                        </div>
                    </div>

                    {/* Member */}
                    {transaction.member && (
                        <div className="col-span-2 bg-slate-50/70 p-2 rounded-xl border border-slate-100/60 flex items-center justify-between">
                            <div className="flex items-center gap-2 truncate">
                                <IconCircleCheck size={13} className="text-emerald-500 shrink-0" />
                                <div className="truncate">
                                    <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Pelanggan</span>
                                    <span className="font-bold text-slate-800 mt-0.5 block text-[10px] leading-none truncate">
                                        {transaction.member.nama}
                                    </span>
                                </div>
                            </div>
                            <span className="font-mono text-[8px] text-slate-500 bg-slate-100 border border-slate-200/50 px-1 py-0.5 rounded font-bold leading-none">
                                {transaction.member.kode}
                            </span>
                        </div>
                    )}

                    {/* Keterangan */}
                    {transaction.nama_transaksi && (
                        <div className="col-span-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100/60 flex items-start gap-2">
                            <IconNotebook size={13} className="text-slate-400 shrink-0 mt-0.5" />
                            <div className="truncate">
                                <span className="text-[8px] text-slate-400 font-bold uppercase block leading-none">Catatan / Keterangan</span>
                                <span className="font-medium text-slate-700 block mt-1 text-[11px] whitespace-pre-wrap leading-tight">
                                    {transaction.nama_transaksi}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
