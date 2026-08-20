"use client";

import { AppButton } from "@/components/shared/app-button";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBarcode, IconTrash } from "@tabler/icons-react";
import type { PurchaseItemLocal } from "../../types";

interface PurchaseItemMobileCardProps {
  item: PurchaseItemLocal;
  index: number;
  priceLabel?: string;
  disabled?: boolean;
  isPriceReadOnly?: boolean;
  isFlashing?: boolean;
  onUpdateItem: (
    temp_uid: string,
    data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi">>
  ) => void;
  onRemoveItem: (temp_uid: string) => void;
}

export function PurchaseItemMobileCard({
  item,
  index,
  priceLabel = "Harga Estimasi",
  disabled = false,
  isPriceReadOnly = false,
  isFlashing = false,
  onUpdateItem,
  onRemoveItem,
}: PurchaseItemMobileCardProps) {
  const subtotal = item.kuantitas * item.harga_estimasi;

  return (
    <div
      id={`purchase-item-card-${item.temp_uid}`}
      className={`bg-white border rounded-2xl p-3.5 shadow-2xs space-y-3 transition-all duration-300 ${
        isFlashing
          ? "border-emerald-300 ring-2 ring-emerald-400/30 bg-emerald-50/40"
          : "border-slate-100 hover:border-slate-200"
      }`}
    >
      {/* ── Header: Number, Name, Barcode & Delete ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0 space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
              {item.nama}
            </h4>
            <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-400 font-medium">
              {item.barcode && (
                <span className="font-mono flex items-center gap-0.5">
                  <IconBarcode size={12} className="opacity-70" />
                  {item.barcode}
                </span>
              )}
              {isFlashing && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                  ⚡ Baru
                </span>
              )}
            </div>
          </div>
        </div>

        <AppButton
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemoveItem(item.temp_uid)}
          disabled={disabled}
          className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 h-7 w-7 flex-shrink-0 cursor-pointer"
          title="Hapus item"
        >
          <IconTrash size={15} />
        </AppButton>
      </div>

      {/* ── Inputs Grid (2 Kolom): Qty & Price ── */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-50">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Qty
          </label>
          <FormNumberInput
            name={`items.${index}.kuantitas`}
            onValueChange={(val) => {
              onUpdateItem(item.temp_uid, { kuantitas: val ?? 0 });
            }}
            disabled={disabled}
            allowDecimal={true}
            className="h-9 text-center text-xs font-bold text-slate-800 rounded-xl border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right block">
            {priceLabel}
          </label>
          {isPriceReadOnly ? (
            <div className="h-9 flex items-center justify-end px-3 rounded-xl bg-slate-50 border border-slate-200/80 font-mono font-bold text-slate-600 text-xs">
              {formatRupiah(item.harga_estimasi)}
            </div>
          ) : (
            <FormNominalInput
              name={`items.${index}.harga_estimasi`}
              onValueChange={(val) => {
                onUpdateItem(item.temp_uid, { harga_estimasi: val ?? 0 });
              }}
              disabled={disabled}
              className="h-9 text-right text-xs font-bold text-slate-800 font-mono rounded-xl border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
            />
          )}
        </div>
      </div>

      {/* ── Footer: Subtotal ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Subtotal
        </span>
        <span className="font-extrabold text-emerald-600 font-mono text-xs">
          {formatRupiah(subtotal)}
        </span>
      </div>
    </div>
  );
}
