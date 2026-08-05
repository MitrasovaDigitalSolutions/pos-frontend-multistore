"use client";

import { IconArrowRight, IconBuildingStore, IconNotes } from "@tabler/icons-react";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";

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
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <IconBuildingStore size={16} className="text-emerald-600" />
        <span>Rute Distribusi Toko</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
        {/* Asal */}
        <div className="sm:col-span-5 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Toko Asal (Pengirim)
          </span>
          <p className="font-bold text-slate-900 text-sm">{activeStoreName || "Toko Asal"}</p>
          <span className="inline-block text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
            {isCentralStore ? "Toko Pusat" : "Toko Cabang"}
          </span>
        </div>

        {/* Arrow */}
        <div className="sm:col-span-1 flex justify-center py-1">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <IconArrowRight size={16} />
          </div>
        </div>

        {/* Tujuan */}
        <div className="sm:col-span-5 space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Toko Tujuan (Penerima) *
          </label>
          <CommandSelect
            options={storeOptions}
            value={destinationUid}
            onChange={setDestinationUid}
            placeholder="Pilih toko tujuan..."
            searchPlaceholder="Cari toko tujuan..."
            emptyMessage="Tidak ada toko lain terdaftar"
          />
        </div>
      </div>

      {/* Catatan Field */}
      <div className="space-y-1.5 pt-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <IconNotes size={15} className="text-slate-400" />
          Catatan Pengiriman (Opsional)
        </label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Misal: Pengiriman stok mingguan cabang ABC..."
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
        />
      </div>
    </div>
  );
}
