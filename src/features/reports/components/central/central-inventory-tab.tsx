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
        <div className="space-y-6">
            {/* 1. Inventory Summary Cards */}
            <CentralInventoryCards data={data} isLoading={isLoading} />

            {/* 2. Visual Inventory Comparison Chart */}
            <Card className="bg-white border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/80">
                        <IconBox size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Komparasi Valuasi Stok Antar Cabang
                        </h3>
                        <p className="text-[11px] text-slate-400">
                            Perbandingan total nilai barang berdasarkan harga beli (HPP)
                        </p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-56 w-full bg-slate-50 rounded-xl animate-pulse" />
                ) : chartData.length === 0 ? (
                    <div className="h-56 w-full bg-slate-50 flex items-center justify-center text-xs text-slate-400">
                        Belum ada data stok cabang.
                    </div>
                ) : (
                    <div className="h-64 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="store_name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                    tickFormatter={(val) =>
                                        val >= 1_000_000
                                            ? `${(val / 1_000_000).toFixed(0)}Jt`
                                            : val
                                    }
                                />
                                <Tooltip content={<CustomInventoryTooltip />} />
                                <Bar dataKey="Valuasi Stok" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
        </div>
    );
}
