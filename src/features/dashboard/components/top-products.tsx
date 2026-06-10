"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconTrophy } from "@tabler/icons-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary } from "../types";

interface TopProductsProps {
  summary: DashboardSummary | undefined;
}

const RANK_COLORS = [
  { bar: "#10b981", badge: "bg-emerald-500", text: "text-white" },
  { bar: "#38bdf8", badge: "bg-sky-400", text: "text-white" },
  { bar: "#f59e0b", badge: "bg-amber-400", text: "text-white" },
  { bar: "#f87171", badge: "bg-red-400", text: "text-white" },
  { bar: "#a78bfa", badge: "bg-violet-400", text: "text-white" },
];

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      name: string;
    };
  }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 shadow-2xl text-white text-xs">
        <div className="font-bold">{payload[0]?.payload?.name}</div>
        <div className="text-slate-300 mt-0.5">
          {formatRupiah(payload[0]?.value)}
        </div>
      </div>
    );
  }
  return null;
};

export function TopProducts({ summary }: TopProductsProps) {
  const products = summary?.top_products ?? [];

  const chartData = products.slice(0, 5).map((p, i) => ({
    name:
      p.product_name.length > 14
        ? p.product_name.slice(0, 14) + "…"
        : p.product_name,
    fullName: p.product_name,
    revenue: p.revenue,
    qty: p.quantity,
    color: RANK_COLORS[i]?.bar ?? "#94a3b8",
  }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <IconTrophy size={17} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Produk Terlaris</div>
            <div className="text-[10px] text-slate-400">Top 5 berdasarkan omzet</div>
          </div>
        </div>
      </div>

      {products.length > 0 ? (
        <>
          {/* Horizontal Bar Chart */}
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                barCategoryGap="25%"
                margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 9, fill: "#cbd5e1" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`;
                    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                    return `${v}`;
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 9, fill: "#64748b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="revenue" radius={[0, 6, 6, 0]} maxBarSize={14}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* List */}
          <div className="space-y-2">
            {products.slice(0, 5).map((tp, i) => {
              const colors = RANK_COLORS[i] ?? RANK_COLORS[4];
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl p-2.5 hover:bg-slate-50 transition-colors"
                >
                  <div
                    className={`w-6 h-6 rounded-lg ${colors.badge} ${colors.text} flex items-center justify-center text-[10px] font-extrabold shrink-0`}
                  >
                    {i + 1}
                  </div>
                  <div className="grow min-w-0">
                    <div className="font-bold text-[11px] text-slate-800 truncate">
                      {tp.product_name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-medium">
                      Terjual {tp.quantity} pcs
                    </div>
                  </div>
                  <span className="font-bold text-xs text-slate-900 tabular-nums shrink-0">
                    {formatRupiah(tp.revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-slate-300 gap-2">
          <IconTrophy size={32} strokeWidth={1.5} />
          <span className="text-xs font-medium text-slate-400">
            Belum ada data penjualan.
          </span>
        </div>
      )}
    </div>
  );
}
