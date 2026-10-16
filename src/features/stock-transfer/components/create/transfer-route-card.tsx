"use client";

import { IconArrowRight, IconBuildingStore, IconInfoCircle, IconNotes, IconTag } from "@tabler/icons-react";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { STORE_LABEL_HQ, STORE_LABEL_BRANCH } from "@/constants/store";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { TRANSFER_TYPE, type TransferType, TRANSFER_TYPE_LABELS } from "../../constants";

interface TransferRouteCardProps {
  activeStoreName?: string;
  isCentralStore?: boolean;
  storeOptions: CommandOption[];
  destinationUid: string;
  setDestinationUid: (val: string) => void;
  tipeTransfer: TransferType;
  setTipeTransfer: (val: TransferType) => void;
  catatan: string;
  setCatatan: (val: string) => void;
}

export function TransferRouteCard({
  activeStoreName,
  isCentralStore,
  storeOptions,
  destinationUid,
  setDestinationUid,
  tipeTransfer,
  setTipeTransfer,
  catatan,
  setCatatan,
}: TransferRouteCardProps) {
  return (
    <div id="transfer-route-box" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
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

      {/* ─── Pilihan Tipe Transfer ────────────────────────────────────────── */}
      <TooltipProvider delayDuration={150}>
        <div id="transfer-type-selector" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <IconTag size={13} className="text-emerald-600" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tipe Transfer
            </span>
          </div>

          <div className="inline-flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 gap-1 w-full sm:w-auto">
            {/* Transfer Reguler */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setTipeTransfer(TRANSFER_TYPE.REGULAR)}
                  className={cn(
                    "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    tipeTransfer === TRANSFER_TYPE.REGULAR
                      ? "bg-white text-emerald-800 shadow-2xs font-bold border border-emerald-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      tipeTransfer === TRANSFER_TYPE.REGULAR ? "bg-emerald-600" : "bg-slate-300"
                    )}
                  />
                  <span>{TRANSFER_TYPE_LABELS.regular}</span>
                  <IconInfoCircle
                    size={13}
                    className={cn(
                      "shrink-0",
                      tipeTransfer === TRANSFER_TYPE.REGULAR ? "text-emerald-600/70" : "text-slate-400"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs p-2.5">
                <p className="font-bold text-emerald-400 mb-0.5">Transfer Reguler</p>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  Distribusi stok biasa antar toko/gudang tanpa ikatan setoran komisi.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Konsinyasi Internal */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setTipeTransfer(TRANSFER_TYPE.KONSINYASI_INTERNAL)}
                  className={cn(
                    "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    tipeTransfer === TRANSFER_TYPE.KONSINYASI_INTERNAL
                      ? "bg-white text-purple-800 shadow-2xs font-bold border border-purple-200/60"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60 border border-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      tipeTransfer === TRANSFER_TYPE.KONSINYASI_INTERNAL ? "bg-purple-600" : "bg-slate-300"
                    )}
                  />
                  <span>{TRANSFER_TYPE_LABELS.konsinyasi_internal}</span>
                  <IconInfoCircle
                    size={13}
                    className={cn(
                      "shrink-0",
                      tipeTransfer === TRANSFER_TYPE.KONSINYASI_INTERNAL ? "text-purple-600/70" : "text-slate-400"
                    )}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs p-2.5">
                <p className="font-bold text-purple-400 mb-0.5">Konsinyasi Internal</p>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  Barang titipan off-book dari Pusat. Harga retail dikontrol penuh & cabang menyetor nilai pasok.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>

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
          id="transfer-notes-input"
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
