"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { AppButton } from "@/components/shared/app-button";
import type { Product } from "@/features/master/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBarcode, IconPackage, IconTrash } from "@tabler/icons-react";
import type { ConsignmentReceivingFormValues } from "../../schemas/consignment-schema";

interface ConsignmentItemMobileCardProps {
  index: number;
  item?: ConsignmentReceivingFormValues["items"][number];
  product?: Product;
  disabled?: boolean;
  isFlashing?: boolean;
  onRemoveItem: () => void;
  setQtyInputRef: (el: HTMLInputElement | null) => void;
  setHargaBeliInputRef: (el: HTMLInputElement | null) => void;
  onQtyKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onHargaBeliKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function ConsignmentItemMobileCard({
  index,
  item,
  product,
  disabled = false,
  isFlashing = false,
  onRemoveItem,
  setQtyInputRef,
  setHargaBeliInputRef,
  onQtyKeyDown,
  onHargaBeliKeyDown,
}: ConsignmentItemMobileCardProps) {
  const qty = Number(item?.kuantitas || 0);
  const hargaBeli = Number(item?.harga_beli || 0);
  const subtotal = qty * hargaBeli;

  return (
    <div
      className={`
        bg-white rounded-2xl border transition-all duration-300 p-3.5 space-y-3 shadow-xs
        ${
          isFlashing
            ? "border-emerald-300 bg-emerald-50/40 ring-2 ring-emerald-200"
            : "border-slate-200/80 hover:border-slate-300"
        }
      `}
    >
      {/* ── Top Header: Item No, Product Name, Barcode & Delete ── */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <span className="font-mono text-[10px] font-extrabold">{index + 1}</span>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-xs text-slate-900 leading-snug">
                {product?.nama || "Produk Konsinyasi"}
              </h4>
              {isFlashing && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.2 rounded-full shrink-0">
                  ⚡ Baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
              {product?.barcode ? (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-50 border border-slate-200/70 px-1.5 py-0.5 rounded-md text-slate-600">
                  <IconBarcode size={12} className="text-slate-400" />
                  {product.barcode}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  <IconPackage size={12} />
                  Tanpa Barcode
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Delete button (minimum 36px touch target) */}
        <AppButton
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemoveItem}
          disabled={disabled}
          className="h-8 w-8 min-h-[32px] min-w-[32px] rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-100 hover:border-rose-200 shrink-0 cursor-pointer"
          title="Hapus barang"
        >
          <IconTrash size={15} />
        </AppButton>
      </div>

      {/* ── Inputs Grid: Qty & Harga Beli ── */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        {/* Qty Input */}
        <div>
          <FormNumberInput<ConsignmentReceivingFormValues>
            name={`items.${index}.kuantitas`}
            label="Kuantitas (Pcs)"
            min={0.01}
            allowDecimal={true}
            disabled={disabled}
            inputRef={setQtyInputRef}
            onKeyDown={onQtyKeyDown}
            className="h-9 text-xs font-bold text-slate-900 rounded-xl bg-slate-50/70 focus:bg-white border-slate-200"
          />
        </div>

        {/* Harga Beli Satuan Input */}
        <div>
          <FormNominalInput<ConsignmentReceivingFormValues>
            name={`items.${index}.harga_beli`}
            label="Harga Beli (Rp)"
            disabled={disabled}
            inputRef={setHargaBeliInputRef}
            onKeyDown={onHargaBeliKeyDown}
            className="h-9 text-xs font-bold font-mono text-slate-900 rounded-xl bg-slate-50/70 focus:bg-white border-slate-200"
          />
        </div>
      </div>

      {/* ── Footer: Subtotal Calculation ── */}
      <div className="flex items-center justify-between bg-slate-50/90 border border-slate-100 rounded-xl px-3 py-2">
        <span className="text-[11px] font-medium text-slate-500">
          Subtotal Barang
        </span>
        <span className="text-xs font-extrabold text-emerald-600 font-mono">
          {formatRupiah(subtotal)}
        </span>
      </div>
    </div>
  );
}
