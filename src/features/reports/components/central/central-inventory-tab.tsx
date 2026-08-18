"use client";

import { Card } from "@/components/ui/card";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBox } from "@tabler/icons-react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { CentralInventoryCards } from "./central-inventory-cards";
import type { CentralInventoryData } from "../../types/central-reports-types";

interface CentralInventoryTabProps {
    data?: CentralInventoryData;
    isLoading: boolean;
}

const CustomInventoryTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 shadow-xl text-slate-800 text-xs space-y-1 z-50">
                <div className="font-bold text-slate-700">{label}</div>
                <div className="text-emerald-700 font-mono font-bold">
                    Valuasi Stok: {formatRupiah(payload[0]?.value || 0)}
                </div>
            </div>
        );
    }
    return null;
};

export function CentralInventoryTab({ data, isLoading }: CentralInventoryTabProps) {
    const chartData = (data?.stores || []).map((s) => ({
        store_name: s.store_name,
        "Valuasi Stok": s.stock_value,
        "Total Qty": s.total_qty,
    }));

    return (
        <div className="space-y-4 sm:space-y-5">
            {/* 1. Inventory Summary Cards */}
            <CentralInventoryCards data={data} isLoading={isLoading} />

            {/* 2. Visual Inventory Comparison Chart */}
            <Card className="bg-white border border-slate-100 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3.5">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
                        <IconBox size={16} />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Komparasi Valuasi Stok Antar Cabang
                        </h3>
                        <p className="text-[10px] text-slate-400">
                            Perbandingan total nilai barang berdasarkan harga beli (HPP)
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-52 w-full bg-slate-50 rounded-xl animate-pulse" />
                ) : chartData.length === 0 ? (
                    <div className="h-52 w-full bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                        Belum ada data stok cabang.
                    </div>
                ) : (
                    <div className="h-56 w-full pt-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="store_name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
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
                                <Tooltip content={<CustomInventoryTooltip />} />
                                <Bar dataKey="Valuasi Stok" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        </div>
    );
}
