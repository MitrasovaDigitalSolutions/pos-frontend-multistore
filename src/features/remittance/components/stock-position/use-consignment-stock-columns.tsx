"use client";

import { useMemo } from "react";
import { IconBuildingStore, IconTag } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { ConsignmentStockPosition } from "../../types";

function formatQty(val?: number | string | null): string {
  if (val === undefined || val === null || val === "") return "0";
  const num = Number(val);
  return isNaN(num) ? "0" : num.toLocaleString("id-ID");
}

interface UseConsignmentStockColumnsOptions {
  showStoreColumn?: boolean;
}

export function useConsignmentStockColumns({
  showStoreColumn = false,
}: UseConsignmentStockColumnsOptions = {}) {
  return useMemo<ColumnDef<ConsignmentStockPosition>[]>(() => {
    const cols: ColumnDef<ConsignmentStockPosition>[] = [
      {
        accessorKey: "nama",
        header: "Produk Titipan",
        size: 220,
        cell: ({ row }) => {
          const item = row.original;
          const nama = item.product?.nama || item.nama_produk || "-";
          const barcode = item.product?.barcode || item.product?.sku || item.sku || "-";
          const satuan = item.product?.satuan || item.unit || "Pcs";
          const kategori = item.product?.category?.nama;

          return (
            <div className="min-w-0">
              <span className="font-semibold text-slate-900 block leading-tight">
                {nama}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                <span>{barcode}</span>
                <span>•</span>
                <span>{satuan}</span>
                {kategori && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-700 bg-purple-50 px-1 py-0.2 rounded font-sans">
                      <IconTag size={9} />
                      {kategori}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        },
      },
    ];

    if (showStoreColumn) {
      cols.push({
        accessorKey: "store_nama",
        header: "Cabang",
        size: 130,
        cell: ({ row }) => {
          const storeNama = row.original.store?.nama || row.original.store_nama || "Cabang";
          return (
            <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
              <IconBuildingStore size={11} className="text-slate-500" />
              {storeNama}
            </span>
          );
        },
      });
    }

    cols.push(
      {
        id: "harga_pasok",
        header: "Harga Pasok",
        size: 110,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right font-medium text-purple-950 font-mono",
        },
        cell: ({ row }) => {
          const item = row.original;
          const hargaPasok = Number(
            item.harga_beli_cabang ?? item.harga_beli ?? item.harga_pasok ?? 0
          );
          return formatRupiah(hargaPasok);
        },
      },
      {
        id: "harga_jual",
        header: "Harga Banderol",
        size: 110,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right font-medium text-slate-800 font-mono",
        },
        cell: ({ row }) => {
          const item = row.original;
          const hargaJual = Number(item.harga_jual_cabang ?? item.harga_jual ?? 0);
          return formatRupiah(hargaJual);
        },
      },
      {
        id: "laba_cabang",
        header: "Laba Cabang",
        size: 110,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right",
        },
        cell: ({ row }) => {
          const item = row.original;
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

          return (
            <div>
              <span className="font-semibold text-emerald-700 font-mono block">
                +{formatRupiah(labaCabang)}
              </span>
              <span className="text-[10px] text-emerald-600 font-mono">
                {margin}%
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "stok",
        header: "Sisa Stok",
        size: 100,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row }) => {
          const item = row.original;
          const sisaStok = Number(item.stok ?? item.sisa_stok ?? 0);
          const satuan = item.product?.satuan || item.unit || "Pcs";

          return (
            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
              {formatQty(sisaStok)} {satuan}
            </span>
          );
        },
      },
      {
        id: "total_nilai_pasok",
        header: "Total Nilai Pasok",
        size: 130,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right font-bold text-slate-900 font-mono",
        },
        cell: ({ row }) => {
          const item = row.original;
          const sisaStok = Number(item.stok ?? item.sisa_stok ?? 0);
          const hargaPasok = Number(
            item.harga_beli_cabang ?? item.harga_beli ?? item.harga_pasok ?? 0
          );
          return formatRupiah(hargaPasok * sisaStok);
        },
      },
      {
        id: "potensi_omzet",
        header: "Potensi Omzet",
        size: 120,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right font-medium text-slate-500 font-mono",
        },
        cell: ({ row }) => {
          const item = row.original;
          const sisaStok = Number(item.stok ?? item.sisa_stok ?? 0);
          const hargaJual = Number(item.harga_jual_cabang ?? item.harga_jual ?? 0);
          return formatRupiah(hargaJual * sisaStok);
        },
      }
    );

    return cols;
  }, [showStoreColumn]);
}
