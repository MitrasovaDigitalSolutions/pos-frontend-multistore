"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CentralOverviewData } from "../../types/central-reports-types";

interface CentralKpiCardsProps {
    overview?: CentralOverviewData;
    isLoading: boolean;
}

export function CentralKpiCards({ overview, isLoading }: CentralKpiCardsProps) {
    if (isLoading || !overview) {
        return (
            <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 animate-pulse">
                <Skeleton className="h-24 w-full" />
            </Card>
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
        <Card className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
                {/* 1. Omset Penjualan */}
                <div className="p-5 flex flex-col justify-between bg-slate-50/40">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Total Penjualan
                        </span>
                        <h4 className="text-xs font-bold text-slate-700 mt-1">
                            Omset Bersih (Net Sales)
                        </h4>
                        <div className="text-xl font-extrabold tracking-tight mt-1 text-emerald-600 font-mono">
                            {formatRupiah(net_sales)}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 leading-normal">
                        {sales_count} transaksi dari {stores_count} cabang | Diskon: {formatRupiah(discount_total)}
                    </p>
                </div>

                {/* 2. Laba Kotor */}
                <div className="p-5 flex flex-col justify-between bg-white">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Keuntungan Kotor
                        </span>
                        <h4 className="text-xs font-bold text-slate-700 mt-1">
                            Laba Kotor (Gross Profit)
                        </h4>
                        <div className="text-xl font-extrabold tracking-tight mt-1 text-blue-600 font-mono">
                            {formatRupiah(gross_profit)}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 leading-normal">
                        Margin Laba: <strong className="text-slate-700">{profit_margin}%</strong> dari omset bersih.
                    </p>
                </div>

                {/* 3. Pengeluaran */}
                <div className="p-5 flex flex-col justify-between bg-slate-50/40">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Beban & Operasional
                        </span>
                        <h4 className="text-xs font-bold text-slate-700 mt-1">
                            Total Pengeluaran
                        </h4>
                        <div className="text-xl font-extrabold tracking-tight mt-1 text-amber-600 font-mono">
                            {formatRupiah(total_expenses)}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 leading-normal">
                        Pengeluaran Rutin: {formatRupiah(overview.total_recurring_expenses || 0)}
                    </p>
                </div>

                {/* 4. Laba Bersih */}
                <div className="p-5 flex flex-col justify-between bg-white">
                    <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Hasil Akhir
                        </span>
                        <h4 className="text-xs font-bold text-slate-700 mt-1">
                            Laba Bersih (Net Profit)
                        </h4>
                        <div className={`text-xl font-extrabold tracking-tight mt-1 font-mono ${net_profit >= 0 ? "text-slate-900" : "text-rose-600"}`}>
                            {formatRupiah(net_profit)}
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 leading-normal">
                        Total barang terjual: <strong className="text-slate-700">{items_sold.toLocaleString("id-ID")} pcs</strong>
                    </p>
                </div>
            </div>
        </Card>
    );
}
