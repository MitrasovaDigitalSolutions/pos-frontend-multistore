"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import {
  IconCash,
  IconReportMoney,
  IconTrendingDown,
} from "@tabler/icons-react";
import type { DashboardSummary } from "../types";

interface StatMiniCardsProps {
  summary: DashboardSummary | undefined;
  isLoading?: boolean;
}

export function StatMiniCards({ summary, isLoading }: StatMiniCardsProps) {
  const netSales = summary?.net_sales ?? 0;
  const grossSales = summary?.gross_sales ?? 0;
  const totalExpenses = summary?.total_expenses ?? 0;
  const recurringExpenses = summary?.total_recurring_expenses ?? 0;
  const oneTimeExpenses = summary?.total_one_time_expenses ?? 0;
  const netProfit = summary?.net_profit ?? 0;

  const netProfitMargin = netSales > 0 ? (netProfit / netSales) * 100 : 0;

  const formatCompact = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(2)}jt`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}k`;
    return val === 0 ? "0" : formatRupiah(val);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:flex-col gap-2 lg:h-full">
      {/* Card 1: Penjualan Bersih */}
      <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-3 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Penjualan Bersih
            </p>
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <IconCash size={14} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {isLoading ? (
              <Skeleton className="h-5 w-28 mt-0.5" />
            ) : (
              <span className="text-lg font-extrabold text-slate-800 tabular-nums leading-none tracking-tight">
                {formatCompact(netSales)}
              </span>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-2.5 w-36 mt-1" />
          ) : (
            <p className="text-[8px] text-slate-400 font-semibold mt-0.5">
              Omset: {formatRupiah(grossSales)}
            </p>
          )}
        </div>
      </div>

      {/* Card 2: Pengeluaran */}
      <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-3 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Pengeluaran
            </p>
            <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <IconTrendingDown size={14} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {isLoading ? (
              <Skeleton className="h-5 w-28 mt-0.5" />
            ) : (
              <span className="text-lg font-extrabold text-slate-800 tabular-nums leading-none tracking-tight">
                {formatCompact(totalExpenses)}
              </span>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-2.5 w-36 mt-1" />
          ) : (
            <p className="text-[8px] text-slate-400 font-semibold mt-0.5">
              Rutin: {formatCompact(recurringExpenses)} | Sekali: {formatCompact(oneTimeExpenses)}
            </p>
          )}
        </div>
      </div>

      {/* Card 3: Laba Bersih */}
      <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-3 flex flex-col justify-between min-h-0">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Laba Bersih
            </p>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IconReportMoney size={14} className="stroke-[2.5]" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {isLoading ? (
              <Skeleton className="h-5 w-28 mt-0.5" />
            ) : (
              <>
                <span className="text-lg font-extrabold text-slate-800 tabular-nums leading-none tracking-tight">
                  {formatCompact(netProfit)}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-1 py-0.2 rounded-full select-none">
                  {netProfitMargin.toFixed(1)}%
                </span>
              </>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-2.5 w-36 mt-1" />
          ) : (
            <p className="text-[8px] text-slate-400 font-semibold mt-0.5">
              HPP: {formatRupiah(summary?.total_cogs ?? 0)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
