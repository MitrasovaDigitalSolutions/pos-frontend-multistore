"use client";

import { useFormContext } from "react-hook-form";
import { IconReceipt2, IconCheck, IconDeviceFloppy } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { ConsignmentReceivingFormValues } from "../../schemas/consignment-schema";

interface ConsignmentSummaryCardProps {
  onSaveDraft: () => void;
  onComplete: () => void;
  isSavingDraft: boolean;
  isCompleting: boolean;
  isEditMode?: boolean;
}

export function ConsignmentSummaryCard({
  onSaveDraft,
  onComplete,
  isSavingDraft,
  isCompleting,
  isEditMode = false,
}: ConsignmentSummaryCardProps) {
  const { watch } = useFormContext<ConsignmentReceivingFormValues>();
  const items = watch("items") || [];

  const totalItems = items.length;
  const totalQty = items.reduce((acc, item) => acc + Number(item.kuantitas || 0), 0);
  const totalNilai = items.reduce(
    (acc, item) => acc + Number(item.kuantitas || 0) * Number(item.harga_beli || 0),
    0
  );

  return (
    <div className="sticky top-20 bg-white border border-slate-100 rounded-2xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <IconReceipt2 className="w-5 h-5 text-emerald-600" />
          Ringkasan Konsinyasi
        </h3>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Off-Book
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-slate-600">
          <span>Total Jenis Produk:</span>
          <span className="font-bold text-slate-800">{totalItems} produk</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Total Kuantitas Titipan:</span>
          <span className="font-bold text-slate-800">{totalQty} pcs</span>
        </div>
        <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-bold">
          <span className="text-slate-900">Total Nilai Titipan:</span>
          <span className="text-emerald-600">{formatRupiah(totalNilai)}</span>
        </div>
      </div>

      <div className="pt-2 space-y-2">
        <Button
          type="button"
          onClick={onComplete}
          disabled={isCompleting || isSavingDraft || totalItems === 0}
          className="w-full h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 cursor-pointer shadow-2xs"
        >
          <IconCheck size={16} />
          <span>{isEditMode ? "Simpan & Selesaikan" : "Selesaikan (Stok Naik)"}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSavingDraft || isCompleting || totalItems === 0}
          className="w-full h-10 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl gap-1.5 cursor-pointer"
        >
          <IconDeviceFloppy size={16} className="text-slate-500" />
          <span>Simpan Sebagai Draft</span>
        </Button>
      </div>

      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-normal">
        💡 Penerimaan konsinyasi ini akan menaikkan stok fisik tanpa pencatatan GL. Hutang timbul saat barang terjual di Kasir (POS).
      </div>
    </div>
  );
}
