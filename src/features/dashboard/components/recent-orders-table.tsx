"use client";

import { useTransactions } from "../api/dashboard-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconArrowUpRight, IconPackage, IconReceipt } from "@tabler/icons-react";
import Link from "next/link";
import { formatDate, formatToTime } from "@/lib/date-utils";
import { useAppRouter } from "@/hooks/use-app-router";
import { Scrollable } from "@/components/ui/scrollable";

const STATUS_BADGES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 border-emerald-100/50",
  canceled: "bg-rose-50 text-rose-700 border-rose-100/50",
  draft: "bg-amber-50 text-amber-700 border-amber-100/50",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Selesai",
  canceled: "Void / Batal",
  draft: "Draft",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Tunai",
  card: "EDC/Card",
  split: "Split",
  draft: "Draft",
};

interface RecentOrdersTableProps {
  from?: string;
  to?: string;
  paymentMethod?: string;
}

export function RecentOrdersTable({ from, to, paymentMethod }: RecentOrdersTableProps) {
  const router = useAppRouter();
  const { data: response, isLoading } = useTransactions({
    from: from || undefined,
    to: to || undefined,
    payment_method: paymentMethod || undefined,
    sort_by: "created_at",
    sort_order: "desc",
  });

  const transactions = response?.data ?? [];
  
  // Sort by created_at DESC in frontend as a robust fallback, and slice to latest 3 items
  const recentTransactions = Array.isArray(transactions)
    ? [...transactions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
    : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-4 h-[280px]">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <IconReceipt size={16} className="stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800">Transaksi Terbaru</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Pantau data transaksi terbaru dan transaksi lainnya.
            </p>
          </div>
        </div>
        <Link
          href="/admin/transactions"
          className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500 hover:text-indigo-600 transition-colors border border-slate-100 rounded-lg px-2.5 py-1.5 bg-white shadow-sm"
        >
          Lihat Semua <IconArrowUpRight size={11} />
        </Link>
      </div>

      {/* Table */}
      <Scrollable className="flex-1 min-h-0" orientation="both">
        <table className="w-full border-collapse">
          <thead>
            <tr className="sticky top-0 z-10">
              {["No. Transaksi", "Nama Produk", "Tanggal/Waktu", "Pembayaran", "Total", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[8px] font-bold uppercase tracking-widest text-slate-400 pb-2 pr-4 last:pr-0 whitespace-nowrap bg-white border-b border-slate-100"
                >
                  {h}
                </th>
              ))}
              <th className="pb-2 bg-white border-b border-slate-100" />
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
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    <IconPackage size={28} strokeWidth={1.5} />
                    <span className="text-xs text-slate-400">Belum ada pesanan tercatat.</span>
                  </div>
                </td>
              </tr>
            ) : (
              recentTransactions.map((trx) => {
                const timeStr = formatToTime(trx.created_at);
                const dateStr = formatDate(trx.created_at, "dd MMM yyyy");
                
                const statusValue = trx.status ? trx.status.toLowerCase() : "completed";
                const statusLabel = (STATUS_LABELS[statusValue] || trx.status || "Selesai").toUpperCase();
                const badgeClass = STATUS_BADGES[statusValue] || "bg-emerald-50 text-emerald-700 border-emerald-100/50";

                const productNames = trx.items.map(item => item.nama_produk).join(", ");
                const truncatedProductNames = productNames.length > 25 ? productNames.slice(0, 25) + "…" : productNames;
                const circleColor = trx.status === "canceled" ? "bg-rose-50 text-rose-500" : "bg-indigo-50 text-indigo-600";

                const paymentValue = trx.metode_pembayaran?.toLowerCase() || "draft";
                const paymentLabel = PAYMENT_LABELS[paymentValue] || trx.metode_pembayaran || "Draft";

                return (
                  <tr
                    key={trx.uid}
                    onClick={() => router.push(`/admin/transactions/${trx.uid}`)}
                    className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  >
                    {/* Order ID */}
                    <td className="py-2.5 pr-4">
                      <span 
                        className="text-[11px] font-bold text-slate-700 truncate block max-w-[85px]"
                        title={trx.nomor_transaksi}
                      >
                        {trx.nomor_transaksi}
                      </span>
                    </td>

                    {/* Product Name */}
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-lg ${circleColor} flex items-center justify-center shrink-0`}>
                          <IconPackage size={12} className="stroke-[2.5]" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700 whitespace-nowrap" title={productNames}>
                          {truncatedProductNames || `${trx.items.length} Item`}
                        </span>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{timeStr}</span>
                        <span className="text-[9px] text-slate-400 whitespace-nowrap">{dateStr}</span>
                      </div>
                    </td>

                    {/* Payment */}
                    <td className="py-2.5 pr-4">
                      <span className="text-[11px] font-semibold text-slate-600 capitalize">{paymentLabel}</span>
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 pr-4">
                      <span className="text-[11px] font-bold text-slate-700 tabular-nums whitespace-nowrap">
                        {formatRupiah(trx.total)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 pr-4">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ${badgeClass}`}>
                        {statusLabel}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 text-right">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                        <IconArrowUpRight size={14} className="stroke-[2.5]" />
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </Scrollable>
    </div>
  );
}
