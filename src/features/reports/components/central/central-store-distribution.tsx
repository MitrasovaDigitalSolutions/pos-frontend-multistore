"use client";

import { Card } from "@/components/ui/card";
import { Scrollable } from "@/components/ui/scrollable";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { CentralStoreBreakdown } from "../../types/central-reports-types";

interface CentralStoreDistributionProps {
    stores: CentralStoreBreakdown[];
    totalNetSales: number;
    isLoading: boolean;
}

export function CentralStoreDistribution({
    stores,
    totalNetSales,
    isLoading,
}: CentralStoreDistributionProps) {
    if (isLoading) {
        return (
            <Card className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs h-72 animate-pulse" />
        );
    }

    const sortedStores = [...stores].sort((a, b) => b.net_sales - a.net_sales);

    return (
        <Card className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Kontribusi Cabang Toko ({stores.length})
                    </h4>
                    <p className="text-[10px] text-slate-400">Pangsa omset & laba per cabang</p>
                </div>
            </div>

            <Scrollable className="max-h-[280px] pr-2">
                <div className="space-y-3">
                    {sortedStores.map((store) => {
                        const percentage =
                            totalNetSales > 0
                                ? Math.round((store.net_sales / totalNetSales) * 100)
                                : 0;

                        return (
                            <div
                                key={store.store_uid}
                                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 space-y-2.5 hover:bg-slate-100/60 transition-colors"
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 font-bold text-slate-800 truncate">
                                        <span className="truncate">{store.store_name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono font-bold text-slate-900 shrink-0 text-xs">
                                        <span>{formatRupiah(store.net_sales)}</span>
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span>{store.sales_count} Trx | Laba: <strong className="text-slate-700 font-mono">{formatRupiah(store.net_profit)}</strong></span>
                                    <span className="font-semibold text-emerald-700">Margin {store.profit_margin}%</span>
                                </div>
                            </div>
                        );
                    })}

                    {stores.length === 0 && (
                        <div className="text-center py-8 text-xs text-slate-400">
                            Belum ada data transaksi cabang.
                        </div>
                    )}
                </div>
            </Scrollable>
        </Card>
    );
}
