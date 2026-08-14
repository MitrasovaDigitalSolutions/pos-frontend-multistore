"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
    IconArrowUpRight,
    IconChartBar,
    IconCoin,
    IconReceipt2,
    IconWallet,
} from "@tabler/icons-react";
import type { CentralOverviewData } from "../../types/central-reports-types";

interface CentralKpiCardsProps {
    overview?: CentralOverviewData;
    isLoading: boolean;
}

export function CentralKpiCards({ overview, isLoading }: CentralKpiCardsProps) {
    if (isLoading || !overview) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-4 bg-white border border-slate-100 rounded-xl shadow-2xs space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-7 w-36" />
                        <Skeleton className="h-3 w-28" />
                    </Card>
                ))}
            </div>
        );
    }

    const {
        net_sales,
        discount_total,
        gross_profit,
        profit_margin,
        total_expenses,
        net_profit,
        items_sold,
        sales_count,
        stores_count,
    } = overview;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Omset Penjualan (Net Sales) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-100/80 shadow-2xs flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                            <IconCoin size={12} />
                        </div>
                        Omset Bersih
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                        {stores_count} Cabang
                    </span>
                </div>

                <div>
                    <div className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 font-mono">
                        {formatRupiah(net_sales)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{sales_count.toLocaleString("id-ID")} transaksi</span>
                        {discount_total > 0 && (
                            <span className="text-slate-400">
                                Diskon: {formatRupiah(discount_total)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Laba Kotor (Gross Profit) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/70 via-white to-white border border-blue-100/80 shadow-2xs flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                            <IconChartBar size={12} />
                        </div>
                        Laba Kotor
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded">
                        Margin {profit_margin}%
                    </span>
                </div>

                <div>
                    <div className="text-lg sm:text-xl font-extrabold tracking-tight text-blue-700 font-mono">
                        {formatRupiah(gross_profit)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>Margin kotor</span>
                        <span className="font-semibold text-blue-700">{profit_margin}% dari omset</span>
                    </div>
                </div>
            </div>

            {/* 3. Pengeluaran (Expenses) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50/70 via-white to-white border border-amber-100/80 shadow-2xs flex flex-col justify-between space-y-2.5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center">
                            <IconWallet size={12} />
                        </div>
                        Total Pengeluaran
                    </span>
                </div>

                <div>
                    <div className="text-lg sm:text-xl font-extrabold tracking-tight text-amber-700 font-mono">
                        {formatRupiah(total_expenses)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>Beban rutin</span>
                        <span>{formatRupiah(overview.total_recurring_expenses || 0)}</span>
                    </div>
                </div>
            </div>

            {/* 4. Laba Bersih (Net Profit) */}
            <div className={`p-4 rounded-xl bg-gradient-to-br ${
                net_profit >= 0
                    ? "from-emerald-50/70 via-white to-white border-emerald-200/90"
                    : "from-rose-50/70 via-white to-white border-rose-200/90"
            } border shadow-2xs flex flex-col justify-between space-y-2.5`}>
                <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                        net_profit >= 0 ? "text-emerald-800" : "text-rose-800"
                    } flex items-center gap-1.5`}>
                        <div className={`w-5 h-5 rounded-md ${
                            net_profit >= 0 ? "bg-emerald-700" : "bg-rose-600"
                        } text-white flex items-center justify-center`}>
                            <IconReceipt2 size={12} />
                        </div>
                        Laba Bersih
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-600">
                        <IconArrowUpRight size={12} className="text-emerald-600" /> {items_sold.toLocaleString("id-ID")} pcs
                    </span>
                </div>

                <div>
                    <div className={`text-lg sm:text-xl font-extrabold tracking-tight font-mono ${
                        net_profit >= 0 ? "text-emerald-700" : "text-rose-600"
                    }`}>
                        {formatRupiah(net_profit)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>Hasil bersih</span>
                        <span className="font-semibold text-slate-700">
                            {net_sales > 0 ? Math.round((net_profit / net_sales) * 100) : 0}% Net Margin
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
