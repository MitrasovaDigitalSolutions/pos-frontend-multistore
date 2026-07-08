"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSalesHistory } from "@/features/dashboard/api/dashboard-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPresentation } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { FormSelect } from "@/components/forms/form-select";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary } from "../types";
import { formatDate as utilsFormatDate } from "@/lib/date-utils";

interface RevenueChartProps {
  summary: DashboardSummary | undefined;
  from?: string;
  to?: string;
}

interface ChartFilterValues {
  interval: "daily" | "weekly" | "monthly";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

function buildData(summary: DashboardSummary | undefined) {
  const currentYear = new Date().getFullYear();
  const gross = summary?.gross_sales ?? 0;
  const profit = summary?.gross_profit ?? 0;
  const demoGross = gross === 0 ? 40000 : gross;
  const demoProfit = profit === 0 ? 8000 : profit;
  const grossSeeds = [0.72, 0.52, 0.8, 0.5, 0.9, 1];
  const profitSeeds = [0.6, 0.4, 0.65, 0.35, 0.75, 0.8];
  const expensesSeeds = [0.1, 0.15, 0.08, 0.12, 0.05, 0.1];
  return MONTHS.map((month, i) => ({
    month: `${month} ${currentYear}`,
    revenue: Math.round(demoGross * grossSeeds[i]),
    profit: Math.round(demoProfit * profitSeeds[i]),
    expenses: Math.round(demoGross * expensesSeeds[i]),
  }));
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; stroke?: string; fill?: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl space-y-1">
        <div className="font-bold text-slate-300 mb-1">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.stroke || p.fill }} />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-bold">{formatRupiah(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const formatDateByInterval = (dateStr: string, interval: "daily" | "weekly" | "monthly") => {
  if (interval === "monthly") {
    const formatted = utilsFormatDate(dateStr, "MMM yyyy");
    return formatted || dateStr;
  }
  const formatted = utilsFormatDate(dateStr, "d MMM yyyy");
  return formatted || dateStr;
};

export function RevenueChart({ summary, from, to }: RevenueChartProps) {
  const methods = useForm<ChartFilterValues>({
    defaultValues: {
      interval: "weekly",
    },
  });

  const watchInterval = useWatch({
    control: methods.control,
    name: "interval",
  });

  const { data: history, isLoading } = useSalesHistory({
    from,
    to,
    interval: watchInterval || "weekly",
  });

  const data = history && history.length > 0
    ? history.map((item) => ({
      month: formatDateByInterval(item.date, watchInterval || "weekly"),
      revenue: item.net_sales,
      profit: item.gross_profit,
      expenses: item.expenses || 0,
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
    <FormProvider {...methods}>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between select-none">
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
              {isLoading ? (
                <Skeleton className="h-8 w-40 mt-1" />
              ) : (
                <span className="text-2xl font-black text-slate-800 tabular-nums tracking-tight">
                  {formatRupiah(gross)}
                </span>
              )}
            </div>
          </div>

          {/* Reusable FormSelect Dropdown */}
          <div className="w-24 shrink-0">
            <FormSelect<ChartFilterValues>
              name="interval"
              options={[
                { value: "daily", label: "Harian" },
                { value: "weekly", label: "Mingguan" },
                { value: "monthly", label: "Bulanan" },
              ]}
              placeholder="Pilih Interval"
              size="sm"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-[10px] font-extrabold text-slate-500 border-b border-slate-50 pb-2 select-none">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2 rounded-sm bg-indigo-500 inline-block" />
            Penjualan Bersih
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2 rounded-sm bg-teal-500 inline-block" />
            Laba Kotor
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2 rounded-sm bg-rose-500 inline-block" />
            Pengeluaran
          </span>
        </div>

        {/* Chart – only render in browser to avoid SSR warning */}
        <div style={{ width: "100%", height: 185 }}>
          {isLoading ? (
            <Skeleton className="w-full h-full rounded-xl" />
          ) : (
            mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
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
                      if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                      return `${v}`;
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Penjualan Bersih"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Laba Kotor"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    name="Pengeluaran"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )
          )}
        </div>
      </div>
    </FormProvider>
  );
}
