"use client";

import { useCheckoutStore } from "@/stores/checkout-store";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconReceipt2, IconArrowUpRight, IconClock } from "@tabler/icons-react";
import Link from "next/link";
import { formatDate, formatToTime } from "@/lib/date-utils";
import { useEffect, useState } from "react";
import type { HoldTransaction } from "@/features/checkout/types";

export function RecentOrders() {
  const storeHoldList = useCheckoutStore((state) => state.holdList);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Limit recent held transactions on dashboard to first 5 items
  const transactions = mounted ? storeHoldList.slice(0, 5) : [];

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
            {!mounted ? (
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
              transactions.map((trx: HoldTransaction) => {
                const timeStr = formatToTime(trx.created_at);
                const dateStr = formatDate(trx.created_at, "dd MMM");
                return (
                  <tr
                    key={trx.uid}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2.5 pr-2">
                      <span className="font-bold text-slate-700">
                        #{String(trx.uid).slice(-7)}
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
