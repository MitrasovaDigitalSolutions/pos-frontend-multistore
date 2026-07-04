"use client";

import React from "react";
import type { Transaction } from "../../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconCash,
    IconCreditCard,
    IconCalendar,
    IconUser,
    IconTag,
    IconReceiptTax,
    IconNotebook,
    IconCircleCheck,
    IconAlertCircle
} from "@tabler/icons-react";

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

    return (
        <div className="space-y-4">
            {/* 1. Cost Breakdown Card */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4.5 space-y-3.5 transition-all duration-300 hover:shadow-md">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Rincian Biaya
                </h3>
                <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center text-slate-650">
                        <span className="font-medium">Subtotal</span>
                        <span className="font-semibold tabular-nums text-slate-800">
                            {formatRupiah(transaction.subtotal)}
                        </span>
                    </div>

                    {transaction.diskon > 0 && (
                        <div className="flex justify-between items-center text-rose-600 bg-rose-50/50 dark:bg-rose-950/10 px-2.5 py-1.5 rounded-xl border border-rose-100/50">
                            <span className="flex items-center gap-1 font-bold">
                                <IconTag size={13} className="stroke-[2.2]" /> Diskon
                            </span>
                            <span className="font-black tabular-nums">
                                -{formatRupiah(transaction.diskon)}
                            </span>
                        </div>
                    )}

                    {transaction.pajak > 0 && (
                        <div className="flex justify-between items-center text-slate-650">
                            <span className="flex items-center gap-1 font-medium">
                                <IconReceiptTax size={13} className="text-slate-450" /> Pajak
                            </span>
                            <span className="font-semibold tabular-nums text-slate-800">
                                {formatRupiah(transaction.pajak)}
                            </span>
                        </div>
                    )}

                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                        <span className="font-black text-slate-800 text-xs">Total Akhir</span>
                        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100/80 rounded-xl px-3 py-1.5 font-black text-indigo-700 text-sm tabular-nums shadow-sm">
                            {formatRupiah(transaction.total)}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Payment Method & Specifics */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4.5 space-y-3.5 transition-all duration-300 hover:shadow-md">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Informasi Pembayaran
                </h3>

                {/* Badge based on payment type */}
                <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    {paymentMethod === "cash" && (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60 shadow-sm">
                                <IconCash size={16} className="stroke-[2.2]" />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-none">Tunai (Cash)</div>
                                <div className="text-[9px] font-medium text-slate-400 mt-1 leading-none">Lunas dibayar tunai</div>
                            </div>
                        </>
                    )}
                    {paymentMethod === "card" && (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-sm">
                                <IconCreditCard size={16} className="stroke-[2.2]" />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-none">Non-Tunai (Card)</div>
                                <div className="text-[9px] font-medium text-slate-400 mt-1 leading-none">Menggunakan EDC</div>
                            </div>
                        </>
                    )}
                    {paymentMethod === "debt" && (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100/60 shadow-sm">
                                <IconNotebook size={16} className="stroke-[2.2]" />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-none">Hutang Member</div>
                                <div className="text-[9px] font-medium text-slate-400 mt-1 leading-none">Penjualan tempo</div>
                            </div>
                        </>
                    )}
                    {paymentMethod === "split" && (
                        <>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0 border border-indigo-100/60 shadow-sm">
                                <IconCreditCard size={16} className="stroke-[2.2]" />
                            </div>
                            <div>
                                <div className="text-[11px] font-black text-slate-800 uppercase tracking-wide leading-none">Gabungan (Split)</div>
                                <div className="text-[9px] font-medium text-slate-400 mt-1 leading-none">Tunai &amp; EDC</div>
                            </div>
                        </>
                    )}
                </div>

                {/* Specifics details */}
                <div className="space-y-2.5 pt-0.5 text-xs">
                    {paymentMethod === "cash" && (
                        <>
                            <div className="flex justify-between items-center text-slate-655">
                                <span className="font-medium">Uang Diterima</span>
                                <span className="font-semibold text-slate-800 tabular-nums">
                                    {formatRupiah(transaction.nominal_bayar || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-655">
                                <span className="font-medium">Kembalian</span>
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100/40 tabular-nums text-[11px]">
                                    {formatRupiah(transaction.kembalian || 0)}
                                </span>
                            </div>
                        </>
                    )}

                    {paymentMethod === "debt" && (
                        <>
                            {transaction.card_amount && transaction.card_amount > 0 ? (
                                <>
                                    <div className="flex justify-between items-center text-slate-655">
                                        <span className="font-medium">DP Tunai</span>
                                        <span className="font-semibold text-slate-800 tabular-nums">
                                            {formatRupiah(transaction.cash_amount || 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-655">
                                        <span className="font-medium">DP Transfer/Card</span>
                                        <span className="font-semibold text-slate-800 tabular-nums">
                                            {formatRupiah(transaction.card_amount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500 pl-3">
                                        <span>Kartu ({transaction.jenis_kartu || "Debit"})</span>
                                        <span className="font-mono">{transaction.nomor_kartu_akhir ? `**** ${transaction.nomor_kartu_akhir}` : "-"}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between items-center text-slate-655">
                                    <span className="font-medium">Uang Muka (DP)</span>
                                    <span className="font-semibold text-slate-800 tabular-nums">
                                        {formatRupiah(transaction.cash_received || 0)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-slate-655">
                                <span className="font-medium">Sisa Hutang</span>
                                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100/40 tabular-nums text-[11px]">
                                    {formatRupiah(transaction.debt_amount || 0)}
                                </span>
                            </div>
                        </>
                    )}

                    {paymentMethod === "card" && (
                        <>
                            <div className="flex justify-between items-center text-slate-655">
                                <span className="font-medium">Jenis Kartu</span>
                                <span className="font-bold uppercase text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/50 text-[10px]">
                                    {transaction.jenis_kartu || "Debit"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-655">
                                <span className="font-medium">Nomor Kartu</span>
                                <span className="font-semibold text-slate-700 font-mono tracking-wider tabular-nums">
                                    {transaction.nomor_kartu_akhir ? `**** ${transaction.nomor_kartu_akhir}` : "-"}
                                </span>
                            </div>
                        </>
                    )}

                    {paymentMethod === "split" && (
                        <>
                            <div className="flex justify-between items-center text-slate-655">
                                <span className="font-medium">Bagian Tunai</span>
                                <span className="font-semibold text-slate-800 tabular-nums">
                                    {formatRupiah(cashPortion)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-slate-655">
                                <span className="font-medium">Bagian Non-Tunai</span>
                                <span className="font-semibold text-slate-800 tabular-nums">
                                    {formatRupiah(cardPortion)}
                                </span>
                            </div>
                            <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-slate-655">
                                <span className="font-medium">EDC Kartu</span>
                                <span className="font-bold uppercase text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200/50 text-[10px]">
                                    {transaction.jenis_kartu || "-"}
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 3. Metadata Dashboard Widget */}
            <div className="bg-slate-950 text-white rounded-2xl p-4.5 shadow-sm border border-slate-900 relative overflow-hidden transition-all duration-300 hover:shadow-md">
                {/* Glow decorations */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest relative z-10">
                    Informasi Tambahan
                </h3>

                <div className="grid grid-cols-2 gap-2.5 mt-3.5 relative z-10">
                    {/* Cashier Info */}
                    <div className="flex items-center gap-2.5 bg-slate-900/50 p-2 rounded-xl">
                        <IconUser size={14} className="text-indigo-400 shrink-0" />
                        <div className="truncate">
                            <div className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">Kasir</div>
                            <div className="font-bold text-slate-100 mt-1 truncate text-[11px] leading-none">{transaction.user?.name || "Kasir"}</div>
                        </div>
                    </div>

                    {/* Date/Time Info */}
                    <div className="flex items-center gap-2.5 bg-slate-900/50 p-2 rounded-xl">
                        <IconCalendar size={14} className="text-indigo-400 shrink-0" />
                        <div className="truncate">
                            <div className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">Waktu</div>
                            <div className="font-semibold text-slate-100 mt-1 truncate text-[11px] leading-none">
                                {formattedDate}
                            </div>
                        </div>
                    </div>

                    {/* Member/Pelanggan Info */}
                    {transaction.member && (
                        <div className="col-span-2 flex items-center justify-between bg-slate-900/50 p-2 rounded-xl border border-slate-850">
                            <div className="flex items-center gap-2.5 truncate">
                                <IconCircleCheck size={15} className="text-emerald-450 shrink-0" />
                                <div className="truncate">
                                    <div className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">Pelanggan</div>
                                    <div className="font-bold text-slate-100 text-[11px] mt-1 leading-none truncate">{transaction.member.nama}</div>
                                </div>
                            </div>
                            <span className="font-mono text-[9px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 shrink-0 leading-none">
                                {transaction.member.kode}
                            </span>
                        </div>
                    )}

                    {/* Void Log (If canceled) */}
                    {transaction.status?.toLowerCase() === "canceled" && (
                        <div className="col-span-2 flex items-center gap-2.5 bg-rose-950/20 p-2 rounded-xl border border-rose-900/30">
                            <IconAlertCircle size={15} className="text-rose-400 shrink-0" />
                            <div className="truncate">
                                <div className="text-[8px] text-rose-450 font-extrabold uppercase tracking-wider leading-none">Di-Void Oleh</div>
                                <div className="font-bold text-rose-350 text-[11px] mt-1 leading-none truncate">
                                    {transaction.voidBy?.name || transaction.void_by?.name || "Admin"}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
