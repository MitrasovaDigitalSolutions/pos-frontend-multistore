"use client";

import { IconFileText } from "@tabler/icons-react";
import { DataTableTextActionButton } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import {
  REMITTANCE_STATUS,
  REMITTANCE_STATUS_CLASSES,
  REMITTANCE_STATUS_LABELS,
} from "../../constants";
import type { StoreRemittance } from "../../types";

interface RemittanceHistoryCardProps {
  remittance: StoreRemittance;
  onOpenProof: (url: string, nomor: string) => void;
}

export function RemittanceHistoryCard({
  remittance: rem,
  onOpenProof,
}: RemittanceHistoryCardProps) {
  const statusClass = REMITTANCE_STATUS_CLASSES[rem.status] || "bg-slate-50 text-slate-700";
  const statusLabel = REMITTANCE_STATUS_LABELS[rem.status] || rem.status;
  const formattedDate = rem.created_at
    ? formatDate(rem.created_at, "dd MMM yyyy, HH:mm") || rem.created_at
    : "—";

  return (
    <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2 text-xs shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="font-mono font-bold text-slate-900 block leading-tight">
            {rem.nomor_setoran}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">{formattedDate}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
        <span className="text-slate-500">
          Kas: <strong className="text-slate-700">{rem.cash_account_source_nama || "Kas Toko"}</strong>
        </span>
        <span className="font-extrabold text-slate-900 font-mono text-sm">
          {formatRupiah(rem.nominal_disetor)}
        </span>
      </div>

      {rem.bukti_transfer_url && (
        <div className="pt-1 flex items-center justify-end">
          <DataTableTextActionButton
            variant="slate"
            icon={<IconFileText size={12} />}
            onClick={() => onOpenProof(rem.bukti_transfer_url || "", rem.nomor_setoran)}
            tooltip="Lihat Bukti Transfer"
          >
            Lihat Bukti Transfer
          </DataTableTextActionButton>
        </div>
      )}

      {rem.status === REMITTANCE_STATUS.REJECTED && rem.alasan_penolakan && (
        <p className="text-rose-600 font-medium text-[11px] bg-rose-50/80 p-2 rounded-lg border border-rose-100 leading-tight">
          <strong>Ditolak:</strong> {rem.alasan_penolakan}
        </p>
      )}
    </div>
  );
}
