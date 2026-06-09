"use client";

import { useHeldTransactions } from "@/features/checkout/api/checkout-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconReceipt2, IconArrowUpRight, IconClock } from "@tabler/icons-react";
import Link from "next/link";

const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    className: "bg-amber-50 text-amber-600 border border-amber-200",
  },
  on_hold: {
    label: "Ditahan",
    className: "bg-sky-50 text-sky-600 border border-sky-200",
  },
  paid: {
    label: "Lunas",
    className: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  },
  void: {
    label: "Void",
    className: "bg-red-50 text-red-500 border border-red-200",
  },
};

export function RecentOrders() {
  const { data, isLoading } = useHeldTransactions({ page: 1, per_page: 5 });
  const transactions = data?.data ?? [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <IconReceipt2 size={17} />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Transaksi Tertahan</div>
            <div className="text-[10px] text-slate-400">Transaksi yang sedang di-hold</div>
          </div>
        </div>
        <Link
          href="/admin/reports"
          className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
        >
          Lihat Semua
          <IconArrowUpRight size={12} />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left text-[9px] font-bold uppercase tracking-widest text-slate-400 pb-2 pr-2">
                ID Transaksi
              </th>
              <th className="text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 pb-2 pr-2">
                Items
              </th>
              <th className="text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 pb-2 pr-2">
                Subtotal
              </th>
              <th className="text-right text-[9px] font-bold uppercase tracking-widest text-slate-400 pb-2">
                Waktu
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td colSpan={4} className="py-3">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400 text-[11px]">
                  <div className="flex flex-col items-center gap-2">
                    <IconClock size={24} strokeWidth={1.5} className="text-slate-300" />
                    <span>Belum ada transaksi tertahan.</span>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((trx) => {
                const date = new Date(trx.created_at);
                const timeStr = date.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const dateStr = date.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                });
                return (
                  <tr
                    key={trx.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2.5 pr-2">
                      <span className="font-bold text-slate-700">
                        #{String(trx.id).padStart(7, "0")}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2 text-right">
                      <span className="text-slate-500">{trx.items_count} item</span>
                    </td>
                    <td className="py-2.5 pr-2 text-right">
                      <span className="font-bold text-slate-800 tabular-nums">
                        {formatRupiah(trx.subtotal)}
                      </span>
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-slate-600">{timeStr}</span>
                        <span className="text-slate-400 text-[9px]">{dateStr}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
