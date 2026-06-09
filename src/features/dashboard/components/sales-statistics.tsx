"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardSummary } from "../types";

interface SalesStatisticsProps {
  summary: DashboardSummary | undefined;
}

const CATEGORIES = [
  { name: "Sepatu", color: "#10b981" },
  { name: "Furniture", color: "#f59e0b" },
  { name: "Pakaian", color: "#f87171" },
];

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
        <span className="font-bold">{payload[0].name}: </span>
        <span>{payload[0].value}%</span>
      </div>
    );
  }
  return null;
};

export function SalesStatistics({ summary }: SalesStatisticsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
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
      name: p.product_name.length > 14 ? p.product_name.slice(0, 14) + "…" : p.product_name,
      value: p.quantity,
      color: CATEGORIES[i % CATEGORIES.length].color,
    }))
    : CATEGORIES.map((c, i) => ({
      name: c.name,
      value: [40, 30, 20, 10][i],
      color: c.color,
    }));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-0 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Total Statistik Penjualan
        </p>
        {/* <select className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 cursor-pointer outline-none">
          <option>Monthly</option>
          <option>Weekly</option>
          <option>Daily</option>
        </select> */}
      </div>

      {/* Donut + Legend */}
      <div className="flex items-center gap-4 flex-1">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: 130, height: 130 }}>
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={62}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Center label */}

        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {displayCategories.map((cat, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[90px]">
                  {cat.name}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-500 tabular-nums">
                {cat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Total Transaksi Penjualan
        </span>
        <span className="text-[11px] font-extrabold text-slate-700 tabular-nums">
          {salesCount}
        </span>
      </div>
    </div>
  );
}
