"use client";

import React, { useMemo } from "react";
import { IconPackage, IconRefresh, IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormInput } from "@/components/forms/form-input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";

interface TransferDetailItemsTableProps {
  items: StockTransferItem[];
  canReceive: boolean;
  onResetAllQty: () => void;
}

// Inner helper component to watch individual row values for discrepancy warning icon
function ReceivingItemRowControls({
  index,
  item,
}: {
  index: number;
  item: StockTransferItem;
}) {
  const { watch } = useFormContext<ReceiveFormValues>();
  const currentQty = watch(`items.${index}.kuantitas_diterima`);
  const isDifferent =
    currentQty !== undefined &&
    currentQty !== null &&
    Number(currentQty) !== Number(item.kuantitas);

  return (
    <div className="flex items-center justify-center gap-1.5">
      <FormNumberInput<ReceiveFormValues>
        name={`items.${index}.kuantitas_diterima`}
        min={0}
        className={`h-8 w-24 text-xs text-center font-extrabold ${isDifferent
          ? "border-amber-400 bg-amber-50 text-amber-900 focus-visible:ring-amber-500"
          : "bg-white border-slate-200"
          }`}
      />
      {isDifferent && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-amber-500 shrink-0 cursor-pointer">
                <IconAlertTriangle size={15} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Jumlah diterima berbeda dari jumlah dikirim</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

export function TransferDetailItemsTable({
  items,
  canReceive,
  onResetAllQty,
}: TransferDetailItemsTableProps) {
  const columns = useMemo<ColumnDef<StockTransferItem>[]>(() => {
    if (canReceive) {
      return [
        {
          accessorKey: "product.nama",
          header: "Produk",
          size: 200,
          cell: ({ row }) => (
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-800 text-xs">
                {row.original.product?.nama || "—"}
              </span>
              {row.original.product?.barcode && (
                <span className="font-mono text-[10px] text-slate-400">
                  {row.original.product.barcode}
                </span>
              )}
            </div>
          ),
        },
        {
          accessorKey: "kuantitas",
          header: "Jumlah Dikirim",
          size: 110,
          meta: { headerClassName: "text-center", cellClassName: "text-center font-bold text-slate-900" },
          cell: ({ row }) => (
            <span className="inline-block bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-black">
              {row.original.kuantitas} pcs
            </span>
          ),
        },
        {
          id: "input_kuantitas_diterima",
          header: "Jumlah Diterima (Pcs)",
          size: 140,
          meta: { headerClassName: "text-center", cellClassName: "text-center" },
          cell: ({ row }) => (
            <ReceivingItemRowControls index={row.index} item={row.original} />
          ),
        },
        {
          id: "input_keterangan",
          header: "Catatan Penerimaan / Alasan Selisih",
          size: 220,
          cell: ({ row }) => (
            <FormInput<ReceiveFormValues>
              name={`items.${row.index}.keterangan`}
              placeholder="Misal: 1 pcs rusak di jalan..."
              maxLength={500}
              className="h-8 text-xs bg-white"
            />
          ),
        },
      ];
    }

    // Read-only mode columns
    return [
      {
        accessorKey: "product.nama",
        header: "Produk",
        size: 220,
        cell: ({ row }) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-slate-800 text-xs">
              {row.original.product?.nama || "—"}
            </span>
            {row.original.product?.barcode && (
              <span className="font-mono text-[10px] text-slate-400">
                {row.original.product.barcode}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "kuantitas",
        header: "Dikirim",
        size: 90,
        meta: { headerClassName: "text-center", cellClassName: "text-center font-bold text-slate-900" },
        cell: ({ row }) => (
          <span className="inline-block bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md text-xs font-extrabold">
            {row.original.kuantitas} pcs
          </span>
        ),
      },
      {
        id: "kuantitas_diterima",
        header: "Diterima",
        size: 90,
        meta: { headerClassName: "text-center", cellClassName: "text-center font-bold" },
        cell: ({ row }) => {
          const qRec = row.original.kuantitas_diterima;
          const qSent = row.original.kuantitas;
          if (qRec == null) return <span className="text-slate-400 text-xs">—</span>;
          const isMatch = qRec === qSent;
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-xs font-extrabold ${isMatch
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
            >
              {qRec} pcs
            </span>
          );
        },
      },
      {
        accessorKey: "keterangan",
        header: "Catatan Item",
        size: 150,
        cell: ({ row }) => (
          <span className="text-xs text-slate-600 italic">
            {row.original.keterangan || "—"}
          </span>
        ),
      },
      {
        id: "stok_source",
        header: "Dampak Stok (Asal)",
        size: 130,
        meta: { headerClassName: "text-center", cellClassName: "text-center text-xs" },
        cell: ({ row }) => {
          const s1 = row.original.stok_sebelum_source;
          const s2 = row.original.stok_sesudah_source;
          if (s1 == null && s2 == null) return <span className="text-slate-400">—</span>;
          return (
            <span className="font-medium text-slate-700">
              {s1 ?? "—"} ➔ <span className="font-bold text-rose-600">{s2 ?? "—"}</span>
            </span>
          );
        },
      },
      {
        id: "stok_dest",
        header: "Dampak Stok (Tujuan)",
        size: 130,
        meta: { headerClassName: "text-center", cellClassName: "text-center text-xs" },
        cell: ({ row }) => {
          const s1 = row.original.stok_sebelum_dest;
          const s2 = row.original.stok_sesudah_dest;
          if (s1 == null && s2 == null) return <span className="text-slate-400">—</span>;
          return (
            <span className="font-medium text-slate-700">
              {s1 ?? "—"} ➔ <span className="font-bold text-emerald-600">{s2 ?? "—"}</span>
            </span>
          );
        },
      },
    ];
  }, [canReceive]);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
      {/* Table Header / Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <IconPackage size={18} className="text-emerald-600" />
          <span>Daftar Produk Dikirim</span>
        </h3>

        {canReceive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetAllQty}
            className="h-7 text-xs font-bold text-emerald-700 hover:bg-emerald-50 px-2 rounded-lg gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <IconRefresh size={13} />
            Reset Semua ke Jumlah Dikirim
          </Button>
        ) : (
          <span className="text-xs text-slate-400 font-semibold">
            {items.length} Produk
          </span>
        )}
      </div>

      {canReceive && (
        <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 flex items-start gap-2">
          <IconInfoCircle size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <strong>Penerimaan Stok Aktif:</strong> Anda dapat mengisi angka pada kolom{" "}
            <strong>Jumlah Diterima</strong> dan catatan item langsung di tabel di bawah sebelum menekan tombol{" "}
            <strong>Terima & Konfirmasi Stok</strong>.
          </div>
        </div>
      )}

      <DataTable columns={columns} data={items} virtualize={false} />
    </div>
  );
}
