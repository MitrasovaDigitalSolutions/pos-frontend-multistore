"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import type { UnsettledTransactionItem } from "../../types";

interface UnsettledTransactionCardProps {
  item: UnsettledTransactionItem;
}

export function UnsettledTransactionCard({ item }: UnsettledTransactionCardProps) {
  const noTransaksi = item.sale?.nomor_transaksi || item.no_struk || "—";
  const rawDate = item.sale?.tanggal_transaksi || item.created_at || item.tanggal;
  const tanggalFormatted = rawDate
    ? formatDate(rawDate, "dd MMM yyyy, HH:mm") || rawDate
    : "—";
  const namaProduk = item.nama_produk || item.product?.nama || item.product_nama || "—";
  const barcode = item.barcode || item.product?.barcode || item.product_barcode;
  const hargaPasok = Number(item.harga_pasok ?? item.harga_beli_cabang ?? item.harga_beli ?? 0);
  const wajibSetor = Number(
    item.wajib_setor ?? (hargaPasok * Number(item.kuantitas || 1))
  );
  const komisi = Number(item.fee_komisi_toko ?? item.laba_cabang ?? item.komisi_toko ?? 0);

  return (
    <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 text-xs shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono font-bold text-slate-900 block">{noTransaksi}</span>
          <span className="text-[10px] text-slate-400 block">{tanggalFormatted}</span>
        </div>
        <span className="font-bold text-blue-700 font-mono text-sm">
          {formatRupiah(wajibSetor)}
        </span>
      </div>

      <div>
        <span className="font-semibold text-slate-800 leading-tight block">
          {namaProduk}
        </span>
        {barcode && (
          <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
            {barcode}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-slate-500">
        <span>
          Qty: <strong className="text-slate-800 font-mono">{item.kuantitas}</strong> • Kasir:{" "}
          <span className="text-slate-700">{item.kasir_nama || "Kasir"}</span>
        </span>
        <span>
          Komisi:{" "}
          <strong className="text-emerald-600 font-mono">+{formatRupiah(komisi)}</strong>
        </span>
      </div>
    </div>
  );
}
