"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesByCategoryItem } from "../../types";

const PALETTE = [
  "#6366f1", // Indigo
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#8b5cf6", // Violet
  "#f43f5e", // Rose
  "#10b981", // Emerald
  "#0ea5e9", // Sky
  "#fb923c", // Orange
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: SalesByCategoryItem & { color: string };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 backdrop-blur-md text-white text-[10px] rounded-lg px-3 py-2 shadow-xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150 space-y-0.5">
        <div className="font-extrabold text-slate-200 mb-1">{data.category}</div>
        <div className="font-black text-emerald-400">{formatRupiah(data.total_sales)}</div>
        {data.total_profit !== undefined && (
          <div className="text-slate-400 text-[9px]">
            Keuntungan:{" "}
            <span className={`font-bold ${data.total_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {data.total_profit < 0 ? `-${formatRupiah(Math.abs(data.total_profit))}` : formatRupiah(data.total_profit)}
            </span>
          </div>
        )}
        <div className="text-slate-400 text-[9px]">
          Kontribusi: <span className="font-bold text-slate-300">{data.percentage_sales.toFixed(2)}%</span>
        </div>
        <div className="text-slate-400 text-[9px]">
          Qty: <span className="font-bold text-slate-300">{data.total_quantity.toLocaleString("id-ID")} pcs</span>
        </div>
      </div>
    );
  }
  return null;
};

interface SalesByCategoryChartProps {
  data: SalesByCategoryItem[];
  isLoading?: boolean;
}

export function SalesByCategoryChart({ data, isLoading }: SalesByCategoryChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-3.5 w-40" />
        </div>
        <Skeleton className="w-full h-[220px] rounded-xl" />
      </div>
    );
  }

  const chartData = data
    .filter((item) => item.total_sales > 0)
    .map((item, i) => ({
      ...item,
      name: item.category.length > 14 ? item.category.slice(0, 14) + "…" : item.category,
      color: PALETTE[i % PALETTE.length],
    }));

  const hasData = chartData.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xs font-extrabold text-slate-800">Grafik Analisis Per Kategori</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Perbandingan total penjualan dan keuntungan bersih per kategori</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-indigo-500 rounded-sm shrink-0" />
            <span className="text-slate-600">Total Penjualan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-500 rounded-sm shrink-0" />
            <span className="text-slate-600">Total Keuntungan</span>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-[220px] text-[11px] text-slate-400 font-medium">
          Tidak ada data penjualan untuk periode ini.
        </div>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 32, left: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  dy={6}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: "#cbd5e1" }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  tickFormatter={(v) => {
                    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`;
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
                    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                    return `${v}`;
                  }}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#f1f5f9", radius: 6 }}
                  wrapperStyle={{ zIndex: 50 }}
                />
                <Bar dataKey="total_sales" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-sales-${index}`}
                      className="outline-none focus:outline-none transition-opacity duration-200 hover:opacity-85 cursor-pointer"
                    />
                  ))}
                </Bar>
                <Bar dataKey="total_profit" radius={[4, 4, 0, 0]} maxBarSize={16}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-profit-${index}`}
                      fill={entry.total_profit >= 0 ? "#10b981" : "#f43f5e"}
                      className="outline-none focus:outline-none transition-opacity duration-200 hover:opacity-85 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}
