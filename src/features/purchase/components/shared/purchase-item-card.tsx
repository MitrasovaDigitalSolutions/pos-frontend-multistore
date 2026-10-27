"use client";

import { AppButton } from "@/components/shared/app-button";
import { DatePicker } from "@/components/ui/date-picker";
import { NominalInput } from "@/components/ui/nominal-input";
import { NumberInput } from "@/components/ui/number-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useAppPreset } from "@/features/license/hooks/use-app-preset";
import { cn } from "@/lib/utils";
import { IconBarcode, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import type { PurchaseItemLocal } from "../../types";

export interface PurchaseItemCardProps {
  item: PurchaseItemLocal;
  index: number;
  priceLabel?: string;
  disabled?: boolean;
  isPriceReadOnly?: boolean;
  isFlashing?: boolean;
  allowSubtotalInput?: boolean;
  qtyInputRef?: (el: HTMLInputElement | null) => void;
  onEnterPress?: () => void;
  onUpdateItem: (
    temp_uid: string,
    data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi" | "expired_date">>
  ) => void;
  onRemoveItem: (temp_uid: string) => void;
}

export function PurchaseItemCard({
  item,
  index,
  priceLabel = "Harga Beli",
  disabled = false,
  isPriceReadOnly = false,
  isFlashing = false,
  allowSubtotalInput = false,
  qtyInputRef,
  onEnterPress,
  onUpdateItem,
  onRemoveItem,
}: PurchaseItemCardProps) {
  const { isPharmacy } = useAppPreset();
  const calculatedSubtotal = Math.round(item.kuantitas * item.harga_estimasi);
  const [subtotalInput, setSubtotalInput] = useState<number | null>(null);
  const [isSubtotalFocused, setIsSubtotalFocused] = useState(false);

  const currentDisplaySubtotal = isSubtotalFocused ? subtotalInput : calculatedSubtotal;

  const handleSubtotalChange = (val: number | null) => {
    setSubtotalInput(val);
    const total = val ?? 0;

    if (item.kuantitas <= 0) {
      onUpdateItem(item.temp_uid, { kuantitas: 1, harga_estimasi: total });
    } else {
      const newUnitPrice = Math.round(total / item.kuantitas);
      onUpdateItem(item.temp_uid, { harga_estimasi: newUnitPrice });
    }
  };

  const handleSubtotalFocus = () => {
    setIsSubtotalFocused(true);
    setSubtotalInput(calculatedSubtotal);
  };

  const handleSubtotalBlur = () => {
    setIsSubtotalFocused(false);
    setSubtotalInput(null);
  };

  return (
    <div
      id={`purchase-item-card-${item.temp_uid}`}
      className={cn(
        "group relative bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 sm:py-1.5 shadow-2xs transition-all duration-150 hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700",
        isFlashing
          ? "border-emerald-500 ring-2 ring-emerald-500/25 bg-emerald-50/30 dark:bg-emerald-950/20"
          : "border-slate-200/90 dark:border-slate-800"
      )}
    >
      {/* ── Desktop & Tablet View (>=640px): 1 Single Dense Row ── */}
      <div className="hidden sm:flex items-center gap-2 min-h-[38px]">
        {/* Number Badge */}
        <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
          {index + 1}
        </span>

        {/* Product Name & Barcode */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate"
              title={item.nama}
            >
              {item.nama}
            </h4>
            {isFlashing && (
              <span className="text-[8px] font-extrabold text-emerald-600 bg-emerald-100/80 dark:bg-emerald-950 px-1 py-0.2 rounded shrink-0">
                ⚡ Baru
              </span>
            )}
          </div>
          {item.barcode && (
            <p className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-0.5 leading-none mt-0.5">
              <IconBarcode size={10} className="opacity-60 shrink-0" />
              <span>{item.barcode}</span>
            </p>
          )}
        </div>

        {/* Input: Qty */}
        <div className="w-18 sm:w-20 shrink-0">
          <NumberInput
            ref={qtyInputRef}
            id={`item-qty-${item.temp_uid}`}
            value={item.kuantitas}
            onChange={(val) => {
              onUpdateItem(item.temp_uid, { kuantitas: val ?? 1 });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onEnterPress?.();
              }
            }}
            disabled={disabled}
            allowDecimal={true}
            min={0.01}
            allowNegative={false}
            className="h-8 text-center text-xs font-bold text-slate-800 dark:text-slate-100 rounded-lg border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
          />
        </div>

        {/* Input: Harga Satuan */}
        <div className="w-26 sm:w-30 shrink-0">
          {isPriceReadOnly ? (
            <div className="h-8 flex items-center justify-end px-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-600 dark:text-slate-300 text-xs">
              {formatRupiah(item.harga_estimasi)}
            </div>
          ) : (
            <NominalInput
              id={`item-price-${item.temp_uid}`}
              value={item.harga_estimasi}
              onValueChange={(val) => {
                onUpdateItem(item.temp_uid, { harga_estimasi: val ?? 0 });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnterPress?.();
                }
              }}
              showCalculator={false}
              disabled={disabled}
              className="h-8 text-right text-xs font-bold text-slate-800 dark:text-slate-100 font-mono rounded-lg border-slate-200 dark:border-slate-700 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
            />
          )}
        </div>

        {/* Input: Expired Date (DatePicker) - Only when isPharmacy */}
        {isPharmacy && (
          <div className="w-28 sm:w-34 shrink-0">
            <DatePicker
              id={`item-exp-${item.temp_uid}`}
              value={item.expired_date}
              size="sm"
              placeholder="Pilih Exp"
              disabled={disabled}
              clearable={true}
              buttonClassName="h-8 text-xs rounded-lg border-slate-200 dark:border-slate-700 px-2"
              onChange={(val) => {
                onUpdateItem(item.temp_uid, {
                  expired_date: val || null,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnterPress?.();
                }
              }}
            />
          </div>
        )}

        {/* Subtotal Display or Editable Total Nota */}
        <div className="w-26 sm:w-32 shrink-0">
          {allowSubtotalInput ? (
            <div className="relative">
              <NominalInput
                id={`item-subtotal-${item.temp_uid}`}
                value={currentDisplaySubtotal}
                onValueChange={handleSubtotalChange}
                onFocus={handleSubtotalFocus}
                onBlur={handleSubtotalBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onEnterPress?.();
                  }
                }}
                showCalculator={false}
                disabled={disabled}
                placeholder="Rp 0"
                className="h-8 text-right text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono rounded-lg border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-slate-900 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
              />
              {isSubtotalFocused && Number(item.kuantitas) > 1 && (
                <div className="absolute right-1 -top-3.5 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded z-20 shadow-xs pointer-events-none">
                  ÷{item.kuantitas}={formatRupiah(Math.round((currentDisplaySubtotal || 0) / Number(item.kuantitas)))}
                </div>
              )}
            </div>
          ) : (
            <div className="h-8 flex items-center justify-end px-2 font-mono font-black text-emerald-600 dark:text-emerald-400 text-xs">
              {formatRupiah(calculatedSubtotal)}
            </div>
          )}
        </div>

        {/* Delete Action Button */}
        <AppButton
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemoveItem(item.temp_uid)}
          disabled={disabled}
          className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg h-7 w-7 p-0 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          title="Hapus barang"
        >
          <IconTrash size={14} />
        </AppButton>
      </div>

      {/* ── Mobile View (<640px): 2 Compact Stacks ── */}
      <div className="sm:hidden space-y-2">
        {/* Line 1: Number, Title, Barcode, Subtotal, Delete */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="w-4.5 h-4.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[9px] font-bold flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={item.nama}>
              {item.nama}
            </h4>
            {isFlashing && (
              <span className="text-[8px] font-bold text-emerald-600 bg-emerald-100 px-1 py-0.2 rounded shrink-0">
                ⚡
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-black text-emerald-600 font-mono">
              {formatRupiah(calculatedSubtotal)}
            </span>
            <AppButton
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onRemoveItem(item.temp_uid)}
              disabled={disabled}
              className="text-slate-300 hover:text-rose-600 h-6 w-6 p-0"
            >
              <IconTrash size={13} />
            </AppButton>
          </div>
        </div>

        {/* Line 2: Responsive Inputs Row on Mobile */}
        <div className="grid grid-cols-12 gap-1.5 items-center">
          <div className={isPharmacy ? "col-span-3" : "col-span-4"}>
            <NumberInput
              value={item.kuantitas}
              onChange={(val) => {
                onUpdateItem(item.temp_uid, { kuantitas: val ?? 1 });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnterPress?.();
                }
              }}
              disabled={disabled}
              allowDecimal={true}
              min={0.01}
              allowNegative={false}
              placeholder="Qty"
              className="h-7 text-center text-xs font-bold rounded-md"
            />
          </div>
          <div className={isPharmacy ? "col-span-5" : "col-span-8"}>
            <NominalInput
              value={item.harga_estimasi}
              onValueChange={(val) => {
                onUpdateItem(item.temp_uid, { harga_estimasi: val ?? 0 });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnterPress?.();
                }
              }}
              showCalculator={false}
              disabled={disabled || isPriceReadOnly}
              placeholder={priceLabel}
              className="h-7 text-right text-xs font-bold font-mono rounded-md"
            />
          </div>
          {isPharmacy && (
            <div className="col-span-4">
              <DatePicker
                value={item.expired_date}
                size="sm"
                placeholder="Exp"
                disabled={disabled}
                clearable={true}
                buttonClassName="h-7 text-xs rounded-md px-1.5"
                onChange={(val) => {
                  onUpdateItem(item.temp_uid, {
                    expired_date: val || null,
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onEnterPress?.();
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
