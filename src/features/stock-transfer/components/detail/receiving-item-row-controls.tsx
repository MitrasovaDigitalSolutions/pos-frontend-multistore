"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
        {/* Button Terima */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleOpenTerima}
                disabled={isProcessing}
                className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <IconCheck size={14} className="stroke-[2.5]" />
                <span>Terima</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Konfirmasi penerimaan produk ini</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Button Tolak */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleOpenTolak}
                disabled={isProcessing}
                className="h-8 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <IconX size={14} className="stroke-[2.5]" />
                <span>Tolak</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Tolak produk ini</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
