"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconTrophy } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { DashboardSummary } from "../types";

interface TopSellingWeeklyProps {
  summary: DashboardSummary | undefined;
}

// Weekly day labels (match reference image)
// const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// function buildWeeklyData(summary: TopSellingWeeklyProps["summary"]) {
//   const net = summary?.net_sales ?? 0;
//   const demoNet = net === 0 ? 3000 : net;
//   const seeds = [0.3, 0.6, 0.45, 0.9, 0.7, 0.55, 0.4];
//   return DAYS.map((day, i) => ({
//     day,
//     sales: Math.round(demoNet * seeds[i]),
//   }));
// }

// const CustomTooltip = ({ active, payload, label }: {
//   active?: boolean;
//   payload?: Array<{ value: number }>;
//   label?: string;
// }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div className="bg-slate-900 text-white text-xs rounded-xl px-3 py-2 shadow-xl">
//         <div className="font-bold text-slate-300 text-[9px] mb-0.5">{label}</div>
//         <div className="font-bold">{formatRupiah(payload[0].value)}</div>
//       </div>
//     );
//   }
//   return null;
// };

const BAR_COLORS = ["#94a3b8", "#94a3b8", "#94a3b8", "#1e293b", "#94a3b8", "#94a3b8", "#94a3b8"];

export function TopSellingWeekly({ summary }: TopSellingWeeklyProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const products = summary?.top_products ?? [];
  // const weeklyData = buildWeeklyData(summary);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-800">Top Produk</h3>
        {/* <select className="text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 cursor-pointer outline-none">
          <option>Monthly</option>
          <option>Weekly</option>
          <option>Daily</option>
        </select> */}
      </div>

      {/* Product List or empty state */}
      <div className="flex-1">
        {products.length > 0 ? (
          <div className="space-y-2.5">
            {products.slice(0, 4).map((p, i) => {
              const colors = ["emerald", "sky", "amber", "red"];
              const color = colors[i % colors.length];
              const bgMap: Record<string, string> = {
                emerald: "bg-emerald-100 text-emerald-600",
                sky: "bg-sky-100 text-sky-600",
                amber: "bg-amber-100 text-amber-600",
                red: "bg-red-100 text-red-500",
              };
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg ${bgMap[color]} flex items-center justify-center text-[9px] font-extrabold shrink-0`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-slate-700 truncate">
                      {p.product_name}
                    </div>
                    <div className="text-[9px] text-slate-400">{p.quantity} pcs</div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 tabular-nums shrink-0">
                    {formatRupiah(p.revenue)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 text-center">
            <div>
              <IconTrophy size={22} className="text-slate-200 mx-auto mb-1.5" strokeWidth={1.5} />
              <p className="text-[10px] text-slate-400">Belum ada penjualan tercatat.</p>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Bar Chart */}
      {/* <div style={{ height: 80 }}>
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              barCategoryGap="30%"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis
                dataKey="day"
                tick={{ fontSize: 8, fill: "#94a3b8", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="sales" radius={[3, 3, 0, 0]} maxBarSize={14}>
                {weeklyData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i] ?? "#94a3b8"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div> */}
    </div>
  );
}
