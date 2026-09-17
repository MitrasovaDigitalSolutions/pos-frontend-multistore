"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { CommandOption } from "@/components/ui/command-select";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { STORE_LABEL_HQ } from "@/constants/store";
import type { Product } from "@/features/master/products/types";
import { useStores } from "@/features/stores/api/stores-api";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useTransferTutorialStore } from "@/stores/transfer-tutorial-store";
import {
  MOCK_STOCK_TRANSFER_DEST_STORE,
  MOCK_STOCK_TRANSFER_NOTE,
} from "../tutorial/constants/transfer-tutorial-constants";
import type { TransferTutorialPreSnapshot } from "../tutorial/types/transfer-tutorial";
import {
  useCreateStockTransfer,
  useStockTransferDetail,
  useUpdateStockTransfer,
} from "../api/stock-transfer-api";

import { TransferCreateHeader } from "./create/transfer-create-header";
import { TransferItemsSection, type TransferItem } from "./create/transfer-items-section";
import { TransferRouteCard } from "./create/transfer-route-card";
import { TransferSummaryCard } from "./create/transfer-summary-card";

interface TransferCreatePageProps {
  editUid?: string;
}

export function TransferCreatePage({ editUid }: TransferCreatePageProps) {
  const router = useAppRouter();
  const { data: session, status } = useSession();
  const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);
  const activeStore = session?.user?.stores?.find((s) => s.uid === activeStoreUid);
  const isTutorialRunning = useTransferTutorialStore(
    (state) => state.isRunning && state.activeTutorial === "stock_transfer_create"
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const { data: storesRes } = useStores({ per_page: 1000 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rawStores = storesRes?.data ?? [];
  const stores = useMemo(() => {
    if (isTutorialRunning && !rawStores.some((s) => s.uid === MOCK_STOCK_TRANSFER_DEST_STORE.uid)) {
      return [...rawStores, MOCK_STOCK_TRANSFER_DEST_STORE as unknown as (typeof rawStores)[0]];
    }
    return rawStores.filter((s) => !s.uid.startsWith("mock-"));
  }, [rawStores, isTutorialRunning]);

  const destStores = useMemo(() => {
    return stores.filter((s) => s.uid !== activeStoreUid);
  }, [stores, activeStoreUid]);

  const storeOptions: CommandOption[] = useMemo(() => {
    return destStores.map((s) => ({
      value: s.uid,
      label: `${s.nama}${s.is_central ? ` (${STORE_LABEL_HQ})` : ""}`,
    }));
  }, [destStores]);

  const [destinationUid, setDestinationUid] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState<TransferItem[]>([]);
  const [prefilled, setPrefilled] = useState(false);

  // Snapshot on tutorial start
  useEffect(() => {
    if (isTutorialRunning) {
      const currentSnap = useTransferTutorialStore.getState().preSnapshot;
      if (!currentSnap) {
        useTransferTutorialStore.getState().saveSnapshot({
          destinationUid,
          catatan,
          stockItems: items,
        });
      }
    }
  }, [isTutorialRunning, destinationUid, catatan, items]);

  // Purge mock selections when tutorial is not running
  useEffect(() => {
    if (!isTutorialRunning) {
      if (destinationUid.startsWith("mock-")) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDestinationUid("");
      }
      if (catatan === MOCK_STOCK_TRANSFER_NOTE || catatan.includes("Cabang Malang")) {
        setCatatan("");
      }
      if (items.some((i) => i.product_uid.startsWith("mock-") || i.barcode === "8991111222333" || i.barcode === "8994444555666")) {
        setItems((prev) => prev.filter((i) => !i.product_uid.startsWith("mock-") && i.barcode !== "8991111222333" && i.barcode !== "8994444555666"));
      }
    }
  }, [isTutorialRunning, destinationUid, catatan, items]);

  // Listen to custom events from transfer tutorial
  useEffect(() => {
    const handleSetField = (e: Event) => {
      const customEvent = e as CustomEvent<{ field: string; value: unknown }>;
      if (customEvent.detail) {
        const { field, value } = customEvent.detail;
        if (field === "destination_uid" || field === "store_uid_destination") {
          setDestinationUid(String(value || ""));
        }
        if (field === "catatan") {
          setCatatan(String(value || ""));
        }
      }
    };

    const handleInjectItems = (e: Event) => {
      const customEvent = e as CustomEvent<{ items: TransferItem[] }>;
      if (customEvent.detail?.items) {
        setItems(customEvent.detail.items);
      }
    };

    const handleClearItems = () => {
      setItems((prev) => prev.filter((i) => !i.product_uid.startsWith("mock-") && i.barcode !== "8991111222333" && i.barcode !== "8994444555666"));
      setDestinationUid((prev) => (prev.startsWith("mock-") ? "" : prev));
      setCatatan((prev) => (prev === MOCK_STOCK_TRANSFER_NOTE || prev.includes("Cabang Malang") ? "" : prev));
    };

    const handleRestoreSnapshot = (e: Event) => {
      const customEvent = e as CustomEvent<TransferTutorialPreSnapshot>;
      if (customEvent.detail) {
        const snap = customEvent.detail;
        if (snap.destinationUid !== undefined) setDestinationUid(snap.destinationUid);
        if (snap.catatan !== undefined) setCatatan(snap.catatan);
        if (snap.stockItems !== undefined) setItems(snap.stockItems);
      }
    };

    window.addEventListener("transfer-tutorial-set-field", handleSetField);
    window.addEventListener("transfer-tutorial-inject-items", handleInjectItems);
    window.addEventListener("transfer-tutorial-clear-items", handleClearItems);
    window.addEventListener("transfer-tutorial-restore-snapshot", handleRestoreSnapshot);

    return () => {
      window.removeEventListener("transfer-tutorial-set-field", handleSetField);
      window.removeEventListener("transfer-tutorial-inject-items", handleInjectItems);
      window.removeEventListener("transfer-tutorial-clear-items", handleClearItems);
      window.removeEventListener("transfer-tutorial-restore-snapshot", handleRestoreSnapshot);
    };
  }, []);

  const createMutation = useCreateStockTransfer();
  const updateMutation = useUpdateStockTransfer();
  const { data: detailData, isLoading: detailLoading } = useStockTransferDetail(editUid || "");

  useEffect(() => {
    let active = true;
    if (editUid && detailData && !prefilled) {
      if (active) {
        setTimeout(() => {
          if (active) {
            setDestinationUid(detailData.store_uid_destination || "");
            setCatatan(detailData.catatan || "");
            setItems(
              detailData.items.map((item) => ({
                product_uid: item.product_uid,
                nama: item.product?.nama || "Unknown",
                barcode: item.product?.barcode || null,
                kuantitas: item.kuantitas,
              }))
            );
            setPrefilled(true);
          }
        }, 0);
      }
    }
    return () => {
      active = false;
    };
  }, [editUid, detailData, prefilled]);

  if (!mounted || status === "loading" || (editUid && detailLoading)) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-48 rounded-lg" />
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
          </div>
        </div>

        {/* Form Body Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {/* Route Card Skeleton */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs space-y-4">
              <Skeleton className="h-4 w-36 rounded-md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>

            {/* Items Section Skeleton */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs space-y-4">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>

          {/* Summary Card Skeleton */}
          <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-2xs space-y-4">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const selectedDestStore = stores.find((s) => s.uid === destinationUid);

  const handleProductFound = (product: Product) => {
    const existing = items.find((i) => i.product_uid === product.uid);
    if (existing) {
      const others = items.filter((i) => i.product_uid !== product.uid);
      setItems([{ ...existing, kuantitas: existing.kuantitas + 1 }, ...others]);
      toast.success(`Qty "${product.nama}" ditambah (+1).`);
      return;
    }
    setItems([
      {
        product_uid: product.uid,
        nama: product.nama,
        barcode: product.barcode,
        stok_tersedia: product.stok,
        kuantitas: 1,
      },
      ...items,
    ]);
    toast.success(`"${product.nama}" ditambahkan ke daftar`);
  };

  const updateQty = (uid: string, qty: number) => {
    const validQty = Math.max(1, qty);
    setItems(items.map((i) => (i.product_uid === uid ? { ...i, kuantitas: validQty } : i)));
  };

  const removeItem = (uid: string) => {
    setItems(items.filter((i) => i.product_uid !== uid));
  };

  const totalJenis = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.kuantitas, 0);

  const handleSubmit = () => {
    if (!destinationUid) return toast.error("Pilih toko tujuan pengiriman!");
    if (items.length === 0) return toast.error("Minimal tambahkan 1 barang ke dalam daftar transfer");
    if (items.some((i) => i.kuantitas <= 0)) return toast.error("Kuantitas pengiriman harus lebih dari 0");

    if (isTutorialRunning || destinationUid.startsWith("mock-") || items.some((it) => it.product_uid.startsWith("mock-"))) {
      toast.success("Simulasi: Draft transfer stok berhasil disimpan (Mode Panduan)!");
      return;
    }

    const payload = {
      store_uid_destination: destinationUid,
      catatan: catatan || undefined,
      items: items.map((i) => ({ product_uid: i.product_uid, kuantitas: i.kuantitas })),
    };

    if (editUid) {
      updateMutation.mutate(
        { uid: editUid, payload },
        {
          onSuccess: (res) => {
            toast.success("Transfer draft berhasil diperbarui!");
            router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/${res.data.uid}`);
          },
          onError: (err) => toast.error(err.message || "Gagal memperbarui transfer stok"),
        }
      );
    } else {
      createMutation.mutate(
        payload,
        {
          onSuccess: (res) => {
            toast.success("Draft transfer stok berhasil disimpan!");
            router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/${res.data.uid}`);
          },
          onError: (err) => toast.error(err.message || "Gagal membuat transfer stok"),
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <TransferCreateHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <TransferRouteCard
            activeStoreName={activeStore?.nama}
            isCentralStore={activeStore?.is_central}
            storeOptions={storeOptions}
            destinationUid={destinationUid}
            setDestinationUid={setDestinationUid}
            catatan={catatan}
            setCatatan={setCatatan}
          />

          <TransferItemsSection
            items={items}
            onProductFound={handleProductFound}
            onUpdateQty={updateQty}
            onRemoveItem={removeItem}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <TransferSummaryCard
            activeStoreName={activeStore?.nama}
            destinationStoreName={selectedDestStore?.nama}
            totalJenis={totalJenis}
            totalQty={totalQty}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending || updateMutation.isPending}
            canSubmit={items.length > 0 && !!destinationUid}
          />
        </div>
      </div>
    </div>
  );
}
