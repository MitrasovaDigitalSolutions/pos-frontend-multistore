"use client";

import { BarcodeInput } from "@/components/shared/barcode-input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProductFormDialog } from "@/features/master/products/components/product-form-dialog";
import type { Product } from "@/features/master/products/types";
import { BulkSubmitBar } from "@/features/purchase/components/shared/bulk-submit-bar";
import { formatToISO, todayStr } from "@/lib/date-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconBarcode,
  IconCheck,
  IconInfoCircle,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  useBulkConsignmentMutation,
  useCompareConsignmentPricesMutation,
  useCompleteConsignmentMutation,
  useCreateConsignmentDraftMutation,
  useUpdateConsignmentDraftMutation,
} from "../../api/consignment-api";
import {
  consignmentReceivingSchema,
  type ConsignmentReceivingFormValues,
} from "../../schemas/consignment-schema";
import type { ConsignmentReceiving, PriceComparisonItem } from "../../types";
import { ConsignmentHeaderCard } from "./consignment-header-card";
import { ConsignmentInstructionPanel } from "./consignment-instruction-panel";
import { ConsignmentItemsTable } from "./consignment-items-table";
import {
  ConsignmentPriceAlertDialog,
  type ConsignmentPriceAlertFormInput,
} from "./consignment-price-alert-dialog";

interface ConsignmentCreatePageProps {
  initialData?: ConsignmentReceiving;
}

