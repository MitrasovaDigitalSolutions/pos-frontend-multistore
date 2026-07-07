"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconChartDonut } from "@tabler/icons-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { DashboardSummary } from "../types";

interface DonutChartProps {
  summary: DashboardSummary | undefined;
}

const COLORS = ["#10b981", "#f59e0b", "#f87171"];

const RADIAN = Math.PI / 180;
interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

const renderCustomLabel = ({
  cx = 0,
  cy = 0,
  midAngle = 0,
  innerRadius = 0,
  outerRadius = 0,
  percent = 0,
}: CustomLabelProps) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[9px] font-bold"
      fontSize={9}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 shadow-2xl text-white text-xs">
        <div className="font-bold">{payload[0]?.name}</div>
        <div className="text-slate-300 mt-0.5">{formatRupiah(payload[0]?.value)}</div>
      </div>
    );
  }
  return null;
};

export function DonutChart({ summary }: DonutChartProps) {
  const products = summary?.top_products ?? [];

  // Build pie data from top products
  const data =
    products.length > 0
      ? products.slice(0, 5).map((p) => ({
        name:
          p.product_name.length > 12
            ? p.product_name.slice(0, 12) + "…"
            : p.product_name,
        value: p.revenue,
      }))
      : [
        { name: "Belum ada", value: 1 },
      ];

  const totalRevenue = products.reduce((acc, p) => acc + p.revenue, 0);
  const hasData = products.length > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
          <IconChartDonut size={17} />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-800">Statistik Penjualan</div>
          <div className="text-[10px] text-slate-400">Distribusi omzet per produk</div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-center gap-4">
        <div className="relative h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={hasData ? 3 : 0}
                dataKey="value"
                labelLine={false}
                label={hasData ? renderCustomLabel : undefined}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      hasData
                        ? COLORS[index % COLORS.length]
                        : "#e2e8f0"
                    }
                    stroke="none"
                  />
                ))}
              </Pie>
              {hasData && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>

          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-[10px] text-slate-400 font-medium leading-none">Total</div>
            <div className="text-xs font-extrabold text-slate-700 tabular-nums mt-0.5 text-center leading-tight">
              {hasData
                ? totalRevenue >= 1_000_000
                  ? `${(totalRevenue / 1_000_000).toFixed(1)}jt`
                  : `${(totalRevenue / 1_000).toFixed(0)}k`
                : "—"}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 flex-1 min-w-0">
          {hasData ? (
            data.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                <span className="text-[10px] text-slate-600 font-medium truncate flex-1">
                  {entry.name}
                </span>
                <span className="text-[10px] font-bold text-slate-500 tabular-nums shrink-0">
                  {formatRupiah(entry.value)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-[10px] text-slate-400 font-medium">
              Belum ada data produk.
            </div>
          )}
        </div>
      </div>

      {/* Footer stat */}
      <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Total produk aktif</span>
        <span className="text-xs font-bold text-slate-700">{products.length} Produk</span>
      </div>
    </div>
  );
}
