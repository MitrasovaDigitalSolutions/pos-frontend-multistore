"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconLoader2, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppButton } from "@/components/shared/app-button";
import { FormTextarea } from "@/components/forms/form-textarea";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { formatDate } from "@/lib/date-utils";
import { useRejectStoreRemittance } from "../../api/remittance-api";
import {
  rejectRemittanceSchema,
  type RejectRemittanceFormValues,
} from "../../schemas/remittance-schema";
import type { StoreRemittance } from "../../types";

interface RemittanceRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remittance: StoreRemittance | null;
}

export function RemittanceRejectDialog({
  open,
  onOpenChange,
  remittance,
}: RemittanceRejectDialogProps) {
  const rejectMutation = useRejectStoreRemittance();

  const methods = useForm<RejectRemittanceFormValues>({
    resolver: zodResolver(rejectRemittanceSchema),
    defaultValues: {
      alasan: "",
    },
  });

  const { handleSubmit, reset } = methods;

  if (!remittance) return null;

  const formattedDate = remittance.created_at
    ? formatDate(remittance.created_at, "dd MMMM yyyy, HH:mm")
    : "—";

  const onSubmit = (values: RejectRemittanceFormValues) => {
    rejectMutation.mutate(
      {
        uid: remittance.uid,
        payload: values,
      },
      {
        onSuccess: () => {
          toast.success(`Setoran ${remittance.nomor_setoran} ditolak.`);
          reset();
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message || "Gagal menolak setoran");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-5 border-slate-100 shadow-xl overflow-hidden">
        <DialogHeader className="pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <IconAlertTriangle size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900 leading-none">
                Tolak Setoran Cabang
              </DialogTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Alasan penolakan akan terbaca oleh admin cabang pengirim
              </p>
            </div>
          </div>
        </DialogHeader>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="py-2.5 space-y-3 text-xs">
            {/* Remittance Detail Recap */}
            <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between items-center text-slate-600">
                <span>No. Setoran:</span>
                <span className="font-mono font-bold text-slate-900">{remittance.nomor_setoran}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Tgl Pengajuan:</span>
                <span className="font-medium text-slate-800">{formattedDate}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Cabang:</span>
                <span className="font-bold text-slate-800">{remittance.store_source_nama || "Cabang"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Nominal:</span>
                <span className="font-bold text-rose-600 font-mono">
                  {formatRupiah(remittance.nominal_disetor)}
                </span>
              </div>
            </div>

            {/* Reusable FormTextarea */}
            <div className="space-y-1">
              <FormTextarea<RejectRemittanceFormValues>
                name="alasan"
                label="Alasan Penolakan *"
                rows={3}
                placeholder="Misal: Mutasi bank belum masuk, mohon lampirkan struk dengan tanggal yang jelas..."
                disabled={rejectMutation.isPending}
                className="text-xs"
              />
              <p className="text-[10px] text-slate-400">
                Alasan ini akan dikirimkan dan dibaca langsung oleh kasir / admin cabang pengirim.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={rejectMutation.isPending}
                className="h-8 px-3.5 text-xs font-semibold rounded-lg"
              >
                Batal
              </AppButton>
              <AppButton
                type="submit"
                variant="destructive"
                size="sm"
                disabled={rejectMutation.isPending}
                className="h-8 px-4 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white gap-1.5 shadow-xs"
              >
                {rejectMutation.isPending ? (
                  <>
                    <IconLoader2 size={13} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <IconX size={13} />
                    <span>Tolak Setoran</span>
                  </>
                )}
              </AppButton>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
