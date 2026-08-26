"use client";

import { AppButton } from "@/components/shared/app-button";
import type { CommandOption } from "@/components/ui/command-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useBrands } from "@/features/master/brands/api/brands-api";
import { useCategories } from "@/features/master/categories/api/categories-api";
import { useProducts } from "@/features/master/products/api/products-api";
import type { Product } from "@/features/master/products/types";
import { useOpnameUIStore } from "@/stores/opname-items-store";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useClearOpnameItems,
  useDeleteOpnameItemRow,
  useFinalizeOpname,
  useOpnameDetail,
  useOpnameItems,
  useScanOpnameItem,
  useUpdateOpname,
  useUpdateOpnameItemRow,
} from "../../api/stock-api";
import type { OpnameItem } from "../../types";
import { EditHeaderDialog } from "./edit-header-dialog";
import { ImportOpnameDraftDialog } from "./import-opname-draft-dialog";
import { OpnameInstructions } from "./opname-instructions";
import { OpnameItemsHeader } from "./opname-items-header";
import { OpnameItemsMobileBar } from "./opname-items-mobile-bar";
import { OpnameItemsTable } from "./opname-items-table";
import { OpnameScannerCard } from "./opname-scanner-card";
import { OpnameStatsCards } from "./opname-stats-cards";

interface OpnameItemsPageProps {
  opnameId: string;
}

