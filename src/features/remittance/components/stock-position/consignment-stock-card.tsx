"use client";

import { IconBuildingStore } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { ConsignmentStockPosition } from "../../types";

interface ConsignmentStockCardProps {
  item: ConsignmentStockPosition;
  showStoreColumn?: boolean;
}

function formatQty(val?: number | string | null): string {
  if (val === undefined || val === null || val === "") return "0";
  const num = Number(val);
  return isNaN(num) ? "0" : num.toLocaleString("id-ID");
}

export function ConsignmentStockCard({
  item,
  showStoreColumn = false,
}: ConsignmentStockCardProps) {
  const nama = item.product?.nama || item.nama_produk || "-";
  const barcode = item.product?.barcode || item.product?.sku || item.sku || "-";
  const satuan = item.product?.satuan || item.unit || "Pcs";
  const kategori = item.product?.category?.nama;
  const storeNama = item.store?.nama || item.store_nama || "Cabang";

  const sisaStok = Number(item.stok ?? item.sisa_stok ?? 0);
  const hargaPasok = Number(
    item.harga_beli_cabang ?? item.harga_beli ?? item.harga_pasok ?? 0
  );
  const hargaJual = Number(item.harga_jual_cabang ?? item.harga_jual ?? 0);
  const labaCabang = Number(
    item.laba_cabang ??
      item.komisi_per_unit ??
      Math.max(0, hargaJual - hargaPasok)
  );
  const margin = hargaJual > 0 ? Math.round((labaCabang / hargaJual) * 100) : 0;
  const subtotalPasok = hargaPasok * sisaStok;

  return (
    <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 text-xs shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-slate-900 leading-tight">
            {nama}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
            <span>{barcode}</span>
            <span>•</span>
            <span>{satuan}</span>
            {kategori && <span>• {kategori}</span>}
          </div>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0 font-mono">
          {formatQty(sisaStok)} {satuan}
        </span>
      </div>

      {showStoreColumn && (
        <div className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded">
          <IconBuildingStore size={11} className="text-slate-400" />
          <span>{storeNama}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
        <div>
          <span className="text-slate-400 block text-[10px]">Harga Pasok</span>
          <span className="font-mono font-medium text-purple-950">
            {formatRupiah(hargaPasok)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Harga Banderol</span>
          <span className="font-mono font-medium text-slate-800">
            {formatRupiah(hargaJual)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Nilai Pasok Total</span>
          <span className="font-mono font-bold text-slate-900">
            {formatRupiah(subtotalPasok)}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Laba Cabang</span>
          <span className="font-mono font-semibold text-emerald-600">
            +{formatRupiah(labaCabang)} ({margin}%)
          </span>
        </div>
      </div>
    </div>
  );
}
