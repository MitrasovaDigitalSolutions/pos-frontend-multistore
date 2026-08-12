"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormInput } from "@/components/forms/form-input";
import { Badge } from "@/components/ui/badge";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";
import { JENIS_SELISIH, JENIS_SELISIH_LABELS } from "../../constants";

interface UseTransferDetailItemsColumnsProps {
  items: StockTransferItem[];
  canReceive: boolean;
  canValidateTransfer?: boolean;
  onReceiveItemSubmit?: (
    item: StockTransferItem,
    payload: {
      status: "received" | "rejected";
      kuantitas_diterima: number;
      jenis_selisih?: "salah_input" | "rusak" | "hilang";
      keterangan?: string;
    }
  ) => Promise<void>;
  processingItemUid?: string | null;
  onValidateItem?: (
    item: StockTransferItem,
    payload: { jenis: "retur" | "koreksi"; kuantitas_return?: number; setujui?: boolean }
  ) => void;
  validatingItemUid?: string | null;
}

function getJenisSelisihBadgeVariant(js: string) {
  if (js === JENIS_SELISIH.RUSAK) return "danger";
  if (js === JENIS_SELISIH.SALAH_INPUT) return "warning";
  return "secondary";
}

export function useTransferDetailItemsColumns({
  items,
  canReceive,
  canValidateTransfer,
  processingItemUid,
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
          header: "Dikirim",
          size: 85,
          meta: { headerClassName: "text-center", cellClassName: "text-center font-bold text-slate-900" },
          cell: ({ row }) => (
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700">
              {row.original.kuantitas} pcs
            </Badge>
          ),
        },
        {
          id: "input_kuantitas_diterima",
          header: "Qty Diterima",
          size: 110,
          meta: { headerClassName: "text-center", cellClassName: "text-center" },
          cell: ({ row }) => {
            if (row.original.status !== null && row.original.status !== undefined) {
              const qRec = row.original.kuantitas_diterima;
              const isRejected = row.original.status === "rejected";
              return (
                <Badge variant={isRejected ? "danger" : "success"} className="px-2.5 py-0.5 text-xs font-bold">
                  {isRejected ? "Ditolak" : `${qRec} pcs`}
                </Badge>
              );
            }

            const idx = items.findIndex((it) => it.uid === row.original.uid);
            const targetIdx = idx >= 0 ? idx : row.index;

            return (
              <FormNumberInput<ReceiveFormValues>
                name={`items.${targetIdx}.kuantitas_diterima`}
                min={0}
                disabled={processingItemUid === row.original.uid}
                className="h-8 w-20 text-xs text-center font-bold mx-auto border-slate-200 bg-white"
              />
            );
          },
        },
        {
          id: "jenis_selisih",
          header: "Alasan Selisih",
          size: 130,
          meta: { headerClassName: "text-center", cellClassName: "text-center" },
          cell: ({ row }) => {
            const js = row.original.jenis_selisih;
            if (!js) return <span className="text-slate-400 text-xs">—</span>;
            return (
              <Badge variant={getJenisSelisihBadgeVariant(js)} className="px-2.5 py-0.5 text-xs font-bold">
                {JENIS_SELISIH_LABELS[js] || js.replace("_", " ")}
              </Badge>
            );
          },
        },
        {
          id: "input_keterangan",
          header: "Catatan Item",
          size: 200,
          cell: ({ row }) => {
            if (row.original.status !== null && row.original.status !== undefined) {
              return (
                <span className="text-xs text-slate-600 italic">
                  {row.original.keterangan || "—"}
                </span>
              );
            }

            const idx = items.findIndex((it) => it.uid === row.original.uid);
            const targetIdx = idx >= 0 ? idx : row.index;

            return (
              <FormInput<ReceiveFormValues>
                name={`items.${targetIdx}.keterangan`}
                placeholder="Catatan..."
                maxLength={500}
                className="h-8 text-xs bg-white"
                disabled={processingItemUid === row.original.uid}
              />
            );
          },
        },
      ];
    }

    if (canValidateTransfer) {
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
          id: "input_kuantitas_return",
          header: "Retur / Kelebihan",
          size: 130,
          meta: { headerClassName: "text-center", cellClassName: "text-center" },
          cell: ({ row }) => {
            const qtySent = Number(row.original.kuantitas);
            const qtyReceived = Number(row.original.kuantitas_diterima || 0);
            
            if (row.original.validated_at) {
              const qty = row.original.jenis_validasi === "koreksi" 
                ? row.original.kuantitas_koreksi 
                : row.original.kuantitas_return;
              const type = row.original.jenis_validasi === "koreksi" ? "Koreksi" : "Retur";
              return (
                <Badge variant="success" className="px-2.5 py-0.5 text-xs font-bold">
                  {type}: {qty ?? 0} pcs
                </Badge>
              );
            }
            
            if (qtyReceived > qtySent) {
              const kelebihan = qtyReceived - qtySent;
              const idx = items.findIndex((it) => it.uid === row.original.uid);
              const targetIdx = idx >= 0 ? idx : row.index;

              return (
                <FormNumberInput<ReceiveFormValues>
                  name={`items.${targetIdx}.kuantitas_koreksi`}
                  min={0}
                  max={kelebihan}
                  disabled={validatingItemUid === row.original.uid}
                  className="h-8 w-20 text-xs text-center font-bold mx-auto border-slate-200 bg-white"
                />
              );
            }

            const diff = qtySent - qtyReceived;
            if (diff <= 0) {
              return <span className="text-slate-400 text-xs">—</span>;
            }

            const idx = items.findIndex((it) => it.uid === row.original.uid);
            const targetIdx = idx >= 0 ? idx : row.index;

            return (
              <FormNumberInput<ReceiveFormValues>
                name={`items.${targetIdx}.kuantitas_return`}
                min={0}
                max={diff}
                disabled={validatingItemUid === row.original.uid}
                className="h-8 w-20 text-xs text-center font-bold mx-auto border-slate-200 bg-white"
              />
            );
          },
        },
        {
          accessorKey: "kuantitas",
          header: "Dikirim",
          size: 85,
          meta: { headerClassName: "text-center", cellClassName: "text-center font-bold text-slate-900" },
          cell: ({ row }) => (
            <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700">
              {row.original.kuantitas} pcs
            </Badge>
          ),
        },
        {
          accessorKey: "kuantitas_diterima",
          header: "Diterima",
          size: 90,
          meta: { headerClassName: "text-center", cellClassName: "text-center font-bold text-slate-900" },
          cell: ({ row }) => {
            const val = row.original.kuantitas_diterima;
            return (
              <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700">
                {val != null ? val : "—"} pcs
              </Badge>
            );
          },
        },
        {
          id: "jenis_selisih",
          header: "Alasan Selisih",
          size: 130,
          meta: { headerClassName: "text-center", cellClassName: "text-center" },
          cell: ({ row }) => {
            const js = row.original.jenis_selisih;
            if (!js) return <span className="text-slate-400 text-xs">—</span>;
            return (
              <Badge variant={getJenisSelisihBadgeVariant(js)} className="px-2.5 py-0.5 text-xs font-bold">
                {JENIS_SELISIH_LABELS[js] || js.replace("_", " ")}
              </Badge>
            );
          },
        },
        {
          accessorKey: "keterangan",
          header: "Catatan Item",
          size: 180,
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
        header: "Dikirim",
        size: 85,
        meta: { headerClassName: "text-center", cellClassName: "text-center font-bold text-slate-900" },
        cell: ({ row }) => (
          <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700">
            {row.original.kuantitas} pcs
          </Badge>
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

          if (isRejected) {
            return (
              <Badge variant="danger" className="px-2.5 py-0.5 text-xs font-bold">
                Ditolak
              </Badge>
            );
          }

          const isMatch = qRec === qSent;
          return (
            <div className="flex flex-col items-center gap-1">
              <Badge variant={isMatch ? "success" : "warning"} className="px-2.5 py-0.5 text-xs font-bold">
                {qRec} pcs
              </Badge>
              {row.original.jenis_validasi === "koreksi" && row.original.kuantitas_koreksi ? (
                <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  Koreksi {row.original.kuantitas_koreksi} pcs
                </span>
              ) : null}
            </div>
          );
        },
      },
      {
        id: "jenis_selisih",
        header: "Alasan Selisih",
        size: 130,
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
        cell: ({ row }) => {
          const js = row.original.jenis_selisih;
          if (!js) return <span className="text-slate-400 text-xs">—</span>;
          return (
            <Badge variant={getJenisSelisihBadgeVariant(js)} className="px-2.5 py-0.5 text-xs font-bold">
              {JENIS_SELISIH_LABELS[js] || js.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "keterangan",
        header: "Catatan Item",
        size: 180,
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
  }, [items, canReceive, canValidateTransfer, processingItemUid, validatingItemUid]);
}
