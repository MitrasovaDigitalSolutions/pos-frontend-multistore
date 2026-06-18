"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
  IconArrowRight,
  IconCash,
  IconReportMoney,
} from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { DashboardSummary } from "../types";

interface StatMiniCardsProps {
  summary: DashboardSummary | undefined;
}

// Simulated sparkline data for visual richness
const SPARKLINE_DATA_1 = [
  { v: 30 }, { v: 45 }, { v: 38 }, { v: 52 }, { v: 48 },
  { v: 61 }, { v: 55 }, { v: 70 }, { v: 65 }, { v: 80 },
];

const SPARKLINE_DATA_2 = [
  { v: 20 }, { v: 35 }, { v: 28 }, { v: 42 }, { v: 38 },
  { v: 55 }, { v: 48 }, { v: 65 }, { v: 60 }, { v: 75 },
];

export function StatMiniCards({ summary }: StatMiniCardsProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const netSales = summary?.net_sales ?? 0;
  const grossProfit = summary?.gross_profit ?? 0;
  const profitMargin = summary?.profit_margin ?? 0;

  return (
    <div className="flex flex-col gap-3.5 h-full">
      {/* Card 1: Penjualan Bersih */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Penjualan Bersih
            </p>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <IconCash size={14} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xl font-extrabold text-slate-800 tabular-nums leading-none tracking-tight">
              {netSales >= 1_000_000
                ? `${(netSales / 1_000_000).toFixed(2)}jt`
                : netSales >= 1_000
                  ? `${(netSales / 1_000).toFixed(0)}k`
                  : netSales === 0
                    ? "0"
                    : formatRupiah(netSales)}
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">
            Omset: {formatRupiah(summary?.gross_sales ?? 0)}
          </p>
        </div>

        {/* Bottom: link + sparkline */}
        <div className="flex items-end justify-between mt-2.5 pt-1.5 border-t border-slate-50">
          <Link
            href="/admin/reports"
            className="text-[9px] font-extrabold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-0.5 group"
          >
            Laporan <IconArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div style={{ width: 60, height: 20 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARKLINE_DATA_1}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 2 }}
                  />
                  <Tooltip content={() => null} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Laba Kotor */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Laba Kotor
            </p>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IconReportMoney size={14} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xl font-extrabold text-slate-800 tabular-nums leading-none tracking-tight">
              {grossProfit >= 1_000_000
                ? `${(grossProfit / 1_000_000).toFixed(2)}jt`
                : grossProfit >= 1_000
                  ? `${(grossProfit / 1_000).toFixed(0)}k`
                  : grossProfit === 0
                    ? "0"
                    : formatRupiah(grossProfit)}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1 py-0.2 rounded-full select-none">
              {profitMargin.toFixed(1)}%
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-semibold mt-1">
            HPP: {formatRupiah(summary?.total_cogs ?? 0)}
          </p>
        </div>

        {/* Bottom: link + sparkline */}
        <div className="flex items-end justify-between mt-2.5 pt-1.5 border-t border-slate-50">
          <Link
            href="/admin/reports"
            className="text-[9px] font-extrabold text-slate-400 hover:text-emerald-600 transition-colors flex items-center gap-0.5 group"
          >
            Detail <IconArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div style={{ width: 60, height: 20 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARKLINE_DATA_2}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 2 }}
                  />
                  <Tooltip content={() => null} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
