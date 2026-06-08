"use client";

import { Card } from "@/components/ui/card";
import { IconCash, IconReceipt, IconChartPie, IconAlertTriangle } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { DashboardSummary } from "../types";

interface StatsGridProps {
  summary: DashboardSummary | undefined;
}

export function StatsGrid({ summary }: StatsGridProps) {
  return (
    <section className="grid grid-cols-4 gap-4">
      {/* Total Penjualan Bersih */}
      <Card className="bg-emerald-600 border-none text-white rounded-2xl shadow-md p-5 flex flex-col gap-1.5 justify-between">
        <div className="flex justify-between items-center text-emerald-100">
          <span className="text-[10px] font-bold uppercase tracking-wider">Total Penjualan Bersih</span>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-lg text-white">
            <IconCash size={18} />
          </div>
        </div>
        <h3 className="text-xl font-bold leading-none select-all tabular-nums">
          {summary ? formatRupiah(summary.net_sales) : "Rp 0"}
        </h3>
        <div className="text-[10px] font-semibold text-emerald-200">Bulan Berjalan</div>
      </Card>

      {/* Transaksi Sukses */}
      <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
        <div className="flex justify-between items-center text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Transaksi Sukses</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">
            <IconReceipt size={18} />
          </div>
        </div>
        <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">
          {summary ? `${summary.sales_count} Trx` : "0 Trx"}
        </h3>
        <div className="text-[10px] font-semibold text-slate-500">
          Total item: {summary ? summary.items_sold : 0} pcs
        </div>
      </Card>

      {/* PPN Terkumpul */}
      <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
        <div className="flex justify-between items-center text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">PPN Terkumpul</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            <IconChartPie size={18} />
          </div>
        </div>
        <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">
          {summary ? formatRupiah(summary.tax_total) : "Rp 0"}
        </h3>
        <div className="text-[10px] font-semibold text-slate-500">Besaran PPN 11%</div>
      </Card>

      {/* Potongan Diskon */}
      <Card className="bg-white border-slate-100 rounded-2xl shadow-sm p-5 flex flex-col gap-1.5 justify-between">
        <div className="flex justify-between items-center text-slate-400">
          <span className="text-[10px] font-bold uppercase tracking-wider">Potongan Diskon</span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-lg">
            <IconAlertTriangle size={18} />
          </div>
        </div>
        <h3 className="text-xl font-bold leading-none text-slate-900 tabular-nums">
          {summary ? formatRupiah(summary.discount_total) : "Rp 0"}
        </h3>
        <div className="text-[10px] font-semibold text-slate-500">Total diskon transaksi</div>
      </Card>
    </section>
  );
}
