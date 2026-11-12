"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import {
  REMITTANCE_STATUS,
  REMITTANCE_STATUS_CLASSES,
  REMITTANCE_STATUS_LABELS,
} from "../../constants";
import type { StoreRemittance } from "../../types";
import {
  getRemittanceNomor,
  getRemittanceSourceAccountName,
} from "../../utils/remittance-utils";

export function useRemittanceHistoryColumns() {
  return useMemo<ColumnDef<StoreRemittance>[]>(
    () => [
      {
        accessorKey: "nomor_remittance",
        header: "No. Setoran",
        size: 160,
        cell: ({ row }) => {
          const rem = row.original;
          const formattedDate = rem.created_at
            ? formatDate(rem.created_at, "dd MMM yyyy, HH:mm") || rem.created_at
            : "—";

          const itemCount = rem.items_count ?? rem.items?.length;

          return (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900 leading-tight">
                  {getRemittanceNomor(rem)}
                </span>
                {itemCount !== undefined && itemCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-md text-[9.5px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {itemCount} item
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {formattedDate}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "cash_account_source_nama",
        header: "Akun Kas Asal",
        size: 140,
        cell: ({ row }) => (
          <span className="text-slate-700 font-medium">
            {getRemittanceSourceAccountName(row.original)}
          </span>
        ),
      },
      {
        accessorKey: "nominal_disetor",
        header: "Nominal",
        size: 130,
        meta: {
          headerClassName: "text-right",
          cellClassName: "text-right font-bold text-slate-900 font-mono whitespace-nowrap",
        },
        cell: ({ row }) => formatRupiah(row.original.nominal_disetor),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 110,
        meta: {
          headerClassName: "text-center",
          cellClassName: "text-center whitespace-nowrap",
        },
        cell: ({ row }) => {
          const rem = row.original;
          const statusClass =
            REMITTANCE_STATUS_CLASSES[rem.status] || "bg-slate-50 text-slate-700";
          const statusLabel = REMITTANCE_STATUS_LABELS[rem.status] || rem.status;

          return (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}
            >
              {statusLabel}
            </span>
          );
        },
      },
      {
        accessorKey: "catatan",
        header: "Catatan",
        size: 200,
        cell: ({ row }) => {
          const rem = row.original;
          if (rem.status === REMITTANCE_STATUS.REJECTED && rem.alasan_penolakan) {
            return (
              <p className="text-rose-600 font-medium text-[11px] bg-rose-50/80 px-2 py-1 rounded border border-rose-100 leading-tight">
                <strong>Ditolak:</strong> {rem.alasan_penolakan}
              </p>
            );
          }
          if (rem.catatan) {
            return (
              <p className="text-slate-500 text-[11px] truncate max-w-xs" title={rem.catatan}>
                {rem.catatan}
              </p>
            );
          }
          return <span className="text-slate-400">—</span>;
        },
      },
    ],
    []
  );
}
