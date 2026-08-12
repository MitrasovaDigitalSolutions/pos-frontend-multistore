"use client";

import { IconCheck, IconX } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { DataTableTextActionButton } from "@/components/ui/data-table-actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { StockTransferItem } from "../../types";

interface ValidationRowControlsProps {
  item: StockTransferItem;
  mode: "retur" | "koreksi";
  onOpenApprove: () => void;
  onOpenReject: () => void;
  isProcessing: boolean;
}

export function ValidationRowControls({
  item,
  mode,
  onOpenApprove,
  onOpenReject,
  isProcessing,
}: ValidationRowControlsProps) {
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-1">
        <Skeleton className="h-7 w-24 rounded-xl" />
      </div>
    );
  }

  if (item.validated_at) {
    const qty = mode === "koreksi" ? item.kuantitas_koreksi : item.kuantitas_return;
    const label = item.jenis_validasi || mode;
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Badge variant="success" className="px-2.5 py-0.5 text-xs font-bold shadow-2xs">
          Sudah Divalidasi
        </Badge>
        <span className="text-[10px] text-slate-500 font-bold capitalize">
          {label}: {qty ?? 0} pcs
        </span>
      </div>
    );
  }

  if (mode === "koreksi") {
    return (
      <div className="flex items-center justify-center gap-1.5">
        <DataTableTextActionButton
          variant="solidEmerald"
          onClick={onOpenApprove}
          disabled={isProcessing}
          icon={<IconCheck size={14} className="stroke-[2.5]" />}
          tooltip="Setujui koreksi stok produk ini"
        >
          Setujui
        </DataTableTextActionButton>
        <DataTableTextActionButton
          variant="solidRose"
          onClick={onOpenReject}
          disabled={isProcessing}
          icon={<IconX size={14} className="stroke-[2.5]" />}
          tooltip="Tolak koreksi stok produk ini"
        >
          Tolak
        </DataTableTextActionButton>
      </div>
    );
  }

  // mode === "retur"
  const diff = Number(item.kuantitas) - Number(item.kuantitas_diterima || 0);

  if (diff <= 0) {
    return (
      <Badge variant="success" className="px-2.5 py-0.5 text-xs font-bold shadow-2xs">
        Diterima Penuh
      </Badge>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <DataTableTextActionButton
        variant="solidEmerald"
        onClick={onOpenApprove}
        disabled={isProcessing}
        icon={<IconCheck size={14} className="stroke-[2.5]" />}
        tooltip="Validasi return produk ini"
      >
        Validasi
      </DataTableTextActionButton>
      <DataTableTextActionButton
        variant="solidRose"
        onClick={onOpenReject}
        disabled={isProcessing}
        icon={<IconX size={14} className="stroke-[2.5]" />}
        tooltip="Tolak klaim retur produk ini"
      >
        Tolak
      </DataTableTextActionButton>
    </div>
  );
}
