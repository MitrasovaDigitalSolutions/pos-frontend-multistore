"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  IconArrowRight,
  IconShoppingBag,
  IconTrendingUp,
  IconCash,
} from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { DashboardSummary } from "../types";
import Link from "next/link";

interface StatMiniCardsProps {
  summary: DashboardSummary | undefined;
}

// Simulated sparkline data for visual richness
const SPARKLINE_DATA = [
  { v: 30 }, { v: 45 }, { v: 38 }, { v: 52 }, { v: 48 },
  { v: 61 }, { v: 55 }, { v: 70 }, { v: 65 }, { v: 80 },
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
  const itemsSold = summary?.items_sold ?? 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Card 1: Total Products Sales */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Total Penjualan Produk
            </p>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <IconCash size={14} className="stroke-[2.5]" />
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 mt-2.5">
            <span className="text-2xl font-extrabold text-slate-800 tabular-nums leading-none tracking-tight">
              {netSales >= 1_000_000
                ? `${(netSales / 1_000_000).toFixed(1)}jt`
                : netSales >= 1_000
                  ? `${(netSales / 1_000).toFixed(0)}k`
                  : netSales === 0
                    ? "0"
                    : formatRupiah(netSales)}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded-full select-none">
              <IconTrendingUp size={8} />
              +12.4%
            </span>
          </div>
        </div>

        {/* Bottom: link + sparkline */}
        <div className="flex items-end justify-between mt-3 pt-2">
          <Link
            href="/admin/reports"
            className="text-[10px] font-extrabold text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 group"
          >
            Lihat Laporan <IconArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div style={{ width: 80, height: 32 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARKLINE_DATA}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                  <Tooltip content={() => null} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Card 2: Total Volume of Products */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Total Produk Terjual
            </p>
            <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <IconShoppingBag size={14} className="stroke-[2.5]" />
            </div>
          </div>
          
          <div className="flex items-center gap-2.5 mt-2.5">
            <span className="text-2xl font-extrabold text-slate-800 tabular-nums leading-none tracking-tight">
              {itemsSold}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded-full select-none">
              <IconTrendingUp size={8} />
              +8.2%
            </span>
          </div>
        </div>

        {/* Bottom: link + icon */}
        <div className="flex items-center justify-between mt-3 pt-2">
          <Link
            href="/admin/products"
            className="text-[10px] font-extrabold text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-1 group"
          >
            Lihat Produk <IconArrowRight size={11} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center transition-all duration-300 hover:scale-105">
            <IconShoppingBag size={13} className="stroke-[2.5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
