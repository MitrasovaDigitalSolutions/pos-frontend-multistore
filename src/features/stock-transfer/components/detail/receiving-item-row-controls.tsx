"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DataTableTextActionButton } from "@/components/ui/data-table-actions";
import { IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { JENIS_SELISIH, TRANSFER_SHIPMENT_STATUS } from "../../constants";
import type { StockTransferItem } from "../../types";
import { ReceivingConfirmDialog } from "./receiving-confirm-dialog";
import type { ReceiveFormValues } from "./types";

interface ReceivingItemRowControlsProps {
  index: number;
  item: StockTransferItem;
  onReceiveItemSubmit?: (
    item: StockTransferItem,
    payload: {
      status: typeof TRANSFER_SHIPMENT_STATUS.RECEIVED | typeof TRANSFER_SHIPMENT_STATUS.REJECTED;
      kuantitas_diterima: number;
      jenis_selisih?: typeof JENIS_SELISIH.SALAH_INPUT | typeof JENIS_SELISIH.RUSAK | typeof JENIS_SELISIH.HILANG;
      keterangan?: string;
    }
  ) => Promise<void>;
  isProcessing: boolean;
}

export function ReceivingItemRowControls({
  index,
  item,
  onReceiveItemSubmit,
  isProcessing,
}: ReceivingItemRowControlsProps) {
  const { watch } = useFormContext<ReceiveFormValues>();
  const currentQty = watch(`items.${index}.kuantitas_diterima`);
  const currentKeterangan = watch(`items.${index}.keterangan`);

  const qtyDiterima = currentQty !== undefined && currentQty !== null ? Number(currentQty) : item.kuantitas;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<typeof TRANSFER_SHIPMENT_STATUS.RECEIVED | typeof TRANSFER_SHIPMENT_STATUS.REJECTED>(TRANSFER_SHIPMENT_STATUS.RECEIVED);

  const handleOpenTerima = () => {
    setDialogMode(TRANSFER_SHIPMENT_STATUS.RECEIVED);
    setDialogOpen(true);
  };

  const handleOpenTolak = () => {
    setDialogMode(TRANSFER_SHIPMENT_STATUS.REJECTED);
    setDialogOpen(true);
  };

  const handleConfirmSubmit = async (payload: {
    status: typeof TRANSFER_SHIPMENT_STATUS.RECEIVED | typeof TRANSFER_SHIPMENT_STATUS.REJECTED;
    kuantitas_diterima: number;
    jenis_selisih?: typeof JENIS_SELISIH.SALAH_INPUT | typeof JENIS_SELISIH.RUSAK | typeof JENIS_SELISIH.HILANG;
    keterangan?: string;
  }) => {
    if (onReceiveItemSubmit) {
      await onReceiveItemSubmit(item, payload);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center py-1">
        <Skeleton className="h-7 w-24 rounded-xl" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center gap-1.5">
        <DataTableTextActionButton
          variant="emerald"
          onClick={handleOpenTerima}
          disabled={isProcessing}
          icon={<IconCheck size={14} className="stroke-[2.5]" />}
          tooltip="Konfirmasi penerimaan produk ini"
        >
          Terima
        </DataTableTextActionButton>
        <DataTableTextActionButton
          variant="rose"
          onClick={handleOpenTolak}
          disabled={isProcessing}
          icon={<IconX size={14} className="stroke-[2.5]" />}
          tooltip="Tolak produk ini"
        >
          Tolak
        </DataTableTextActionButton>
      </div>

      <ReceivingConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={item}
        mode={dialogMode}
        qtyDiterima={qtyDiterima}
        keterangan={currentKeterangan}
        onConfirm={handleConfirmSubmit}
        isLoading={isProcessing}
      />
    </>
  );
}
