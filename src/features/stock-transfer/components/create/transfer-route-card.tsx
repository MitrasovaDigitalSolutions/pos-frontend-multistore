"use client";

import { IconArrowRight, IconBuildingStore, IconNotes } from "@tabler/icons-react";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { STORE_LABEL_HQ, STORE_LABEL_BRANCH } from "@/constants/store";

interface TransferRouteCardProps {
  activeStoreName?: string;
  isCentralStore?: boolean;
  storeOptions: CommandOption[];
  destinationUid: string;
  setDestinationUid: (val: string) => void;
  catatan: string;
  setCatatan: (val: string) => void;
}

export function TransferRouteCard({
  activeStoreName,
  isCentralStore,
  storeOptions,
  destinationUid,
  setDestinationUid,
  catatan,
  setCatatan,
}: TransferRouteCardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
            <IconBuildingStore size={15} />
          </div>
          <span>Rute Distribusi Stok</span>
        </h3>
        <span className="text-[11px] text-slate-400 font-medium">Langkah 1 dari 2</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
        {/* Toko Asal (Pengirim) */}
        <div className="sm:col-span-5 bg-slate-50/80 border border-slate-100/80 rounded-xl p-3 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Toko Asal (Pengirim)
            </span>
            <span className="inline-block text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.2 rounded-md">
              {isCentralStore ? STORE_LABEL_HQ : STORE_LABEL_BRANCH}
            </span>
          </div>
          <p className="font-extrabold text-slate-900 text-sm truncate">
            {activeStoreName || "Toko Asal"}
          </p>
        </div>

        {/* Transfer Arrow Indicator */}
        <div className="sm:col-span-1 flex justify-center py-1">
          <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shadow-2xs">
            <IconArrowRight size={14} />
          </div>
        </div>

        {/* Toko Tujuan (Penerima) */}
        <div className="sm:col-span-5 space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Toko Tujuan (Penerima) <span className="text-rose-500">*</span>
          </label>
          <CommandSelect
            options={storeOptions}
            value={destinationUid}
            onChange={setDestinationUid}
            placeholder="Pilih toko tujuan..."
            searchPlaceholder="Cari nama toko tujuan..."
            emptyMessage="Tidak ada toko lain terdaftar"
          />
        </div>
      </div>

      {/* Catatan Field */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <IconNotes size={14} className="text-slate-400" />
            <span>Catatan Pengiriman</span>
            <span className="text-[10px] font-normal text-slate-400">(opsional)</span>
          </label>
          <span className="text-[10px] text-slate-400">{catatan.length}/300</span>
        </div>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Misal: Pengiriman restok mingguan untuk produk populer..."
          rows={2}
          maxLength={300}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
    </div>
  );
}
