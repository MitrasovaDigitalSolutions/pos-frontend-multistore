"use client";

import { AppButton } from "@/components/shared/app-button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { NumberInput } from "@/components/ui/number-input";
import type { OpnameItem } from "../../types";
import type { OpnameItemLocal } from "@/stores/opname-items-store";
import {
  IconBarcode,
  IconCategory,
  IconMinus,
  IconPlus,
  IconTag,
  IconTrash,
} from "@tabler/icons-react";

interface OpnameItemMobileCardProps {
  item: OpnameItem | OpnameItemLocal;
  index: number;
  categoryOptions: CommandOption[];
  brandOptions: CommandOption[];
  updateItem: (
    id: string,
    data: Partial<
      Pick<
        OpnameItem,
        "stok_fisik" | "alasan" | "brand_uid" | "category_uid"
      >
    >
  ) => void;
  removeItem: (id: string) => void;
  onFocusBarcode?: () => void;
}

export function OpnameItemMobileCard({
  item,
  index,
  categoryOptions,
  brandOptions,
  updateItem,
  removeItem,
  onFocusBarcode,
}: OpnameItemMobileCardProps) {
  const isOpnameItem = "uid" in item && !("temp_uid" in item);
  const itemId = isOpnameItem ? item.uid : (item as OpnameItemLocal).temp_uid;
  const productName = isOpnameItem ? (item.product?.nama || item.product_uid) : (item as OpnameItemLocal).nama;
  const productBarcode = isOpnameItem ? (item.product?.barcode || "") : ((item as OpnameItemLocal).barcode || "");
  const diff = isOpnameItem && typeof item.selisih === "number"
    ? item.selisih
    : (Number(item.stok_fisik) || 0) - (Number(item.stok_sistem) || 0);

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
              {productBarcode && (
                <span className="font-mono flex items-center gap-0.5">
                  <IconBarcode size={12} className="opacity-70" />
                  {productBarcode}
                </span>
              )}
              <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-semibold font-sans">
                Sistem: {item.stok_sistem} pcs
              </span>
            </div>
          </div>
        </div>

        <AppButton
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => removeItem(itemId)}
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
              onClick={() =>
                updateItem(itemId, {
                  stok_fisik: Math.max(0, (Number(item.stok_fisik) || 0) - 1),
                })
              }
              className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              <IconMinus size={13} />
            </AppButton>
            <div className="flex-1 min-w-0">
              <NumberInput
                id={`opname-qty-${item.product_uid}`}
                value={item.stok_fisik}
                onChange={(val) => {
                  updateItem(itemId, {
                    stok_fisik: val === null ? 0 : Math.max(0, val),
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onFocusBarcode?.();
                  }
                }}
                allowDecimal={false}
                allowNegative={false}
                min={0}
                className="h-8 text-center rounded-xl border-slate-200 p-0 text-xs font-bold w-full bg-slate-50/50 focus:bg-white"
              />
            </div>
            <AppButton
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() =>
                updateItem(itemId, {
                  stok_fisik: (Number(item.stok_fisik) || 0) + 1,
                })
              }
              className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              <IconPlus size={13} />
            </AppButton>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right block">
            Selisih
          </label>
          <div
            className={`h-8 flex items-center justify-end px-3 rounded-xl font-mono font-bold text-xs ${diff === 0
                ? "bg-slate-50 text-slate-400 border border-slate-100"
                : diff > 0
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "bg-rose-50 text-rose-700 border border-rose-100"
              }`}
          >
            {diff > 0 ? `+${diff}` : diff} pcs
          </div>
        </div>
      </div>

      {/* ── Category & Brand Selectors ── */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <div className="space-y-1">
          <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
            <IconCategory size={10} />
            <span>Kategori</span>
          </label>
          <CommandSelect
            options={categoryOptions}
            value={item.category_uid || ""}
            onChange={(val) =>
              updateItem(itemId, { category_uid: val || null })
            }
            placeholder="Pilih Kategori"
            searchPlaceholder="Cari kategori..."
            emptyMessage="Tidak ada"
            size="sm"
            className="h-8 text-[11px] bg-slate-50/50 border-slate-200 rounded-xl"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
            <IconTag size={10} />
            <span>Brand</span>
          </label>
          <CommandSelect
            options={brandOptions}
            value={item.brand_uid || ""}
            onChange={(val) =>
              updateItem(itemId, { brand_uid: val || null })
            }
            placeholder="Pilih Brand"
            searchPlaceholder="Cari brand..."
            emptyMessage="Tidak ada"
            size="sm"
            className="h-8 text-[11px] bg-slate-50/50 border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* ── Alasan Selisih ── */}
      <div className="pt-0.5">
        <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Alasan Selisih
        </label>
        <input
          type="text"
          value={item.alasan || ""}
          placeholder="Alasan selisih (misal: Barang rusak, kedaluwarsa)..."
          onChange={(e) => {
            updateItem(itemId, { alasan: e.target.value });
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onFocusBarcode?.();
            }
          }}
          className="h-8 w-full border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 rounded-xl text-[11px] px-3 bg-slate-50/50 focus:bg-white outline-none"
        />
      </div>
    </div>
  );
}
