"use client";

import { IconCheck, IconInfoCircle, IconSend, IconX } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";

interface RequestTransferSummaryCardProps {
  supplierName?: string;
  catalogName?: string;
  totalJenis: number;
  totalQty: number;
  onSubmit: () => void;
  isPending: boolean;
  canSubmit: boolean;
}

export function RequestTransferSummaryCard({
  supplierName,
  catalogName,
  totalJenis,
  totalQty,
  onSubmit,
  isPending,
  canSubmit,
}: RequestTransferSummaryCardProps) {
  const isSupplierValid = !!supplierName;
  const isItemsValid = totalJenis > 0 && totalQty > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-5 space-y-4 sticky top-20">
      <h3 className="font-bold text-sm text-slate-900 border-b border-slate-50 pb-2.5">
        Ringkasan Request Transfer
      </h3>

      {/* Summary Stats */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Supplier:</span>
          <span className={`font-bold ${isSupplierValid ? "text-slate-900" : "text-slate-400 italic"}`}>
            {supplierName || "Belum dipilih"}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Katalog Sales:</span>
          <span className="font-semibold text-slate-700">
            {catalogName || "Tanpa katalog"}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-100">
          <span>Jenis Barang:</span>
          <span className="font-bold text-slate-900">{totalJenis} SKU</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Total Kuantitas:</span>
          <span className="font-black text-slate-900 text-sm">{totalQty} unit</span>
        </div>
      </div>

      {/* Checklist validation */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 text-[11px]">
        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block">
          Checklist Persyaratan:
        </span>
        <div className="flex items-center gap-2">
          {isSupplierValid ? (
            <IconCheck size={14} className="text-emerald-600 shrink-0" />
          ) : (
            <IconX size={14} className="text-amber-500 shrink-0" />
          )}
          <span className={isSupplierValid ? "text-slate-700 font-semibold" : "text-slate-400"}>
            Supplier tujuan dipilih
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isItemsValid ? (
            <IconCheck size={14} className="text-emerald-600 shrink-0" />
          ) : (
            <IconX size={14} className="text-amber-500 shrink-0" />
          )}
          <span className={isItemsValid ? "text-slate-700 font-semibold" : "text-slate-400"}>
            Minimal 1 barang dengan kuantitas &gt; 0
          </span>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-3 bg-emerald-50/70 border border-emerald-100/80 rounded-xl text-emerald-800 text-[11px] space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
          <IconInfoCircle size={14} className="shrink-0 text-emerald-600" />
          <span>Informasi Request Transfer:</span>
        </div>
        <p className="text-[10px] leading-relaxed text-emerald-800">
          Permintaan akan dikirimkan ke supplier. Item dengan kuantitas 0 akan diabaikan secara otomatis saat pengiriman.
        </p>
      </div>

      {/* Submit CTA Button */}
      <AppButton
        onClick={onSubmit}
        disabled={isPending || !canSubmit}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
      >
        <IconSend size={16} />
        <span>{isPending ? "Mengirim..." : "Kirim Request Transfer"}</span>
      </AppButton>
    </div>
  );
}
