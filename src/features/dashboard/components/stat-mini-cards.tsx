"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { IconArrowRight, IconShoppingBag, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
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
  useEffect(() => setMounted(true), []);
  const netSales = summary?.net_sales ?? 0;
  const itemsSold = summary?.items_sold ?? 0;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Card 1: Total Products Sales */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between min-h-0">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Total Penjualan Produk
          </p>
          <div className="flex items-center gap-2.5 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 tabular-nums leading-none">
              {netSales >= 1_000_000
                ? `${(netSales / 1_000_000).toFixed(1)}jt`
                : netSales >= 1_000
                  ? `${(netSales / 1_000).toFixed(0)}k`
                  : netSales === 0
                    ? "0"
                    : formatRupiah(netSales)}
            </span>
            {/* <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <IconTrendingUp size={10} />
              +10%
            </span> */}
          </div>
        </div>

        {/* Bottom: link + sparkline */}
        <div className="flex items-end justify-between mt-3">
          <Link
            href="/admin/reports"
            className="text-[10px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            Lihat Detail Penjualan <IconArrowRight size={11} />
          </Link>
          <div style={{ width: 96, height: 40 }}>
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SPARKLINE_DATA}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#818cf8"
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
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between min-h-0">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
            Total Produk Terjual
          </p>
          <div className="flex items-center gap-2.5 mt-2">
            <span className="text-3xl font-extrabold text-slate-800 tabular-nums leading-none">
              {itemsSold}
            </span>
            {/* <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              <IconTrendingDown size={10} />
              -12%
            </span> */}
          </div>
        </div>

        {/* Bottom: link + icon */}
        <div className="flex items-center justify-between mt-3">
          <Link
            href="/admin/products"
            className="text-[10px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            Lihat Semua Produk <IconArrowRight size={11} />
          </Link>
          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <IconShoppingBag size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
