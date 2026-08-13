"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPackage } from "@tabler/icons-react";
import type { ConsignmentReceivingItem } from "../../types";

interface ConsignmentItemsTabProps {
  items?: ConsignmentReceivingItem[];
}

export function ConsignmentItemsTab({ items }: ConsignmentItemsTabProps) {
  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-medium">
        Tidak ada barang titipan tercatat untuk konsinyasi ini.
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
              <th className="p-3">Nama Produk</th>
              <th className="p-3 text-right">Harga Beli</th>
              <th className="p-3 text-center">Qty Titipan</th>
              <th className="p-3 text-center">Terjual</th>
              <th className="p-3 text-center">Retur</th>
              <th className="p-3 text-center">Sisa</th>
              <th className="p-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-medium">
            {items.map((item, idx) => {
              const qty = Number(item.kuantitas || 0);
              const price = Number(item.harga_beli || 0);
              const subtotal = qty * price;
              const terjual = Number(item.qty_terjual || 0);
              const retur = Number(item.qty_diretur || 0);
              const sisa = item.sisa !== undefined ? item.sisa : qty - terjual - retur;

              return (
                <tr key={item.uid || idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3">
                    <p className="font-semibold text-slate-900">
                      {item.product?.nama || "Produk Konsinyasi"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {item.product?.barcode || "—"}
                    </p>
                  </td>
                  <td className="p-3 text-right text-slate-700 font-mono">
                    {formatRupiah(price)}
                  </td>
                  <td className="p-3 text-center font-bold text-slate-900 font-mono">
                    {qty} pcs
                  </td>
                  <td className="p-3 text-center font-mono">
                    <span className={terjual > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}>
                      {terjual} pcs
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono">
                    <span className={retur > 0 ? "text-amber-600 font-bold" : "text-slate-400"}>
                      {retur} pcs
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono">
                    <span className="font-bold text-slate-800">{sisa} pcs</span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 font-mono">
                    {formatRupiah(subtotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="block sm:hidden space-y-2.5">
        {items.map((item, idx) => {
          const qty = Number(item.kuantitas || 0);
          const price = Number(item.harga_beli || 0);
          const subtotal = qty * price;
          const terjual = Number(item.qty_terjual || 0);
          const retur = Number(item.qty_diretur || 0);
          const sisa = item.sisa !== undefined ? item.sisa : qty - terjual - retur;

          return (
            <div
              key={item.uid || idx}
              className="p-3 rounded-xl border border-slate-100 bg-white space-y-2 shadow-2xs"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-50 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <IconPackage size={14} className="stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs truncate">
                      {item.product?.nama || "Produk Konsinyasi"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {item.product?.barcode || "—"}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[10px] font-extrabold font-mono shrink-0">
                  {qty} pcs
                </span>
              </div>

              {/* Body */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-0.5">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Harga Beli</span>
                  <span className="font-semibold text-slate-700 font-mono">
                    {formatRupiah(price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Subtotal</span>
                  <span className="font-extrabold text-slate-900 font-mono">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
              </div>

              {/* Footer details */}
              <div className="flex items-center justify-between gap-2 border-t border-dashed border-slate-100 pt-2 text-[10px]">
                <span className="text-slate-500 font-medium">
                  Terjual: <strong className="text-emerald-600">{terjual} pcs</strong>
                </span>
                <span className="text-slate-500 font-medium">
                  Retur: <strong className="text-amber-600">{retur} pcs</strong>
                </span>
                <span className="text-slate-500 font-medium">
                  Sisa: <strong className="text-slate-800 font-bold">{sisa} pcs</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
