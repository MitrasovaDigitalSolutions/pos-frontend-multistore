"use client";

import {
  IconBuildingBank,
  IconFileText,
  IconListDetails,
  IconReceipt2,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppButton } from "@/components/shared/app-button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { useStoreRemittanceDetail } from "../api/remittance-api";
import {
  REMITTANCE_STATUS,
  REMITTANCE_STATUS_CLASSES,
  REMITTANCE_STATUS_LABELS,
} from "../constants";
import type { StoreRemittance } from "../types";
import {
  getRemittanceDestAccountName,
  getRemittanceDestStoreName,
  getRemittanceItemSaleItem,
  getRemittanceNomor,
  getRemittanceProofUrl,
  getRemittanceSourceAccountName,
  getRemittanceSourceStoreName,
  getRemittanceSubmitUserName,
  getRemittanceVerifyUserName,
} from "../utils/remittance-utils";

interface RemittanceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remittance: StoreRemittance | null;
  onOpenProof?: (url: string, nomor: string) => void;
}

export function RemittanceDetailDialog({
  open,
  onOpenChange,
  remittance,
  onOpenProof,
}: RemittanceDetailDialogProps) {
  const uid = remittance?.uid || "";
  const { data: detailData, isLoading } = useStoreRemittanceDetail(open ? uid : "");

  const activeRem = detailData || remittance;
  if (!activeRem) return null;

  const nomor = getRemittanceNomor(activeRem);
  const statusClass =
    REMITTANCE_STATUS_CLASSES[activeRem.status] || "bg-slate-50 text-slate-700";
  const statusLabel = REMITTANCE_STATUS_LABELS[activeRem.status] || activeRem.status;
  const createdAt = activeRem.created_at
    ? formatDate(activeRem.created_at, "dd MMM yyyy, HH:mm") || activeRem.created_at
    : "—";
  const verifiedAt = activeRem.verified_at
    ? formatDate(activeRem.verified_at, "dd MMM yyyy, HH:mm") || activeRem.verified_at
    : null;

  const totalOmzet = Number(activeRem.total_omzet ?? activeRem.total_omzet_kotor ?? 0);
  const totalKomisi = Number(activeRem.total_fee_komisi ?? activeRem.total_fee_cabang ?? 0);
  const totalWajibSetor = Number(activeRem.total_wajib_setor ?? activeRem.nominal_disetor ?? 0);
  const nominalDisetor = Number(activeRem.nominal_disetor ?? 0);
  const items = activeRem.items || [];
  const proofUrl = getRemittanceProofUrl(activeRem);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:max-w-3xl bg-white rounded-2xl p-4 sm:p-5 border-slate-200/80 shadow-xl overflow-hidden max-h-[90dvh] flex flex-col">
        <DialogHeader className="pb-2.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <IconListDetails size={18} />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900 leading-none font-mono">
                  {nomor}
                </DialogTitle>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Diajukan pada {createdAt}
                </p>
              </div>
            </div>

            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}
            >
              {statusLabel}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3.5 py-2 pr-0.5 text-xs">
          {/* Metadata Cabang, Pusat & Kas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pengirim (Cabang)
              </span>
              <p className="font-bold text-slate-800">
                {getRemittanceSourceStoreName(activeRem)}
              </p>
              <p className="text-[11px] text-slate-500">
                Kas Asal:{" "}
                <strong className="text-slate-700">
                  {getRemittanceSourceAccountName(activeRem)}
                </strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Oleh: <span className="text-slate-700">{getRemittanceSubmitUserName(activeRem)}</span>
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-slate-200/80 sm:pl-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Penerima (Pusat)
              </span>
              <p className="font-bold text-slate-800">
                {getRemittanceDestStoreName(activeRem)}
              </p>
              <p className="text-[11px] text-slate-500">
                Kas Tujuan:{" "}
                <strong className="text-slate-700">
                  {getRemittanceDestAccountName(activeRem)}
                </strong>
              </p>
              {verifiedAt && (
                <p className="text-[11px] text-slate-500">
                  Diverifikasi:{" "}
                  <span className="text-slate-700">
                    {getRemittanceVerifyUserName(activeRem)} ({verifiedAt})
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Ringkasan Finansial */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl border border-slate-200/80 bg-white">
              <span className="text-[10px] text-slate-400 font-semibold block">
                Total Omzet
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                {formatRupiah(totalOmzet)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200/80 bg-white">
              <span className="text-[10px] text-slate-400 font-semibold block">
                Komisi Cabang
              </span>
              <span className="font-mono font-bold text-emerald-600 text-xs mt-0.5 block">
                +{formatRupiah(totalKomisi)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200/80 bg-white">
              <span className="text-[10px] text-slate-400 font-semibold block">
                Wajib Setor
              </span>
              <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block">
                {formatRupiah(totalWajibSetor)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl border border-blue-200/80 bg-blue-50/50">
              <span className="text-[10px] text-blue-600 font-bold block">
                Nominal Disetor
              </span>
              <span className="font-mono font-extrabold text-blue-700 text-xs mt-0.5 block">
                {formatRupiah(nominalDisetor)}
              </span>
            </div>
          </div>

          {/* Catatan / Alasan Penolakan */}
          {activeRem.status === REMITTANCE_STATUS.REJECTED && activeRem.alasan_penolakan && (
            <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-700 text-xs">
              <strong>Alasan Penolakan:</strong> {activeRem.alasan_penolakan}
            </div>
          )}
          {activeRem.catatan && (
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs">
              <strong>Catatan:</strong> {activeRem.catatan}
            </div>
          )}

          {/* Daftar Item yang Disetor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <IconReceipt2 size={15} className="text-blue-600" />
                <span className="font-bold text-slate-800 text-xs">
                  Daftar Item yang Disetor
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  {items.length} item
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Rincian item setoran tidak tersedia.
              </div>
            ) : (
              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase sticky top-0">
                      <tr>
                        <th className="py-2 px-3">No. Struk</th>
                        <th className="py-2 px-3">Produk</th>
                        <th className="py-2 px-2.5 text-right">Qty</th>
                        <th className="py-2 px-3 text-right">Komisi</th>
                        <th className="py-2 px-3 text-right">Nilai Setor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((remItem, idx) => {
                        const saleItem = getRemittanceItemSaleItem(remItem);
                        const noStruk =
                          saleItem?.sale?.nomor_transaksi || saleItem?.no_struk || "—";
                        const rawDate =
                          saleItem?.sale?.created_at ||
                          saleItem?.created_at;
                        const dateFormatted = rawDate
                          ? formatDate(rawDate, "dd MMM, HH:mm") || ""
                          : "";
                        const productName =
                          saleItem?.nama_produk ||
                          saleItem?.product?.nama ||
                          saleItem?.product_nama ||
                          "Produk Konsinyasi";
                        const barcode =
                          saleItem?.barcode || saleItem?.product?.barcode || "";
                        const qty = saleItem?.kuantitas ?? 1;
                        const nominalPasok = Number(remItem.nominal_pasok || 0);
                        const nominalKomisi = Number(remItem.nominal_komisi || 0);

                        return (
                          <tr
                            key={remItem.uid || remItem.sale_item_uid || idx}
                            className="hover:bg-slate-50/70"
                          >
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="font-mono font-bold text-slate-900 block">
                                {noStruk}
                              </span>
                              {dateFormatted && (
                                <span className="text-[10px] text-slate-400 block">
                                  {dateFormatted}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <span className="font-semibold text-slate-800 block line-clamp-1">
                                {productName}
                              </span>
                              {barcode && (
                                <span className="font-mono text-[10px] text-slate-400 block">
                                  {barcode}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-800">
                              {qty}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-600 whitespace-nowrap">
                              +{formatRupiah(nominalKomisi)}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-blue-700 whitespace-nowrap">
                              {formatRupiah(nominalPasok)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 shrink-0">
          <div>
            {proofUrl && onOpenProof ? (
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenProof(proofUrl, nomor)}
                className="h-8 px-3 text-xs font-semibold rounded-lg gap-1.5"
              >
                <IconFileText size={14} />
                <span>Lihat Bukti Transfer</span>
              </AppButton>
            ) : (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <IconBuildingBank size={13} />
                <span>Konsinyasi Internal</span>
              </span>
            )}
          </div>

          <AppButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 text-xs font-semibold rounded-lg"
          >
            Tutup
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

