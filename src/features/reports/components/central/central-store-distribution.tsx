"use client";

import { Card } from "@/components/ui/card";
import { Scrollable } from "@/components/ui/scrollable";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBuildingStore, IconTrophy } from "@tabler/icons-react";
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
            <Card className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-2xs h-80 animate-pulse" />
        );
    }

    const sortedStores = [...stores].sort((a, b) => b.net_sales - a.net_sales);

    return (
        <Card className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <IconTrophy size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Peringkat Omset Cabang
                        </h4>
                        <p className="text-[10px] text-slate-400">Kontribusi penjualan & laba per cabang</p>
                    </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {stores.length} Cabang
                </span>
            </div>

            <Scrollable className="max-h-[250px] pr-1.5">
                <div className="space-y-2.5">
                    {sortedStores.map((store, idx) => {
                        const percentage =
                            totalNetSales > 0
                                ? Math.round((store.net_sales / totalNetSales) * 100)
                                : 0;

                        return (
                            <div
                                key={store.store_uid}
                                className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2 hover:bg-slate-100/70 transition-colors"
                            >
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                                            idx === 0
                                                ? "bg-amber-100 text-amber-800 border border-amber-300/80"
                                                : idx === 1
                                                ? "bg-slate-200 text-slate-700"
                                                : "bg-slate-100 text-slate-500"
                                        }`}>
                                            #{idx + 1}
                                        </span>
                                        <span className="font-bold text-slate-900 truncate">{store.store_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900 shrink-0 text-xs">
                                        <span>{formatRupiah(store.net_sales)}</span>
                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                                            {percentage}%
                                        </span>
                                    </div>
                                </div>

                                <div className="w-full h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span>{store.sales_count} Transaksi</span>
                                    <span className="font-semibold text-emerald-700">
                                        Laba: {formatRupiah(store.net_profit)} ({store.profit_margin}%)
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {stores.length === 0 && (
                        <div className="text-center py-8 text-xs text-slate-400">
                            <IconBuildingStore size={24} className="mx-auto mb-1 text-slate-300" />
                            Belum ada data transaksi cabang.
                        </div>
                    )}
                </div>
            </Scrollable>
        </Card>
    );
}
