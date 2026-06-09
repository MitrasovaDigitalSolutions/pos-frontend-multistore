"use client";

import { useTransactions } from "../api/dashboard-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconArrowUpRight, IconPackage } from "@tabler/icons-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  completed: "text-emerald-600",
  canceled: "text-red-500",
  draft: "text-amber-500",
};

interface RecentOrdersTableProps {
  from?: string;
  to?: string;
  paymentMethod?: string;
}

export function RecentOrdersTable({ from, to, paymentMethod }: RecentOrdersTableProps) {
  const { data: response, isLoading } = useTransactions({
    from: from || undefined,
    to: to || undefined,
    payment_method: paymentMethod || undefined,
  });

  const transactions = response?.data ?? [];
  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 5) : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Transaksi Terbaru</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Pantau data transaksi terbaru dan transaksi lainnya.
          </p>
        </div>
        <Link
          href="/admin/reports"
          className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-emerald-600 transition-colors border border-slate-100 rounded-lg px-2.5 py-1.5"
        >
          View All <IconArrowUpRight size={11} />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {["Order ID", "Nama Produk", "Tanggal", "Pembayaran", "Jumlah", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[8px] font-bold uppercase tracking-widest text-slate-400 pb-2.5 pr-4 last:pr-0 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
              <th className="pb-2.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  <td colSpan={7} className="py-3">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : recentTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    <IconPackage size={28} strokeWidth={1.5} />
                    <span className="text-xs text-slate-400">Belum ada pesanan tercatat.</span>
                  </div>
                </td>
              </tr>
            ) : (
              recentTransactions.map((trx) => {
                const date = new Date(trx.created_at);
                const dateStr = date.toLocaleDateString("id-ID", {
                  day: "2-digit", month: "short", year: "numeric",
                });
                const statusLabel = trx.status ? trx.status.toUpperCase() : "COMPLETED";
                const statusColor = STATUS_COLORS[trx.status] || "text-emerald-600";

                const productNames = trx.items.map(item => item.nama_produk).join(", ");
                const truncatedProductNames = productNames.length > 25 ? productNames.slice(0, 25) + "…" : productNames;

                return (
                  <tr
                    key={trx.id}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Order ID */}
                    <td className="py-3 pr-4">
                      <span className="text-[11px] font-bold text-slate-700">
                        {trx.nomor_transaksi}
                      </span>
                    </td>

                    {/* Product Name */}
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
                          <IconPackage size={10} className="text-sky-500" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap" title={productNames}>
                          {truncatedProductNames || `${trx.items.length} Item`}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3 pr-4">
                      <span className="text-[11px] text-slate-500 whitespace-nowrap">{dateStr}</span>
                    </td>

                    {/* Payment */}
                    <td className="py-3 pr-4">
                      <span className="text-[11px] text-slate-500 capitalize">{trx.metode_pembayaran || "Draft"}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-3 pr-4">
                      <span className="text-[11px] font-bold text-slate-700 tabular-nums whitespace-nowrap">
                        {formatRupiah(trx.total)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wide ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3">
                      <button className="text-slate-300 hover:text-slate-500 text-base font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity">
                        ···
                      </button>
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
