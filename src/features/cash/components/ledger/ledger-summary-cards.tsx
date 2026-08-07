"use client";

import React from "react";
import {
    IconFilter,
    IconScale,
    IconTrendingDown,
    IconTrendingUp,
} from "@tabler/icons-react";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CashLedger } from "../../api/cash-api";
import { getMovementDirection } from "../../utils/ledger-helpers";

interface LedgerSummaryCardsProps {
    data: CashLedger[];
    totalRecords: number;
}

export function LedgerSummaryCards({ data, totalRecords }: LedgerSummaryCardsProps) {
    const totalDebit = data.reduce((acc, item) => {
        const dir = getMovementDirection(item);
        return dir === "debit" ? acc + Math.abs(item.amount) : acc;
    }, 0);

    const totalCredit = data.reduce((acc, item) => {
        const dir = getMovementDirection(item);
        return dir === "credit" ? acc + Math.abs(item.amount) : acc;
    }, 0);

    const netFlow = totalDebit - totalCredit;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Debit Card */}
            <div className="bg-white border border-emerald-100 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
                    <IconTrendingUp size={20} />
                </div>
                <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Total Debit (Masuk)
                    </span>
                    <span className="text-sm font-black text-emerald-600 tabular-nums">
                        +{formatRupiah(totalDebit)}
                    </span>
                </div>
            </div>

            {/* Credit Card */}
            <div className="bg-white border border-rose-100 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                    <IconTrendingDown size={20} />
                </div>
                <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Total Kredit (Keluar)
                    </span>
                    <span className="text-sm font-black text-rose-600 tabular-nums">
                        -{formatRupiah(totalCredit)}
                    </span>
                </div>
            </div>

            {/* Net Flow Card */}
            <div className="bg-white border border-slate-100 rounded-xl p-3.5 flex items-center gap-3 shadow-xs">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    netFlow >= 0
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                }`}>
                    <IconScale size={20} />
                </div>
                <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Selisih Arus Kas (Net)
                    </span>
                    <span className={`text-sm font-black tabular-nums ${
                        netFlow >= 0 ? "text-blue-700" : "text-amber-700"
                    }`}>
                        {netFlow >= 0 ? "+" : ""}{formatRupiah(netFlow)}
                    </span>
                </div>
            </div>

            {/* Total Transactions */}
            <div className="bg-white border border-slate-100 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
                <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                        Jumlah Catatan Mutasi
                    </span>
                    <span className="text-sm font-black text-slate-800 tabular-nums">
                        {totalRecords} Transaksi
                    </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
                    <IconFilter size={16} />
                </div>
            </div>
        </div>
    );
}
