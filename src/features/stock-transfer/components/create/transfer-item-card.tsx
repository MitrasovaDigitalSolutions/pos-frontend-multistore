"use client";

import {
  IconBarcode,
  IconBuildingStore,
  IconBuildingWarehouse,
  IconCash,
  IconInfoCircle,
  IconMinus,
  IconPercentage,
  IconPlus,
  IconReceiptTax,
  IconTrash,
} from "@tabler/icons-react";
import { NumberInput } from "@/components/ui/number-input";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { TRANSFER_TYPE, type TransferType } from "../../constants";
import {
  useConsignmentCommissionMode,
  type CommissionType,
} from "../../hooks/use-consignment-commission-mode";
import type { TransferItem } from "./transfer-items-section";

export interface TransferItemCardProps {
  item: TransferItem;
  index: number;
  tipeTransfer?: TransferType;
  onUpdateQty: (uid: string, qty: number) => void;
  onUpdateKomisi?: (uid: string, tipe: CommissionType, nilai: number) => void;
  onRemoveItem: (uid: string) => void;
  qtyInputRef?: (el: HTMLInputElement | null) => void;
  onEnterPress?: () => void;
}

export function TransferItemCard({
  item,
  index,
  tipeTransfer = TRANSFER_TYPE.REGULAR,
  onUpdateQty,
  onUpdateKomisi,
  onRemoveItem,
  qtyInputRef,
  onEnterPress,
}: TransferItemCardProps) {
  const isKonsinyasi = tipeTransfer === TRANSFER_TYPE.KONSINYASI_INTERNAL;
  const { mode, description: modeDescription, calculatePricing } = useConsignmentCommissionMode();

  const modalPusat = item.modal_pusat ?? item.harga_beli ?? 0;
  const hargaDasarPusat = item.harga_dasar_pusat ?? item.harga_jual ?? item.harga_pasok ?? 0;
  const tipeKomisi: CommissionType = item.tipe_komisi || "percentage";
  const nilaiKomisi = item.nilai_komisi ?? 0;

  const pricing = calculatePricing({
    modalPusat,
    hargaDasarPusat,
    tipeKomisi,
    nilaiKomisi,
    kuantitas: item.kuantitas,
  });

  return (
    <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-xl p-3 sm:p-3.5 shadow-2xs transition-all space-y-2.5">
      {/* ── Product Header Row ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        {/* Left: Index badge & Product Meta */}
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] flex items-center justify-center shrink-0 border border-emerald-200/60 mt-0.5">
            {index + 1}
          </span>
          <div className="min-w-0 space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug line-clamp-1">
              {item.nama}
            </h4>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-[10px] text-slate-500">
              {item.barcode && (
                <span className="inline-flex items-center gap-1 font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                  <IconBarcode size={11} className="text-slate-400" />
                  {item.barcode}
                </span>
              )}
              {item.stok_tersedia !== undefined && (
                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">
                  Stok Pusat: <strong className="text-slate-800">{item.stok_tersedia}</strong> pcs
                </span>
              )}
              {hargaDasarPusat > 0 && (
                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">
                  Harga Master: <strong className="text-slate-800">{formatRupiah(hargaDasarPusat)}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quantity Stepper & Delete */}
        <div className="flex items-center justify-between sm:justify-end gap-2 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-200/80">
            <button
              type="button"
              onClick={() => onUpdateQty(item.product_uid, Math.max(0.001, item.kuantitas - 1))}
              className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-2xs"
              aria-label="Kurangi kuantitas"
            >
              <IconMinus size={12} />
            </button>
            <NumberInput
              ref={qtyInputRef}
              value={item.kuantitas}
              onChange={(val) => onUpdateQty(item.product_uid, val || 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnterPress?.();
                }
              }}
              min={0.001}
              allowNegative={false}
              className="h-6 w-14 text-center text-xs font-bold border-none bg-transparent shadow-none px-1"
            />
            <button
              type="button"
              onClick={() => onUpdateQty(item.product_uid, item.kuantitas + 1)}
              className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 transition-all cursor-pointer shadow-2xs"
              aria-label="Tambah kuantitas"
            >
              <IconPlus size={12} />
            </button>
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onRemoveItem(item.product_uid)}
            className="w-7 h-7 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-rose-100 shrink-0"
            title="Hapus produk"
            aria-label="Hapus produk"
          >
            <IconTrash size={15} />
          </button>
        </div>
      </div>

      {/* ── Compact Consignment Strip (Konsinyasi Internal Only) ── */}
      {isKonsinyasi && (
        <div className="bg-purple-50/40 border border-purple-100/90 rounded-xl p-2.5 sm:p-3 space-y-2">
          {/* Row 1: Spacious Commission Input & Mode Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            {/* Left: Input Komisi (Wide & Clear) */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1 shrink-0">
                <IconReceiptTax size={14} className="text-purple-600" />
                <span>Komisi Cabang:</span>
              </span>

              {/* Pill Switch % vs Rp */}
              <div className="inline-flex p-0.5 bg-slate-200/80 rounded-lg border border-slate-200/90 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateKomisi?.(item.product_uid, "percentage", nilaiKomisi)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer flex items-center gap-0.5",
                    tipeKomisi === "percentage"
                      ? "bg-white text-purple-700 shadow-2xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Komisi Persentase (%)"
                >
                  <IconPercentage size={12} />
                  <span>%</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateKomisi?.(item.product_uid, "fixed", nilaiKomisi)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer font-bold",
                    tipeKomisi === "fixed"
                      ? "bg-white text-purple-700 shadow-2xs font-black"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                  title="Komisi Nominal Tetap (Rupiah)"
                >
                  <span>Rp</span>
                </button>
              </div>

              {/* Wide & Distinct NumberInput */}
              <div className="relative">
                <NumberInput
                  value={nilaiKomisi}
                  onChange={(val) => onUpdateKomisi?.(item.product_uid, tipeKomisi, val || 0)}
                  min={0}
                  allowNegative={false}
                  placeholder="0"
                  className="h-8 w-28 sm:w-36 text-right text-xs sm:text-sm font-bold font-mono border-purple-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 rounded-lg px-2.5 bg-white shadow-2xs text-slate-900"
                />
              </div>

              {/* Live Nominal Helper Tag */}
              {pricing.nominalKomisiPerUnit > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60 shadow-2xs">
                  <span>= +{formatRupiah(pricing.nominalKomisiPerUnit)}</span>
                  <span className="text-[9px] text-emerald-600 font-normal">/ unit</span>
                </span>
              )}
            </div>

            {/* Right: Mode Badge with Tooltip */}
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100/70 px-2.5 py-1 rounded-full border border-purple-200/80 cursor-help self-start sm:self-auto shrink-0">
                    <span>{mode === "markup_price" ? "Mode: Markup Price" : "Mode: Cut Revenue"}</span>
                    <IconInfoCircle size={12} className="text-purple-600" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs p-2.5">
                  <p className="font-bold text-purple-300 mb-0.5">Aturan Komisi Konsinyasi</p>
                  <p className="text-slate-200 leading-relaxed text-[11px]">{modeDescription}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Row 2: Compact 3-Column Metrics Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2 pt-1 border-t border-purple-100/70 text-xs">
            {/* 1. Wajib Setor */}
            <div className="bg-white/90 border border-purple-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between sm:flex-col sm:items-start gap-1 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <IconBuildingWarehouse size={12} className="text-purple-600 shrink-0" />
                <span>Wajib Setor</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-black text-purple-950 text-xs sm:text-sm">
                  {formatRupiah(pricing.hargaBeliCabang)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (Tot: {formatRupiah(pricing.totalWajibSetor)})
                </span>
              </div>
            </div>

            {/* 2. Harga Kasir Cabang */}
            <div className="bg-white/90 border border-slate-200/70 rounded-lg px-2.5 py-1.5 flex items-center justify-between sm:flex-col sm:items-start gap-1 shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <IconCash size={12} className="text-slate-500 shrink-0" />
                <span>Harga Kasir Cabang</span>
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                  {formatRupiah(pricing.hargaJualCabang)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (Omz: {formatRupiah(pricing.totalOmzetRetail)})
                </span>
              </div>
            </div>

            {/* 3. Laba Cabang */}
            <div className="bg-white/90 border border-emerald-100 rounded-lg px-2.5 py-1.5 flex items-center justify-between sm:flex-col sm:items-start gap-1 shadow-2xs">
              <div className="flex items-center justify-between w-full">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <IconBuildingStore size={12} className="text-emerald-600 shrink-0" />
                  <span>Laba Cabang</span>
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200/50">
                  {pricing.marginCabangPercent}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono font-black text-emerald-700 text-xs sm:text-sm">
                  +{formatRupiah(pricing.labaCabangPerUnit)}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (Tot: +{formatRupiah(pricing.totalLabaCabang)})
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
