"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { StockTransferItem } from "../../types";
import type { ReceiveFormValues } from "./types";
import { ReceivingConfirmDialog } from "./receiving-confirm-dialog";

interface ReceivingItemRowControlsProps {
  index: number;
  item: StockTransferItem;
  onReceiveItemSubmit?: (
    item: StockTransferItem,
    payload: {
      status: "received" | "rejected";
      kuantitas_diterima: number;
      jenis_selisih?: "salah_input" | "rusak" | "hilang";
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
  const [dialogMode, setDialogMode] = useState<"received" | "rejected">("received");

  const handleOpenTerima = () => {
    setDialogMode("received");
    setDialogOpen(true);
  };

  const handleOpenTolak = () => {
    setDialogMode("rejected");
    setDialogOpen(true);
  };

  const handleConfirmSubmit = async (payload: {
    status: "received" | "rejected";
    kuantitas_diterima: number;
    jenis_selisih?: "salah_input" | "rusak" | "hilang";
    keterangan?: string;
  }) => {
    if (onReceiveItemSubmit) {
      await onReceiveItemSubmit(item, payload);
    }
  };

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
                className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <IconCheck size={14} />
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
                className="h-8 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
              >
                <IconX size={14} />
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
