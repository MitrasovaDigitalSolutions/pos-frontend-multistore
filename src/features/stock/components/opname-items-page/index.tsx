"use client";

import { AppButton } from "@/components/shared/app-button";
import type { CommandOption } from "@/components/ui/command-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useBrands } from "@/features/master/brands/api/brands-api";
import { useCategories } from "@/features/master/categories/api/categories-api";
import type { Product } from "@/features/master/products/types";
import { clearOpnameItemsStore, getOpnameItemsStore, type OpnameItemLocal } from "@/stores/opname-items-store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useFinalizeOpname,
  useOpnameAllItems,
  useOpnameDetail,
  useUpdateOpname,
  useUpdateOpnameItems,
} from "../../api/stock-api";
import type { OpnameItem } from "../../types";
import { EditHeaderDialog } from "./edit-header-dialog";
import { ImportOpnameDraftDialog } from "./import-opname-draft-dialog";
import { OpnameInstructions } from "./opname-instructions";
import { OpnameItemsHeader } from "./opname-items-header";
import { OpnameItemsMobileBar } from "./opname-items-mobile-bar";
import { OpnameItemsSkeleton } from "./opname-items-skeleton";
import { OpnameItemsTable } from "./opname-items-table";
import { OpnameScannerCard } from "./opname-scanner-card";
import { OpnameStatsCards } from "./opname-stats-cards";

interface OpnameItemsPageProps {
  opnameId: string;
}

/** Convert a server OpnameItem to the local store format with robust field fallbacks */
function toLocalItem(dbItem: OpnameItem, index: number): OpnameItemLocal {
  const raw = dbItem as unknown as Record<string, unknown>;
  return {
    temp_uid: `db-${dbItem.uid || `item-${index}`}`,
    product_uid: String(dbItem.product_uid || raw.product_uid || ""),
    brand_uid: dbItem.brand_uid || dbItem.product?.brand_uid || dbItem.brand?.uid || null,
    category_uid: dbItem.category_uid || dbItem.product?.category_uid || dbItem.category?.uid || null,
    nama: dbItem.product?.nama || (raw.nama as string) || (raw.product_name as string) || "Produk",
    barcode: dbItem.product?.barcode || (raw.barcode as string) || "",
    stok_sistem: Number(dbItem.stok_sistem ?? raw.stok_sistem) || 0,
    stok_fisik: Number(dbItem.stok_fisik ?? raw.stok_fisik) || 0,
    alasan: dbItem.alasan || (raw.alasan as string) || "Opname rutin",
    updated_at: 0 - index, // deterministic ordering from server
  };
}

