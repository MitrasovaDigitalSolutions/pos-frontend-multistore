"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import type { UnsettledTransactionItem } from "../../types";

export function useUnsettledColumns() {
  return useMemo<ColumnDef<UnsettledTransactionItem>[]>(
    () => [
      {
        accessorKey: "nomor_transaksi",
        header: "No. Struk",
        size: 160,
        cell: ({ row }) => {
          const item = row.original;
          const noTransaksi = item.sale?.nomor_transaksi || item.no_struk || "—";
          const rawDate = item.sale?.tanggal_transaksi || item.created_at || item.tanggal;
          const tanggalFormatted = rawDate
            ? formatDate(rawDate, "dd MMM yyyy, HH:mm") || rawDate
            : "—";

          return (
            <div>
              <span className="font-mono font-bold text-slate-900 block leading-tight">
                {noTransaksi}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {tanggalFormatted}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "kasir",
        header: "Kasir",
        size: 120,
        cell: ({ row }) => (
          <span className="text-slate-600 font-medium">
            {row.original.kasir_nama || "Kasir"}
          </span>
        ),
      },
      {
        accessorKey: "nama_produk",
        header: "Produk Titipan",
        size: 220,
        cell: ({ row }) => {
          const item = row.original;
          const namaProduk = item.nama_produk || item.product?.nama || item.product_nama || "—";
          const barcode = item.barcode || item.product?.barcode || item.product_barcode;

          return (
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 block leading-tight line-clamp-1">
                {namaProduk}
              </span>
              {barcode && (
                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                  {barcode}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "kuantitas",
        header: "Qty",
        size: 70,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right font-bold text-slate-800 font-mono",
        },
        cell: ({ row }) => row.original.kuantitas,
      },
      {
        id: "harga_jual",
        header: "Harga Jual",
        size: 110,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right text-slate-600 font-mono",
        },
        cell: ({ row }) => {
          const item = row.original;
          const hargaJual = Number(item.harga_satuan ?? item.harga_jual_cabang ?? item.harga_jual ?? 0);
          return formatRupiah(hargaJual);
        },
      },
      {
        id: "harga_pasok",
        header: "Harga Pasok",
        size: 110,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right text-slate-600 font-mono",
        },
        cell: ({ row }) => {
          const item = row.original;
          const hargaPasok = Number(item.harga_pasok ?? item.harga_beli_cabang ?? item.harga_beli ?? 0);
          return formatRupiah(hargaPasok);
        },
      },
      {
        id: "komisi",
        header: "Komisi",
        size: 110,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right text-emerald-600 font-bold font-mono",
        },
        cell: ({ row }) => {
          const item = row.original;
          const komisi = Number(item.fee_komisi_toko ?? item.laba_cabang ?? item.komisi_toko ?? 0);
          return `+${formatRupiah(komisi)}`;
        },
      },
      {
        id: "wajib_setor",
        header: "Wajib Setor",
        size: 120,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right font-bold text-blue-700 font-mono whitespace-nowrap",
        },
        cell: ({ row }) => {
          const item = row.original;
          const hargaPasok = Number(item.harga_pasok ?? item.harga_beli_cabang ?? item.harga_beli ?? 0);
          const wajibSetor = Number(
            item.wajib_setor ?? (hargaPasok * Number(item.kuantitas || 1))
          );
          return formatRupiah(wajibSetor);
        },
      },
    ],
    []
  );
}
