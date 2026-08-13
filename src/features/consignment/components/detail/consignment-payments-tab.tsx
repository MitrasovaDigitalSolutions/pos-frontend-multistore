"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDateTime } from "@/lib/date-utils";
import type { ConsignmentPayment } from "../../types";

interface ConsignmentPaymentsTabProps {
  payments?: ConsignmentPayment[];
}

export function ConsignmentPaymentsTab({ payments }: ConsignmentPaymentsTabProps) {
  if (!payments || payments.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-medium">
        Belum ada riwayat pelunasan untuk konsinyasi ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop / Tablet Table View */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="p-3">No. Pelunasan</th>
              <th className="p-3">Tanggal Bayar</th>
              <th className="p-3">Akun Kas / Pembayaran</th>
              <th className="p-3 text-right">Nominal Bayar</th>
              <th className="p-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium">
            {payments.map((payment) => (
              <tr key={payment.uid} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-3">
                  <span className="font-mono font-bold text-emerald-600">
                    {payment.nomor_pembayaran}
                  </span>
                </td>
                <td className="p-3 text-slate-600">
                  {formatToReadableDateTime(payment.tanggal_bayar || payment.created_at)}
                </td>
                <td className="p-3 font-semibold text-slate-800">
                  {payment.cashAccount?.nama || payment.metode_pembayaran || "Kas Utama"}
                </td>
                <td className="p-3 text-right font-bold text-slate-900 font-mono">
                  {formatRupiah(payment.jumlah_bayar)}
                </td>
                <td className="p-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                    Lunas
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden space-y-2.5">
        {payments.map((payment) => (
          <div
            key={payment.uid}
            className="p-3 rounded-xl border border-slate-100 bg-white space-y-2 shadow-2xs"
          >
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
              <span className="font-mono font-bold text-emerald-600 text-xs">
                {payment.nomor_pembayaran}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-100">
                Lunas
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Tanggal</span>
                <span className="text-slate-600">
                  {formatToReadableDateTime(payment.tanggal_bayar || payment.created_at)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Nominal Bayar</span>
                <span className="font-extrabold text-slate-900 font-mono">
                  {formatRupiah(payment.jumlah_bayar)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
