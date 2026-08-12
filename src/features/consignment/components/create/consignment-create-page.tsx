"use client";

import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormInput } from "@/components/forms/form-input";
import { FormSelect } from "@/components/forms/form-select";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { Button } from "@/components/ui/button";
import type { Product } from "@/features/master/products/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowLeft, IconBarcode, IconBuildingStore } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useCompleteConsignmentMutation,
  useCreateConsignmentDraftMutation,
  useScanConsignmentProductMutation,
  useUpdateConsignmentDraftMutation,
} from "../../api/consignment-api";
import {
  consignmentReceivingSchema,
  type ConsignmentReceivingFormValues,
} from "../../schemas/consignment-schema";
import type { ConsignmentReceiving } from "../../types";
import { ConsignmentItemsTable } from "./consignment-items-table";
import { ConsignmentSummaryCard } from "./consignment-summary-card";

interface ConsignmentCreatePageProps {
  initialData?: ConsignmentReceiving;
  suppliers?: { value: string; label: string }[];
}

export function ConsignmentCreatePage({ initialData, suppliers = [] }: ConsignmentCreatePageProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData);

  const [productsMap, setProductsMap] = useState<Map<string, Product>>(new Map());

  const form = useForm<ConsignmentReceivingFormValues>({
    resolver: zodResolver(consignmentReceivingSchema),
    defaultValues: {
      supplier_uid: initialData?.supplier_uid || "",
      supplier: initialData?.supplier || "",
      tanggal_terima: initialData?.tanggal_terima || new Date().toISOString().split("T")[0],
      catatan: initialData?.catatan || "",
      items: initialData?.items?.map((i) => ({
        product_uid: i.product_uid,
        kuantitas: Number(i.kuantitas || 1),
        harga_beli: Number(i.harga_beli || 0),
        update_harga_jual: i.update_harga_jual || false,
        harga_jual_baru: i.harga_jual_baru ? Number(i.harga_jual_baru) : null,
        margin_baru: i.margin_baru ? Number(i.margin_baru) : null,
      })) || [],
    },
  });

  const createDraftMutation = useCreateConsignmentDraftMutation();
  const updateDraftMutation = useUpdateConsignmentDraftMutation();
  const completeMutation = useCompleteConsignmentMutation();
  const scanMutation = useScanConsignmentProductMutation();

  const handleBarcodeSubmit = useCallback(
    async (barcode: string) => {
      if (!barcode.trim()) return;
      try {
        const res = await scanMutation.mutateAsync(barcode);
        if (res) {
          const currentItems = form.getValues("items") || [];
          const existingIdx = currentItems.findIndex((it) => it.product_uid === res.product_uid);

          // Store product info in local map
          setProductsMap((prev) => {
            const next = new Map(prev);
            next.set(res.product_uid, {
              uid: res.product_uid,
              nama: res.nama,
              barcode: res.barcode,
              harga_beli: res.harga_beli,
              harga_jual: res.harga_jual,
            } as Product);
            return next;
          });

          if (existingIdx >= 0) {
            const currentQty = Number(currentItems[existingIdx].kuantitas || 0);
            form.setValue(`items.${existingIdx}.kuantitas`, currentQty + 1);
            toast.success(`Qty "${res.nama}" ditambah (+1).`);
          } else {
            form.setValue("items", [
              ...currentItems,
              {
                product_uid: res.product_uid,
                kuantitas: 1,
                harga_beli: res.harga_beli,
                update_harga_jual: false,
                harga_jual_baru: null,
                margin_baru: null,
              },
            ]);
            toast.success(`"${res.nama}" berhasil ditambahkan.`);
          }
        }
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } }; message?: string };
        toast.error(error?.response?.data?.message || error?.message || "Produk tidak ditemukan.");
      }
    },
    [form, scanMutation]
  );

  const handleSaveDraft = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Mohon lengkapi data penerimaan konsinyasi dengan benar.");
      return;
    }

    const values = form.getValues();
    try {
      if (isEditMode && initialData) {
        await updateDraftMutation.mutateAsync({ uid: initialData.uid, payload: values });
        toast.success("Draft konsinyasi berhasil diperbarui.");
      } else {
        await createDraftMutation.mutateAsync(values);
        toast.success("Draft konsinyasi berhasil disimpan.");
      }
      router.push("/admin/consignment");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal menyimpan draft konsinyasi.");
    }
  };

  const handleCompleteDirect = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Mohon lengkapi data penerimaan konsinyasi dengan benar.");
      return;
    }

    const values = form.getValues();
    try {
      let targetUid = initialData?.uid;
      if (isEditMode && initialData) {
        await updateDraftMutation.mutateAsync({ uid: initialData.uid, payload: values });
      } else {
        const res = await createDraftMutation.mutateAsync(values);
        targetUid = res?.uid;
      }

      if (targetUid) {
        await completeMutation.mutateAsync(targetUid);
        toast.success("Penerimaan konsinyasi berhasil diselesaikan (stok fisik bertambah).");
        router.push("/admin/consignment");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(error?.response?.data?.message || error?.message || "Gagal menyelesaikan penerimaan konsinyasi.");
    }
  };

  const handleRemoveItem = (index: number) => {
    const current = form.getValues("items") || [];
    form.setValue(
      "items",
      current.filter((_, i) => i !== index)
    );
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-6 p-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/consignment")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 gap-1.5 rounded-xl cursor-pointer"
          >
            <IconArrowLeft size={16} />
            <span>Kembali ke Daftar Konsinyasi</span>
          </Button>

          <span className="text-xs font-mono font-bold text-slate-400">
            {isEditMode ? initialData?.nomor_konsinyasi : "Draft Konsinyasi Baru"}
          </span>
        </div>

        {/* Header Info Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <IconBuildingStore className="w-5 h-5 text-emerald-600" />
            Informasi Penerimaan Konsinyasi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Supplier / Pemasok *</label>
              {suppliers.length > 0 ? (
                <FormSelect<ConsignmentReceivingFormValues>
                  name="supplier_uid"
                  options={suppliers}
                  placeholder="Pilih supplier..."
                />
              ) : (
                <FormInput<ConsignmentReceivingFormValues>
                  name="supplier"
                  placeholder="Nama supplier..."
                  className="h-10 text-xs"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Terima *</label>
              <FormDatePicker<ConsignmentReceivingFormValues>
                name="tanggal_terima"
                className="h-10 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan / Keterangan</label>
              <FormInput<ConsignmentReceivingFormValues>
                name="catatan"
                placeholder="Catatan tambahan (opsional)..."
                className="h-10 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Barcode Scanner Bar */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap">
            <IconBarcode className="w-5 h-5 text-emerald-600" />
            <span>Scan Barcode Produk:</span>
          </div>
          <div className="flex-1 w-full">
            <BarcodeInput
              onProductFound={(product) => {
                handleBarcodeSubmit(product.barcode || product.uid);
              }}
              onSearchSubmit={handleBarcodeSubmit}
              placeholder="Scan barcode atau masukkan kode produk lalu tekan Enter..."
            />
          </div>
        </div>

        {/* Main Content Layout (Table + Sticky Summary) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <ConsignmentItemsTable productsMap={productsMap} onRemoveItem={handleRemoveItem} />
          </div>

          <div className="lg:col-span-1">
            <ConsignmentSummaryCard
              onSaveDraft={handleSaveDraft}
              onComplete={handleCompleteDirect}
              isSavingDraft={createDraftMutation.isPending || updateDraftMutation.isPending}
              isCompleting={completeMutation.isPending}
              isEditMode={isEditMode}
            />
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