export function OpnameItemsPage({ opnameId }: OpnameItemsPageProps) {
  const router = useRouter();

  // ── UI Filter Store ──
  const page = useOpnameUIStore((state) => state.page);
  const perPage = useOpnameUIStore((state) => state.perPage);
  const search = useOpnameUIStore((state) => state.search);
  const filterSelisih = useOpnameUIStore((state) => state.filterSelisih);
  const categoryUid = useOpnameUIStore((state) => state.categoryUid);
  const brandUid = useOpnameUIStore((state) => state.brandUid);
  const sortBy = useOpnameUIStore((state) => state.sortBy);
  const sortOrder = useOpnameUIStore((state) => state.sortOrder);

  // ── Queries & Mutations ──
  const { data: opname, isLoading: opnameLoading, refetch: refetchDetail } = useOpnameDetail(opnameId);
  const {
    data: itemsResponse,
    isLoading: itemsLoading,
    isFetching: itemsFetching,
    refetch: refetchItems,
  } = useOpnameItems(opnameId, {
    page,
    per_page: perPage,
    search: search || undefined,
    filter_selisih: filterSelisih !== "all" ? filterSelisih : undefined,
    category_uid: categoryUid || undefined,
    brand_uid: brandUid || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  });

  const { data: productsData } = useProducts({ per_page: 1000 });
  const products = useMemo(() => productsData?.data || [], [productsData?.data]);

  const { data: categoriesData } = useCategories({ per_page: 1000 });
  const { data: brandsData } = useBrands({ per_page: 1000 });

  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);
  const brands = useMemo(() => brandsData?.data || [], [brandsData?.data]);

  const categoryOptions: CommandOption[] = useMemo(
    () => [
      { value: "", label: "Tanpa Kategori" },
      ...categories.map((c) => ({
        value: String(c.uid),
        label: c.nama,
      })),
    ],
    [categories]
  );

  const brandOptions: CommandOption[] = useMemo(
    () => [
      { value: "", label: "Tanpa Brand" },
      ...brands.map((b) => ({
        value: String(b.uid),
        label: b.nama,
      })),
    ],
    [brands]
  );

  const updateOpname = useUpdateOpname();
  const scanOpnameItem = useScanOpnameItem();
  const updateSingleItem = useUpdateOpnameItemRow();
  const deleteSingleItem = useDeleteOpnameItemRow();
  const clearOpnameItems = useClearOpnameItems();
  const finalizeOpname = useFinalizeOpname();

  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isImportDraftOpen, setIsImportDraftOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  /** Last scan feedback state — shown inline in scanner card */
  const [lastScanFeedback, setLastScanFeedback] = useState<{
    type: "added" | "incremented";
    productName: string;
    qty: number;
  } | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToInput = () => {
    const element = document.getElementById("barcode-scanner-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        const inputEl = element.querySelector("input");
        if (inputEl) {
          inputEl.focus();
        }
      }, 250);
    }
  };

  const handleFocusBarcode = () => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
      barcodeInputRef.current.select();
    } else {
      scrollToInput();
    }
  };

  // ── Scan handler: Sends direct mutation to backend ──
  const handleProductFound = async (product: Product) => {
    if (!product.barcode) {
      toast.error("Produk tidak memiliki barcode.");
      return;
    }

    try {
      const res = await scanOpnameItem.mutateAsync({
        uid: opnameId,
        data: { barcode: product.barcode },
      });

      const updatedItem = res.data;
      const isExisting = (Number(updatedItem.stok_fisik) || 0) > 1;

      setLastScanFeedback({
        type: isExisting ? "incremented" : "added",
        productName: product.nama,
        qty: Number(updatedItem.stok_fisik) || 1,
      });

      toast.success(
        isExisting
          ? `Jumlah ${product.nama} (+1): ${updatedItem.stok_fisik} pcs`
          : `Ditambahkan: ${product.nama} (1 pcs)`
      );

      setTimeout(() => setLastScanFeedback(null), 3000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal mencatat barcode produk.");
    }
  };

  // ── Single row updates ──
  const handleUpdateQty = (itemUid: string, qty: number) => {
    updateSingleItem.mutate({
      opnameUid: opnameId,
      itemUid,
      data: { stok_fisik: qty },
    });
  };

  const handleUpdateField = (
    itemUid: string,
    field: "alasan" | "brand_uid" | "category_uid",
    value: string | null
  ) => {
    updateSingleItem.mutate({
      opnameUid: opnameId,
      itemUid,
      data: { [field]: value },
    });
  };

  const handleRemoveItem = (itemUid: string) => {
    deleteSingleItem.mutate(
      { opnameUid: opnameId, itemUid },
      {
        onSuccess: () => {
          toast.success("Barang dihapus dari daftar opname.");
        },
        onError: (err) => {
          toast.error(err.message || "Gagal menghapus barang.");
        },
      }
    );
  };

  const handleConfirmReset = () => {
    clearOpnameItems.mutate(opnameId, {
      onSuccess: () => {
        toast.success("Seluruh daftar barang opname dikosongkan.");
        setIsConfirmResetOpen(false);
      },
      onError: (err) => {
        toast.error(err.message || "Gagal mengosongkan daftar barang.");
        setIsConfirmResetOpen(false);
      },
    });
  };

  const handleImportDraftSuccess = async () => {
    setIsSyncing(true);
    try {
      await Promise.all([refetchDetail(), refetchItems()]);
      toast.success("Draf opname dari file Excel berhasil dimuat.");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memperbarui data opname.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFinalize = async () => {
    const totalCount = itemsResponse?.summary?.total_count ?? itemsResponse?.meta?.total ?? 0;
    if (totalCount === 0) {
      toast.error("Harap tambahkan minimal 1 barang sebelum finalisasi.");
      return;
    }

    try {
      await finalizeOpname.mutateAsync(opnameId);
      toast.success("Proses finalisasi stock opname selesai!");
      router.push(ROUTES.ADMIN_STOCK);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memfinalisasi stock opname.");
    } finally {
      setIsConfirmFinalizeOpen(false);
    }
  };

  const handleSaveCatatan = async (catatan: string) => {
    try {
      await updateOpname.mutateAsync({
        uid: opnameId,
        data: { catatan },
      });
      toast.success("Catatan opname berhasil diperbarui.");
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memperbarui catatan opname.");
      return false;
    }
  };

  if (opnameLoading || !opname) {
    return (
      <div className="space-y-4 animate-pulse p-4">
        <div className="h-10 bg-slate-100 rounded-xl w-1/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const items = (itemsResponse?.data || []) as OpnameItem[];
  const summary = itemsResponse?.summary || {
    total_count: itemsResponse?.meta?.total ?? 0,
    match_count: 0,
    positive_count: 0,
    negative_count: 0,
  };
  const totalCount = summary.total_count;

  const stats = {
    match: summary.match_count,
    positive: summary.positive_count,
    negative: summary.negative_count,
  };

  return (
    <div className="space-y-3 sm:space-y-3.5 pb-28 sm:pb-8">
      {/* ── Compact Header / Actions ── */}
      <OpnameItemsHeader
        opname={opname}
        itemsCount={totalCount}
        isPendingSave={false}
        isPendingFinalize={finalizeOpname.isPending}
        isInstructionsOpen={isInstructionsOpen}
        onToggleInstructions={() => setIsInstructionsOpen(!isInstructionsOpen)}
        onOpenEditHeader={() => setIsEditHeaderOpen(true)}
        onOpenImportExcel={() => setIsImportDraftOpen(true)}
        onSaveDraft={() => toast.success("Semua perubahan tersimpan otomatis.")}
        onOpenFinalize={() => setIsConfirmFinalizeOpen(true)}
        onBack={() => router.push(ROUTES.ADMIN_STOCK)}
      />

      {/* ── Collapsible Guide ── */}
      <OpnameInstructions
        open={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
      />

      {/* ── Compact Statistics ── */}
      <OpnameStatsCards
        totalCount={totalCount}
        matchCount={stats.match}
        positiveCount={stats.positive}
        negativeCount={stats.negative}
        isLoading={itemsLoading || isSyncing}
      />

      {/* ── Scanner Card with Inline Feedback ── */}
      <OpnameScannerCard
        products={products}
        disabled={scanOpnameItem.isPending || isSyncing}
        onProductFound={handleProductFound}
        lastScanFeedback={lastScanFeedback}
      />

      {/* ── Items Container ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900">
              Daftar Perhitungan Fisik
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full">
              {totalCount.toLocaleString("id-ID")} Item
            </span>
          </div>
          {totalCount > 0 && !isSyncing && (
            <AppButton
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsConfirmResetOpen(true)}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer hover:underline h-auto p-0"
            >
              Kosongkan Daftar
            </AppButton>
          )}
        </div>

        {/* Responsive Table / Card View with Server-Side Search & Pagination */}
        <OpnameItemsTable
          items={items}
          meta={itemsResponse?.meta}
          summary={summary}
          isLoading={itemsLoading}
          isFetching={itemsFetching}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          onUpdateQty={handleUpdateQty}
          onUpdateField={handleUpdateField}
          onRemoveItem={handleRemoveItem}
          onFocusBarcode={handleFocusBarcode}
          isSyncing={isSyncing}
        />
      </div>

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <OpnameItemsMobileBar
        itemsCount={totalCount}
        stats={stats}
        isPendingSave={false}
        isPendingFinalize={finalizeOpname.isPending}
        onSaveDraft={() => toast.success("Semua perubahan tersimpan otomatis.")}
        onOpenFinalize={() => setIsConfirmFinalizeOpen(true)}
      />

      {/* ── Confirm Finalize Dialog ── */}
      <ConfirmDialog
        open={isConfirmFinalizeOpen}
        onOpenChange={setIsConfirmFinalizeOpen}
        title="Finalisasi Stock Opname?"
        description="Setelah difinalisasi, stok semua produk dalam daftar ini akan langsung diperbarui ke sistem dan penyesuaian stok akan tercatat otomatis. Aksi ini tidak dapat dibatalkan."
        confirmText={
          finalizeOpname.isPending ? "Memproses..." : "Ya, Finalisasi Stok"
        }
        cancelText="Batal"
        onConfirm={handleFinalize}
        variant="primary"
      />

      {/* ── Confirm Reset / Kosongkan Daftar Dialog ── */}
      <ConfirmDialog
        open={isConfirmResetOpen}
        onOpenChange={setIsConfirmResetOpen}
        title="Kosongkan Daftar Barang"
        description="Apakah Anda yakin ingin menghapus seluruh barang di draf opname ini dari server? Aksi ini tidak dapat dibatalkan."
        confirmText="Ya, Kosongkan"
        cancelText="Batal"
        variant="danger"
        onConfirm={handleConfirmReset}
      />

      <EditHeaderDialog
        open={isEditHeaderOpen}
        onOpenChange={setIsEditHeaderOpen}
        opname={opname}
        onSave={handleSaveCatatan}
        isPending={updateOpname.isPending}
      />

      <ImportOpnameDraftDialog
        open={isImportDraftOpen}
        onOpenChange={setIsImportDraftOpen}
        opnameUid={opnameId}
        nomorOpname={opname.nomor_opname}
        onImportSuccess={handleImportDraftSuccess}
      />
    </div>
  );
}
