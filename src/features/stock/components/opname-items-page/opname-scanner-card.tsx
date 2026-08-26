"use client";

import { BarcodeInput } from "@/components/shared/barcode-input";
import type { Product } from "@/features/master/products/types";
import { IconBarcode, IconCheck, IconPlus } from "@tabler/icons-react";
import { toast } from "sonner";

interface OpnameScannerCardProps {
  products?: Product[];
  disabled?: boolean;
  onProductFound: (product: Product) => void;
  lastScanFeedback?: {
    type: "added" | "incremented";
    productName: string;
    qty: number;
  } | null;
}

export function OpnameScannerCard({
  products,
  disabled = false,
  onProductFound,
  lastScanFeedback,
}: OpnameScannerCardProps) {
  return (
    <div
      id="barcode-scanner-section"
      className="bg-white border border-slate-100 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2"
    >
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-50">
        <div className="flex items-center gap-1.5">
          <div className="bg-emerald-50 text-emerald-600 p-1 rounded-md">
            <IconBarcode size={15} />
          </div>
          <h3 className="text-xs font-bold text-slate-900">
            Scan Barcode / Cari Nama Produk
          </h3>
        </div>
        <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">
          Otomatis menambah &amp; menempatkan barang di urutan teratas
        </span>
      </div>

      <BarcodeInput
        onProductFound={onProductFound}
        onError={(msg) => toast.error(msg)}
        disabled={disabled}
        products={products}
        placeholder="Scan barcode fisik atau ketik nama barang untuk pencarian cepat..."
      />

      {/* ── Inline Scan Feedback Badge ── */}
      {lastScanFeedback && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-300 ${
            lastScanFeedback.type === "incremented"
              ? "bg-blue-50 text-blue-700 border border-blue-200/70"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
          }`}
        >
          {lastScanFeedback.type === "incremented" ? (
            <>
              <IconCheck size={14} className="shrink-0 text-blue-600" />
              <span>
                Sudah ada —{" "}
                <span className="font-extrabold">{lastScanFeedback.productName}</span>
                {" "}(qty: {lastScanFeedback.qty - 1} → {lastScanFeedback.qty})
              </span>
            </>
          ) : (
            <>
              <IconPlus size={14} className="shrink-0 text-emerald-600" />
              <span>
                Ditambahkan —{" "}
                <span className="font-extrabold">{lastScanFeedback.productName}</span>
                {" "}({lastScanFeedback.qty} pcs)
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
