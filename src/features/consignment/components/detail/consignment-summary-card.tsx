"use client";

import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import type { ConsignmentReceiving } from "../../types";
import { CONSIGNMENT_STATUS_BADGE } from "../../constants";

interface ConsignmentSummaryCardProps {
  item: ConsignmentReceiving;
}

export function ConsignmentSummaryCard({ item }: ConsignmentSummaryCardProps) {
  const statusInfo = CONSIGNMENT_STATUS_BADGE[item.status] || {
    label: item.status,
    variant: "secondary" as const,
  };

  const totalNilai =
    item.items?.reduce(
      (acc, it) => acc + Number(it.kuantitas || 0) * Number(it.harga_beli || 0),
      0
    ) || 0;

  const totalItemsCount =
    item.items?.reduce((acc, it) => acc + Number(it.kuantitas || 0), 0) || 0;

  const sisaHutang = Number(item.sisa_hutang || 0);

  return (
    <section className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-5 space-y-4">
      <h3 className="text-xs font-bold text-slate-900 pb-3 border-b border-slate-50 flex items-center justify-between">
        <span>Ringkasan Konsinyasi</span>
        <Badge variant={statusInfo.variant} className="px-2 py-0.5 text-[10px] font-bold">
          {statusInfo.label}
        </Badge>
      </h3>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            No. Konsinyasi
          </span>
          <p className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate">{item.nomor_konsinyasi}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Tanggal Terima
          </span>
          <p className="font-semibold text-slate-700">
            {formatToReadableDate(item.tanggal_terima || item.created_at)}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Tgl. Jatuh Tempo
          </span>
          <p className="font-semibold text-slate-700">
            {item.tanggal_jatuh_tempo ? formatToReadableDate(item.tanggal_jatuh_tempo) : "—"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Supplier
          </span>
          <p className="font-semibold text-slate-800 truncate">
            {item.supplier || item.supplier_relationship?.nama || "—"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Pencatat / User
          </span>
          <p className="font-semibold text-slate-700 truncate">{item.user?.nama || "—"}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Nilai Titipan
          </span>
          <p className="font-extrabold text-slate-900 text-sm font-mono text-emerald-600">
            {formatRupiah(totalNilai)}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Sisa Hutang Konsinyasi
          </span>
          {sisaHutang > 0 ? (
            <p className="font-bold text-rose-600 font-mono">{formatRupiah(sisaHutang)}</p>
          ) : (
            <p className="font-semibold text-emerald-600 text-[11px]">Rp 0 (Lunas)</p>
          )}
        </div>

        <div className="space-y-1 col-span-2 pt-2 border-t border-slate-50 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Produk & Kuantitas
          </span>
          <span className="font-bold text-slate-800 font-mono">
            {item.items?.length || 0} produk ({totalItemsCount} pcs)
          </span>
        </div>

        <div className="space-y-1 col-span-2 pt-2 border-t border-slate-50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Catatan / Keterangan
          </span>
          <p className="text-slate-600 font-medium leading-relaxed">
            {item.catatan || "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
