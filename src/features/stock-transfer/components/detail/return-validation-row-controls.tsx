"use client";

import { useState } from "react";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { StockTransferItem } from "../../types";

interface ReturnValidationRowControlsProps {
  item: StockTransferItem;
  returnQty: number;
  onValidateReturnItem?: (item: StockTransferItem, kuantitasReturn: number) => void;
  isProcessing: boolean;
}

export function ReturnValidationRowControls({
  item,
  returnQty,
  onValidateReturnItem,
  isProcessing,
}: ReturnValidationRowControlsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const diff = Number(item.kuantitas) - Number(item.kuantitas_diterima || 0);

  if (item.return_validated_at) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <Badge variant="success" className="px-2.5 py-0.5 text-xs font-bold">
          Sudah Divalidasi
        </Badge>
        <span className="text-[10px] text-slate-500 font-bold">
          Return: {item.kuantitas_return ?? 0} pcs
        </span>
      </div>
    );
  }

  if (diff <= 0) {
    return (
      <Badge variant="success" className="px-2.5 py-0.5 text-xs font-bold">
        Diterima Penuh
      </Badge>
    );
  }

  const handleConfirm = () => {
    if (onValidateReturnItem) {
      onValidateReturnItem(item, returnQty);
    }
    setConfirmOpen(false);
  };

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold animate-pulse border border-slate-200 shadow-2xs">
          <IconLoader2 className="animate-spin w-3.5 h-3.5 text-emerald-600" />
          <span>Memproses...</span>
        </span>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isProcessing}
        className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
      >
        <IconCheck size={14} />
        <span>Validasi Return</span>
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Konfirmasi Validasi Return"
        description={`Apakah Anda yakin ingin memvalidasi pengembalian produk "${item.product?.nama || "item"}" sebanyak ${returnQty} pcs ke dalam stok toko?`}
        confirmText="Ya, Validasi Return"
        cancelText="Batal"
        variant="success"
        onConfirm={handleConfirm}
        isLoading={isProcessing}
      />
    </>
  );
}
