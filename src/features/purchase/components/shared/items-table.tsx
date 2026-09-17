"use client";

import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { PurchaseItemLocal } from "../../types";
import { PurchaseItemMobileCard } from "./purchase-item-mobile-card";
import { PurchaseItemTableRow } from "./purchase-item-table-row";

interface ItemsTableProps {
  items: PurchaseItemLocal[];
  onUpdateItem: (
    temp_uid: string,
    data: Partial<Pick<PurchaseItemLocal, "kuantitas" | "harga_estimasi">>
  ) => void;
  onRemoveItem: (temp_uid: string) => void;
  priceLabel?: string;
  disabled?: boolean;
  isPriceReadOnly?: boolean;
  allowSubtotalInput?: boolean;
}

export function ItemsTable({
  items,
  onUpdateItem,
  onRemoveItem,
  priceLabel = "Harga Estimasi",
  disabled = false,
  isPriceReadOnly = false,
  allowSubtotalInput = false,
}: ItemsTableProps) {
  const methods = useForm({
    values: {
      items: items.map((item) => ({
        kuantitas: item.kuantitas,
        harga_estimasi: item.harga_estimasi,
      })),
    },
  });

  const [flashId, setFlashId] = useState<string | null>(null);
  const prevLengthRef = useRef(items.length);

  // Flash animation and smooth adaptive scrolling when a new item is added
  useEffect(() => {
    if (items.length > prevLengthRef.current) {
      const topItem = items[0];
      if (topItem) {
        const timer = setTimeout(() => {
          setFlashId(topItem.temp_uid);
          const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
          const targetElement = isMobile
            ? document.getElementById(`purchase-item-card-${topItem.temp_uid}`)
            : document.getElementById(`purchase-item-row-${topItem.temp_uid}`);

          if (targetElement) {
            targetElement.scrollIntoView({
              behavior: "smooth",
              block: isMobile ? "center" : "nearest",
            });
          }

          setTimeout(() => setFlashId(null), 800);
        }, 30);
        return () => clearTimeout(timer);
      }
    }
    prevLengthRef.current = items.length;
  }, [items.length, items]);

  const totalItems = items.reduce((acc, item) => acc + item.kuantitas, 0);
  const totalValue = items.reduce((acc, item) => acc + item.kuantitas * item.harga_estimasi, 0);

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white/50">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center">
          <IconDeviceFloppy size={28} className="text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">Belum ada barang</p>
        <p className="text-xs text-slate-400 mt-1">
          Scan barcode atau ketik nama produk untuk menambahkan barang.
        </p>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="space-y-3">
        {/* ── Mobile Card List View (< 768px) ── */}
        <div className="block md:hidden space-y-2.5">
          {items.map((item, idx) => (
            <PurchaseItemMobileCard
              key={item.temp_uid}
              item={item}
              index={idx}
              priceLabel={priceLabel}
              disabled={disabled}
              isPriceReadOnly={isPriceReadOnly}
              isFlashing={flashId === item.temp_uid}
              allowSubtotalInput={allowSubtotalInput}
              onUpdateItem={onUpdateItem}
              onRemoveItem={onRemoveItem}
            />
          ))}
        </div>

        {/* ── Desktop Table View (≥ 768px) ── */}
        <div id="rec-table-card" className="hidden md:block border border-slate-100 rounded-2xl overflow-hidden shadow-2xs bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead id="rec-table-header">
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-3 w-10">No</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Nama Produk</th>
                <th className="p-3 text-center w-24">Qty</th>
                <th className="p-3 text-right w-36">{priceLabel}</th>
                <th className={`p-3 text-right ${allowSubtotalInput ? "w-44" : "w-32"}`}>
                  {allowSubtotalInput ? "Total Item" : "Subtotal"}
                </th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item, idx) => (
                <PurchaseItemTableRow
                  key={item.temp_uid}
                  item={item}
                  index={idx}
                  disabled={disabled}
                  isPriceReadOnly={isPriceReadOnly}
                  isFlashing={flashId === item.temp_uid}
                  allowSubtotalInput={allowSubtotalInput}
                  onUpdateItem={onUpdateItem}
                  onRemoveItem={onRemoveItem}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Summary & Totals Banner (Responsive for both Mobile & Desktop) ── */}
        <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Qty:
              </span>
              <span className="font-extrabold text-slate-800 font-mono">
                {totalItems} pcs
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Variasi:
              </span>
              <span className="font-extrabold text-slate-800 font-mono">
                {items.length} produk
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Nilai:
            </span>
            <span className="text-base sm:text-lg font-black text-emerald-600 font-mono">
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
    </FormProvider>
  );
}
