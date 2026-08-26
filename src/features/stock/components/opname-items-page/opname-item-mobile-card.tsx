"use client";

import { AppButton } from "@/components/shared/app-button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import type { OpnameItem } from "@/features/stock/types";
import { IconBarcode, IconCategory, IconTag, IconTrash } from "@tabler/icons-react";
import { OpnameQtyInput } from "./opname-qty-input";

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
  const diff = stokFisik - stokSistem;
  const productName = item.nama || item.product?.nama || "Produk";
  const barcode = item.barcode || item.product?.barcode || null;

  return (
    <div
      id={`opname-card-${item.product_uid}`}
      className="bg-white border border-slate-100 rounded-xl p-2.5 shadow-2xs space-y-2 transition-all"
    >
      {/* ── Header: Number, Name, Barcode & Delete ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-1.5 min-w-0">
          <span className="shrink-0 w-5 h-5 rounded-md bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug break-words">
              {productName}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-400 font-medium mt-0.5">
              {barcode && (
                <span className="font-mono flex items-center gap-0.5">
                  <IconBarcode size={11} className="opacity-70" />
                  {barcode}
                </span>
              )}
              <span>•</span>
              <span className="font-mono text-slate-600 font-semibold">
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
          className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer h-6 w-6"
          title="Hapus produk"
        >
          <IconTrash size={14} />
        </AppButton>
      </div>

      {/* ── Stock Controls: Stepper Fisik & Selisih ── */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Fisik:</span>
          <OpnameQtyInput
            itemUid={item.uid}
            productUid={item.product_uid}
            stokFisik={stokFisik}
            onUpdateQty={onUpdateQty}
            onFocusBarcode={onFocusBarcode}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Selisih:</span>
          <span
            className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded-md inline-block ${
              diff === 0
                ? "bg-slate-100 text-slate-500"
                : diff > 0
                ? "bg-blue-50 text-blue-700 border border-blue-100"
                : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}
          >
            {diff > 0 ? `+${diff}` : diff}
          </span>
        </div>
      </div>

      {/* ── Category & Brand Selectors ── */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50">
        <div className="space-y-0.5">
          <label className="text-[9.5px] font-bold text-slate-400 uppercase">Kategori</label>
          <CommandSelect
            options={categoryOptions}
            value={item.category_uid || ""}
            onChange={(val) => onUpdateField(item.uid, "category_uid", val || null)}
            placeholder="Pilih Kategori"
            searchPlaceholder="Cari kategori..."
            emptyMessage="Tidak ditemukan"
            size="sm"
            leftIcon={<IconCategory size={11} className="text-slate-400" />}
            className="h-6.5 text-[10.5px] bg-slate-50/50 border-slate-200"
          />
        </div>

        <div className="space-y-0.5">
          <label className="text-[9.5px] font-bold text-slate-400 uppercase">Brand</label>
          <CommandSelect
            options={brandOptions}
            value={item.brand_uid || ""}
            onChange={(val) => onUpdateField(item.uid, "brand_uid", val || null)}
            placeholder="Pilih Brand"
            searchPlaceholder="Cari brand..."
            emptyMessage="Tidak ditemukan"
            size="sm"
            leftIcon={<IconTag size={11} className="text-slate-400" />}
            className="h-6.5 text-[10.5px] bg-slate-50/50 border-slate-200"
          />
        </div>
      </div>

      {/* ── Alasan Selisih ── */}
      <div className="pt-1 border-t border-slate-50">
        <input
          type="text"
          defaultValue={item.alasan || ""}
          placeholder="Tulis alasan jika ada selisih..."
          onBlur={(e) => {
            const val = e.target.value.trim();
            if (val !== (item.alasan || "")) {
              onUpdateField(item.uid, "alasan", val || null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const val = (e.target as HTMLInputElement).value.trim();
              if (val !== (item.alasan || "")) {
                onUpdateField(item.uid, "alasan", val || null);
              }
              (e.target as HTMLInputElement).blur();
              onFocusBarcode?.();
            }
          }}
          className="h-6.5 w-full border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 rounded-md text-[10.5px] px-2 outline-none bg-slate-50/50 focus:bg-white transition-all"
        />
      </div>
    </div>
  );
}
