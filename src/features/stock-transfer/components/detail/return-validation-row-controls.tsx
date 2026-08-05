"use client";

import { useState } from "react";
import type { StockTransferItem } from "../../types";

interface ReturnValidationRowControlsProps {
  item: StockTransferItem;
  onValidateReturnItem?: (item: StockTransferItem, kuantitasReturn: number) => void;
  isProcessing: boolean;
}

export function ReturnValidationRowControls({
  item,
  onValidateReturnItem,
  isProcessing,
}: ReturnValidationRowControlsProps) {
  const diff = Number(item.kuantitas) - Number(item.kuantitas_diterima || 0);
  const [returnQty, setReturnQty] = useState<number | string>(diff);

  if (item.return_validated_at) {
    return (
      <div className="flex flex-col gap-1 items-start">
        <span className="inline-block px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Sudah Divalidasi
        </span>
        <span className="text-xs text-slate-600 font-bold">
          Return: {item.kuantitas_return ?? 0} pcs
        </span>
      </div>
    );
  }

  if (diff <= 0) {
    return (
      <span className="inline-block px-2 py-0.5 rounded-md text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Diterima Penuh
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={returnQty}
          onChange={(e) => setReturnQty(e.target.value)}
          disabled={isProcessing}
          className="h-8 w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-center font-extrabold outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={() => {
            if (onValidateReturnItem) onValidateReturnItem(item, Number(returnQty));
          }}
          disabled={isProcessing}
          className="h-8 rounded-md bg-emerald-600 px-3 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isProcessing ? "Memproses..." : "Validasi Return"}
        </button>
      </div>
    </div>
  );
}