export function OpnameItemsPage({ opnameId }: OpnameItemsPageProps) {
  const router = useRouter();
  const { data: opname, isLoading: opnameLoading, refetch: refetchDetail } = useOpnameDetail(opnameId);
  const { data: dbItems, isLoading: dbItemsLoading, refetch: refetchItems } = useOpnameAllItems(opnameId);

  const { data: categoriesData } = useCategories({ per_page: 1000 });
  const { data: brandsData } = useBrands({ per_page: 1000 });

  const categories = useMemo(() => categoriesData?.data || [], [categoriesData?.data]);
  const brands = useMemo(() => brandsData?.data || [], [brandsData?.data]);

  const categoryOptions: CommandOption[] = useMemo(() => [
    { value: "", label: "Tanpa Kategori" },
    ...categories.map((c) => ({
      value: String(c.uid),
      label: c.nama,
    })),
  ], [categories]);

  const brandOptions: CommandOption[] = useMemo(() => [
    { value: "", label: "Tanpa Brand" },
    ...brands.map((b) => ({
      value: String(b.uid),
      label: b.nama,
    })),
  ], [brands]);

  const updateOpname = useUpdateOpname();
  const updateOpnameItems = useUpdateOpnameItems();
  const finalizeOpname = useFinalizeOpname();

  // Zustand Store scoped for this opnameId — now Map-based
  const useStore = getOpnameItemsStore(opnameId);
  const items = useStore((state) => state.items);
  const itemCount = useStore((state) => state.itemCount);
  const isDirty = useStore((state) => state.isDirty);
  const markClean = useStore((state) => state.markClean);
  const addItem = useStore((state) => state.addItem);
  const updateItem = useStore((state) => state.updateItem);
  const removeItem = useStore((state) => state.removeItem);
  const setItems = useStore((state) => state.setItems);
  const clearAll = useStore((state) => state.clearAll);
  const hasItem = useStore((state) => state.hasItem);
  const getItem = useStore((state) => state.getItem);

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

  const isHydratedRef = useRef(false);

  // Sync items from server database when loading draft
  useEffect(() => {
    if (isHydratedRef.current) return;

    const serverItems = (opname?.items && opname.items.length > 0)
      ? opname.items
      : (Array.isArray(dbItems) ? dbItems : []);

    if (itemCount === 0 && serverItems.length > 0) {
      const formatted = serverItems.map((dbItem: OpnameItem, index: number) => toLocalItem(dbItem, index));
      setItems(formatted);
      isHydratedRef.current = true;
    } else if (serverItems.length > 0 || !dbItemsLoading) {
      isHydratedRef.current = true;
    }
  }, [dbItems, dbItemsLoading, itemCount, opname?.items, setItems]);

  const handleImportDraftSuccess = async (newItems?: OpnameItem[]) => {
    setIsSyncing(true);
    try {
      if (newItems && Array.isArray(newItems) && newItems.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 60));
        const formatted = newItems.map((dbItem: OpnameItem, index: number) => toLocalItem(dbItem, index));
        setItems(formatted);
        toast.success(`${formatted.length.toLocaleString("id-ID")} item berhasil dimuat ke draf.`);
        return;
      }

      // Fallback: Always refetch fresh items from server to ensure 100% sync
      const [detailRes, itemsRes] = await Promise.all([
        refetchDetail(),
        refetchItems(),
      ]);

      const freshItems = (detailRes.data?.items && detailRes.data.items.length > 0)
        ? detailRes.data.items
        : (Array.isArray(itemsRes.data) ? itemsRes.data : []);

      if (freshItems.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 60));
        const formatted = freshItems.map((dbItem: OpnameItem, index: number) => toLocalItem(dbItem, index));
        setItems(formatted);
        toast.success(`${formatted.length.toLocaleString("id-ID")} item berhasil disinkronkan ke draf.`);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal menyinkronkan data produk dari server.");
    } finally {
      setIsSyncing(false);
    }
  };

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

  const handleProductFound = (product: Product) => {
    // O(1) lookup — check if product already exists in Map
    const isExisting = hasItem(product.uid);
    const existingItem = isExisting ? getItem(product.uid) : undefined;

    if (existingItem) {
      const newQty = (Number(existingItem.stok_fisik) || 0) + 1;
      updateItem(product.uid, { stok_fisik: newQty });
      setLastScanFeedback({
        type: "incremented",
        productName: product.nama,
        qty: newQty,
      });
      toast.success(
        `Stok fisik ${product.nama} bertambah (+1) jadi ${newQty} pcs`,
        { duration: 1800 }
      );
    } else {
      addItem({
        product_uid: product.uid,
        brand_uid: product.brand_uid ?? null,
        category_uid: product.category_uid ?? null,
        nama: product.nama,
        barcode: product.barcode,
        stok_sistem: Number(product.stok) || 0,
        stok_fisik: 1,
        alasan: "Ditemukan saat opname fisik",
      });
      setLastScanFeedback({
        type: "added",
        productName: product.nama,
        qty: 1,
      });
      toast.success(`${product.nama} berhasil ditambahkan ke daftar`, {
        duration: 2000,
      });
    }

    setTimeout(() => {
      setLastScanFeedback(null);
    }, 4000);
  };

  const handleSaveDraft = async (manualToast = true, force = false) => {
    // Skip hitting /items endpoint if no modifications were made
    if (!isDirty && !force) {
      if (manualToast) {
        toast.info("Tidak ada perubahan item yang perlu disimpan.");
      }
      return true;
    }

    try {
      const payload = {
        items: items.map((i) => ({
          product_uid: i.product_uid,
          brand_uid: i.brand_uid,
          category_uid: i.category_uid,
          stok_fisik: Number(i.stok_fisik) || 0,
          alasan: i.alasan || "",
        })),
      };

      await updateOpnameItems.mutateAsync({
        uid: opnameId,
        data: payload,
      });

      markClean();

      if (manualToast) {
        toast.success("Draf stock opname berhasil disimpan ke server.");
      }
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal menyimpan draf stock opname.");
      return false;
    }
  };

  const handleFinalize = async () => {
    try {
      // Step 1: Save latest local changes only if dirty (skipped if clean!)
      const saveSuccess = await handleSaveDraft(false);
      if (!saveSuccess) return;

      // Step 2: Finalize
      await finalizeOpname.mutateAsync(opnameId);
      toast.success("Stock Opname berhasil diselesaikan!");
      clearOpnameItemsStore(opnameId);
      router.push(ROUTES.ADMIN_STOCK);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal menyelesaikan Stock Opname.");
    }
  };

  const handleReset = () => {
    setIsConfirmResetOpen(true);
  };

  const handleConfirmReset = () => {
    clearAll();
    toast.info("Daftar barang lokal berhasil dikosongkan.");
    setIsConfirmResetOpen(false);
  };

  const handleSaveCatatan = async (catatan: string) => {
    try {
      await updateOpname.mutateAsync({
        uid: opnameId,
        data: {
          catatan: catatan,
          // status: opname?.status ?? "draft",
        },
      });
      toast.success("Catatan opname berhasil diperbarui.");
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memperbarui catatan opname.");
      return false;
    }
  };

  const hasServerItems = (opname?.items && opname.items.length > 0) || (Array.isArray(dbItems) && dbItems.length > 0);
  if (opnameLoading || !opname || (dbItemsLoading && itemCount === 0 && !hasServerItems)) {
    return (
      <OpnameItemsSkeleton
        message={opnameLoading ? "Sedang memuat data Stock Opname..." : "Sedang Memuat Seluruh Data Item Opname..."}
      />
    );
  }

  const stats = items.reduce(
    (acc, item) => {
      const diff = (Number(item.stok_fisik) || 0) - (Number(item.stok_sistem) || 0);
      if (diff > 0) acc.positive++;
      else if (diff < 0) acc.negative++;
      else acc.match++;
      return acc;
    },
    { positive: 0, negative: 0, match: 0 }
  );

  return (
    <div className="space-y-3 sm:space-y-3.5 pb-28 sm:pb-8">
      {/* ── Compact Header / Actions ── */}
      <OpnameItemsHeader
        opname={opname}
        itemsCount={itemCount}
        isPendingSave={updateOpnameItems.isPending || isSyncing}
        isPendingFinalize={finalizeOpname.isPending}
        isInstructionsOpen={isInstructionsOpen}
        onToggleInstructions={() => setIsInstructionsOpen(!isInstructionsOpen)}
        onOpenEditHeader={() => setIsEditHeaderOpen(true)}
        onOpenImportExcel={() => setIsImportDraftOpen(true)}
        onSaveDraft={() => handleSaveDraft(true)}
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
        totalCount={itemCount}
        matchCount={stats.match}
        positiveCount={stats.positive}
        negativeCount={stats.negative}
        isLoading={isSyncing || dbItemsLoading}
      />

      {/* ── Scanner Card with Inline Feedback ── */}
      <OpnameScannerCard
        disabled={updateOpnameItems.isPending || isSyncing || dbItemsLoading}
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
              {itemCount.toLocaleString("id-ID")} Item
            </span>
          </div>
          {itemCount > 0 && !isSyncing && (
            <AppButton
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleReset}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-transparent border-none cursor-pointer hover:underline h-auto p-0"
            >
              Kosongkan Daftar
            </AppButton>
          )}
        </div>

        {/* Responsive Table / Card View with Search + Client Pagination */}
        <OpnameItemsTable
          items={items}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          updateItem={updateItem}
          removeItem={removeItem}
          onFocusBarcode={handleFocusBarcode}
          isSyncing={isSyncing}
          isLoadingItems={dbItemsLoading}
        />
      </div>

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <OpnameItemsMobileBar
        itemsCount={itemCount}
        stats={stats}
        isPendingSave={updateOpnameItems.isPending || isSyncing}
        isPendingFinalize={finalizeOpname.isPending}
        onSaveDraft={() => handleSaveDraft(true)}
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
        description="Apakah Anda yakin ingin mengosongkan seluruh daftar barang di draf lokal ini? Perubahan yang belum disimpan ke server akan hilang."
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
