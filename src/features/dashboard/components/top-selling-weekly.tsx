"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconTrophy } from "@tabler/icons-react";
import type { DashboardSummary } from "../types";

interface TopSellingWeeklyProps {
  summary: DashboardSummary | undefined;
}

export function TopSellingWeekly({ summary }: TopSellingWeeklyProps) {

  const products = summary?.top_products ?? [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IconTrophy size={14} className="stroke-[2.5]" />
          </div>
          <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Top Produk Terlaris</h3>
        </div>
      </div>

      {/* Product List or empty state */}
      <div className="flex-1 mt-1">
        {products.length > 0 ? (
          <div className="space-y-3.5">
            {products.slice(0, 4).map((p, i) => {
              const colors = ["indigo", "teal", "amber", "rose"];
              const color = colors[i % colors.length];
              const bgMap: Record<string, string> = {
                indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/30",
                teal: "bg-teal-50 text-teal-600 border-teal-100/30",
                amber: "bg-amber-50 text-amber-600 border-amber-100/30",
                rose: "bg-rose-50 text-rose-600 border-rose-100/30",
              };
              return (
                <div key={i} className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50/50 p-1 rounded-xl transition-colors">
                  <div className={`w-7 h-7 rounded-lg ${bgMap[color]} border flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                      {p.product_name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-semibold mt-0.5">{p.quantity} pcs terjual</div>
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-800 tabular-nums shrink-0 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                    {formatRupiah(p.revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-center h-full">
            <div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-300">
                <IconTrophy size={20} strokeWidth={1.5} />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">Belum ada penjualan tercatat.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
