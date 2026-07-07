"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconCash, IconReceipt, IconTag, IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import type { DashboardSummary } from "../types";

interface StatsGridProps {
  summary: DashboardSummary | undefined;
}

const cards = [
  {
    key: "net_sales" as const,
    label: "Total Penjualan Bersih",
    sub: "Bulan Berjalan",
    icon: IconCash,
    gradient: "from-emerald-500 to-emerald-700",
    glow: "shadow-emerald-400/40",
    iconBg: "bg-white/20",
    format: (v: number) => formatRupiah(v),
    trend: "+10%",
    trendUp: true,
  },
  {
    key: "sales_count" as const,
    label: "Transaksi Sukses",
    sub: (s: DashboardSummary) => `Total item: ${s.items_sold} pcs`,
    icon: IconReceipt,
    gradient: "from-sky-400 to-sky-600",
    glow: "shadow-sky-400/40",
    iconBg: "bg-white/20",
    format: (v: number) => `${v} Trx`,
    trend: "+8%",
    trendUp: true,
  },
  {
    key: "discount_total" as const,
    label: "Potongan Diskon",
    sub: "Total diskon transaksi",
    icon: IconTag,
    gradient: "from-red-400 to-rose-600",
    glow: "shadow-red-400/40",
    iconBg: "bg-white/20",
    format: (v: number) => formatRupiah(v),
    trend: "-12%",
    trendUp: false,
  },
];

export function StatsGrid({ summary }: StatsGridProps) {
  return (
    <section className="grid grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIcon = card.trendUp ? IconTrendingUp : IconTrendingDown;
        const rawVal = summary ? summary[card.key] : 0;
        const displayVal = card.format(rawVal as number);
        const subText =
          typeof card.sub === "function"
            ? summary
              ? card.sub(summary)
              : ""
            : card.sub;

        return (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg ${card.glow} flex flex-col gap-3 text-white`}
          >
            {/* Decorative blob */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-black/10 blur-xl pointer-events-none" />

            {/* Header row */}
            <div className="flex items-start justify-between relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 leading-tight max-w-[80%]">
                {card.label}
              </span>
              <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className="text-white" />
              </div>
            </div>

            {/* Value */}
            <div className="relative z-10">
              <div className="text-2xl font-extrabold leading-none tabular-nums tracking-tight">
                {displayVal}
              </div>
            </div>

            {/* Footer row */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] text-white/70 font-medium">{subText}</span>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${card.trendUp ? "text-white" : "text-white/80"}`}>
                <TrendIcon size={12} />
                {card.trend}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
