"use client";

import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconChartDots, IconSwitchHorizontal } from "@tabler/icons-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { CentralSalesTrendData } from "../../types/central-reports-types";

interface CentralSalesChartProps {
    trendData?: CentralSalesTrendData;
    byStore: boolean;
    onByStoreToggle: (val: boolean) => void;
    isLoading: boolean;
}

const STORE_COLORS = [
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#ec4899", // Pink
    "#06b6d4", // Cyan
];

const CustomTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-xl text-slate-800 text-xs space-y-1.5 z-50">
                <div className="font-bold text-slate-700 border-b border-slate-100 pb-1 text-[11px]">
                    Periode: {label}
                </div>
                {payload.map((p) => (
                    <div key={p.name} className="flex items-center justify-between gap-4 text-[11px]">
                        <div className="flex items-center gap-1.5">
                            <span
                                className="inline-block w-2 h-2 rounded-full shrink-0 shadow-2xs"
                                style={{ background: p.color }}
                            />
                            <span className="text-slate-600 font-medium">{p.name}:</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function CentralSalesChart({
    trendData,
    byStore,
    onByStoreToggle,
    isLoading,
}: CentralSalesChartProps) {
    const mainSeries = trendData?.series || [];
    const storesSeries = trendData?.stores || [];

    // Build dataset when byStore = false (Total Consolidation)
    const totalChartData = mainSeries.map((item) => ({
        date: item.date,
        "Omset Bersih": item.net_sales,
        "Laba Kotor": item.gross_profit,
        Pengeluaran: item.expenses,
    }));

    // Build dataset when byStore = true (Per-Store Comparison)
    const storeMapByDate: Record<string, Record<string, number>> = {};

    storesSeries.forEach((st) => {
        st.data?.forEach((item) => {
            if (!storeMapByDate[item.date]) {
                storeMapByDate[item.date] = { date: item.date as unknown as number };
            }
            storeMapByDate[item.date][st.store_name] = item.net_sales;
        });
    });

    const perStoreChartData = Object.values(storeMapByDate);
    const activeChartData = byStore && perStoreChartData.length > 0 ? perStoreChartData : totalChartData;

    return (
        <Card className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <IconChartDots size={16} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            {byStore ? "Tren Penjualan Per Cabang" : "Tren Omset, Laba & Beban"}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                            {byStore
                                ? "Garis perbandingan omset masing-masing cabang"
                                : "Agregasi Omset Bersih, Laba Kotor, dan Pengeluaran"}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => onByStoreToggle(!byStore)}
                    className={`h-7 px-2.5 text-[11px] font-bold rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                        byStore
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs hover:bg-emerald-700"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                    title="Beralih antara tren total vs tren per-cabang"
                >
                    <IconSwitchHorizontal size={13} />
                    <span>Breakdown Cabang: {byStore ? "ON" : "OFF"}</span>
                </button>
            </div>

            {isLoading ? (
                <div className="h-60 w-full bg-slate-50/70 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
                    Memuat grafik tren penjualan...
                </div>
            ) : activeChartData.length === 0 ? (
                <div className="h-60 w-full bg-slate-50/50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                    Tidak ada data tren penjualan pada rentang tanggal ini.
                </div>
            ) : (
                <div className="h-60 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                        {byStore && storesSeries.length > 0 ? (
                            <LineChart data={perStoreChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 10 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 10 }}
                                    tickFormatter={(val) =>
                                        val >= 1_000_000
                                            ? `${(val / 1_000_000).toFixed(0)}Jt`
                                            : val >= 1_000
                                            ? `${(val / 1_000).toFixed(0)}Rb`
                                            : val
                                    }
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {storesSeries.map((st, idx) => (
                                    <Line
                                        key={st.store_uid}
                                        type="monotone"
                                        dataKey={st.store_name}
                                        stroke={STORE_COLORS[idx % STORE_COLORS.length]}
                                        strokeWidth={2.5}
                                        dot={{ r: 2 }}
                                        activeDot={{ r: 4 }}
                                    />
                                ))}
                            </LineChart>
                        ) : (
                            <AreaChart data={totalChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientNetSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradientGrossProfit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gradientExpenses" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 10 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 10 }}
                                    tickFormatter={(val) =>
                                        val >= 1_000_000
                                            ? `${(val / 1_000_000).toFixed(0)}Jt`
                                            : val >= 1_000
                                            ? `${(val / 1_000).toFixed(0)}Rb`
                                            : val
                                    }
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="Omset Bersih"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#gradientNetSales)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Laba Kotor"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#gradientGrossProfit)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="Pengeluaran"
                                    stroke="#f59e0b"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#gradientExpenses)"
                                />
                            </AreaChart>
                        )}
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
}
