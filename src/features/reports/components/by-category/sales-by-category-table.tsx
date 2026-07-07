"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { SalesByCategoryItem } from "../../types";

const PALETTE = [
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
  "#10b981",
  "#0ea5e9",
  "#fb923c",
];

interface SalesByCategoryTableProps {
  data: SalesByCategoryItem[];
  isLoading?: boolean;
}

export function SalesByCategoryTable({ data, isLoading }: SalesByCategoryTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-3.5 w-44" />
        </div>
        <div className="space-y-2 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-10 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const hasData = data.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="mb-4">
        <h3 className="text-xs font-extrabold text-slate-800">Detail Per Kategori</h3>
        <p className="text-[10px] text-slate-400 mt-0.5">Rincian penjualan, kuantitas, dan kontribusi tiap kategori</p>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-24 text-[11px] text-slate-400 font-medium">
          Tidak ada data untuk periode ini.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left font-extrabold text-slate-500 uppercase tracking-wider px-4 py-3 text-[9px] w-8">#</th>
                <th className="text-left font-extrabold text-slate-500 uppercase tracking-wider px-4 py-3 text-[9px]">Kategori</th>
                <th className="text-right font-extrabold text-slate-500 uppercase tracking-wider px-4 py-3 text-[9px]">Total Penjualan</th>
                <th className="text-right font-extrabold text-slate-500 uppercase tracking-wider px-4 py-3 text-[9px]">Total Keuntungan</th>
                <th className="text-right font-extrabold text-slate-500 uppercase tracking-wider px-4 py-3 text-[9px]">Total Qty</th>
                <th className="text-left font-extrabold text-slate-500 uppercase tracking-wider px-4 py-3 text-[9px] min-w-[140px]">Kontribusi</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => {
                const color = PALETTE[i % PALETTE.length];
                return (
                  <tr
                    key={item.category_uid ?? item.category}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* # */}
                    <td className="px-4 py-3 text-slate-400 font-bold tabular-nums">{i + 1}</td>

                    {/* Kategori */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ background: color }}
                        />
                        <span className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {item.category}
                        </span>
                      </div>
                    </td>

                    {/* Total Penjualan */}
                    <td className="px-4 py-3 text-right font-extrabold text-slate-800 tabular-nums">
                      {formatRupiah(item.total_sales)}
                    </td>

                    {/* Total Keuntungan */}
                    <td className="px-4 py-3 text-right font-bold tabular-nums">
                      <span className={item.total_profit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                        {item.total_profit < 0 ? `-${formatRupiah(Math.abs(item.total_profit))}` : formatRupiah(item.total_profit)}
                      </span>
                    </td>

                    {/* Total Qty */}
                    <td className="px-4 py-3 text-right font-bold text-slate-600 tabular-nums">
                      {item.total_quantity.toLocaleString("id-ID")} pcs
                    </td>

                    {/* Kontribusi */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(item.percentage_sales, 100)}%`,
                              background: color,
                            }}
                          />
                        </div>
                        <span className="font-extrabold tabular-nums shrink-0" style={{ color }}>
                          {item.percentage_sales.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Footer totals */}
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200">
                <td colSpan={2} className="px-4 py-3 font-extrabold text-slate-700 text-[10px] uppercase tracking-wider">
                  Total
                </td>
                <td className="px-4 py-3 text-right font-black text-slate-900 tabular-nums">
                  {formatRupiah(data.reduce((s, d) => s + d.total_sales, 0))}
                </td>
                <td className="px-4 py-3 text-right font-black tabular-nums">
                  {(() => {
                    const totalProfit = data.reduce((s, d) => s + (d.total_profit ?? 0), 0);
                    return (
                      <span className={totalProfit >= 0 ? "text-emerald-700" : "text-rose-700"}>
                        {totalProfit < 0 ? `-${formatRupiah(Math.abs(totalProfit))}` : formatRupiah(totalProfit)}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 text-right font-black text-slate-900 tabular-nums">
                  {data.reduce((s, d) => s + d.total_quantity, 0).toLocaleString("id-ID")} pcs
                </td>
                <td className="px-4 py-3">
                  <span className="font-extrabold text-slate-500">100%</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
