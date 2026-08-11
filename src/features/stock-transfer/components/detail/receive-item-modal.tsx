"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconPackage, IconX } from "@tabler/icons-react";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StockTransferItem } from "../../types";

interface ReceiveItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockTransferItem | null;
  mode: "received" | "rejected";
  onConfirm: (payload: {
    status: "received" | "rejected";
    kuantitas_diterima: number;
    jenis_selisih?: "salah_input" | "rusak" | "hilang";
    keterangan?: string;
  }) => Promise<void>;
  isProcessing: boolean;
}

export function ReceiveItemModal({
  open,
  onOpenChange,
  item,
  mode,
  onConfirm,
  isProcessing,
}: ReceiveItemModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<"received" | "rejected">("received");
  const [qtyDiterima, setQtyDiterima] = useState<number>(0);
  const [jenisSelisih, setJenisSelisih] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");

  useEffect(() => {
    if (item) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedStatus(mode);
      if (mode === "received") {
        setQtyDiterima(item.kuantitas);
        setJenisSelisih("");
      } else {
        setQtyDiterima(0);
        setJenisSelisih("rusak");
      }
      setKeterangan("");
    }
  }, [item, mode, open]);

  if (!item) return null;

  const qtyDikirim = item.kuantitas;
  const isParsial = qtyDiterima < qtyDikirim && selectedStatus === "received";
  const isRejected = selectedStatus === "rejected";
  const requireSelisihReason = isRejected || isParsial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      status: selectedStatus,
      kuantitas_diterima: Math.min(Math.max(0, qtyDiterima), qtyDikirim),
      jenis_selisih: requireSelisihReason && jenisSelisih
        ? (jenisSelisih as "salah_input" | "rusak" | "hilang")
        : undefined,
      keterangan: keterangan.trim() || undefined,
    };
    await onConfirm(payload);
    onOpenChange(false);
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${selectedStatus === "received" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
            <IconPackage size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {selectedStatus === "received" ? "Penerimaan Barang" : "Penolakan Barang"}
            </h3>
            <p className="text-[11px] font-normal text-slate-400">Proses penerimaan item secara mendetail</p>
          </div>
        </div>
      }
      className="sm:max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {/* Product Information Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Detail Produk
          </span>
          <p className="font-extrabold text-slate-900 text-sm">{item.product?.nama || "—"}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Barcode: <strong className="font-mono text-slate-700">{item.product?.barcode || "—"}</strong></span>
            <span>Jumlah Dikirim: <strong className="font-bold text-slate-900">{qtyDikirim} pcs</strong></span>
          </div>
        </div>

        {/* Action Preset Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            Keputusan Penerimaan
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("received");
                setQtyDiterima(qtyDikirim);
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${selectedStatus === "received"
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <IconCheck size={16} className="text-emerald-600" />
              <span>Terima Barang</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus("rejected");
                setQtyDiterima(0);
                if (!jenisSelisih) setJenisSelisih("rusak");
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${selectedStatus === "rejected"
                  ? "bg-rose-50 border-rose-300 text-rose-800 shadow-2xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
            >
              <IconX size={16} className="text-rose-600" />
              <span>Tolak</span>
            </button>
          </div>
        </div>

        {/* Quantity Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">Kuantitas Diterima (pcs)</label>
            <span className="text-[10px] text-slate-400">Max: {qtyDikirim} pcs</span>
          </div>
          <NumberInput
            value={qtyDiterima}
            onChange={(val) => setQtyDiterima(Math.min(qtyDikirim, Math.max(0, val || 0)))}
            min={0}
            max={qtyDikirim}
            allowNegative={false}
            className="h-10 text-sm font-black text-center border-slate-200 rounded-xl"
          />
        </div>

        {/* Reason for Discrepancy (if needed) */}
        {requireSelisihReason && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              Alasan Selisih / Penolakan <span className="text-rose-500">*</span>
            </label>
            <Select value={jenisSelisih} onValueChange={(val) => setJenisSelisih(val || "")}>
              <SelectTrigger className="w-full h-9 rounded-xl border-slate-200 bg-white text-xs text-slate-800">
                <SelectValue placeholder="-- Pilih Alasan Selisih --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rusak">Barang Rusak Saat Pengiriman</SelectItem>
                <SelectItem value="hilang">Barang Hilang / Kurang</SelectItem>
                <SelectItem value="salah_input">Salah Input Qty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Catatan Penerimaan (Opsional)</label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="Misal: 1 pcs kemasan penyok..."
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Modal Submit CTA */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs rounded-xl"
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isProcessing || (requireSelisihReason && !jenisSelisih)}
            className={`h-9 text-xs rounded-xl font-bold text-white cursor-pointer ${selectedStatus === "received" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
              }`}
          >
            {isProcessing ? "Memproses..." : selectedStatus === "received" ? "Simpan Penerimaan" : "Konfirmasi Penolakan"}
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}
