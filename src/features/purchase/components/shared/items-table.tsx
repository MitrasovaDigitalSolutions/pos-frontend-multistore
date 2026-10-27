"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useAppPreset } from "@/features/license/hooks/use-app-preset";
import { IconDeviceFloppy, IconPackage } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { PurchaseItemLocal } from "../../types";
import { PurchaseItemCard } from "./purchase-item-card";

interface ItemsTableProps {
  items: PurchaseItemLocal[];
  onUpdateItem: (
    temp_uid: string,
    data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi" | "expired_date">>
  ) => void;
  onRemoveItem: (temp_uid: string) => void;
  priceLabel?: string;
  disabled?: boolean;
  isPriceReadOnly?: boolean;
  allowSubtotalInput?: boolean;
  lastScannedUid?: string | null;
  onClearLastScannedUid?: () => void;
  onEnterKey?: () => void;
}

export function ItemsTable({
  items,
  onUpdateItem,
  onRemoveItem,
  priceLabel = "Harga Satuan",
  disabled = false,
  isPriceReadOnly = false,
  allowSubtotalInput = false,
  lastScannedUid,
  onClearLastScannedUid,
  onEnterKey,
}: ItemsTableProps) {
  const { isPharmacy } = useAppPreset();
  const [flashId, setFlashId] = useState<string | null>(null);
  const qtyInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Focus Qty and select text ONLY when a new item was scanned or found
  useEffect(() => {
    if (lastScannedUid) {
      const topItem =
        items.find((i) => i.product_uid === lastScannedUid) || items[0];

      const timer = setTimeout(() => {
        if (topItem) {
          setFlashId(topItem.temp_uid);
        }
        const inputEl = qtyInputRefs.current.get(lastScannedUid);
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          inputEl.focus({ preventScroll: true });
          inputEl.select();
        }
        onClearLastScannedUid?.();
        setTimeout(() => setFlashId(null), 800);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [items, lastScannedUid, onClearLastScannedUid]);

  const totalItems = items.reduce((acc, item) => acc + item.kuantitas, 0);
  const totalValue = items.reduce(
    (acc, item) => acc + item.kuantitas * item.harga_estimasi,
    0
  );

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-10 text-center bg-white/60 dark:bg-slate-900/40">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600">
          <IconPackage size={30} />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
          Belum ada barang di daftar
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
          Scan barcode atau cari nama produk untuk menambahkan barang
          belanja/penerimaan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* ── Compact Column Headers (Desktop/Tablet) ── */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border border-slate-100 dark:border-slate-800">
        <span className="w-5 shrink-0 text-center">#</span>
        <span className="flex-1 min-w-0">Nama Produk</span>
        <span className="w-18 sm:w-20 text-center shrink-0">Qty</span>
        <span className="w-26 sm:w-30 text-right shrink-0">{priceLabel}</span>
        {isPharmacy && (
          <span className="w-28 sm:w-34 text-center shrink-0">Exp. Date</span>
        )}
        <span className="w-26 sm:w-32 text-right shrink-0">
          {allowSubtotalInput ? "Total Nota (Edit)" : "Subtotal"}
        </span>
        <span className="w-7 shrink-0"></span>
      </div>

      {/* ── 1 Column Grid (Ultra-Compact High-Volume Rows) ── */}
      <div className="grid grid-cols-1 gap-1.5">
        {items.map((item, idx) => (
          <PurchaseItemCard
            key={item.temp_uid}
            item={item}
            index={idx}
            priceLabel={priceLabel}
            disabled={disabled}
            isPriceReadOnly={isPriceReadOnly}
            isFlashing={flashId === item.temp_uid}
            allowSubtotalInput={allowSubtotalInput}
            qtyInputRef={(el) => {
              if (el) qtyInputRefs.current.set(item.product_uid, el);
              else qtyInputRefs.current.delete(item.product_uid);
            }}
            onEnterPress={onEnterKey}
            onUpdateItem={onUpdateItem}
            onRemoveItem={onRemoveItem}
          />
        ))}
      </div>

      {/* ── Summary & Totals Banner (Responsive for both Mobile & Desktop) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Qty:
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {totalItems} pcs
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Variasi:
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-100 font-mono">
              {items.length} produk
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Nilai:
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatRupiah(totalValue)}
          </span>
        </div>
      </div>

      {/* Auto-save indicator */}
      <div className="flex items-center gap-1.5 px-1">
        <IconDeviceFloppy size={12} className="text-emerald-500" />
        <span className="text-[10px] text-slate-400 font-medium">
          Data tersimpan otomatis di lokal komputer anda
        </span>
      </div>
    </div>
  );
}
