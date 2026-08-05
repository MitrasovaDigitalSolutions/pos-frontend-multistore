"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FormInput } from "@/components/forms/form-input";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";
import { JENIS_SELISIH_CLASSES, JENIS_SELISIH_LABELS } from "../../constants";
import { ReceivingItemRowControls } from "./receiving-item-row-controls";
import { ReturnValidationRowControls } from "./return-validation-row-controls";

interface UseTransferDetailItemsColumnsProps {
  canReceive: boolean;
  canValidateReturn?: boolean;
  onReceiveItem?: (item: StockTransferItem, status: "received" | "rejected") => void;
  processingItemUid?: string | null;
  onValidateReturnItem?: (item: StockTransferItem, kuantitasReturn: number) => void;
  validatingItemUid?: string | null;
}

export function useTransferDetailItemsColumns({
  canReceive,
  canValidateReturn,
  onReceiveItem,
  processingItemUid,
  onValidateReturnItem,
  validatingItemUid,
}: UseTransferDetailItemsColumnsProps) {
  return useMemo<ColumnDef<StockTransferItem>[]>(() => {
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
          header: "Penerimaan & Status",
          size: 260,
          meta: { headerClassName: "text-left", cellClassName: "text-left" },
          cell: ({ row }) => {
            if (row.original.status !== null && row.original.status !== undefined) {
              const qRec = row.original.kuantitas_diterima;
              const isRejected = row.original.status === "rejected";
              const jenisSelisih = row.original.jenis_selisih;

              if (isRejected) {
                return (
                  <div className="flex flex-col gap-1 items-start">
                    <span className="inline-block px-2 py-0.5 rounded-md text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                      Ditolak ({qRec} pcs)
                    </span>
                    {jenisSelisih && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${JENIS_SELISIH_CLASSES[jenisSelisih]}`}>
                        {JENIS_SELISIH_LABELS[jenisSelisih]}
                      </span>
                    )}
                  </div>
                );
              }

              return (
                <span className="inline-block px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Diterima ({qRec} pcs)
                </span>
              );
            }

            return (
              <ReceivingItemRowControls
                index={row.index}
                item={row.original}
                onReceiveItem={onReceiveItem}
                isProcessing={processingItemUid === row.original.uid}
              />
            );
          },
        },
        {
          id: "input_keterangan",
          header: "Catatan Penerimaan / Alasan Selisih",
          size: 220,
          cell: ({ row }) => {
            if (row.original.status !== null && row.original.status !== undefined) {
              return (
                <span className="text-xs text-slate-600 italic">
                  {row.original.keterangan || "—"}
                </span>
              );
            }
            return (
              <FormInput<ReceiveFormValues>
                name={`items.${row.index}.keterangan`}
                placeholder="Misal: 1 pcs rusak di jalan..."
                maxLength={500}
                className="h-8 text-xs bg-white"
                disabled={processingItemUid === row.original.uid}
              />
            );
          },
        },
      ];
    }

    if (canValidateReturn) {
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
          accessorKey: "kuantitas_diterima",
          header: "Diterima",
          size: 110,
          meta: { headerClassName: "text-center", cellClassName: "text-center font-bold text-slate-900" },
          cell: ({ row }) => {
            const val = row.original.kuantitas_diterima;
            return (
              <span className="inline-block bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg text-xs font-black">
                {val != null ? val : "—"} pcs
              </span>
            );
          },
        },
        {
          id: "input_kuantitas_return",
          header: "Selisih / Return & Status",
          size: 260,
          meta: { headerClassName: "text-left", cellClassName: "text-left" },
          cell: ({ row }) => (
            <ReturnValidationRowControls
              item={row.original}
              onValidateReturnItem={onValidateReturnItem}
              isProcessing={validatingItemUid === row.original.uid}
            />
          ),
        },
        {
          accessorKey: "keterangan",
          header: "Catatan",
          size: 200,
          cell: ({ row }) => (
            <span className="text-xs text-slate-600 italic">
              {row.original.keterangan || "—"}
            </span>
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
          const status = row.original.status;
          const isRejected = status === "rejected";
          const jenisSelisih = row.original.jenis_selisih;

          if (isRejected) {
            return (
              <div className="flex flex-col items-center gap-1">
                <span className="inline-block px-2 py-0.5 rounded-md text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                  Ditolak
                </span>
                {jenisSelisih && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold border ${JENIS_SELISIH_CLASSES[jenisSelisih]}`}>
                    {JENIS_SELISIH_LABELS[jenisSelisih]}
                  </span>
                )}
              </div>
            );
          }

          const isMatch = qRec === qSent;
          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-xs font-extrabold ${
                isMatch
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
  }, [canReceive, canValidateReturn, onReceiveItem, processingItemUid, onValidateReturnItem, validatingItemUid]);
}
