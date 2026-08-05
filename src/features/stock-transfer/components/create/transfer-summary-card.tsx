"use client";

import { IconCheck, IconDeviceFloppy, IconInfoCircle, IconX } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";

interface TransferSummaryCardProps {
  activeStoreName?: string;
  destinationStoreName?: string;
  totalJenis: number;
  totalQty: number;
  onSubmit: () => void;
  isPending: boolean;
  canSubmit: boolean;
}

export function TransferSummaryCard({
  activeStoreName,
  destinationStoreName,
  totalJenis,
  totalQty,
  onSubmit,
  isPending,
  canSubmit,
}: TransferSummaryCardProps) {
  const isDestValid = !!destinationStoreName;
  const isItemsValid = totalJenis > 0;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-5 space-y-4 sticky top-6">
      <h3 className="font-bold text-sm text-slate-900 border-b border-slate-50 pb-2.5">
        Ringkasan Transfer
      </h3>

      {/* Summary Stats */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Toko Pengirim:</span>
          <span className="font-bold text-slate-900">{activeStoreName || "Toko Pusat"}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Toko Penerima:</span>
          <span className={`font-bold ${isDestValid ? "text-emerald-700" : "text-slate-400 italic"}`}>
            {destinationStoreName || "Belum dipilih"}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-100">
          <span>Jenis Barang:</span>
          <span className="font-bold text-slate-900">{totalJenis} SKU</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Total Unit Dikirim:</span>
          <span className="font-black text-slate-900 text-sm">{totalQty} pcs</span>
        </div>
      </div>

      {/* Checklist validation */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1.5 text-[11px]">
        <span className="font-bold text-slate-500 uppercase text-[9px] tracking-wider block">
          Checklist Persyaratan:
        </span>
        <div className="flex items-center gap-2">
          {isDestValid ? (
            <IconCheck size={14} className="text-emerald-600 shrink-0" />
          ) : (
            <IconX size={14} className="text-amber-500 shrink-0" />
          )}
          <span className={isDestValid ? "text-slate-700 font-semibold" : "text-slate-400"}>
            Toko tujuan penerima dipilih
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isItemsValid ? (
            <IconCheck size={14} className="text-emerald-600 shrink-0" />
          ) : (
            <IconX size={14} className="text-amber-500 shrink-0" />
          )}
          <span className={isItemsValid ? "text-slate-700 font-semibold" : "text-slate-400"}>
            Minimal 1 barang dimasukkan
          </span>
        </div>
      </div>

      {/* Info Notice */}
      <div className="p-3 bg-amber-50/70 border border-amber-100/80 rounded-xl text-amber-800 text-[11px] space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-amber-900">
          <IconInfoCircle size={14} className="shrink-0 text-amber-600" />
          <span>Alur Distribusi Stok:</span>
        </div>
        <p className="text-[10px] leading-relaxed text-amber-800">
          Transfer akan disimpan sebagai <strong className="font-bold">Draft</strong>. Pemotongan stok toko pengirim dilakukan setelah Anda menekan tombol <strong className="font-bold">Finalize / Kirim</strong> di halaman detail.
        </p>
      </div>

      {/* Submit CTA Button */}
      <AppButton
        onClick={onSubmit}
        disabled={isPending || !canSubmit}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all"
      >
        <IconDeviceFloppy size={16} />
        <span>{isPending ? "Memproses..." : "Simpan Draft Transfer"}</span>
      </AppButton>
    </div>
  );
}
