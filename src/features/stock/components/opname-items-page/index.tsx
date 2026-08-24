"use client";

import { AppButton } from "@/components/shared/app-button";
import type { CommandOption } from "@/components/ui/command-select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import { useBrands } from "@/features/master/brands/api/brands-api";
import { useCategories } from "@/features/master/categories/api/categories-api";
import { useProducts } from "@/features/master/products/api/products-api";
import type { Product } from "@/features/master/products/types";
import { clearOpnameItemsStore, getOpnameItemsStore, type OpnameItemLocal } from "@/stores/opname-items-store";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useFinalizeOpname,
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
import { OpnameItemsTable } from "./opname-items-table";
import { OpnameScannerCard } from "./opname-scanner-card";
import { OpnameStatsCards } from "./opname-stats-cards";

interface OpnameItemsPageProps {
  opnameId: string;
}

export function OpnameItemsPage({ opnameId }: OpnameItemsPageProps) {
  const router = useRouter();
  const { data: opname, isLoading: opnameLoading } = useOpnameDetail(opnameId);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    per_page: 500,
  });

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

  const products = productsData?.data || [];

  const updateOpname = useUpdateOpname();
  const updateOpnameItems = useUpdateOpnameItems();
  const finalizeOpname = useFinalizeOpname();

  // Zustand Store scoped for this opnameId
  const useStore = getOpnameItemsStore(opnameId);
  const items = useStore((state) => state.items);
  const addItem = useStore((state) => state.addItem);
  const updateItem = useStore((state) => state.updateItem);
  const removeItem = useStore((state) => state.removeItem);
  const setItems = useStore((state) => state.setItems);
  const clearAll = useStore((state) => state.clearAll);

  const [isConfirmFinalizeOpen, setIsConfirmFinalizeOpen] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isImportDraftOpen, setIsImportDraftOpen] = useState(false);

  const isFirstLoad = useRef(true);

  // Sync initial items from database if store is empty
  useEffect(() => {
    if (!isFirstLoad.current || opnameLoading || !opname) return;

    if (items.length === 0 && opname.items && opname.items.length > 0) {
      const formatted: OpnameItemLocal[] = opname.items.map((dbItem: OpnameItem) => ({
        temp_uid: `db-${dbItem.uid || Math.random().toString(36).substring(2, 9)}`,
        product_uid: dbItem.product_uid,
        brand_uid: dbItem.brand_uid || dbItem.product?.brand_uid || dbItem.brand?.uid || null,
        category_uid: dbItem.category_uid || dbItem.product?.category_uid || dbItem.category?.uid || null,
        nama: dbItem.product?.nama || "Produk",
        barcode: dbItem.product?.barcode || "",
        stok_sistem: dbItem.stok_sistem,
        stok_fisik: dbItem.stok_fisik,
        alasan: dbItem.alasan || "Opname rutin",
      }));
      setItems(formatted);
    }
    isFirstLoad.current = false;
  }, [items.length, opname, opnameLoading, setItems]);

  const handleImportDraftSuccess = (newItems?: OpnameItem[]) => {
    if (newItems && newItems.length > 0) {
      const formatted: OpnameItemLocal[] = newItems.map((dbItem: OpnameItem) => ({
        temp_uid: `db-${dbItem.uid || Math.random().toString(36).substring(2, 9)}`,
        product_uid: dbItem.product_uid,
        brand_uid: dbItem.brand_uid || dbItem.product?.brand_uid || dbItem.brand?.uid || null,
        category_uid: dbItem.category_uid || dbItem.product?.category_uid || dbItem.category?.uid || null,
        nama: dbItem.product?.nama || "Produk",
        barcode: dbItem.product?.barcode || "",
        stok_sistem: dbItem.stok_sistem,
        stok_fisik: dbItem.stok_fisik,
        alasan: dbItem.alasan || "Opname rutin",
      }));
      setItems(formatted);
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
    const existing = items.find((i) => i.product_uid === product.uid);
    if (existing) {
      const newCount = (Number(existing.stok_fisik) || 0) + 1;
      addItem({
        product_uid: product.uid,
        brand_uid: product.brand_uid || product.brand?.uid || null,
        category_uid: product.category_uid || product.category?.uid || null,
        barcode: product.barcode,
        nama: product.nama,
        stok_sistem: product.stok,
        stok_fisik: newCount,
        alasan: existing.alasan || "Opname rutin",
      });
      toast.success(`Jumlah ${product.nama} (+1): ${newCount} pcs`);
    } else {
      addItem({
        product_uid: product.uid,
        brand_uid: product.brand_uid || product.brand?.uid || null,
        category_uid: product.category_uid || product.category?.uid || null,
        barcode: product.barcode,
        nama: product.nama,
        stok_sistem: product.stok,
        stok_fisik: 1,
        alasan: "Opname rutin",
      });
      toast.success(`Ditambahkan: ${product.nama} (1 pcs)`);
    }

    setTimeout(() => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      const element = document.getElementById(`opname-card-${product.uid}`) || document.getElementById(`opname-item-${product.uid}`);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: isMobile ? "center" : "nearest",
        });
        element.classList.add("ring-2", "ring-emerald-400/50");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-emerald-400/50");
        }, 1400);
      }

      const qtyInput = document.getElementById(`opname-qty-${product.uid}`) as HTMLInputElement | null;
      if (qtyInput) {
        qtyInput.focus();
        qtyInput.select();
      }
    }, 80);
  };

  const handleSaveDraft = async (showToast = true) => {
    if (items.length === 0) {
      if (showToast) toast.error("Daftar barang opname masih kosong.");
      return false;
    }

    const payload = {
      items: items.map((item) => ({
        product_uid: item.product_uid,
        brand_uid: item.brand_uid || null,
        category_uid: item.category_uid || null,
        stok_fisik: Number(item.stok_fisik) || 0,
        alasan: item.alasan || "Opname rutin",
      })),
    };

    try {
      await updateOpnameItems.mutateAsync({
        uid: opnameId,
        data: payload,
      });
      if (showToast) toast.success("Draf stock opname berhasil disimpan.");
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      if (showToast) toast.error(error.message || "Gagal menyimpan draf.");
      return false;
    }
  };

  const handleFinalize = async () => {
    if (items.length === 0) {
      toast.error("Harap tambahkan minimal 1 barang sebelum finalisasi.");
      return;
    }

    const saveSuccess = await handleSaveDraft(false);
    if (!saveSuccess) {
      toast.error("Gagal menyimpan draf sebelum finalisasi.");
      return;
    }

    try {
      await finalizeOpname.mutateAsync(opnameId);
      toast.success("Proses finalisasi stock opname selesai!");
      clearAll();
      clearOpnameItemsStore(opnameId);
      router.push(ROUTES.ADMIN_STOCK);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Gagal memfinalisasi stock opname.");
    } finally {
      setIsConfirmFinalizeOpen(false);
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
        itemsCount={items.length}
        isPendingSave={updateOpnameItems.isPending}
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
        totalCount={items.length}
        matchCount={stats.match}
        positiveCount={stats.positive}
        negativeCount={stats.negative}
      />

      {/* ── Scanner Card ── */}
      <OpnameScannerCard
        products={products}
        disabled={productsLoading || updateOpnameItems.isPending}
        onProductFound={handleProductFound}
      />

      {/* ── Items Container ── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs overflow-hidden">
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900">
              Daftar Perhitungan Fisik
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-full">
              {items.length} Item
            </span>
          </div>
          {items.length > 0 && (
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

        {/* Responsive Table / Card View with Client Pagination (10 per page, virtualized) */}
        <OpnameItemsTable
          items={items}
          categoryOptions={categoryOptions}
          brandOptions={brandOptions}
          updateItem={updateItem}
          removeItem={removeItem}
          onFocusBarcode={handleFocusBarcode}
        />
      </div>

      {/* ── Mobile Sticky Bottom Action Bar ── */}
      <OpnameItemsMobileBar
        itemsCount={items.length}
        stats={stats}
        isPendingSave={updateOpnameItems.isPending}
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
