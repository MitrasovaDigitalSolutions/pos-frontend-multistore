"use client";

import { useMemo } from "react";
import { IconBoxSeam, IconCash, IconPackage, IconReceipt2 } from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { ConsignmentStockPosition } from "../../types";

interface ConsignmentStockStatTilesProps {
  items: ConsignmentStockPosition[];
  isLoading?: boolean;
}

function formatQty(val?: number | string | null): string {
  if (val === undefined || val === null || val === "") return "0";
  const num = Number(val);
  return isNaN(num) ? "0" : num.toLocaleString("id-ID");
}

export function ConsignmentStockStatTiles({
  items,
  isLoading = false,
}: ConsignmentStockStatTilesProps) {
  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
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

        return {
          totalSisaStok: acc.totalSisaStok + sisaStok,
          totalNilaiPasok: acc.totalNilaiPasok + hargaPasok * sisaStok,
          totalPotensiOmzet: acc.totalPotensiOmzet + hargaJual * sisaStok,
          totalPotensiLaba: acc.totalPotensiLaba + labaCabang * sisaStok,
        };
      },
      {
        totalSisaStok: 0,
        totalNilaiPasok: 0,
        totalPotensiOmzet: 0,
        totalPotensiLaba: 0,
      }
    );
  }, [items]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      {/* 1. Total SKU */}
      <div className="p-2.5 sm:p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Total SKU
          </span>
          <span className="text-base font-bold text-slate-900 font-mono mt-0.5 block">
            {isLoading ? "-" : items.length} SKU
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <IconPackage size={15} />
        </div>
      </div>

      {/* 2. Total Sisa Stok Fisik */}
      <div className="p-2.5 sm:p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Sisa Stok
          </span>
          <span className="text-base font-bold text-blue-600 font-mono mt-0.5 block">
            {isLoading ? "-" : formatQty(totals.totalSisaStok)} unit
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <IconBoxSeam size={15} />
        </div>
      </div>

      {/* 3. Nilai Wajib Setor (Harga Pasok) */}
      <div className="p-2.5 sm:p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Nilai Wajib Setor
          </span>
          <span className="text-base font-bold text-purple-600 font-mono mt-0.5 block">
            {isLoading ? "-" : formatRupiah(totals.totalNilaiPasok)}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <IconReceipt2 size={15} />
        </div>
      </div>

      {/* 4. Potensi Komisi Cabang */}
      <div className="p-2.5 sm:p-3 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between shadow-2xs">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate">
            Potensi Komisi
          </span>
          <span className="text-base font-bold text-emerald-600 font-mono mt-0.5 block">
            {isLoading ? "-" : `+${formatRupiah(totals.totalPotensiLaba)}`}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <IconCash size={15} />
        </div>
      </div>
    </div>
  );
}
