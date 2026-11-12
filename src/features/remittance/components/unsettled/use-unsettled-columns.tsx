"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import type { UnsettledTransactionItem } from "../../types";
import { getUnsettledItemMetrics } from "../../utils/remittance-utils";

interface UseUnsettledColumnsOptions {
  selectedSet: Set<string>;
  allVisibleSelected: boolean;
  onToggleItem: (uid: string) => void;
  onToggleAllVisible: (checked: boolean) => void;
}

export function useUnsettledColumns({
  selectedSet,
  allVisibleSelected,
  onToggleItem,
  onToggleAllVisible,
}: UseUnsettledColumnsOptions) {
  return useMemo<ColumnDef<UnsettledTransactionItem>[]>(
    () => [
      {
        id: "select",
        size: 40,
        enableSorting: false,
        meta: {
          headerClassName: "w-10 text-center",
          cellClassName: "w-10 text-center",
        },
        header: () => (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={allVisibleSelected}
              onCheckedChange={(val) => onToggleAllVisible(Boolean(val))}
              aria-label="Pilih semua item yang ditampilkan"
            />
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isSelected = selectedSet.has(item.uid);
          return (
            <div
              className="flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleItem(item.uid)}
                aria-label={`Pilih item ${item.nama_produk || item.product?.nama || item.uid}`}
              />
            </div>
          );
        },
      },
      {
        accessorKey: "nomor_transaksi",
        header: "No. Struk",
        size: 160,
        cell: ({ row }) => {
          const item = row.original;
          const noTransaksi = item.sale?.nomor_transaksi || item.no_struk || "—";
          const rawDate =
            item.sale?.tanggal_transaksi ||
            item.sale?.created_at ||
            item.created_at ||
            item.tanggal;
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
        accessorKey: "nama_produk",
        header: "Produk Titipan",
        size: 240,
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
        size: 65,
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
          const { hargaJual } = getUnsettledItemMetrics(row.original);
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
          const { hargaPasok } = getUnsettledItemMetrics(row.original);
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
          const { komisi } = getUnsettledItemMetrics(row.original);
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
          const { wajibSetor } = getUnsettledItemMetrics(row.original);
          return formatRupiah(wajibSetor);
        },
      },
    ],
    [allVisibleSelected, onToggleAllVisible, onToggleItem, selectedSet]
  );
}
