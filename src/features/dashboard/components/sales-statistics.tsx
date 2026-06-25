"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowRight, IconChartPie } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardSummary } from "../types";

interface SalesStatisticsProps {
  summary: DashboardSummary | undefined;
  isLoading?: boolean;
}

const CATEGORIES = [
  { name: "Sepatu", color: "#6366f1" },  // Indigo
  { name: "Furniture", color: "#14b8a6" }, // Teal
  { name: "Pakaian", color: "#f59e0b" },   // Amber
  { name: "Makanan", color: "#8b5cf6" },   // Violet
  { name: "Lainnya", color: "#f43f5e" },   // Rose
];

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      percentage: number;
    };
  }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 backdrop-blur-md text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-800">
        <span className="font-extrabold text-slate-300">{data.name}: </span>
        <span className="font-black text-emerald-400">{data.value} Pcs ({data.percentage}%)</span>
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

  const categoriesData = summary?.top_categories ?? [];
  const salesCount = summary?.sales_count ?? 0;

  const hasCategories = categoriesData.length > 0;

  // 1. Sort categories by quantity to show the highest sales volume first
  const sortedCategories = [...categoriesData].sort((a, b) => b.quantity - a.quantity);

  // 2. Group into exactly 5 categories (top 4 + Lainnya for the rest)
  let processedCategories: Array<{ name: string; quantity: number; color: string }> = [];

  if (hasCategories) {
    if (sortedCategories.length <= 5) {
      processedCategories = sortedCategories.map((c, i) => ({
        name: c.category_name,
        quantity: c.quantity,
        color: CATEGORIES[i % CATEGORIES.length].color,
      }));
    } else {
      // Top 4 categories
      const top4 = sortedCategories.slice(0, 4);
      processedCategories = top4.map((c, i) => ({
        name: c.category_name,
        quantity: c.quantity,
        color: CATEGORIES[i].color,
      }));
      // Group the rest into "Lainnya"
      const others = sortedCategories.slice(4);
      const othersQuantity = others.reduce((sum, c) => sum + c.quantity, 0);
      processedCategories.push({
        name: "Lainnya",
        quantity: othersQuantity,
        color: CATEGORIES[4].color,
      });
    }
  } else {
    // Fallback/Demo categories
    processedCategories = CATEGORIES.map((c, i) => ({
      name: c.name,
      quantity: [40, 30, 20, 10, 5][i],
      color: c.color,
    }));
  }

  // 3. Calculate total quantity of these 5 points for percentage calculation
  const totalQuantity = processedCategories.reduce((sum, c) => sum + c.quantity, 0);

  // 4. Build pie data
  const pieData = processedCategories.map((c) => ({
    name: c.name,
    value: c.quantity, // Value for Pie slice size
    percentage: totalQuantity > 0 ? Math.round((c.quantity / totalQuantity) * 100) : 0,
    color: c.color,
  }));

  // 5. Build display categories for legend (truncated if too long)
  const displayCategories = processedCategories.map((c) => ({
    name: c.name,
    displayName: c.name.length > 15 ? c.name.slice(0, 15) + "…" : c.name,
    value: c.quantity,
    percentage: totalQuantity > 0 ? Math.round((c.quantity / totalQuantity) * 100) : 0,
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
        <Link
          href="/admin/reports/sales/by-category"
          className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1 transition-all"
        >
          Detail
          <IconArrowRight size={10} className="stroke-[2.5]" />
        </Link>
      </div>

      {/* Main Content (Donut + Legend) */}
      <div className="flex flex-col items-center justify-center flex-1 w-full my-auto">
        {/* Donut Container with Absolute Centered Labels */}
        <div className="relative flex items-center justify-center mx-auto" style={{ width: 130, height: 130 }}>
          {isLoading ? (
            <Skeleton className="w-[120px] h-[120px] rounded-full absolute" />
          ) : (
            mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={58}
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
                  <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50 }} />
                </PieChart>
              </ResponsiveContainer>
            )
          )}

          {/* Centered label inside Donut */}
          {!isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none z-0">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">Total</span>
              <span className="text-2xl font-black text-slate-800 mt-1 tracking-tight leading-none tabular-nums">
                {salesCount}
              </span>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5 leading-none">Transaksi</span>
            </div>
          )}
        </div>

        {/* Legend: 3 on Top and 2 on Bottom */}
        <div className="flex flex-col gap-2.5 mt-4 w-full border-t border-slate-50 pt-4">
          {/* Row 1: Top 3 Items */}
          <div className="flex justify-center gap-x-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 min-w-[75px]">
                  <div className="flex items-center gap-1 justify-center">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2.5 w-10 mt-0.5" />
                </div>
              ))
            ) : (
              displayCategories.slice(0, 3).map((cat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center min-w-[75px] group hover:bg-slate-50/50 p-1 rounded-lg transition-colors">
                  <div className="flex items-center gap-1.5 justify-center">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125 shadow-sm"
                      style={{ background: cat.color }}
                    />
                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px] group-hover:text-slate-800 transition-colors" title={cat.name}>
                      {cat.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 justify-center">
                    <span className="text-[9px] font-bold text-slate-500 tabular-nums">
                      {cat.value} Pcs
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Row 2: Bottom 2 Items */}
          <div className="flex justify-center gap-x-4">
            {isLoading ? (
              Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 min-w-[75px]">
                  <div className="flex items-center gap-1 justify-center">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2.5 w-10 mt-0.5" />
                </div>
              ))
            ) : (
              displayCategories.slice(3, 5).map((cat, i) => (
                <div key={i} className="flex flex-col items-center justify-center text-center min-w-[75px] group hover:bg-slate-50/50 p-1 rounded-lg transition-colors">
                  <div className="flex items-center gap-1.5 justify-center">
                    <span
                      className="w-2 h-2 rounded-full shrink-0 transition-transform group-hover:scale-125 shadow-sm"
                      style={{ background: cat.color }}
                    />
                    <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px] group-hover:text-slate-800 transition-colors" title={cat.name}>
                      {cat.displayName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 justify-center">
                    <span className="text-[9px] font-bold text-slate-500 tabular-nums">
                      {cat.value} Pcs
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
