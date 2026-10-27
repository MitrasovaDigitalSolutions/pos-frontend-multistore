"use client";

import React from "react";
import type { CompoundedTransactionItem } from "../../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconFlask, IconPill, IconClock, IconTag } from "@tabler/icons-react";

interface TransactionDetailCompoundedItemsProps {
    compoundedItems?: CompoundedTransactionItem[];
}

export function TransactionDetailCompoundedItems({
    compoundedItems,
}: TransactionDetailCompoundedItemsProps) {
    if (!compoundedItems || compoundedItems.length === 0) {
        return null;
    }

    return (
        <div
            id="trx-detail-compounded-card"
            className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col p-3.5 sm:p-4.5 space-y-3 sm:space-y-4 transition-all duration-300 hover:shadow-md"
        >
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/80 pb-2.5 sm:pb-3">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-650 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/60 shadow-sm">
                        <IconFlask size={16} className="stroke-[2.2]" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                            Obat Racikan Farmasi
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-1 leading-none truncate">
                            Daftar formula racikan khusus beserta rincian komposisi bahan.
                        </p>
                    </div>
                </div>
                <div className="text-[10px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-900/60 rounded-lg px-2 py-0.5 shrink-0">
                    {compoundedItems.length} Racikan
                </div>
            </div>

            {/* List of compounded items */}
            <div className="space-y-3">
                {compoundedItems.map((comp, idx) => {
                    const totalFees = (comp.tuslah_fee || 0) + (comp.embalase_fee || 0);

                    return (
                        <div
                            key={comp.uid || `comp-${idx}`}
                            className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-4 space-y-3 shadow-2xs"
                        >
                            {/* Top row: Nama Racikan, Sediaan, Total Harga */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2.5">
                                <div className="flex items-start sm:items-center gap-2 min-w-0 flex-wrap">
                                    <div className="w-6 h-6 rounded-lg bg-teal-100/70 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                                        <IconPill size={14} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                                                {comp.nama_racikan}
                                            </h4>
                                            <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-teal-100/60 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 shrink-0">
                                                {comp.jenis_racikan}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-md shrink-0">
                                                {comp.jumlah_kemasan} kemasan
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                                    <span className="text-[9px] font-semibold text-slate-400 uppercase sm:block">
                                        Total Racikan
                                    </span>
                                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 font-mono">
                                        {formatRupiah(comp.total_harga)}
                                    </span>
                                </div>
                            </div>

                            {/* Signa & Biaya Pelayanan Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                                {comp.aturan_pakai && (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                                        <IconClock size={13} className="text-teal-600 dark:text-teal-400 shrink-0" />
                                        <div className="min-w-0 truncate">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                                                Aturan Pakai (Signa)
                                            </span>
                                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5 text-[11px] leading-tight">
                                                {comp.aturan_pakai}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
                                    <div className="flex items-center gap-1.5">
                                        <IconTag size={13} className="text-slate-400 shrink-0" />
                                        <div>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase block leading-none">
                                                Biaya Layanan
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                                                Tuslah ({formatRupiah(comp.tuslah_fee || 0)}) + Embalase ({formatRupiah(comp.embalase_fee || 0)})
                                            </span>
                                        </div>
                                    </div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs font-mono shrink-0">
                                        {formatRupiah(totalFees)}
                                    </span>
                                </div>
                            </div>

                            {/* Ingredients Subtable */}
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Komposisi Bahan Obat ({comp.ingredients?.length || 0} bahan):
                                </span>

                                <div className="rounded-lg border border-slate-200/70 dark:border-slate-800 overflow-x-auto bg-white dark:bg-slate-950">
                                    <table className="w-full text-[11px] border-collapse min-w-[340px]">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                                <th className="py-1.5 px-2.5 text-left">Nama Obat</th>
                                                <th className="py-1.5 px-2 text-center">Jumlah</th>
                                                <th className="py-1.5 px-2 text-right">Harga Satuan</th>
                                                <th className="py-1.5 px-2.5 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {comp.ingredients?.map((ing, ingIdx) => (
                                                <tr key={ing.uid || `ing-${ingIdx}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                                    <td className="py-1.5 px-2.5 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                                                        {ing.nama_produk}
                                                    </td>
                                                    <td className="py-1.5 px-2 text-center font-mono font-semibold text-slate-600 dark:text-slate-400">
                                                        {ing.kuantitas} {ing.satuan || ""}
                                                    </td>
                                                    <td className="py-1.5 px-2 text-right font-mono text-slate-500">
                                                        {formatRupiah(ing.harga_satuan)}
                                                    </td>
                                                    <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                                        {formatRupiah(ing.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
