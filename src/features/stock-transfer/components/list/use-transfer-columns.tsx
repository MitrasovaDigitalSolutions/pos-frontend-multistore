"use client";

import { StatusBadge } from "@/components/ui/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate, formatToReadableDate } from "@/lib/date-utils";
import { IconArrowDownLeft, IconArrowRight, IconArrowUpRight } from "@tabler/icons-react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { TRANSFER_STATUS_LABELS, TRANSFER_SHIPMENT_STATUS_LABELS } from "../../constants";
import type { StockTransfer } from "../../types";

export function useTransferColumns(activeStoreUid?: string | null) {
  return useMemo<ColumnDef<StockTransfer>[]>(
    () => [
      {
        accessorKey: "nomor_transfer",
        header: "No. Transfer",
        size: 190,
        cell: ({ row }) => {
          const isOutgoing = row.original.store_uid_source === activeStoreUid;
          const isIncoming = row.original.store_uid_destination === activeStoreUid;

          return (
            <div className="flex flex-col gap-0.5 min-w-[170px]">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-mono font-bold text-slate-900 text-xs tracking-tight">
                  {row.original.nomor_transfer}
                </span>
                {isOutgoing && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60 flex items-center gap-0.5 text-[9px] font-extrabold shrink-0 cursor-pointer">
                        <IconArrowUpRight size={11} /> Keluar
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Transfer Keluar</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                {isIncoming && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-200/60 flex items-center gap-0.5 text-[9px] font-extrabold shrink-0 cursor-pointer">
                        <IconArrowDownLeft size={11} /> Masuk
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Transfer Masuk</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                {row.original.created_at
                  ? formatDate(row.original.created_at, "dd MMM yyyy, HH:mm")
                  : "—"}
              </span>
            </div>
          );
        },
      },
      {
        id: "route",
        header: "Alur Distribusi (Asal ➔ Tujuan)",
        size: 260,
        cell: ({ row }) => {
          const src = row.original.source_store;
          const dst = row.original.destination_store;
          return (
            <div className="flex items-center gap-2 text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  {src?.nama || "—"}
                  {src?.is_central && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0 rounded border border-emerald-200">
                      Pusat
                    </span>
                  )}
                </span>
              </div>
              <IconArrowRight size={14} className="text-slate-400 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  {dst?.nama || "—"}
                  {dst?.is_central && (
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0 rounded border border-emerald-200">
                      Pusat
                    </span>
                  )}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        id: "items_count",
        header: "Jumlah Produk",
        size: 130,
        cell: ({ row }) => {
          const itemsCount = row.original.items?.length || 0;
          const totalQty = row.original.items?.reduce((sum, item) => sum + Number(item.kuantitas || 0), 0) || 0;
          return (
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-xs">
                {itemsCount} Produk
              </span>
              <span className="text-[10px] text-slate-400">
                Total {totalQty} unit
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status Transfer",
        size: 130,
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
        cell: ({ row }) => {
          const st = row.original.status;
          return (
            <StatusBadge
              status={st}
              label={TRANSFER_STATUS_LABELS[st] || st}
              className="text-xs px-2.5 py-0.5 font-bold"
            />
          );
        },
      },
      {
        id: "status_pengiriman",
        header: "Status Pengiriman",
        size: 150,
        meta: { headerClassName: "text-center", cellClassName: "text-center" },
        cell: ({ row }) => {
          const statusPengiriman = row.original.status_pengiriman || row.original.status_penerimaan;
          if (!statusPengiriman) return <span className="text-slate-400 text-xs">—</span>;

          return (
            <StatusBadge
              status={statusPengiriman}
              label={TRANSFER_SHIPMENT_STATUS_LABELS[statusPengiriman] || statusPengiriman.replace("_", " ")}
              className="text-xs px-2.5 py-0.5 font-bold"
            />
          );
        },
      },
      {
        accessorKey: "tanggal_kirim",
        header: "Waktu Pengiriman",
        size: 140,
        cell: ({ row }) => (
          <span className="text-xs text-slate-500">
            {row.original.tanggal_kirim
              ? formatToReadableDate(row.original.tanggal_kirim)
              : "—"}
          </span>
        ),
      },
    ],
    [activeStoreUid]
  );
}
