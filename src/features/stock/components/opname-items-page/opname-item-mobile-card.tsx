"use client";

import { AppButton } from "@/components/shared/app-button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { NumberInput } from "@/components/ui/number-input";
import type { OpnameItem } from "@/features/stock/types";
import {
  IconBarcode,
  IconCategory,
  IconMinus,
  IconPlus,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";

interface OpnameItemMobileCardProps {
  item: OpnameItem;
  index: number;
  categoryOptions: CommandOption[];
  brandOptions: CommandOption[];
  onUpdateQty: (itemUid: string, qty: number) => void;
  onUpdateField: (itemUid: string, field: "alasan" | "brand_uid" | "category_uid", value: string | null) => void;
  onRemoveItem: (itemUid: string) => void;
  onFocusBarcode?: () => void;
}

export function OpnameItemMobileCard({
  item,
  index,
  categoryOptions,
  brandOptions,
  onUpdateQty,
  onUpdateField,
  onRemoveItem,
  onFocusBarcode,
}: OpnameItemMobileCardProps) {
  const stokFisik = Number(item.stok_fisik) || 0;
  const stokSistem = Number(item.stok_sistem) || 0;
  const diff = Number(item.selisih ?? (stokFisik - stokSistem));
  const productName = item.nama || item.product?.nama || "Produk";
  const barcode = item.barcode || item.product?.barcode || null;

  return (
    <div
      id={`opname-card-${item.product_uid}`}
      className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs space-y-3 transition-all"
    >
      {/* ── Header: Number, Name, Barcode & Delete ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0 space-y-0.5">
            <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug break-words">
              {productName}
            </h4>
            <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-400 font-medium">
              {barcode && (
                <span className="font-mono flex items-center gap-0.5">
                  <IconBarcode size={12} className="opacity-70" />
                  {barcode}
                </span>
              )}
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold font-sans">
                Sistem: {stokSistem} pcs
              </span>
            </div>
          </div>
        </div>

        <AppButton
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemoveItem(item.uid)}
          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0 cursor-pointer"
          title="Hapus produk"
        >
          <IconTrash size={16} />
        </AppButton>
      </div>

      {/* ── Stock Controls: Stepper Fisik & Selisih ── */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-50">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Stok Fisik
          </label>
          <div className="flex items-center gap-1">
            <AppButton
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onUpdateQty(item.uid, Math.max(0, stokFisik - 1))}
              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm cursor-pointer"
            >
              <IconMinus size={13} />
            </AppButton>
            <div className="flex-1 min-w-0">
              <NumberInput
                id={`opname-qty-${item.product_uid}`}
                value={stokFisik}
                onChange={(val) => onUpdateQty(item.uid, val === null ? 0 : Math.max(0, val))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onFocusBarcode?.();
                  }
                }}
                allowDecimal={false}
                allowNegative={false}
                min={0}
                className="h-7 w-full text-center rounded-lg border border-slate-200 p-0 text-xs font-bold font-mono outline-none focus-visible:border-emerald-600"
              />
            </div>
            <AppButton
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => onUpdateQty(item.uid, stokFisik + 1)}
              className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm cursor-pointer"
            >
              <IconPlus size={13} />
            </AppButton>
          </div>
        </div>

        <div className="space-y-1 text-right">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Selisih
          </label>
          <div className="h-7 flex items-center justify-end">
            <span
              className={`font-mono font-bold text-xs px-2 py-0.5 rounded-lg inline-block ${
                diff === 0
                  ? "bg-slate-100 text-slate-500"
                  : diff > 0
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
            >
              {diff > 0 ? `+${diff}` : diff} pcs
            </span>
          </div>
        </div>
      </div>

      {/* ── Category & Brand Selectors ── */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Kategori
          </label>
          <CommandSelect
            options={categoryOptions}
            value={item.category_uid || ""}
            onChange={(val) => onUpdateField(item.uid, "category_uid", val || null)}
            placeholder="Pilih Kategori"
            searchPlaceholder="Cari kategori..."
            emptyMessage="Tidak ditemukan"
            size="sm"
            leftIcon={<IconCategory size={12} className="text-slate-400" />}
            className="h-7 text-[11px] bg-slate-50/50 border-slate-200"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Brand
          </label>
          <CommandSelect
            options={brandOptions}
            value={item.brand_uid || ""}
            onChange={(val) => onUpdateField(item.uid, "brand_uid", val || null)}
            placeholder="Pilih Brand"
            searchPlaceholder="Cari brand..."
            emptyMessage="Tidak ditemukan"
            size="sm"
            leftIcon={<IconTag size={12} className="text-slate-400" />}
            className="h-7 text-[11px] bg-slate-50/50 border-slate-200"
          />
        </div>
      </div>

      {/* ── Alasan Selisih ── */}
      <div className="pt-1 border-t border-slate-50 space-y-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Alasan Selisih
        </label>
        <input
          type="text"
          defaultValue={item.alasan || ""}
          placeholder="Tulis alasan jika ada selisih..."
          onBlur={(e) => onUpdateField(item.uid, "alasan", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onUpdateField(item.uid, "alasan", (e.target as HTMLInputElement).value);
              onFocusBarcode?.();
            }
          }}
          className="h-7 w-full border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 rounded-lg text-[11px] px-2 outline-none bg-slate-50/50 focus:bg-white"
        />
      </div>
    </div>
  );
}
