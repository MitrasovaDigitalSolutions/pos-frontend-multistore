"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatToReadableDate } from "@/lib/date-utils";
import type { ConsignmentReceiving } from "../../types";

export function useConsignmentColumns() {
  return useMemo<ColumnDef<ConsignmentReceiving>[]>(
    () => [
      {
        accessorKey: "nomor_konsinyasi",
        header: "Nomor Konsinyasi",
        size: 180,
        meta: { headerClassName: "text-left", cellClassName: "text-left font-bold text-slate-900" },
        cell: ({ row }) => (
          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {row.original.nomor_konsinyasi}
          </span>
        ),
      },
      {
        accessorKey: "tanggal_terima",
        header: "Tanggal Terima",
        size: 140,
        cell: ({ row }) => (
          <span className="text-xs text-slate-600">
            {formatToReadableDate(row.original.tanggal_terima || row.original.created_at)}
          </span>
        ),
      },
      {
        accessorKey: "supplier",
        header: "Supplier",
        size: 180,
        cell: ({ row }) => {
          const suppName = row.original.supplier || row.original.supplier_relationship?.nama || "—";
          return <span className="text-xs font-semibold text-slate-800">{suppName}</span>;
        },
      },
      {
        accessorKey: "items",
        header: "Jumlah Produk",
        size: 120,
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
        cell: ({ row }) => {
          const totalQty = row.original.items?.reduce((acc, item) => acc + Number(item.kuantitas || 0), 0) || 0;
          const count = row.original.items?.length || 0;
          return (
            <span className="text-xs font-medium text-slate-700">
              {count} produk ({totalQty} pcs)
            </span>
          );
        },
      },
      {
        accessorKey: "total_nilai",
        header: "Total Nilai Titipan",
        size: 160,
        meta: { headerClassName: "text-right", cellClassName: "text-right font-bold text-slate-900" },
        cell: ({ row }) => {
          const totalNilai =
            row.original.items?.reduce(
              (acc, item) => acc + Number(item.kuantitas || 0) * Number(item.harga_beli || 0),
              0
            ) || 0;
          return <span className="text-xs font-bold text-slate-900">{formatRupiah(totalNilai)}</span>;
        },
      },
      {
        accessorKey: "sisa_hutang",
        header: "Sisa Hutang",
        size: 150,
        meta: { headerClassName: "text-right", cellClassName: "text-right" },
        cell: ({ row }) => {
          const sisaHutang = Number(row.original.sisa_hutang || 0);
          if (sisaHutang <= 0) {
            return <span className="text-xs text-slate-400">—</span>;
          }
          return (
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {formatRupiah(sisaHutang)}
            </span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 140,
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    []
  );
}
