"use client";

import { DataTableTextActionButton } from "@/components/ui/data-table-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCheck, IconX } from "@tabler/icons-react";

interface ReceivingItemRowControlsProps {
  onOpenTerima: () => void;
  onOpenTolak: () => void;
  isProcessing: boolean;
  terimaId?: string;
  tolakId?: string;
}

export function ReceivingItemRowControls({
  onOpenTerima,
  onOpenTolak,
  isProcessing,
  terimaId,
  tolakId,
}: ReceivingItemRowControlsProps) {
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-1">
        <Skeleton className="h-7 w-24 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5">
      <DataTableTextActionButton
        id={terimaId}
        variant="solidEmerald"
        onClick={onOpenTerima}
        disabled={isProcessing}
        icon={<IconCheck size={14} className="stroke-[2.5]" />}
        tooltip={terimaId ? undefined : "Konfirmasi penerimaan produk ini"}
      >
        Terima
      </DataTableTextActionButton>
      <DataTableTextActionButton
        id={tolakId}
        variant="solidRose"
        onClick={onOpenTolak}
        disabled={isProcessing}
        icon={<IconX size={14} className="stroke-[2.5]" />}
        tooltip={tolakId ? undefined : "Tolak produk ini"}
      >
        Tolak
      </DataTableTextActionButton>
    </div>
  );
}
