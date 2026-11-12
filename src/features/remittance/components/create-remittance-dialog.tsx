"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, FormProvider, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  IconBuildingBank,
  IconCheck,
  IconFileText,
  IconInfoCircle,
  IconLoader2,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppButton } from "@/components/shared/app-button";
import { FormSelect } from "@/components/forms/form-select";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormInput } from "@/components/forms/form-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { extractDataList } from "@/lib/utils";
import { useCashAccounts, type CashAccount } from "@/features/cash/api/cash-api";
import {
  useCreateStoreRemittance,
  useUnsettledRemittanceItems,
} from "../api/remittance-api";
import {
  createRemittanceSchema,
  type CreateRemittanceFormValues,
} from "../schemas/remittance-schema";
import type { UnsettledSummary, UnsettledTransactionItem } from "../types";
import { calculateSelectedItemsSummary } from "../utils/remittance-utils";
import { RemittanceItemSelector } from "./remittance-item-selector";

interface CreateRemittanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary?: UnsettledSummary | null;
  selectedItemUids?: string[];
  onSuccessSubmit?: () => void;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

export function CreateRemittanceDialog({
  open,
  onOpenChange,
  summary,
  selectedItemUids = [],
  onSuccessSubmit,
}: CreateRemittanceDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { data: rawCashAccounts, isLoading: loadingAccounts } = useCashAccounts();
  const cashAccounts = extractDataList<CashAccount>(rawCashAccounts);
  const createMutation = useCreateStoreRemittance();

  const { data: unsettledItemsRes } = useUnsettledRemittanceItems({ all: 1 });
  const allUnsettledItems = useMemo(() => {
    if (Array.isArray(summary?.items) && summary.items.length > 0) {
      return summary.items;
    }
    return extractDataList<UnsettledTransactionItem>(unsettledItemsRes);
  }, [summary?.items, unsettledItemsRes]);

  const defaultSelectedUids = useMemo(() => {
    if (selectedItemUids.length > 0) {
      const validSet = new Set(allUnsettledItems.map((i) => i.uid));
      const filtered = selectedItemUids.filter((uid) => validSet.has(uid));
      if (filtered.length > 0) return filtered;
    }
    return allUnsettledItems.map((i) => i.uid);
  }, [allUnsettledItems, selectedItemUids]);

  const defaultSummaryMetrics = useMemo(() => {
    const defaultSet = new Set(defaultSelectedUids);
    const items = allUnsettledItems.filter((item) => defaultSet.has(item.uid));
    return calculateSelectedItemsSummary(items);
  }, [allUnsettledItems, defaultSelectedUids]);

  const cashAccountOptions = useMemo(() => {
    return cashAccounts.map((acc) => ({
      value: acc.uid,
      label: acc.nama,
      description: `${acc.tipe.toUpperCase()} • Saldo: ${formatRupiah(acc.saldo || 0)}`,
    }));
  }, [cashAccounts]);

  const initialFormValues = useMemo<CreateRemittanceFormValues>(
    () => ({
      sale_item_uids: defaultSelectedUids,
      cash_account_source_uid: "",
      nominal_disetor: defaultSummaryMetrics.totalWajibSetor,
      catatan: "",
    }),
    [defaultSelectedUids, defaultSummaryMetrics.totalWajibSetor]
  );

  const methods = useForm<CreateRemittanceFormValues>({
    resolver: zodResolver(createRemittanceSchema) as Resolver<CreateRemittanceFormValues>,
    values: initialFormValues,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = methods;

  const watchedSaleItemUids = useWatch({ control, name: "sale_item_uids" }) ?? defaultSelectedUids;

  const activeSelectedItems = useMemo(() => {
    const selectedSet = new Set(watchedSaleItemUids);
    return allUnsettledItems.filter((item) => selectedSet.has(item.uid));
  }, [allUnsettledItems, watchedSaleItemUids]);

  const activeSummary = useMemo(
    () => calculateSelectedItemsSummary(activeSelectedItems),
    [activeSelectedItems]
  );

  const handleSelectedItemsChange = (nextUids: string[]) => {
    const nextSet = new Set(nextUids);
    const nextItems = allUnsettledItems.filter((item) => nextSet.has(item.uid));
    const nextMetrics = calculateSelectedItemsSummary(nextItems);

    setValue("sale_item_uids", nextUids, { shouldValidate: true, shouldDirty: true });
    setValue("nominal_disetor", nextMetrics.totalWajibSetor, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedFile(null);
      setFilePreview(null);
      setFileError(null);
      reset({
        sale_item_uids: defaultSelectedUids,
        cash_account_source_uid: "",
        nominal_disetor: defaultSummaryMetrics.totalWajibSetor,
        catatan: "",
      });
    }
    onOpenChange(nextOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setFileError("Format file harus berupa JPG, PNG, atau PDF.");
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`Ukuran file maksimal ${MAX_FILE_SIZE_MB}MB.`);
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setFileError(null);
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
  };

  const onSubmit = (values: CreateRemittanceFormValues) => {
    createMutation.mutate(
      {
        sale_item_uids: values.sale_item_uids,
        cash_account_source_uid: values.cash_account_source_uid || undefined,
        nominal_disetor: activeSummary.totalWajibSetor,
        bukti_transfer: selectedFile || null,
        catatan: values.catatan || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Setoran berhasil diajukan! Menunggu verifikasi Pusat.");
          onSuccessSubmit?.();
          handleOpenChange(false);
        },
        onError: (err) => {
          toast.error(err.message || "Gagal mengajukan setoran ke pusat");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        id="create-remittance-dialog"
        className="max-w-xl md:max-w-5xl bg-white rounded-2xl p-4 sm:p-5 border-slate-200/80 shadow-xl overflow-hidden max-h-[92dvh] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="pb-2.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <IconBuildingBank size={18} />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-slate-900 leading-none">
                Form Setoran ke Pusat
              </DialogTitle>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pilih item penjualan konsinyasi yang akan disetor beserta bukti transfer ke Pusat
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto space-y-3.5 pt-2 pr-0.5"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Kolom Kiri (5/12): Pemilih Item Multi-Select */}
              <div className="lg:col-span-5">
                <RemittanceItemSelector
                  items={allUnsettledItems}
                  selectedUids={watchedSaleItemUids}
                  onChange={handleSelectedItemsChange}
                  disabled={createMutation.isPending}
                  errorMessage={errors.sale_item_uids?.message}
                />
              </div>

              {/* Kolom Tengah (4/12): Rekap Item Terpilih & Form Kas/Catatan */}
              <div className="lg:col-span-4 space-y-2.5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Rekap Item Dipilih
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {activeSummary.itemsCount} dari {allUnsettledItems.length} item
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Omzet Konsinyasi:</span>
                      <span className="font-semibold text-slate-800 font-mono">
                        {formatRupiah(activeSummary.totalOmzet)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Hak Komisi Cabang:</span>
                      <span className="font-semibold text-emerald-600 font-mono">
                        +{formatRupiah(activeSummary.totalFeeKomisi)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs">Wajib Setor Pokok:</span>
                    <span className="font-extrabold text-blue-700 text-sm font-mono">
                      {formatRupiah(activeSummary.totalWajibSetor)}
                    </span>
                  </div>
                </div>

                <FormSelect<CreateRemittanceFormValues>
                  name="cash_account_source_uid"
                  label="Kas Pengeluaran *"
                  placeholder="Pilih akun kas / bank asal..."
                  options={cashAccountOptions}
                  disabled={loadingAccounts || createMutation.isPending}
                  size="sm"
                />

                <div className="space-y-1">
                  <FormNominalInput<CreateRemittanceFormValues>
                    name="nominal_disetor"
                    label="Nominal Setor (Rp) *"
                    placeholder="0"
                    disabled={true}
                    className="h-9 text-xs bg-slate-50 font-bold"
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Nominal wajib setor otomatis disesuaikan dengan total item yang dipilih.
                  </p>
                </div>

                <FormInput<CreateRemittanceFormValues>
                  name="catatan"
                  label="Catatan / No. Ref Transfer"
                  placeholder="Contoh: Ref BCA #91283..."
                  disabled={createMutation.isPending}
                  className="h-9 text-xs"
                />
              </div>

              {/* Kolom Kanan (3/12): Bukti Transfer Upload & Info */}
              <div className="lg:col-span-3 space-y-2.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>
                      Bukti Transfer{" "}
                      <span className="text-[9px] text-slate-400 font-normal lowercase">
                        (opsional)
                      </span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      Maks. {MAX_FILE_SIZE_MB}MB
                    </span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={createMutation.isPending}
                  />

                  {!selectedFile ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={createMutation.isPending}
                      className="w-full h-[155px] border border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 transition-all rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-slate-500 group"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <IconUpload size={16} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        Pilih Bukti Transfer
                      </span>
                      <span className="text-[10px] text-slate-400 text-center leading-tight">
                        Screenshot m-banking, struk ATM, atau file PDF
                      </span>
                    </button>
                  ) : (
                    <div className="h-[155px] p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {filePreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={filePreview}
                            alt="Preview bukti"
                            className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <IconFileText size={22} />
                          </div>
                        )}
                        <div className="truncate min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                          <span className="inline-block mt-1 text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                            Siap Diunggah
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                        >
                          Ganti File
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus file"
                        >
                          <IconTrash size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {fileError && (
                    <p className="text-[11px] text-rose-500 font-semibold">{fileError}</p>
                  )}
                </div>

                <div className="p-2.5 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2 text-blue-900 text-[10px] leading-relaxed">
                  <IconInfoCircle size={15} className="text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Item yang tidak dicentang akan tetap berstatus{" "}
                    <strong>Belum Disetor</strong> dan dapat diajukan pada setoran berikutnya.
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="pt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 shrink-0 flex-wrap">
              <span className="text-[11px] text-slate-500">
                Total disetor:{" "}
                <strong className="font-mono font-bold text-blue-700">
                  {formatRupiah(activeSummary.totalWajibSetor)}
                </strong>{" "}
                ({activeSummary.itemsCount} item)
              </span>

              <div className="flex items-center gap-2 ml-auto">
                <AppButton
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenChange(false)}
                  disabled={createMutation.isPending}
                  className="h-8 px-3.5 text-xs font-semibold rounded-lg"
                >
                  Batal
                </AppButton>
                <AppButton
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={
                    createMutation.isPending ||
                    activeSummary.itemsCount === 0 ||
                    activeSummary.totalWajibSetor <= 0
                  }
                  className="h-8 px-4 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
                >
                  {createMutation.isPending ? (
                    <>
                      <IconLoader2 size={13} className="animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <IconCheck size={13} />
                      <span>Kirim Setoran ({activeSummary.itemsCount} Item)</span>
                    </>
                  )}
                </AppButton>
              </div>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
