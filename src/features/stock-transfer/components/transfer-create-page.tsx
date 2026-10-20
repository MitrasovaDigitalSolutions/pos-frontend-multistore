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
import { useBranchPolicy } from "@/hooks/use-branch-policy";
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
import { TRANSFER_TYPE, type TransferType } from "../constants";
import {
  useConsignmentCommissionMode,
  type CommissionType,
} from "../hooks/use-consignment-commission-mode";

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

  const canTransferToOtherBranch = useBranchPolicy("branch_can_transfer_to_other_branch");

  const destStores = useMemo(() => {
    return stores.filter((s) => {
      if (s.uid === activeStoreUid) return false;
      if (!canTransferToOtherBranch && !s.is_central) return false;
      return true;
    });
  }, [stores, activeStoreUid, canTransferToOtherBranch]);

  const storeOptions: CommandOption[] = useMemo(() => {
    return destStores.map((s) => ({
      value: s.uid,
      label: `${s.nama}${s.is_central ? ` (${STORE_LABEL_HQ})` : ""}`,
    }));
  }, [destStores]);

  const [destinationUid, setDestinationUid] = useState<string>("");
  const [tipeTransfer, setTipeTransfer] = useState<TransferType>(TRANSFER_TYPE.REGULAR);
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
            if (detailData.tipe_transfer) {
              setTipeTransfer(detailData.tipe_transfer as TransferType);
            }
            setItems(
              detailData.items.map((item) => ({
                product_uid: item.product_uid,
                nama: item.product?.nama || "Unknown",
                barcode: item.product?.barcode || null,
                stok_tersedia: item.product?.stok,
                kuantitas: Number(item.kuantitas),
                tipe_komisi: (item.tipe_komisi as CommissionType) || "percentage",
                nilai_komisi: Number(item.nilai_komisi ?? 0),
                modal_pusat: Number(item.product?.harga_beli ?? 0),
                harga_dasar_pusat: Number(
                  item.product?.harga_jual ?? item.harga_jual_pusat ?? item.harga_jual_cabang ?? 0
                ),
                harga_pasok: item.harga_pasok_pusat
                  ? Number(item.harga_pasok_pusat)
                  : item.harga_beli_cabang
                  ? Number(item.harga_beli_cabang)
                  : undefined,
                harga_jual: item.harga_jual_pusat
                  ? Number(item.harga_jual_pusat)
                  : item.harga_jual_cabang
                  ? Number(item.harga_jual_cabang)
                  : undefined,
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

  const selectedDestStore = stores.find((s) => s.uid === destinationUid);
  const { calculatePricing } = useConsignmentCommissionMode();

  const handleProductFound = (product: Product) => {
    const existing = items.find((i) => i.product_uid === product.uid);
    if (existing) {
      const others = items.filter((i) => i.product_uid !== product.uid);
      setItems([{ ...existing, kuantitas: existing.kuantitas + 1 }, ...others]);
      toast.success(`Qty "${product.nama}" ditambah (+1).`);
      return;
    }
    const defaultHargaJual = product.harga_jual ?? product.harga ?? 0;
    const defaultModal = product.harga_beli ?? 0;

    setItems([
      {
        product_uid: product.uid,
        nama: product.nama,
        barcode: product.barcode,
        stok_tersedia: product.stok,
        kuantitas: 1,
        tipe_komisi: "percentage",
        nilai_komisi: 0,
        modal_pusat: defaultModal,
        harga_dasar_pusat: defaultHargaJual,
        harga_pasok: defaultModal,
        harga_jual: defaultHargaJual,
      },
      ...items,
    ]);
    toast.success(`"${product.nama}" ditambahkan ke daftar`);
  };

  const updateQty = (uid: string, qty: number) => {
    const validQty = Math.max(0.001, qty);
    setItems((prev) => prev.map((i) => (i.product_uid === uid ? { ...i, kuantitas: validQty } : i)));
  };

  const updateKomisi = (uid: string, tipe: CommissionType, nilai: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product_uid === uid
          ? { ...i, tipe_komisi: tipe, nilai_komisi: Math.max(0, nilai) }
          : i
      )
    );
  };

  const removeItem = (uid: string) => {
    setItems((prev) => prev.filter((i) => i.product_uid !== uid));
  };

  const isKonsinyasi = tipeTransfer === TRANSFER_TYPE.KONSINYASI_INTERNAL;
  const totalJenis = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.kuantitas, 0);

  const { totalNilaiPasok, totalNilaiRetail, totalEstimasiKomisi } = useMemo(() => {
    let pasokSum = 0;
    let retailSum = 0;
    let komisiSum = 0;

    for (const item of items) {
      if (isKonsinyasi) {
        const pricing = calculatePricing({
          modalPusat: item.modal_pusat ?? 0,
          hargaDasarPusat: item.harga_dasar_pusat ?? item.harga_jual ?? 0,
          tipeKomisi: item.tipe_komisi || "percentage",
          nilaiKomisi: item.nilai_komisi ?? 0,
          kuantitas: item.kuantitas,
        });
        pasokSum += pricing.totalWajibSetor;
        retailSum += pricing.totalOmzetRetail;
        komisiSum += pricing.totalLabaCabang;
      } else {
        const dasar = item.harga_dasar_pusat ?? item.harga_jual ?? 0;
        const subtotal = dasar * item.kuantitas;
        pasokSum += subtotal;
        retailSum += subtotal;
      }
    }

    return {
      totalNilaiPasok: pasokSum,
      totalNilaiRetail: retailSum,
      totalEstimasiKomisi: komisiSum,
    };
  }, [items, isKonsinyasi, calculatePricing]);

  const handleSubmit = () => {
    if (!destinationUid) return toast.error("Pilih toko tujuan pengiriman!");
    if (items.length === 0) return toast.error("Minimal tambahkan 1 barang ke dalam daftar transfer");
    if (items.some((i) => i.kuantitas <= 0)) return toast.error("Kuantitas pengiriman harus lebih dari 0");

    if (isTutorialRunning || destinationUid.startsWith("mock-")) {
      toast.success("Simulasi: Draft transfer stok berhasil disimpan (Mode Panduan)!");
      return;
    }

    const payload = {
      store_uid_destination: destinationUid,
      tipe_transfer: tipeTransfer,
      catatan: catatan || undefined,
      items: items.map((i) => ({
        product_uid: i.product_uid,
        kuantitas: Number(i.kuantitas),
        tipe_komisi: i.tipe_komisi || "percentage",
        nilai_komisi: Number(i.nilai_komisi || 0),
      })),
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
            tipeTransfer={tipeTransfer}
            setTipeTransfer={setTipeTransfer}
            catatan={catatan}
            setCatatan={setCatatan}
            isRestrictedToCentral={!canTransferToOtherBranch && !activeStore?.is_central}
          />

          <TransferItemsSection
            items={items}
            tipeTransfer={tipeTransfer}
            onProductFound={handleProductFound}
            onUpdateQty={updateQty}
            onUpdateKomisi={updateKomisi}
            onRemoveItem={removeItem}
          />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <TransferSummaryCard
            activeStoreName={activeStore?.nama}
            destinationStoreName={selectedDestStore?.nama}
            totalJenis={totalJenis}
            totalQty={totalQty}
            tipeTransfer={tipeTransfer}
            totalNilaiPasok={totalNilaiPasok}
            totalNilaiRetail={totalNilaiRetail}
            totalEstimasiKomisi={totalEstimasiKomisi}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending || updateMutation.isPending}
            canSubmit={items.length > 0 && !!destinationUid}
          />
        </div>
      </div>
    </div>
  );
}
