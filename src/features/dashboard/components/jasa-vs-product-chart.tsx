"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconChartBar } from "@tabler/icons-react";
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
import type { JasaVsProductData } from "../types";
import { cn } from "@/lib/utils";

type ChartTab = "profit" | "gross";


interface JasaVsProductChartProps {
  data: JasaVsProductData | undefined;
  isLoading?: boolean;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: {
      name: string;
      percentage: number;
      quantity: number;
      unit: string;
    };
  }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-950/95 backdrop-blur-md text-white text-[10px] rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="font-extrabold text-slate-300 mb-0.5">{data.name}</div>
        <div className="font-black text-emerald-400">
          {formatRupiah(payload[0].value)}
        </div>
        <div className="text-slate-400 text-[9px] mt-0.5">
          Kontribusi: {data.percentage.toFixed(0)}%
        </div>
        <div className="text-slate-400 text-[9px]">
          Jumlah: {data.quantity} {data.unit}
        </div>
      </div>
    );
  }
  return null;
};

export function JasaVsProductChart({ data, isLoading }: JasaVsProductChartProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ChartTab>("profit");

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const total_jasa_sales = data?.total_jasa_sales ?? 0;
  const total_product_sales = data?.total_product_sales ?? 0;
  const total_jasa_profit = data?.total_jasa_profit ?? 0;
  const total_product_profit = data?.total_product_profit ?? 0;
  const total_jasa_quantity = data?.total_jasa_quantity ?? 0;
  const total_product_quantity = data?.total_product_quantity ?? 0;

  const isProfit = activeTab === "profit";

  const totalValue = isProfit
    ? total_jasa_profit + total_product_profit
    : total_jasa_sales + total_product_sales;

  const productValue = isProfit ? total_product_profit : total_product_sales;
  const jasaValue = isProfit ? total_jasa_profit : total_jasa_sales;

  const productPct = totalValue > 0 ? (productValue / totalValue) * 100 : 0;
  const jasaPct = totalValue > 0 ? (jasaValue / totalValue) * 100 : 0;

  const chartData = [
    {
      name: "Produk",
      value: productValue,
      percentage: productPct,
      quantity: total_product_quantity,
      unit: "Item",
      color: "#6366f1", // Indigo
    },
    {
      name: "Jasa",
      value: jasaValue,
      percentage: jasaPct,
      quantity: total_jasa_quantity,
      unit: "Jasa",
      color: "#14b8a6", // Teal
    },
  ];

  const renderSkeletons = () => (
    <div className="flex flex-col justify-between h-full w-full gap-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-50">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-3.5 w-24" />
      </div>

      {/* Chart Skeleton */}
      <Skeleton className="w-full h-[120px] rounded-xl my-1" />

      {/* Legend Skeleton */}
      <div className="grid grid-cols-2 gap-2.5 border-t border-slate-50 pt-2.5">
        <div className="space-y-1">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-2.5 w-12 rounded" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-10 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-2.5 w-12 rounded" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-full min-h-[280px]">
        {renderSkeletons()}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between h-full min-h-[280px] select-none">
      {/* Header with inline Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-50">
        <div className="flex items-center gap-1.5 select-none">
          <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <IconChartBar size={12} className="stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {isProfit ? "Komposisi Profit" : "Komposisi Penjualan"}
          </span>
        </div>

        {/* Small Switcher buttons group */}
        <div className="flex bg-slate-50 p-0.5 rounded-md border border-slate-100 text-[9px] font-bold shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("profit")}
            className={cn(
              "px-2 py-0.5 rounded-sm transition-all select-none",
              activeTab === "profit"
                ? "bg-white text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50"
                : "text-slate-400 hover:text-slate-600 border border-transparent"
            )}
          >
            Profit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("gross")}
            className={cn(
              "px-2 py-0.5 rounded-sm transition-all select-none",
              activeTab === "gross"
                ? "bg-white text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50"
                : "text-slate-400 hover:text-slate-600 border border-transparent"
            )}
          >
            Gross
          </button>
        </div>
      </div>

      {/* Main Content: Bar Chart */}
      <div style={{ width: "100%", height: 120 }} className="my-2">
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 5, bottom: 0, left: -25 }}
              barSize={28}
            >
              <XAxis
                dataKey="name"
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc", radius: 6 }}
                wrapperStyle={{ zIndex: 50 }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="outline-none focus:outline-none transition-all duration-300 hover:opacity-90 cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend Section */}
      <div className="grid grid-cols-2 gap-2.5 border-t border-slate-50 pt-2.5">
        {/* Produk */}
        <div className="flex flex-col gap-0.5 p-1.5 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/50">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
            <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider">
              Produk
            </span>
          </div>
          <div className="text-[11px] font-black text-slate-800 tabular-nums mt-0.5">
            {formatRupiah(productValue)}
          </div>
          <div className="text-[8px] font-semibold text-slate-400">
            {productPct.toFixed(0)}% | {total_product_quantity} Item
          </div>
        </div>

        {/* Jasa */}
        <div className="flex flex-col gap-0.5 p-1.5 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/50">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
            <span className="text-[8px] font-extrabold text-slate-500 uppercase tracking-wider">
              Jasa
            </span>
          </div>
          <div className="text-[11px] font-black text-slate-800 tabular-nums mt-0.5">
            {formatRupiah(jasaValue)}
          </div>
          <div className="text-[8px] font-semibold text-slate-400">
            {jasaPct.toFixed(0)}% | {total_jasa_quantity} Jasa
          </div>
        </div>
      </div>
    </div>
  );
}
