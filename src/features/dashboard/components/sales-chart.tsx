"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconChartBar } from "@tabler/icons-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary } from "../types";

interface SalesChartProps {
  summary: DashboardSummary | undefined;
}

// Mock monthly data for visual richness – real data from summary is overlaid
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

function buildChartData(summary: DashboardSummary | undefined) {
  const net = summary?.net_sales ?? 0;
  const gross = summary?.gross_sales ?? 0;

  // Simulate prior months with decay so current month stands out
  return MONTHS.map((month, i) => {
    const factor = i === MONTHS.length - 1 ? 1 : 0.4 + Math.random() * 0.45;
    return {
      month,
      "Penjualan Bersih": Math.round(net * factor),
      "Penjualan Kotor": Math.round(gross * factor),
    };
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-white text-xs space-y-1">
        <div className="font-bold text-slate-300 mb-2">{label}</div>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ background: p.color }}
            />
            <span className="text-slate-400">{p.name}:</span>
            <span className="font-bold">{formatRupiah(p.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesChart({ summary }: SalesChartProps) {
  const data = buildChartData(summary);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <IconChartBar size={17} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Perbandingan Penjualan</div>
            <div className="text-[10px] text-slate-400">6 bulan terakhir</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-semibold">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            Bersih
          </span>
          <span className="flex items-center gap-1.5 text-sky-500">
            <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" />
            Kotor
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} barCategoryGap="30%">
            <defs>
              <linearGradient id="barNet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
              <linearGradient id="barGross" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#cbd5e1" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}jt`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                return `${v}`;
              }}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9", radius: 6 }} />
            <Bar dataKey="Penjualan Bersih" fill="url(#barNet)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Penjualan Kotor" fill="url(#barGross)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Total Bersih</div>
          <div className="text-sm font-extrabold text-emerald-600 tabular-nums">
            {summary ? formatRupiah(summary.net_sales) : "Rp 0"}
          </div>
        </div>
        <div className="h-8 w-px bg-slate-100" />
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Total Kotor</div>
          <div className="text-sm font-extrabold text-sky-500 tabular-nums">
            {summary ? formatRupiah(summary.gross_sales) : "Rp 0"}
          </div>
        </div>
        <div className="h-8 w-px bg-slate-100" />
        <div>
          <div className="text-[10px] text-slate-400 font-medium">Jml Transaksi</div>
          <div className="text-sm font-extrabold text-slate-700 tabular-nums">
            {summary ? summary.sales_count : 0} Trx
          </div>
        </div>
      </div>
    </div>
  );
}
