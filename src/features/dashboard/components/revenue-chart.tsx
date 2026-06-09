"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconDotsVertical } from "@tabler/icons-react";
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
  const net = summary?.net_sales ?? 0;
  const gross = summary?.gross_sales ?? 0;
  const demoGross = gross === 0 ? 4000 : gross;
  const demoNet = net === 0 ? 2500 : net;
  const grossSeeds = [0.72, 0.52, 0.8, 0.5, 0.9, 1];
  const netSeeds = [0.6, 0.4, 0.65, 0.35, 0.75, 0.8];
  return MONTHS.map((month, i) => ({
    month,
    revenue: Math.round(demoGross * grossSeeds[i]),
    profit: Math.round(demoNet * netSeeds[i]),
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
        profit: item.net_sales,
      }))
    : buildData(summary);
  const gross = summary?.gross_sales ?? 0;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Total Penjualan Produk
          </p>
          <div className="flex items-center gap-2.5 mt-1.5">
            <span className="text-2xl font-extrabold text-slate-800 tabular-nums">
              {formatRupiah(gross)}
            </span>
            {/* <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <IconTrendingUp size={10} />
              +45%
            </span> */}
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-500 transition-colors">
          <IconDotsVertical size={16} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[10px] font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-amber-600 inline-block" />
          Total Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-2 rounded-sm bg-emerald-600 inline-block" />
          Total Profit
        </span>
      </div>

      {/* Chart – only render in browser to avoid SSR width=-1 warning */}
      <div style={{ width: "100%", height: 185 }}>
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              barCategoryGap="25%"
              barGap={2}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
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
                  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
                  return `${v}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="revenue" name="Total Revenue" maxBarSize={20} radius={[4, 4, 0, 0]} fill="#f59e0b" />
              <Bar dataKey="profit" name="Total Profit" maxBarSize={20} radius={[4, 4, 0, 0]} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
