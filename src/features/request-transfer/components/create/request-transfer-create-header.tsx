"use client";

import { IconArrowLeft, IconTruckDelivery } from "@tabler/icons-react";
import { AppButton } from "@/components/shared/app-button";
import { useAppRouter } from "@/hooks/use-app-router";
import { ROUTES } from "@/constants/routes";

export function RequestTransferCreateHeader() {
  const router = useAppRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs">
      <div className="flex items-center gap-3.5">
        <AppButton
          type="button"
          variant="outline"
          onClick={() => router.push(ROUTES.ADMIN_REQUEST_TRANSFERS)}
          className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shrink-0 cursor-pointer"
        >
          <IconArrowLeft size={18} />
        </AppButton>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Buat Request Transfer Baru
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-full">
              <IconTruckDelivery size={12} /> Permintaan Stok
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih supplier serta katalog pilihan dan tentukan daftar barang yang ingin diminta.
          </p>
        </div>
      </div>
    </div>
  );
}
