"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconDotsVertical, IconPresentation } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary, SalesHistoryItem } from "../types";

interface RevenueChartProps {
  summary: DashboardSummary | undefined;
  history?: SalesHistoryItem[];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

function buildData(summary: DashboardSummary | undefined) {
  const gross = summary?.gross_sales ?? 0;
  const profit = summary?.gross_profit ?? 0;
  const demoGross = gross === 0 ? 40000 : gross;
  const demoProfit = profit === 0 ? 8000 : profit;
  const grossSeeds = [0.72, 0.52, 0.8, 0.5, 0.9, 1];
  const profitSeeds = [0.6, 0.4, 0.65, 0.35, 0.75, 0.8];
  return MONTHS.map((month, i) => ({
    month,
    revenue: Math.round(demoGross * grossSeeds[i]),
    profit: Math.round(demoProfit * profitSeeds[i]),
  }));
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; fill: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl space-y-1">
        <div className="font-bold text-slate-300 mb-1">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.fill }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-bold">{formatRupiah(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function RevenueChart({ summary, history }: RevenueChartProps) {
  const data = history && history.length > 0
    ? history.map((item) => ({
        month: item.period,
        revenue: item.gross_sales,
        profit: item.net_sales, // fallback to net_sales if history uses it
      }))
    : buildData(summary);
  const gross = summary?.gross_sales ?? 0;
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <IconPresentation size={14} className="stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Penjualan Produk
            </span>
          </div>
          <div className="flex items-center gap-2.5 mt-2">
            <span className="text-2xl font-black text-slate-800 tabular-nums tracking-tight">
              {formatRupiah(gross)}
            </span>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <IconDotsVertical size={16} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[10px] font-extrabold text-slate-500 border-b border-slate-50 pb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2 rounded-sm bg-indigo-500 inline-block" />
          Total Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2 rounded-sm bg-teal-500 inline-block" />
          Total Profit
        </span>
      </div>

      {/* Chart – only render in browser to avoid SSR warning */}
      <div style={{ width: "100%", height: 185 }}>
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barCategoryGap="25%"
              barGap={2}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#0d9488" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 8, fill: "#cbd5e1" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                  return `${v}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="revenue" name="Total Revenue" maxBarSize={16} radius={[3, 3, 0, 0]} fill="url(#colorRevenue)" className="transition-all duration-300 hover:opacity-90" />
              <Bar dataKey="profit" name="Total Profit" maxBarSize={16} radius={[3, 3, 0, 0]} fill="url(#colorProfit)" className="transition-all duration-300 hover:opacity-90" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
