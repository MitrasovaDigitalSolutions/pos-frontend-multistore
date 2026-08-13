"use client";

import { IconInfoCircle } from "@tabler/icons-react";

export function ConsignmentInstructionPanel() {
  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-2.5 text-xs">
      <div className="flex items-center gap-2 font-bold text-slate-800 border-b border-slate-200/40 pb-2">
        <IconInfoCircle className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Panduan Penerimaan Konsinyasi</span>
      </div>

      <ul className="space-y-2 text-[11px] text-slate-600 list-disc list-inside leading-relaxed">
        <li>
          <strong className="text-slate-700">Stok Fisik:</strong> Barang konsinyasi yang diselesaikan akan langsung menambahkan kuantitas stok fisik toko.
        </li>
        <li>
          <strong className="text-slate-700">Off-Book:</strong> Tidak ada pencatatan hutang dagang atau jurnal akuntansi saat penerimaan.
        </li>
        <li>
          <strong className="text-slate-700">Pencatatan Hutang:</strong> Hutang timbul secara otomatis saat barang konsinyasi terjual di Kasir (POS).
        </li>
        <li>
          <strong className="text-slate-700">Pelunasan & Retur:</strong> Pembayaran ke supplier dilakukan via menu <em>Pelunasan & Retur</em> sesuai kuantitas barang yang telah terjual.
        </li>
      </ul>
    </div>
  );
}
