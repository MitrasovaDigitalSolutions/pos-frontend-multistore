"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { useCashAccounts } from "@/features/cash/api/cash-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowBackUp,
  IconCash,
  IconCheck,
  IconLoader2,
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

import { todayStr } from "@/lib/date-utils";

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
      jumlah_bayar: sisaHutang || 0,
      cash_account_uid: "",
      tanggal_bayar: todayStr(),
      catatan: "",
    },
  });

  useEffect(() => {
    if (open && receiving) {
      form.reset({
        jumlah_bayar: Number(receiving.sisa_hutang || 0),
        cash_account_uid: "",
        tanggal_bayar: todayStr(),
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
      toast.success(
        `Pelunasan untuk ${receiving.nomor_konsinyasi} berhasil disubmit. Sisa barang titipan otomatis dikembalikan.`
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        error?.response?.data?.message || error?.message || "Gagal memproses pembayaran konsinyasi."
      );
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2 text-slate-900 font-bold">
          <IconCash className="w-5 h-5 text-emerald-600" />
          <span>Pelunasan & Penutupan Konsinyasi</span>
        </div>
      }
      className="sm:max-w-2xl"
    >
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-1">
          <p className="text-xs text-slate-500 -mt-1">
            Bayar hasil penjualan konsinyasi <strong className="text-slate-800 font-mono">{receiving?.nomor_konsinyasi}</strong> dan kembalikan sisa titipan.
          </p>

          {/* Top Grid Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Sisa Hutang Overview */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Supplier / Total Hutang Laku
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {receiving?.supplier || "Supplier"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-extrabold text-emerald-600 font-mono">
                  {formatRupiah(sisaHutang)}
                </span>
              </div>
            </div>

            {/* Auto Return Info Banner */}
            <div className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl flex items-start gap-2.5">
              <IconArrowBackUp size={18} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-amber-800 block">Auto-Retur Sisa Titipan</span>
                <p className="text-[11px] text-amber-700 leading-tight">
                  <strong>{totalSisaTitipan} pcs</strong> sisa produk tidak laku otomatis dikembalikan & sesi ditutup (`closed`).
                </p>
              </div>
            </div>
          </div>

          {/* 2-Column Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/40 p-4 rounded-xl border border-slate-100">
            {/* Left Column */}
            <div className="space-y-3.5">
              {/* Cash Account Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Akun Kas / Kasir *
                </label>
                <FormSelect<ConsignmentPaymentFormValues>
                  name="cash_account_uid"
                  options={cashAccountOptions}
                  placeholder={isCashLoading ? "Memuat akun kas..." : "Pilih akun kasir / bank..."}
                />
              </div>

              {/* Tanggal Bayar */}
              <FormDatePicker<ConsignmentPaymentFormValues>
                name="tanggal_bayar"
                label="Tanggal Pembayaran *"
              />
            </div>

            {/* Right Column */}
            <div className="space-y-3.5">
              {/* Jumlah Bayar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Nominal Pembayaran (Rp) *
                </label>
                <FormNumberInput<ConsignmentPaymentFormValues>
                  name="jumlah_bayar"
                  min={0}
                  max={sisaHutang > 0 ? sisaHutang : undefined}
                  className="h-10 text-xs font-bold text-emerald-600"
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Catatan Pembayaran
                </label>
                <FormInput<ConsignmentPaymentFormValues>
                  name="catatan"
                  placeholder="Catatan pembayaran (opsional)..."
                  className="h-9 text-xs"
                />
              </div>
            </div>
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
    </BaseDialog>
  );
}
