"use client";

import { IconDeviceFloppy, IconInfoCircle } from "@tabler/icons-react";
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
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-5 sticky top-6">
      <h3 className="font-bold text-sm text-slate-900 border-b border-slate-50 pb-3">
        Ringkasan Transfer
      </h3>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Toko Pengirim:</span>
          <span className="font-bold text-slate-800">{activeStoreName || "Toko Pusat"}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Toko Penerima:</span>
          <span className="font-bold text-emerald-700">
            {destinationStoreName || "— Belum dipilih"}
          </span>
        </div>
        <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-100">
          <span>Jenis Produk:</span>
          <span className="font-bold text-slate-900">{totalJenis} Barang</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
          <span>Total Unit Dikirim:</span>
          <span className="font-extrabold text-slate-900 text-sm">{totalQty} pcs</span>
        </div>
      </div>

      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[11px] space-y-1">
        <div className="flex items-center gap-1 font-bold text-amber-900">
          <IconInfoCircle size={14} className="shrink-0 text-amber-600" />
          Info Alur Transfer:
        </div>
        <p className="text-[10px] leading-relaxed">
          Menyimpan transfer akan membuatnya berstatus <strong className="font-bold">Draft</strong>. Setelah diperiksa, tombol <strong className="font-bold">Finalize / Kirim</strong> pada halaman detail akan secara fisik memotong stok di toko asal.
        </p>
      </div>

      <AppButton
        onClick={onSubmit}
        disabled={isPending || !canSubmit}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
      >
        <IconDeviceFloppy size={16} />
        Simpan Draft Transfer
      </AppButton>
    </div>
  );
}
