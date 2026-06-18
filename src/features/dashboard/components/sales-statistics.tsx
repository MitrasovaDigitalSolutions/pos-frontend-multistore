"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardSummary } from "../types";
import { IconChartPie, IconDeviceAnalytics } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SalesStatisticsProps {
  summary: DashboardSummary | undefined;
  isLoading?: boolean;
}

const CATEGORIES = [
  { name: "Sepatu", color: "#6366f1" },
  { name: "Furniture", color: "#14b8a6" },
  { name: "Pakaian", color: "#f59e0b" },
  { name: "Lainnya", color: "#f43f5e" },
];

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 backdrop-blur-md text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-800">
        <span className="font-extrabold text-slate-300">{payload[0].name}: </span>
        <span className="font-black text-emerald-400">{payload[0].value}%</span>
      </div>
    );
  }
  return null;
};

export function SalesStatistics({ summary, isLoading }: SalesStatisticsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const products = summary?.top_products ?? [];
  const salesCount = summary?.sales_count ?? 0;

  // Build pie data: use top products if available, else use demo categories
  const hasProducts = products.length > 0;
  const total = hasProducts
    ? products.reduce((s, p) => s + p.revenue, 0)
    : 0;

  const pieData = hasProducts
    ? products.slice(0, 4).map((p, i) => ({
      name: p.product_name,
      value: total > 0 ? Math.round((p.revenue / total) * 100) : 25,
      color: CATEGORIES[i % CATEGORIES.length].color,
    }))
    : CATEGORIES.map((c, i) => ({
      name: c.name,
      value: [40, 30, 20, 10][i],
      color: c.color,
    }));

  const displayCategories = hasProducts
    ? products.slice(0, 4).map((p, i) => ({
      name: p.product_name.length > 15 ? p.product_name.slice(0, 15) + "…" : p.product_name,
      value: p.quantity,
      color: CATEGORIES[i % CATEGORIES.length].color,
    }))
    : CATEGORIES.map((c, i) => ({
      name: c.name,
      value: [40, 30, 20, 10][i],
      color: c.color,
    }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <IconChartPie size={14} className="stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Kategori Terlaris
          </span>
        </div>
        <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100/50">
          <IconDeviceAnalytics size={10} /> Live
        </span>
      </div>

      {/* Main Content (Donut + Legend) */}
      <div className="flex flex-col items-center justify-center flex-1 w-full my-auto">
        {/* Donut Container with Absolute Centered Labels */}
        <div className="relative flex items-center justify-center mx-auto" style={{ width: 140, height: 140 }}>
          {isLoading ? (
            <Skeleton className="w-[130px] h-[130px] rounded-full absolute" />
          ) : (
            mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} className="outline-none focus:outline-none transition-all duration-300 hover:opacity-90" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )
          )}

          {/* Centered label inside Donut */}
          {!isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Total</span>
              <span className="text-2xl font-black text-slate-800 mt-1 tracking-tight leading-none tabular-nums">
                {salesCount}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">Transaksi</span>
            </div>
          )}
        </div>

        {/* Legend: Stacked & Styled Grid */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-3.5 mt-6 w-full border-t border-slate-50 pt-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))
          ) : (
            displayCategories.map((cat, i) => (
              <div key={i} className="flex flex-col gap-0.5 group cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125"
                    style={{ background: cat.color }}
                  />
                  <span className="text-[10px] font-bold text-slate-500 truncate max-w-[100px] group-hover:text-slate-800 transition-colors" title={cat.name}>
                    {cat.name}
                  </span>
                </div>
                <span className="text-[11px] font-extrabold text-slate-800 ml-3.5 tabular-nums">
                  {cat.value} <span className="text-[9px] text-slate-400 font-medium">pcs</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      {/* <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
          Total Transaksi Penjualan
        </span>
        <span className="text-xs font-black text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded-md tabular-nums">
          {salesCount} Trx
        </span>
      </div> */}
    </div>
  );
}