export function ConsignmentCreatePage({ initialData }: ConsignmentCreatePageProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const [lastAddedUid, setLastAddedUid] = useState<string | null>(null);

  const [productsMap, setProductsMap] = useState<Map<string, Product>>(() => {
    const map = new Map<string, Product>();
    if (initialData?.items) {
      initialData.items.forEach((item) => {
        if (item.product) {
          map.set(item.product_uid, item.product);
        }
      });
    }
    return map;
  });

  const [notFoundQuery, setNotFoundQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  // Price comparison state
  const [isPriceAlertOpen, setIsPriceAlertOpen] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<PriceComparisonItem[]>([]);

  const form = useForm<ConsignmentReceivingFormValues>({
    resolver: zodResolver(consignmentReceivingSchema),
    defaultValues: {
      supplier_uid: initialData?.supplier_uid || "",
      supplier: initialData?.supplier || "",
      tanggal_terima: initialData?.tanggal_terima
        ? formatToISO(initialData.tanggal_terima)
        : todayStr(),
      tanggal_jatuh_tempo: initialData?.tanggal_jatuh_tempo
        ? formatToISO(initialData.tanggal_jatuh_tempo)
        : "",
      catatan: initialData?.catatan || "",
      items:
        initialData?.items?.map((i) => ({
          product_uid: i.product_uid,
          kuantitas: Number(i.kuantitas || 1),
          harga_beli: Number(i.harga_beli || 0),
          update_harga_jual: Boolean(i.update_harga_jual),
          harga_jual_baru: i.harga_jual_baru ? Number(i.harga_jual_baru) : null,
          margin_baru: i.margin_baru ? Number(i.margin_baru) : null,
        })) || [],
    },
  });

  const createDraftMutation = useCreateConsignmentDraftMutation();
  const updateDraftMutation = useUpdateConsignmentDraftMutation();
  const completeMutation = useCompleteConsignmentMutation();
  const bulkMutation = useBulkConsignmentMutation();
  const comparePricesMutation = useCompareConsignmentPricesMutation();

  const isSubmitting =
    createDraftMutation.isPending ||
    updateDraftMutation.isPending ||
    completeMutation.isPending ||
    bulkMutation.isPending ||
    comparePricesMutation.isPending;

  const handleProductFound = (product: Product) => {
    setLastAddedUid(product.uid);
    const currentItems = form.getValues("items") || [];
    const existingIdx = currentItems.findIndex((it) => it.product_uid === product.uid);

    // Save product definition in map
    setProductsMap((prev) => {
      const next = new Map(prev);
      next.set(product.uid, product);
      return next;
    });

    if (existingIdx >= 0) {
      const existingItem = currentItems[existingIdx];
      const otherItems = currentItems.filter((_, idx) => idx !== existingIdx);
      const currentQty = Number(existingItem.kuantitas || 0);
      form.setValue("items", [
        { ...existingItem, kuantitas: currentQty + 1 },
        ...otherItems,
      ]);
      toast.success(`Qty "${product.nama}" ditambah (+1).`);
    } else {
      form.setValue("items", [
        {
          product_uid: product.uid,
          kuantitas: 1,
          harga_beli: product.harga_beli || 0,
          update_harga_jual: false,
          harga_jual_baru: null,
          margin_baru: null,
        },
        ...currentItems,
      ]);
      toast.success(`"${product.nama}" ditambahkan ke daftar.`);
    }
  };

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
      toast.error(
        error?.response?.data?.message || error?.message || "Gagal menyimpan draft konsinyasi."
      );
    }
  };

  const handleCompleteClick = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Mohon lengkapi data penerimaan konsinyasi dengan benar.");
      return;
    }

    const items = form.getValues("items") || [];
    if (items.length === 0) {
      toast.error("Minimal 1 barang konsinyasi wajib diisi.");
      return;
    }

    // Check for price changes
    try {
      const payload = items.map((i) => ({
        product_uid: i.product_uid,
        harga_beli: Number(i.harga_beli || 0),
      }));
      const rawRes = await comparePricesMutation.mutateAsync({ items: payload });
      const alertsList: PriceComparisonItem[] = Array.isArray(rawRes)
        ? rawRes
        : Array.isArray((rawRes as unknown as { data: PriceComparisonItem[] })?.data)
          ? (rawRes as unknown as { data: PriceComparisonItem[] }).data
          : [];

      const activeAlerts = alertsList.filter((a) => a.perlu_alert);

      if (activeAlerts.length > 0) {
        setPriceAlerts(activeAlerts);
        setIsPriceAlertOpen(true);
        return;
      }
    } catch (err) {
      console.error("Error comparing consignment prices:", err);
    }

    setIsCompleteDialogOpen(true);
  };

  const handleCompleteWithPrices = (formValues: ConsignmentPriceAlertFormInput) => {
    setIsPriceAlertOpen(false);

    // Apply updated prices to form items
    const currentItems = form.getValues("items") || [];
    const nextItems = currentItems.map((item) => {
      const alertUpdate = formValues.items.find((u) => u.product_uid === item.product_uid);
      if (alertUpdate && alertUpdate.update_harga_jual) {
        return {
          ...item,
          update_harga_jual: true,
          harga_jual_baru: alertUpdate.harga_jual_baru,
          margin_baru: alertUpdate.margin_baru,
        };
      }
      return item;
    });

    form.setValue("items", nextItems);
    setIsCompleteDialogOpen(true);
  };

  const handleCompleteWithoutPrices = () => {
    setIsPriceAlertOpen(false);
    setIsCompleteDialogOpen(true);
  };

  const handleCompleteConfirmed = async () => {
    const values = form.getValues();
    try {
      if (isEditMode && initialData?.uid) {
        // Document already exists as draft (has UID): update draft first, then hit complete endpoint
        await updateDraftMutation.mutateAsync({ uid: initialData.uid, payload: values });
        await completeMutation.mutateAsync(initialData.uid);
      } else {
        // New document from scratch (no UID): hit bulk endpoint (creates + completes in 1 request)
        await bulkMutation.mutateAsync(values);
      }

      toast.success("Penerimaan konsinyasi berhasil diselesaikan. Stok fisik bertambah.");
      setIsCompleteDialogOpen(false);
      router.push("/admin/consignment");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Gagal menyelesaikan penerimaan konsinyasi."
      );
    }
  };

  const handleRemoveItem = (index: number) => {
    const current = form.getValues("items") || [];
    form.setValue(
      "items",
      current.filter((_, i) => i !== index)
    );
  };

  const items = useWatch({
    control: form.control,
    name: "items",
    defaultValue: [],
  });
  const itemCount = items.reduce((acc, item) => acc + Number(item?.kuantitas || 0), 0);
  const totalValue = items.reduce(
    (acc, item) => acc + Number(item?.kuantitas || 0) * Number(item?.harga_beli || 0),
    0
  );
  const uniqueProductCount = items.length;

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        {/* Navigation / Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              onClick={() => router.push("/admin/consignment")}
              variant="outline"
              className="p-2 h-9 w-9 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white cursor-pointer"
            >
              <IconArrowLeft size={18} />
            </Button>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>
                  {isEditMode
                    ? `Edit Penerimaan Konsinyasi — ${initialData?.nomor_konsinyasi || ""}`
                    : "Input Penerimaan Konsinyasi Baru"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-700 border-amber-100">
                  Draft
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Penerimaan konsinyasi menaikkan stok fisik tanpa pencatatan hutang dagang pada GL.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start pb-28 sm:pb-8">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            {/* Barcode scanner box */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100/30">
                  <IconBarcode size={18} />
                </div>
                <h3 className="text-xs font-bold text-slate-900">Scan Barcode Penerimaan Konsinyasi</h3>
              </div>

              <BarcodeInput
                ref={barcodeInputRef}
                refocusOnFound={false}
                onProductFound={(product) => {
                  setNotFoundQuery("");
                  handleProductFound(product);
                }}
                onError={(msg) => toast.error(msg)}
                onProductNotFound={(query) => {
                  setNotFoundQuery(query);
                  setIsCreateDialogOpen(true);
                }}
                onInputChange={() => {
                  if (notFoundQuery) {
                    setNotFoundQuery("");
                  }
                }}
                disabled={isSubmitting}
                placeholder="Scan barcode atau ketik nama/kode produk untuk mencari..."
              />

              {notFoundQuery && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-3.5 bg-rose-50/50 border border-rose-100 rounded-xl text-rose-900 text-xs">
                  <div className="flex items-center gap-2">
                    <IconInfoCircle size={16} className="text-rose-500 shrink-0" />
                    <span>
                      Produk <strong>&quot;{notFoundQuery}&quot;</strong> tidak ditemukan.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end shrink-0">
                    <Button
                      type="button"
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold h-8 px-3 rounded-lg border-none cursor-pointer flex-1 sm:flex-initial"
                    >
                      Tambah Produk Baru
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setNotFoundQuery("")}
                      className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-rose-100/50 cursor-pointer border-none flex items-center justify-center shrink-0"
                    >
                      <IconX size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div>
              <ConsignmentItemsTable
                productsMap={productsMap}
                onRemoveItem={handleRemoveItem}
                disabled={isSubmitting}
                barcodeInputRef={barcodeInputRef}
                lastAddedUid={lastAddedUid}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-5 sm:space-y-6">
            <ConsignmentHeaderCard isPending={isSubmitting} />
            <ConsignmentInstructionPanel />
          </div>
        </div>

        {/* Sticky Bottom Action Bar */}
        <BulkSubmitBar
          itemCount={itemCount}
          productCount={uniqueProductCount}
          total={totalValue}
          onSubmit={handleCompleteClick}
          onSecondarySubmit={handleSaveDraft}
          onReset={() => setIsResetDialogOpen(true)}
          isSubmitting={isSubmitting}
          submitLabel={isEditMode ? "Simpan & Selesaikan" : "Selesaikan Konsinyasi"}
          submitIcon={<IconCheck size={16} />}
          secondarySubmitLabel="Simpan Draft"
          secondarySubmitIcon={<IconUpload size={16} />}
        />

        {/* Dialogs */}
        <ProductFormDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          editingProduct={null}
          onSuccess={(product: Product) => {
            setNotFoundQuery("");
            handleProductFound(product);
          }}
          infoMessage={
            notFoundQuery ? `Produk "${notFoundQuery}" tidak ditemukan. Silakan buat baru.` : undefined
          }
        />

        <ConsignmentPriceAlertDialog
          open={isPriceAlertOpen}
          onOpenChange={setIsPriceAlertOpen}
          priceAlerts={priceAlerts}
          isFinalizing={isSubmitting}
          onCompleteWithoutPrices={handleCompleteWithoutPrices}
          onCompleteWithPrices={handleCompleteWithPrices}
        />

        <ConfirmDialog
          open={isResetDialogOpen}
          onOpenChange={setIsResetDialogOpen}
          title="Kosongkan Penerimaan Konsinyasi"
          description="Apakah Anda yakin ingin mengosongkan seluruh data penerimaan konsinyasi? Semua barang titipan yang telah ditambahkan akan dibersihkan."
          confirmText="Ya, Kosongkan"
          cancelText="Batal"
          variant="warning"
          onConfirm={() => {
            form.setValue("items", []);
            setIsResetDialogOpen(false);
            toast.info("Data penerimaan konsinyasi berhasil dikosongkan.");
          }}
        />

        <ConfirmDialog
          open={isCompleteDialogOpen}
          onOpenChange={setIsCompleteDialogOpen}
          title="Selesaikan Penerimaan Konsinyasi"
          description="Stok fisik barang akan bertambah secara otomatis. Penerimaan ini bersifat off-book (hutang timbul saat barang terjual di Kasir). Apakah Anda yakin ingin menyelesaikan penerimaan konsinyasi ini?"
          confirmText="Ya, Selesaikan"
          cancelText="Batal"
          variant="success"
          isLoading={isSubmitting}
          onConfirm={handleCompleteConfirmed}
        />
      </div>
    </FormProvider>
  );
}
