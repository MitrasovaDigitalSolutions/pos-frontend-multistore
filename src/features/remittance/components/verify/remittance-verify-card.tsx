"use client";

import { IconCheck, IconFileText, IconX } from "@tabler/icons-react";
import { DataTableTextActionButton } from "@/components/ui/data-table";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import {
  REMITTANCE_STATUS,
  REMITTANCE_STATUS_CLASSES,
  REMITTANCE_STATUS_LABELS,
} from "../../constants";
import type { StoreRemittance } from "../../types";

interface RemittanceVerifyCardProps {
  remittance: StoreRemittance;
  onOpenProof: (url: string, nomor: string) => void;
  onApprove: (rem: StoreRemittance) => void;
  onReject: (rem: StoreRemittance) => void;
}

export function RemittanceVerifyCard({
  remittance: rem,
  onOpenProof,
  onApprove,
  onReject,
}: RemittanceVerifyCardProps) {
  const statusClass = REMITTANCE_STATUS_CLASSES[rem.status] || "bg-slate-50 text-slate-700";
  const statusLabel = REMITTANCE_STATUS_LABELS[rem.status] || rem.status;
  const isPending = rem.status === REMITTANCE_STATUS.PENDING;
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
        <div>
          <span className="font-semibold text-slate-800 block">
            {rem.store_source_nama || "Cabang"}
          </span>
          {rem.cash_account_source_nama && (
            <span className="text-[10px] text-slate-400 block">
              via {rem.cash_account_source_nama}
            </span>
          )}
        </div>
        <span className="font-extrabold text-slate-900 font-mono text-sm">
          {formatRupiah(rem.nominal_disetor)}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-2">
        <div>
          {rem.bukti_transfer_url ? (
            <DataTableTextActionButton
              variant="slate"
              icon={<IconFileText size={12} />}
              onClick={() => onOpenProof(rem.bukti_transfer_url || "", rem.nomor_setoran)}
              tooltip="Lihat Bukti Transfer"
            >
              Bukti
            </DataTableTextActionButton>
          ) : (
            <span className="text-slate-400 text-[11px]">—</span>
          )}
        </div>

        {isPending ? (
          <div className="flex items-center gap-1.5">
            <DataTableTextActionButton
              variant="solidEmerald"
              icon={<IconCheck size={12} />}
              onClick={() => onApprove(rem)}
              tooltip="Verifikasi & Terima Dana Setoran"
            >
              Terima
            </DataTableTextActionButton>
            <DataTableTextActionButton
              variant="rose"
              icon={<IconX size={12} />}
              onClick={() => onReject(rem)}
              tooltip="Tolak Setoran Cabang"
            >
              Tolak
            </DataTableTextActionButton>
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 font-medium">
            {rem.status === REMITTANCE_STATUS.VERIFIED ? "Sudah Diverifikasi" : "Ditolak"}
          </span>
        )}
      </div>
    </div>
  );
}
