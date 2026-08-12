"use client";

import { DataTableTextActionButton } from "@/components/ui/data-table-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { IconCheck, IconX } from "@tabler/icons-react";

interface ReceivingItemRowControlsProps {
  onOpenTerima: () => void;
  onOpenTolak: () => void;
  isProcessing: boolean;
}

export function ReceivingItemRowControls({
  onOpenTerima,
  onOpenTolak,
  isProcessing,
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
        variant="solidEmerald"
        onClick={onOpenTerima}
        disabled={isProcessing}
        icon={<IconCheck size={14} className="stroke-[2.5]" />}
        tooltip="Konfirmasi penerimaan produk ini"
      >
        Terima
      </DataTableTextActionButton>
      <DataTableTextActionButton
        variant="solidRose"
        onClick={onOpenTolak}
        disabled={isProcessing}
        icon={<IconX size={14} className="stroke-[2.5]" />}
        tooltip="Tolak produk ini"
      >
        Tolak
      </DataTableTextActionButton>
    </div>
  );
}
