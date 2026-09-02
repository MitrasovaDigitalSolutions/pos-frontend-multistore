"use client";

import { BarcodeInput } from "@/components/shared/barcode-input";
import type { Product } from "@/features/master/products/types";
import { IconBarcode, IconCheck, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

interface OpnameScannerCardProps {
  disabled?: boolean;
  onProductFound: (product: Product) => void;
  onScanDirectBarcode?: (barcode: string) => void;
  lastScanFeedback?: {
    type: "added" | "incremented";
    productName: string;
    qty: number;
  } | null;
}

export function OpnameScannerCard({
  disabled = false,
  onProductFound,
  onScanDirectBarcode,
  lastScanFeedback,
}: OpnameScannerCardProps) {
  return (
    <div
      id="barcode-scanner-section"
      className="bg-white border border-slate-100 rounded-xl p-2.5 sm:p-3 shadow-2xs space-y-2"
    >
      <div className="flex items-center justify-between pb-1 border-b border-slate-50">
        <div className="flex items-center gap-1.5">
          <div className="bg-emerald-50 text-emerald-600 p-1 rounded-md">
            <IconBarcode size={14} />
          </div>
          <h3 className="text-xs font-bold text-slate-800">
            Scan Barcode / Cari Produk
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">
          Tekan Enter setelah input barcode atau pilih produk
        </span>
      </div>

      <BarcodeInput
        isJasa={false}
        onProductFound={onProductFound}
        onProductNotFound={(query) => {
          if (onScanDirectBarcode) {
            onScanDirectBarcode(query);
          } else {
            toast.error(`Produk "${query}" tidak ditemukan.`);
          }
        }}
        onError={(msg) => toast.error(msg)}
        disabled={disabled}
        placeholder="Scan barcode fisik atau ketik nama produk..."
      />

      {/* ── Inline Scan Feedback Badge ── */}
      {lastScanFeedback && (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200 ${
            lastScanFeedback.type === "incremented"
              ? "bg-blue-50 text-blue-700 border border-blue-200/60"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
          }`}
        >
          {lastScanFeedback.type === "incremented" ? (
            <>
              <IconCheck size={13} className="shrink-0 text-blue-600" />
              <span className="truncate">
                Sudah ada: <span className="font-extrabold">{lastScanFeedback.productName}</span> (stok: {lastScanFeedback.qty} pcs)
              </span>
            </>
          ) : (
            <>
              <IconPlus size={13} className="shrink-0 text-emerald-600" />
              <span className="truncate">
                Ditambahkan: <span className="font-extrabold">{lastScanFeedback.productName}</span> ({lastScanFeedback.qty} pcs)
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
