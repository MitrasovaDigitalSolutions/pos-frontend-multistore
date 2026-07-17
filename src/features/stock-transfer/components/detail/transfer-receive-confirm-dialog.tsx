"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import {
  IconAlertTriangle,
  IconCheck,
  IconPackage,
} from "@tabler/icons-react";
import { useMemo } from "react";
import type { StockTransferItem } from "../../types";
import type { ReceiveItemFormValue } from "./types";

interface TransferReceiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: StockTransferItem[];
  formItems: ReceiveItemFormValue[];
  onConfirm: () => void;
  isLoading: boolean;
}

export function TransferReceiveConfirmDialog({
  open,
  onOpenChange,
  items,
  formItems,
  onConfirm,
  isLoading,
}: TransferReceiveConfirmDialogProps) {
  // Compute summary & list of discrepancies
  const summary = useMemo(() => {
    let totalSent = 0;
    let totalReceived = 0;
    const discrepancies: {
      productUid: string;
      nama: string;
      barcode?: string;
      qtySent: number;
      qtyReceived: number;
      keterangan: string;
      diff: number;
    }[] = [];

    items.forEach((item) => {
      const formItem = formItems.find((f) => f.product_uid === item.product_uid);
      const qtySent = Number(item.kuantitas);
      const qtyReceived = Number(formItem?.kuantitas_diterima ?? qtySent);
      const keterangan = formItem?.keterangan?.trim() || "";

      totalSent += qtySent;
      totalReceived += qtyReceived;

      if (qtySent !== qtyReceived || keterangan !== "") {
        discrepancies.push({
          productUid: item.product_uid,
          nama: item.product?.nama || "Produk",
          barcode: item.product?.barcode,
          qtySent,
          qtyReceived,
          keterangan,
          diff: qtyReceived - qtySent,
        });
      }
    });

    return {
      totalItems: items.length,
      totalSent,
      totalReceived,
      hasDiscrepancy: discrepancies.length > 0,
      discrepancies,
    };
  }, [items, formItems]);

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2 text-slate-900">
          {summary.hasDiscrepancy ? (
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <IconAlertTriangle size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <IconPackage size={18} />
            </div>
          )}
          <span>Konfirmasi Penerimaan Stok</span>
        </div>
      }
      className="sm:max-w-xl max-h-[85vh] flex flex-col"
    >
      <div className="space-y-4 py-2 overflow-y-auto pr-1 flex-1">
        {/* Main Stat Summary */}
        <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Barang
            </span>
            <span className="text-sm font-black text-slate-800">{summary.totalItems} Produk</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Dikirim
            </span>
            <span className="text-sm font-black text-slate-800">{summary.totalSent} pcs</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Diterima
            </span>
            <span
              className={`text-sm font-black ${summary.totalReceived === summary.totalSent
                ? "text-emerald-700"
                : "text-amber-700"
                }`}
            >
              {summary.totalReceived} pcs
            </span>
          </div>
        </div>

        {/* Status Callout Banner */}
        {summary.hasDiscrepancy ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <IconAlertTriangle size={16} className="text-amber-600 shrink-0" />
              <span>
                Perhatian: Terdapat {summary.discrepancies.length} produk dengan selisih jumlah / catatan khusus!
              </span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Stok yang ditambahkan ke inventori toko penerima akan disesuaikan sebesar angka{" "}
              <strong>Jumlah Diterima</strong> di bawah ini.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <IconCheck size={16} className="text-emerald-600 shrink-0" />
            <div>
              <strong>Lengkap:</strong> Seluruh {summary.totalItems} produk diterima 100% sesuai jumlah pengiriman.
            </div>
          </div>
        )}

        {/* List of Discrepancies if any */}
        {summary.hasDiscrepancy && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Rincian Perbedaan Jumlah / Catatan:
            </span>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {summary.discrepancies.map((disc) => (
                <div key={disc.productUid} className="p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{disc.nama}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-normal line-through text-[11px]">
                        {disc.qtySent} pcs
                      </span>
                      <span className="text-emerald-700 font-extrabold">{disc.qtyReceived} pcs</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${disc.diff < 0
                          ? "bg-rose-100 text-rose-700"
                          : disc.diff > 0
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                          }`}
                      >
                        {disc.diff > 0 ? `+${disc.diff}` : disc.diff}
                      </span>
                    </div>
                  </div>
                  {disc.keterangan && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                      Catatan: &quot;{disc.keterangan}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 text-xs rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 cursor-pointer shadow-xs"
          >
            <IconCheck size={16} />
            {isLoading ? "Memproses..." : "Ya, Konfirmasi & Terima Stok"}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}
