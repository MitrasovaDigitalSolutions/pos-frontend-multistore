"use client";

import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCashAccounts } from "@/features/cash/api/cash-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowBackUp,
  IconCash,
  IconCheck,
  IconLoader2
} from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useConsignmentReturnableItems,
  useCreateConsignmentPaymentMutation,
} from "../../api/consignment-api";
import {
  consignmentPaymentSchema,
  type ConsignmentPaymentFormValues,
} from "../../schemas/consignment-schema";
import type { ConsignmentReceiving } from "../../types";

interface ConsignmentPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiving: ConsignmentReceiving | null;
  onSuccess?: () => void;
}

export function ConsignmentPaymentDialog({
  open,
  onOpenChange,
  receiving,
  onSuccess,
}: ConsignmentPaymentDialogProps) {
  const { data: cashAccounts = [], isLoading: isCashLoading } = useCashAccounts();
  const { data: returnableItems = [] } = useConsignmentReturnableItems(
    receiving?.uid || "",
    open && !!receiving
  );

  const paymentMutation = useCreateConsignmentPaymentMutation();

  const sisaHutang = Number(receiving?.sisa_hutang || 0);

  const form = useForm<ConsignmentPaymentFormValues>({
    resolver: zodResolver(consignmentPaymentSchema),
    defaultValues: {
      jumlah_bayar: sisaHutang || 1,
      cash_account_uid: "",
      tanggal_bayar: new Date().toISOString().split("T")[0],
      catatan: "",
    },
  });

  useEffect(() => {
    if (open && receiving) {
      form.reset({
        jumlah_bayar: Number(receiving.sisa_hutang || 0),
        cash_account_uid: "",
        tanggal_bayar: new Date().toISOString().split("T")[0],
        catatan: "",
      });
    }
  }, [open, receiving, form]);

  const cashAccountOptions = (Array.isArray(cashAccounts) ? cashAccounts : []).map(
    (acc: { uid: string; nama: string; saldo?: number }) => ({
      value: acc.uid,
      label: `${acc.nama} (${formatRupiah(acc.saldo || 0)})`,
    })
  );

  const totalSisaTitipan = returnableItems.reduce((acc, item) => acc + Number(item.sisa || 0), 0);

  const handleSubmit = async (values: ConsignmentPaymentFormValues) => {
    if (!receiving) return;
    try {
      await paymentMutation.mutateAsync({
        uid: receiving.uid,
        payload: {
          jumlah_bayar: Number(values.jumlah_bayar),
          cash_account_uid: String(values.cash_account_uid),
          tanggal_bayar: values.tanggal_bayar,
          catatan: values.catatan,
        },
      });
      toast.success(`Pembayaran untuk ${receiving.nomor_konsinyasi} berhasil. Sisa barang titipan otomatis dikembalikan.`);
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal memproses pembayaran konsinyasi.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white border border-slate-100 p-6 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-100">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <IconCash className="w-5 h-5 text-emerald-600" />
            <span>Pelunasan Konsinyasi</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Bayar hutang konsinyasi <strong>{receiving?.nomor_konsinyasi}</strong> dan kembalikan sisa titipan.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
            {/* Auto Return Info Banner */}
            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <IconArrowBackUp size={16} className="text-amber-700" />
                <span>Auto-Retur Sisa Titipan:</span>
              </div>
              <p className="text-[11px] text-amber-700 leading-normal">
                Saat pembayaran disubmit, sebanyak <strong>{totalSisaTitipan} pcs</strong> sisa barang titipan yang belum terjual akan **otomatis dikembalikan ke supplier** dan sesi konsinyasi ini akan ditutup (`closed`).
              </p>
            </div>

            {/* Sisa Hutang Overview */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Total Hutang Laku:</span>
                <span className="text-xs font-bold text-slate-700">{receiving?.supplier || "Supplier"}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600">{formatRupiah(sisaHutang)}</span>
              </div>
            </div>

            {/* Cash Account Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Akun Kas/Kasir *</label>
              <FormSelect<ConsignmentPaymentFormValues>
                name="cash_account_uid"
                options={cashAccountOptions}
                placeholder={isCashLoading ? "Memuat akun kas..." : "Pilih akun kasir / bank..."}
              />
            </div>

            {/* Jumlah Bayar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Jumlah Pembayaran (Rp) *</label>
              <FormNumberInput<ConsignmentPaymentFormValues>
                name="jumlah_bayar"
                min={1}
                max={sisaHutang}
                className="h-10 text-xs font-bold text-emerald-600"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Pembayaran</label>
              <FormInput<ConsignmentPaymentFormValues>
                name="catatan"
                placeholder="Catatan pembayaran (opsional)..."
                className="h-9 text-xs"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={paymentMutation.isPending}
                className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 cursor-pointer shadow-2xs"
              >
                {paymentMutation.isPending && <IconLoader2 size={14} className="animate-spin" />}
                <IconCheck size={16} />
                <span>Bayar & Tutup Sesi</span>
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
