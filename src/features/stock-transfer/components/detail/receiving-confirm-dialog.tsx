"use client";

import { useEffect, useRef } from "react";
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
  const keteranganInputRef = useRef<HTMLInputElement>(null);

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
      setTimeout(() => {
        if (keteranganInputRef.current) {
          keteranganInputRef.current.focus();
          keteranganInputRef.current.select();
        }
      }, 100);
    }
  }, [open, initialKeterangan, item, formMethods]);

  if (!item) return null;

  const qtyDikirim = item.kuantitas;
  const isRejected = mode === TRANSFER_SHIPMENT_STATUS.REJECTED;
  const hasDiscrepancy = qtyDiterima < qtyDikirim && mode === TRANSFER_SHIPMENT_STATUS.RECEIVED;
  const hasExcess = qtyDiterima > qtyDikirim && mode === TRANSFER_SHIPMENT_STATUS.RECEIVED;
  const needsReason = isRejected || hasDiscrepancy || hasExcess;

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
        id="transfer-dialog-confirm-receive"
        className="max-w-sm bg-white rounded-2xl p-6 gap-0 border-slate-100 shadow-xl overflow-hidden"
        showCloseButton={false}
      >
        <FormProvider {...formMethods}>
          <form
            id="transfer-dialog-confirm-receive"
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmSubmit();
            }}
            className="w-full"
          >
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Icon Badge */}
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center ${isRejected
                  ? "bg-rose-50 text-rose-600 border-rose-100"
                  : hasExcess || hasDiscrepancy
                    ? "bg-amber-50 text-amber-600 border-amber-100"
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}
              >
                {isRejected ? (
                  <IconX size={24} />
                ) : hasExcess || hasDiscrepancy ? (
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
                    : hasExcess
                      ? "Konfirmasi Penerimaan Lebih"
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
                      Menolak produk ini akan membatalkan keseluruhan produk yang diterima.
                    </p>
                  ) : hasExcess ? (
                    <>
                      <p className="text-amber-700">
                        Diterima: <strong className="font-bold">{qtyDiterima} pcs</strong> (Dikirim: {qtyDikirim} pcs). Kelebihan <strong>{qtyDiterima - qtyDikirim} pcs</strong> akan divalidasi oleh toko asal.
                      </p>
                      {qtyDiterima > qtyDikirim * 2 && (
                        <p className="text-rose-600 font-semibold mt-1">
                          Jumlah melebihi 200% dari yang dikirim — mohon periksa kembali.
                        </p>
                      )}
                    </>
                  ) : hasDiscrepancy ? (
                    <p className="text-amber-700">
                      Diterima: <strong className="font-bold">{qtyDiterima} pcs</strong> (Dikirim: {qtyDikirim} pcs). Terdapat kekurangan <strong>-{qtyDikirim - qtyDiterima} pcs</strong>.
                    </p>
                  ) : (
                    <p>
                      Diterima penuh sebanyak <strong className="font-bold text-emerald-700">{qtyDiterima} pcs</strong>.
                    </p>
                  )}
                </div>
              </DialogHeader>

              {/* Summary Stats Pill */}
              <div className="w-full grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Dikirim</span>
                  <span className="font-bold text-slate-700">{qtyDikirim} pcs</span>
                </div>
                <div className="flex flex-col items-center border-l border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Diterima</span>
                  <span
                    className={`font-bold ${isRejected
                      ? "text-rose-600"
                      : hasDiscrepancy
                        ? "text-amber-600"
                        : "text-emerald-600"
                      }`}
                  >
                    {isRejected ? "0 pcs" : `${qtyDiterima} pcs`}
                  </span>
                </div>
              </div>

              {/* Discrepancy Alert / Selector */}
              {needsReason && (
                <div className="w-full space-y-2.5 pt-1 text-left">
                  {hasDiscrepancy && (
                    <div className="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                      <IconAlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block">Terjadi Selisih Kurang!</span>
                        <span className="text-[11px] text-amber-700">
                          Jumlah diterima kurang {qtyDikirim - qtyDiterima} pcs dari kiriman.
                        </span>
                      </div>
                    </div>
                  )}

                  {hasExcess && (
                    <div className="p-2.5 bg-blue-50/80 border border-blue-200/60 rounded-xl text-xs text-blue-800 flex items-start gap-2">
                      <IconAlertTriangle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block">Terjadi Kelebihan Stok!</span>
                        <span className="text-[11px] text-blue-700">
                          Jumlah diterima lebih {qtyDiterima - qtyDikirim} pcs dari kiriman.
                        </span>
                      </div>
                    </div>
                  )}

                  <FormSelect<ConfirmFormValues>
                    name="jenis_selisih"
                    label="Penyebab Selisih / Alasan"
                    options={[
                      { value: JENIS_SELISIH.SALAH_INPUT, label: "Salah Input / Hitung" },
                      { value: JENIS_SELISIH.RUSAK, label: "Barang Rusak / Cacat" },
                      { value: JENIS_SELISIH.HILANG, label: "Barang Hilang / Kurang" },
                    ]}
                  />
                </div>
              )}

              {/* Catatan / Keterangan Optional */}
              <div className="w-full text-left pt-1">
                <FormInput<ConfirmFormValues>
                  inputRef={keteranganInputRef}
                  autoFocus
                  name="keterangan"
                  label="Catatan / Keterangan (Opsional)"
                  placeholder="Misal: Dus penyok, barang kurang, dll..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleConfirmSubmit();
                    }
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-2.5 mt-5">
              <Button
                id="transfer-dialog-btn-cancel"
                type="button"
                variant="outline"
                className="flex-1 h-10 text-xs font-bold border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                id="transfer-dialog-btn-submit"
                type="submit"
                className={`flex-1 h-10 text-xs font-bold rounded-xl text-white flex items-center justify-center gap-1.5 cursor-pointer ${isRejected
                  ? "bg-rose-600 hover:bg-rose-700"
                  : hasDiscrepancy
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                disabled={isLoading}
              >
                {isLoading && <IconLoader2 size={14} className="animate-spin" />}
                <span>{isRejected ? "Ya, Tolak Item" : "Ya, Terima Item"}</span>
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
