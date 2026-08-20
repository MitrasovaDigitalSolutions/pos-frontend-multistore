"use client";

import { IconBarcode, IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { NumberInput } from "@/components/ui/number-input";
import type { RequestLineItem } from "../../schemas/request-transfer-schema";

interface RequestTransferItemMobileCardProps {
  item: RequestLineItem;
  index: number;
  onUpdateQty: (productUid: string, qty: number) => void;
  onRemoveItem: (productUid: string) => void;
  qtyInputRef?: (el: HTMLInputElement | null) => void;
  onEnterPress?: () => void;
}

export function RequestTransferItemMobileCard({
  item,
  index,
  onUpdateQty,
  onRemoveItem,
  qtyInputRef,
  onEnterPress,
}: RequestTransferItemMobileCardProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-2xs space-y-3">
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
            {item.barcode && (
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium font-mono">
                <IconBarcode size={12} className="opacity-70" />
                <span>{item.barcode}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRemoveItem(item.product_uid)}
          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer flex-shrink-0"
          title="Hapus produk"
        >
          <IconTrash size={16} />
        </button>
      </div>

      {/* ── Qty Counter Bar (Mobile Touch Friendly) ── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Jumlah Request
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onUpdateQty(item.product_uid, Math.max(0, item.kuantitas - 1))}
            className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
          >
            <IconMinus size={14} />
          </button>
          <NumberInput
            ref={qtyInputRef}
            value={item.kuantitas}
            onChange={(val) => onUpdateQty(item.product_uid, val || 0)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onEnterPress?.();
              }
            }}
            min={0}
            allowNegative={false}
            className="h-8 w-16 text-center text-xs font-bold border-slate-200 rounded-xl px-1"
          />
          <button
            type="button"
            onClick={() => onUpdateQty(item.product_uid, item.kuantitas + 1)}
            className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all cursor-pointer"
          >
            <IconPlus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
