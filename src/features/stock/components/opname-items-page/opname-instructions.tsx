"use client";

import { IconAlertTriangle, IconInfoCircle, IconX } from "@tabler/icons-react";

interface OpnameInstructionsProps {
  open: boolean;
  onClose: () => void;
}

export function OpnameInstructions({ open, onClose }: OpnameInstructionsProps) {
  if (!open) return null;

  return (
    <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3.5 space-y-2 text-xs relative animate-in fade-in slide-in-from-top-1 duration-200">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2.5 right-2.5 p-1 text-amber-700 hover:text-amber-900 rounded-lg hover:bg-amber-100/50 cursor-pointer"
        title="Tutup Petunjuk"
      >
        <IconX size={15} />
      </button>

      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
        <IconInfoCircle size={17} className="text-amber-600 shrink-0" />
        <span>Panduan Perhitungan Stock Opname</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] text-amber-900/90 leading-relaxed">
        <div className="bg-white/60 p-2.5 rounded-xl border border-amber-100/60">
          <strong className="block text-slate-800 mb-0.5">
            1. Scan Barcode / Cari Produk
          </strong>
          Gunakan barcode scanner atau ketikkan nama barang pada form pencarian.
          Barang baru otomatis masuk di paling atas.
        </div>

        <div className="bg-white/60 p-2.5 rounded-xl border border-amber-100/60">
          <strong className="block text-slate-800 mb-0.5">
            2. Sesuaikan Stok Fisik
          </strong>
          Tekan tombol <strong>+ / -</strong> atau ketik langsung angka stok
          aktual yang ditemukan di toko.
        </div>

        <div className="bg-white/60 p-2.5 rounded-xl border border-amber-100/60">
          <strong className="block text-slate-800 mb-0.5">
            3. Simpan Draf & Finalisasi
          </strong>
          Simpan progres sewaktu-waktu sebagai draf. Setelah semua barang
          selesai dihitung, klik <strong>Finalisasi</strong> untuk memperbarui
          stok toko.
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10.5px] text-amber-700/90 pt-1 font-medium">
        <IconAlertTriangle size={13} className="shrink-0" />
        <span>
          Pastikan transaksi kasir sedang tidak berjalan aktif di toko saat
          proses opname agar stok tidak berubah di tengah jalan.
        </span>
      </div>
    </div>
  );
}
