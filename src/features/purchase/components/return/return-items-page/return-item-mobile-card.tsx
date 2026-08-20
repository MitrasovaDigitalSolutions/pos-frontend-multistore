"use client";

import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconBarcode, IconTrash } from "@tabler/icons-react";
import type { PurchaseItemLocal } from "../../../types";

interface ReturnItemMobileCardProps {
  item: PurchaseItemLocal;
  index: number;
  isPending: boolean;
  maxReturnable: number;
  reasons: { value: string; label: string }[];
  updateItem: (temp_uid: string, updates: Partial<PurchaseItemLocal>) => void;
}

export function ReturnItemMobileCard({
  item,
  index,
  isPending,
  maxReturnable,
  reasons,
  updateItem,
}: ReturnItemMobileCardProps) {
  const subtotal = item.kuantitas * item.harga_estimasi;
  const isSelected = item.kuantitas > 0;

  return (
    <div
      className={`bg-white border rounded-2xl p-3.5 shadow-2xs space-y-3 transition-all duration-200 ${
        isSelected
          ? "border-emerald-200 ring-1 ring-emerald-400/20 bg-emerald-50/20"
          : "border-slate-100"
      }`}
    >
      {/* ── Header: Number, Name, Barcode & Action ── */}
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
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md font-semibold">
                Sisa: {maxReturnable} pcs
              </span>
            </div>
          </div>
        </div>

        {isSelected && (
          <button
            type="button"
            onClick={() => updateItem(item.temp_uid, { kuantitas: 0 })}
            disabled={isPending}
            className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            title="Kosongkan item"
          >
            <IconTrash size={15} />
          </button>
        )}
      </div>

      {/* ── Inputs Grid (2 Kolom): Qty Retur & Harga Beli ── */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-50">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Qty Retur (Maks {maxReturnable})
          </label>
          <FormNumberInput
            name={`items.${index}.kuantitas`}
            min={0}
            max={maxReturnable}
            onValueChange={(val) => {
              const checkedVal = Math.min(maxReturnable, Math.max(0, val ?? 0));
              updateItem(item.temp_uid, { kuantitas: checkedVal });
            }}
            disabled={isPending}
            className="h-9 text-center text-xs font-bold text-slate-800 rounded-xl border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right block">
            Harga Beli
          </label>
          <div className="h-9 flex items-center justify-end px-3 rounded-xl bg-slate-50 border border-slate-200/80 font-mono font-bold text-slate-600 text-xs">
            {formatRupiah(item.harga_estimasi)}
          </div>
        </div>
      </div>

      {/* ── Alasan Retur Select ── */}
      <div className="space-y-1 pt-1 border-t border-slate-50">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Alasan Retur
        </label>
        <FormSelect
          name={`items.${index}.alasan`}
          options={reasons}
          disabled={isPending || item.kuantitas === 0}
          onChange={(val) => {
            updateItem(item.temp_uid, { alasan: val });
          }}
          size="sm"
        />
      </div>

      {/* ── Footer: Subtotal ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Subtotal Retur
        </span>
        <span className="font-extrabold text-emerald-600 font-mono text-xs">
          {formatRupiah(subtotal)}
        </span>
      </div>
    </div>
  );
}
