"use client";

import React, { useMemo, useState } from "react";
import { IconPackage, IconRefresh, IconInfoCircle, IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { useFormContext } from "react-hook-form";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";
import { JENIS_SELISIH_LABELS, JENIS_SELISIH_CLASSES } from "../../constants";

interface TransferDetailItemsTableProps {
  items: StockTransferItem[];
  canReceive: boolean;
  onResetAllQty: () => void;
  onReceiveItem?: (item: StockTransferItem, status: "received" | "rejected") => void;
  processingItemUid?: string | null;
  canValidateReturn?: boolean;
  onValidateReturnItem?: (item: StockTransferItem, kuantitasReturn: number) => void;
  validatingItemUid?: string | null;
}

// Inner helper component to watch individual row values for discrepancy warning icon
function ReceivingItemRowControls({
  index,
  item,
  onReceiveItem,
  isProcessing,
}: {
  index: number;
  item: StockTransferItem;
  onReceiveItem?: (item: StockTransferItem, status: "received" | "rejected") => void;
  isProcessing: boolean;
}) {
  const { watch, setValue } = useFormContext<ReceiveFormValues>();
  const currentQty = watch(`items.${index}.kuantitas_diterima`);
  const status = watch(`items.${index}.status`) || "received";
  const isDifferent =
    currentQty !== undefined &&
    currentQty !== null &&
    Number(currentQty) !== Number(item.kuantitas);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center gap-1.5">
            <FormNumberInput<ReceiveFormValues>
            name={`items.${index}.kuantitas_diterima`}
            min={0}
            disabled={isProcessing}
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
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => { 
              setValue(`items.${index}.status`, "received"); 
              setValue(`items.${index}.jenis_selisih`, null); 
              if (onReceiveItem) onReceiveItem(item, "received");
            }}
            disabled={isProcessing}
            className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${status === "received" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"} ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {isProcessing && status === "received" ? "Memproses..." : "Terima"}
          </button>
          {status !== "rejected" ? (
            <button
              type="button"
              onClick={() => setValue(`items.${index}.status`, "rejected")}
              disabled={isProcessing}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors text-slate-500 hover:text-slate-700 ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              Tolak
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onReceiveItem) onReceiveItem(item, "rejected");
              }}
              disabled={isProcessing || !watch(`items.${index}.jenis_selisih`)}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors bg-white text-rose-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
            >
              {isProcessing ? "Memproses..." : "Konfirmasi Tolak"}
            </button>
          )}
        </div>
      </div>
      {status === "rejected" && (
         <FormSelect<ReceiveFormValues>
           name={`items.${index}.jenis_selisih`}
           options={[
             { label: "Pilih Alasan", value: "" },
             { label: "Salah Input", value: "salah_input" },
             { label: "Rusak", value: "rusak" },
             { label: "Hilang", value: "hilang" }
           ]}
           disabled={isProcessing}
           className="h-7 text-[10px] border-rose-300 bg-rose-50 text-rose-900"
         />
      )}
    </div>
  );
}

function ReturnItemRowControls({
  item,
  onValidateReturnItem,
  isProcessing,
}: {
  item: StockTransferItem;
  onValidateReturnItem?: (item: StockTransferItem, kuantitasReturn: number) => void;
  isProcessing: boolean;
}) {
  const diff = Number(item.kuantitas) - Number(item.kuantitas_diterima || 0);
  const [returnQty, setReturnQty] = useState<number | string>(diff);

  if (item.return_validated_at) {
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="inline-block px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Sudah Divalidasi
        </span>
        <span className="text-xs text-slate-600 font-bold">
          Return: {item.kuantitas_return ?? 0} pcs
        </span>
      </div>
    );
  }

  if (diff <= 0) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Diterima Penuh
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={returnQty}
          onChange={(e) => setReturnQty(e.target.value)}
          disabled={isProcessing}
          className="h-8 w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-center font-extrabold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => {
            if (onValidateReturnItem) onValidateReturnItem(item, Number(returnQty));
          }}
          disabled={isProcessing}
          className="h-8 rounded-md bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Memproses..." : "Validasi Return"}
        </button>
      </div>
      <span className="text-[10px] text-slate-500">
        Max selisih: {diff} pcs
      </span>
    </div>
  );
}

export function TransferDetailItemsTable({
  items,
  canReceive,
  onResetAllQty,
  onReceiveItem,
  processingItemUid,
  canValidateReturn,
  onValidateReturnItem,
  validatingItemUid,
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
          header: "Penerimaan & Status",
          size: 260,
          meta: { headerClassName: "text-left", cellClassName: "text-left" },
          cell: ({ row }) => {
            // Already processed by server
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
            <ReturnItemRowControls 
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

  const { watch } = useFormContext<ReceiveFormValues>();
  
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-4">
      {/* Table Header / Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <IconPackage size={18} className="text-emerald-600" />
          <span>Daftar Produk Dikirim</span>
          {canReceive && (
            <span className="text-xs font-normal text-slate-500 ml-2">
              (Item diproses langsung per baris)
            </span>
          )}
          {canValidateReturn && (
            <span className="text-xs font-normal text-amber-600 ml-2">
              (Validasi return per item)
            </span>
          )}
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
            Reset Semua Input
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
            <strong>Penerimaan Stok Aktif:</strong> Sesuaikan jumlah dan status per item, lalu klik tombol <strong>Terima</strong> atau <strong>Konfirmasi Tolak</strong> pada masing-masing baris. Transaksi akan langsung tersimpan.
          </div>
        </div>
      )}

      {canValidateReturn && (
        <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <IconInfoCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Validasi Return Aktif:</strong> Sebagai toko pengirim, Anda harus memvalidasi jumlah barang yang dikembalikan (selisih). Masukkan jumlah yang benar-benar diterima kembali, lalu klik <strong>Validasi Return</strong>.
          </div>
        </div>
      )}

      <DataTable columns={columns} data={items} virtualize={false} />
    </div>
  );
}
