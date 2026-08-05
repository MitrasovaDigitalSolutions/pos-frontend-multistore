"use client";

import { useState } from "react";
import { IconCheck } from "@tabler/icons-react";
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
        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Sudah Divalidasi
        </span>
        <span className="text-[10px] text-slate-500 font-bold">
          Return: {item.kuantitas_return ?? 0} pcs
        </span>
      </div>
    );
  }

  if (diff <= 0) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Diterima Penuh
      </span>
    );
  }

  const handleConfirm = () => {
    if (onValidateReturnItem) {
      onValidateReturnItem(item, returnQty);
    }
    setConfirmOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isProcessing}
        className="h-8 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
      >
        <IconCheck size={14} />
        <span>{isProcessing ? "..." : "Validasi Return"}</span>
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
