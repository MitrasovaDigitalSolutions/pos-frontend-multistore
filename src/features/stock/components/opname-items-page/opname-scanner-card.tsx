"use client";

import { BarcodeInput } from "@/components/shared/barcode-input";
import type { Product } from "@/features/master/products/types";
import { IconBarcode } from "@tabler/icons-react";
import { toast } from "sonner";

interface OpnameScannerCardProps {
  products: Product[];
  disabled: boolean;
  onProductFound: (product: Product) => void;
}

export function OpnameScannerCard({
  products,
  disabled,
  onProductFound,
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
          Otomatis menambah & menempatkan barang di urutan teratas
        </span>
      </div>

      <BarcodeInput
        onProductFound={onProductFound}
        onError={(msg) => toast.error(msg)}
        disabled={disabled}
        products={products}
        placeholder="Scan barcode fisik atau ketik nama barang untuk pencarian cepat..."
      />
    </div>
  );
}
