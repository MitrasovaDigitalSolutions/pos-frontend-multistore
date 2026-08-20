"use client";

import { AppButton } from "@/components/shared/app-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ROUTES } from "@/constants/routes";
import {
  useFinalizeOpname,
  useOpnameDetail,
  useUpdateOpname,
  useUpdateOpnameItems,
} from "../../api/stock-api";
import type { Product } from "@/features/master/products/types";
import { useProducts } from "@/features/master/products/api/products-api";
import {
  clearOpnameItemsStore,
  getOpnameItemsStore,
  type OpnameItemLocal,
} from "@/stores/opname-items-store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EditHeaderDialog } from "./edit-header-dialog";
import { OpnameInstructions } from "./opname-instructions";
import { OpnameItemsHeader } from "./opname-items-header";
import { OpnameItemsMobileList } from "./opname-items-mobile-list";
import { OpnameItemsTable } from "./opname-items-table";
import { OpnameScannerCard } from "./opname-scanner-card";
import { OpnameStatsCards } from "./opname-stats-cards";
import type { OpnameItem } from "../../types";

interface OpnameItemsPageProps {
  opnameId: string;
}

export function OpnameItemsPage({ opnameId }: OpnameItemsPageProps) {
  const router = useRouter();
  const { data: opname, isLoading: opnameLoading } = useOpnameDetail(opnameId);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    per_page: 500,
  });

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
  const [isEditHeaderOpen, setIsEditHeaderOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // Sync DB Items to Local Zustand Store on first load
  const dbItems = opname?.items;
  useEffect(() => {
    if (dbItems && dbItems.length > 0) {
      const currentStoreItems = useStore.getState().items;
      if (!currentStoreItems || currentStoreItems.length === 0) {
        const formatted: OpnameItemLocal[] = dbItems.map((dbItem: OpnameItem) => ({
          temp_uid: `db-${dbItem.uid}`,
          product_uid: dbItem.product_uid,
          nama: dbItem.product?.nama || "Produk",
          barcode: dbItem.product?.barcode || "",
          stok_sistem: dbItem.stok_sistem,
          stok_fisik: dbItem.stok_fisik,
          alasan: dbItem.alasan || "Opname rutin",
        }));
        setItems(formatted);
      }
    }
  }, [dbItems, opnameId, setItems, useStore]);

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

  const handleProductFound = (product: Product) => {
    const existing = items.find((i: OpnameItemLocal) => i.product_uid === product.uid);
    if (existing) {
      const newCount = (Number(existing.stok_fisik) || 0) + 1;
      addItem({
        product_uid: product.uid,
        barcode: product.barcode,
        nama: product.nama,
        stok_sistem: product.stok,
        stok_fisik: newCount,
        alasan: existing.alasan || "Opname rutin",
      });
      toast.success(`Jumlah ${product.nama} (+1): sekarang ${newCount} pcs`);
    } else {
      addItem({
        product_uid: product.uid,
        barcode: product.barcode,
        nama: product.nama,
        stok_sistem: product.stok,
        stok_fisik: 1,
        alasan: "Opname rutin",
      });
      toast.success(`Ditambahkan: ${product.nama} (1 pcs)`);
    }

    // Scroll and highlight the added product at the top
    setTimeout(() => {
      const isMobile =
        typeof window !== "undefined" && window.innerWidth < 768;
      const element = document.getElementById(
        isMobile
          ? `opname-card-${product.uid}`
          : `opname-item-${product.uid}`
      );
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: isMobile ? "center" : "nearest",
        });
        element.classList.add("bg-emerald-50", "ring-2", "ring-emerald-400/50");
        setTimeout(() => {
          element.classList.remove(
            "bg-emerald-50",
            "ring-2",
            "ring-emerald-400/50"
          );
        }, 1400);
      }
    }, 120);
  };

  const handleSaveDraft = async (showToast = true) => {
    if (items.length === 0) {
      if (showToast) toast.error("Daftar barang opname masih kosong.");
      return false;
    }

    const payload = {
      items: items.map((item: OpnameItemLocal) => ({
        product_uid: item.product_uid,
        stok_fisik: item.stok_fisik,
        alasan: item.alasan || "Opname rutin",
      })),
    };

    try {
      await updateOpnameItems.mutateAsync({
        uid: opnameId,
        data: payload,
      });
      if (showToast)
        toast.success(
          "Daftar barang stock opname berhasil disimpan sebagai draf."
        );
      return true;
    } catch (err: unknown) {
      const error = err as { message?: string };
      if (showToast)
        toast.error(error.message || "Gagal menyimpan draf barang.");
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
      toast.error("Gagal menyimpan items sebelum finalisasi.");
      return;
    }

    try {
      await finalizeOpname.mutateAsync(opnameId);
      toast.success("Proses finalisasi stock opname berhasil!");
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
    if (
      confirm(
        "Apakah Anda yakin ingin mengosongkan daftar barang lokal? Perubahan yang belum disimpan akan hilang."
      )
    ) {
      clearAll();
      toast.info("Daftar barang lokal dikosongkan.");
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

  // Calculate discrepancy stats
  const stats = items.reduce(
    (acc: { positive: number; negative: number; match: number }, item: OpnameItemLocal) => {
      const diff = item.stok_fisik - item.stok_sistem;
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

        {/* Desktop View */}
        <OpnameItemsTable
          items={items}
          updateItem={updateItem}
          removeItem={removeItem}
        />

        {/* Mobile View */}
        <OpnameItemsMobileList
          items={items}
          updateItem={updateItem}
          removeItem={removeItem}
          stats={stats}
          isPendingSave={updateOpnameItems.isPending}
          isPendingFinalize={finalizeOpname.isPending}
          onSaveDraft={() => handleSaveDraft(true)}
          onOpenFinalize={() => setIsConfirmFinalizeOpen(true)}
        />
      </div>

      {/* ── Modals ── */}
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

      <EditHeaderDialog
        open={isEditHeaderOpen}
        onOpenChange={setIsEditHeaderOpen}
        opname={opname}
        onSave={handleSaveCatatan}
        isPending={updateOpname.isPending}
      />
    </div>
  );
}
