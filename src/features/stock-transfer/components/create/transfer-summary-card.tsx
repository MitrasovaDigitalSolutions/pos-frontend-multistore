"use client";

import { IconCheck, IconDeviceFloppy, IconInfoCircle, IconX } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { STORE_LABEL_HQ } from "@/constants/store";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { TRANSFER_TYPE, type TransferType } from "../../constants";

interface TransferSummaryCardProps {
  activeStoreName?: string;
  destinationStoreName?: string;
  totalJenis: number;
  totalQty: number;
  tipeTransfer?: TransferType;
  totalNilaiPasok?: number;
  totalNilaiRetail?: number;
  totalEstimasiKomisi?: number;
  onSubmit: () => void;
  isPending: boolean;
  canSubmit: boolean;
}

export function TransferSummaryCard({
  activeStoreName,
  destinationStoreName,
  totalJenis,
  totalQty,
  tipeTransfer = TRANSFER_TYPE.REGULAR,
  totalNilaiPasok = 0,
  totalNilaiRetail = 0,
  totalEstimasiKomisi = 0,
  onSubmit,
  isPending,
  canSubmit,
}: TransferSummaryCardProps) {
  const isDestValid = !!destinationStoreName;
  const isItemsValid = totalJenis > 0;
  const isKonsinyasi = tipeTransfer === TRANSFER_TYPE.KONSINYASI_INTERNAL;

  return (
    <div id="transfer-summary-card" className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-5 space-y-4 sticky top-20">
      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
        <h3 className="font-bold text-sm text-slate-900">
          Ringkasan Transfer
        </h3>
        {isKonsinyasi && (
          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
            Titipan Pusat
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between items-center text-slate-600">
          <span>Toko Pengirim:</span>
          <span className="font-bold text-slate-900">{activeStoreName || STORE_LABEL_HQ}</span>
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

        {isKonsinyasi && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5 bg-purple-50/40 p-2.5 rounded-xl border border-purple-100/60">
            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span>Total Nilai Pasok (Wajib Setor):</span>
              <span className="font-bold text-purple-900">{formatRupiah(totalNilaiPasok)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span>Potensi Omzet Retail:</span>
              <span className="font-semibold text-slate-800">{formatRupiah(totalNilaiRetail)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-700 text-[11px] pt-1 border-t border-purple-100">
              <span className="font-bold">Estimasi Komisi Cabang:</span>
              <span className="font-black">{formatRupiah(totalEstimasiKomisi)}</span>
            </div>
          </div>
        )}
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
        id="transfer-btn-submit"
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
