"use client";

import { useState } from "react";
import { IconTrophy } from "@tabler/icons-react";
import type { DashboardSummary, TopProduct } from "../types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";

interface TopSellingWeeklyProps {
  summary: DashboardSummary | undefined;
  isLoading?: boolean;
}

type ProductTab = "quantity" | "profit";

export function TopSellingWeekly({ summary, isLoading }: TopSellingWeeklyProps) {
  const [activeTab, setActiveTab] = useState<ProductTab>("quantity");

  // Map explicitly to the correct array from summary
  const quantityProducts = summary?.top_products_by_quantity ?? [];
  const profitProducts = summary?.top_products_by_profit ?? [];
  const currentProducts = activeTab === "quantity" ? quantityProducts : profitProducts;

  const renderProductList = (products: TopProduct[], type: ProductTab) => {
    if (products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-slate-300 gap-2">
          <IconTrophy size={28} strokeWidth={1.5} />
          <span className="text-[10px] font-medium text-slate-400">
            Belum ada data produk.
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {products.slice(0, 5).map((p, i) => {
          const colors = ["indigo", "teal", "amber", "rose", "violet"];
          const color = colors[i % colors.length];
          const bgMap: Record<string, string> = {
            indigo: "bg-indigo-50 text-indigo-600 border-indigo-100/30",
            teal: "bg-teal-50 text-teal-600 border-teal-100/30",
            amber: "bg-amber-50 text-amber-600 border-amber-100/30",
            rose: "bg-rose-50 text-rose-600 border-rose-100/30",
            violet: "bg-violet-50 text-violet-600 border-violet-100/30",
          };
          return (
            <div key={i} className="flex items-center gap-2.5 group hover:bg-slate-50/50 p-1 rounded-lg transition-colors">
              <div className={`w-6 h-6 rounded-md ${bgMap[color]} border flex items-center justify-center text-[9px] font-extrabold shrink-0 shadow-sm transition-transform group-hover:scale-105`}>
                #{i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-slate-700 truncate group-hover:text-slate-900 transition-colors">
                  {p.product_name}
                </div>
              </div>
              {type === "quantity" ? (
                <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100/30 px-2 py-0.5 rounded shrink-0 tabular-nums">
                  {p.quantity} Pcs
                </span>
              ) : (
                <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100/30 px-2 py-0.5 rounded shrink-0 tabular-nums">
                  {formatRupiah(p.profit ?? 0)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderSkeletons = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <Skeleton className="w-6 h-6 rounded-md shrink-0" />
          <div className="flex-1">
            <Skeleton className="h-3 w-3/4 rounded" />
          </div>
          <Skeleton className="h-4.5 w-10 rounded shrink-0" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col gap-3 h-full min-h-[280px] justify-between">
      {/* Header with inline Switcher */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <div className="flex items-center gap-1.5 select-none">
          <div className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <IconTrophy size={11} className="stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Top Produk</span>
        </div>

        {/* Small Switcher buttons group */}
        <div className="flex bg-slate-50 p-0.5 rounded-md border border-slate-100 text-[9px] font-bold shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("quantity")}
            className={cn(
              "px-2 py-0.5 rounded-sm transition-all  select-none",
              activeTab === "quantity"
                ? "bg-white text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border border-slate-200/50"
                : "text-slate-400 hover:text-slate-600 border border-transparent"
            )}
          >
            Qty
          </button>
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
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 mt-1 flex flex-col min-h-0">
        {isLoading ? renderSkeletons() : renderProductList(currentProducts, activeTab)}
      </div>
    </div>
  );
}

