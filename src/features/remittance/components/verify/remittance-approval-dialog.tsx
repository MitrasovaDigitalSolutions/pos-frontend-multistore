"use client";

import { IconCheck, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppButton } from "@/components/shared/app-button";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { useVerifyStoreRemittance } from "../../api/remittance-api";
import type { StoreRemittance } from "../../types";

interface RemittanceApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remittance: StoreRemittance | null;
}

export function RemittanceApprovalDialog({
  open,
  onOpenChange,
  remittance,
}: RemittanceApprovalDialogProps) {
  const verifyMutation = useVerifyStoreRemittance();

  if (!remittance) return null;

  const formattedDate = remittance.created_at
    ? formatDate(remittance.created_at, "dd MMMM yyyy, HH:mm")
    : "—";

  const handleVerify = () => {
    verifyMutation.mutate(remittance.uid, {
      onSuccess: () => {
        toast.success(`Setoran ${remittance.nomor_setoran} berhasil diverifikasi!`);
        onOpenChange(false);
      },
      onError: (err) => {
        toast.error(err.message || "Gagal memverifikasi setoran");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-5 border-slate-100 shadow-xl overflow-hidden">
        <DialogHeader className="pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <IconCircleCheck size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900 leading-none">
                Konfirmasi Verifikasi Setoran
              </DialogTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pastikan mutasi rekening bank sudah benar-benar masuk
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2.5 space-y-2.5 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Apakah Anda yakin telah memeriksa mutasi rekening bank dan menerima dana setoran berikut?
          </p>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between items-center text-slate-500">
              <span>No. Setoran:</span>
              <span className="font-mono font-bold text-slate-800">{remittance.nomor_setoran}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Tgl Pengajuan:</span>
              <span className="font-medium text-slate-800">{formattedDate}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Cabang Pengirim:</span>
              <span className="font-bold text-slate-800">{remittance.store_source_nama || "Cabang"}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500">
              <span>Nominal Masuk:</span>
              <span className="font-extrabold text-emerald-600 text-sm font-mono">
                {formatRupiah(remittance.nominal_disetor)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Setelah disetujui, status transaksi konsinyasi cabang terkait akan ditandai resmi lunas (*settled*).
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={verifyMutation.isPending}
            className="h-8 px-3.5 text-xs font-semibold rounded-lg"
          >
            Batal
          </AppButton>
          <AppButton
            type="button"
            variant="default"
            size="sm"
            onClick={handleVerify}
            disabled={verifyMutation.isPending}
            className="h-8 px-4 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
          >
            {verifyMutation.isPending ? (
              <>
                <IconLoader2 size={13} className="animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <IconCheck size={13} />
                <span>Verifikasi &amp; Terima Dana</span>
              </>
            )}
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
