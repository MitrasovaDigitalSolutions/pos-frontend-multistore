"use client";

import { IconArrowLeft } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { useAppRouter } from "@/hooks/use-app-router";

export function TransferCreateHeader() {
  const router = useAppRouter();

  return (
    <div className="flex items-center gap-4">
      <AppButton
        type="button"
        variant="outline"
        onClick={() => router.back()}
        className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
      >
        <IconArrowLeft size={18} />
      </AppButton>
      <div>
        <h2 className="text-lg font-bold text-slate-900">Buat Transfer Stok Baru</h2>
        <p className="text-xs text-slate-400">Pilih toko tujuan (cabang/pusat) dan tentukan jumlah barang yang dikirim.</p>
      </div>
    </div>
  );
}
