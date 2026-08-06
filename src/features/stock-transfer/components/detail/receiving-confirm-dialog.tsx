"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { IconAlertTriangle, IconCircleCheck, IconLoader2, IconX } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormSelect } from "@/components/forms/form-select";
import { FormInput } from "@/components/forms/form-input";
import { JENIS_SELISIH, TRANSFER_SHIPMENT_STATUS } from "../../constants";
import type { StockTransferItem } from "../../types";

export interface ReceivingConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: StockTransferItem | null;
  mode: typeof TRANSFER_SHIPMENT_STATUS.RECEIVED | typeof TRANSFER_SHIPMENT_STATUS.REJECTED;
  qtyDiterima: number;
  keterangan?: string;
  onConfirm: (payload: {
    status: typeof TRANSFER_SHIPMENT_STATUS.RECEIVED | typeof TRANSFER_SHIPMENT_STATUS.REJECTED;
    kuantitas_diterima: number;
    jenis_selisih?: typeof JENIS_SELISIH.SALAH_INPUT | typeof JENIS_SELISIH.RUSAK | typeof JENIS_SELISIH.HILANG;
    keterangan?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

type ConfirmFormValues = {
  jenis_selisih: typeof JENIS_SELISIH.SALAH_INPUT | typeof JENIS_SELISIH.RUSAK | typeof JENIS_SELISIH.HILANG;
  keterangan: string;
};

export function ReceivingConfirmDialog({
  open,
  onOpenChange,
  item,
  mode,
  qtyDiterima,
  keterangan: initialKeterangan,
  onConfirm,
  isLoading = false,
}: ReceivingConfirmDialogProps) {
  const formMethods = useForm<ConfirmFormValues>({
    defaultValues: {
      jenis_selisih: JENIS_SELISIH.SALAH_INPUT,
      keterangan: "",
    },
  });

  useEffect(() => {
    if (open) {
      formMethods.reset({
        jenis_selisih: JENIS_SELISIH.SALAH_INPUT,
        keterangan: initialKeterangan || item?.keterangan || "",
      });
    }
  }, [open, initialKeterangan, item, formMethods]);

  if (!item) return null;

  const qtyDikirim = item.kuantitas;
  const isRejected = mode === TRANSFER_SHIPMENT_STATUS.REJECTED;
  const hasDiscrepancy = qtyDiterima < qtyDikirim && mode === TRANSFER_SHIPMENT_STATUS.RECEIVED;
  const needsReason = isRejected || hasDiscrepancy;

  const handleConfirmSubmit = async () => {
    const values = formMethods.getValues();
    await onConfirm({
      status: mode,
      kuantitas_diterima: isRejected ? 0 : qtyDiterima,
      jenis_selisih: needsReason ? values.jenis_selisih : undefined,
      keterangan: values.keterangan?.trim() || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm bg-white rounded-2xl p-6 gap-0 border-slate-100 shadow-xl overflow-hidden"
        showCloseButton={false}
      >
        <FormProvider {...formMethods}>
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Icon Badge */}
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center ${isRejected
                ? "bg-rose-50 text-rose-600 border-rose-100"
                : hasDiscrepancy
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}
            >
              {isRejected ? (
                <IconX size={24} />
              ) : hasDiscrepancy ? (
                <IconAlertTriangle size={24} />
              ) : (
                <IconCircleCheck size={24} />
              )}
            </div>

            {/* Title & Description */}
            <DialogHeader className="gap-1">
              <DialogTitle className="text-sm font-bold text-slate-900 text-center">
                {isRejected
                  ? "Konfirmasi Penolakan Item"
                  : hasDiscrepancy
                    ? "Konfirmasi Penerimaan Selisih"
                    : "Konfirmasi Penerimaan Item"}
              </DialogTitle>
              <div className="text-xs text-slate-500 max-w-xs leading-relaxed text-center space-y-1">
                <p>
                  Produk: <strong className="text-slate-800 font-bold">{item.product?.nama || "—"}</strong>
                </p>
                {isRejected ? (
                  <p className="text-rose-600 font-semibold">
                    Menolak produk ini akan membatalkan keseluruhan produk yang dikirim.
                  </p>
                ) : hasDiscrepancy ? (
                  <p className="text-amber-700">
                    Diterima: <strong className="font-bold">{qtyDiterima} pcs</strong> (Dikirim: {qtyDikirim} pcs). Terdapat selisih <strong>{qtyDikirim - qtyDiterima} pcs</strong>.
                  </p>
                ) : (
                  <p>
                    Diterima penuh sebanyak <strong className="font-bold text-emerald-700">{qtyDiterima} pcs</strong>.
                  </p>
                )}
              </div>
            </DialogHeader>

            {/* FormSelect Alasan jika ada selisih atau ditolak */}
            {needsReason && (
              <div className="w-full text-left pt-1">
                <FormSelect<ConfirmFormValues>
                  name="jenis_selisih"
                  label="Pilih Alasan Selisih / Penolakan"
                  options={[
                    { label: "Barang Rusak Saat Pengiriman", value: JENIS_SELISIH.RUSAK },
                    { label: "Barang Hilang / Kurang", value: JENIS_SELISIH.HILANG },
                    { label: "Salah Input Kuantitas", value: JENIS_SELISIH.SALAH_INPUT },
                  ]}
                  placeholder="-- Pilih Alasan --"
                  size="sm"
                />
              </div>
            )}

            {/* FormInput Catatan / Keterangan (Opsional) */}
            <div className="w-full text-left pt-1">
              <FormInput<ConfirmFormValues>
                name="keterangan"
                label="Catatan / Keterangan (Opsional)"
                placeholder="Misal: Dus penyok, barang kurang, dll..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex gap-2.5 mt-5">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-10 text-xs font-bold border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              className={`flex-1 h-10 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer ${isRejected
                ? "bg-rose-600 hover:bg-rose-700"
                : hasDiscrepancy
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              onClick={handleConfirmSubmit}
              disabled={isLoading}
            >
              {isLoading && <IconLoader2 size={14} className="animate-spin" />}
              <span>{isRejected ? "Ya, Tolak Item" : "Ya, Terima Item"}</span>
            </Button>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
