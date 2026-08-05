"use client";

import { IconLoader2 } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { CommandOption } from "@/components/ui/command-select";
import { ROUTES } from "@/constants/routes";
import type { Product } from "@/features/master/products/types";
import { useStores } from "@/features/stores/api/stores-api";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
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


  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const { data: storesRes } = useStores({ per_page: 1000 });
  const stores = storesRes?.data ?? [];
  const destStores = stores.filter((s) => s.uid !== activeStoreUid);
  const storeOptions: CommandOption[] = destStores.map((s) => ({
    value: s.uid,
    label: `${s.nama}${s.is_central ? " (Toko Pusat)" : ""}`,
  }));

  const [destinationUid, setDestinationUid] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState<TransferItem[]>([]);
  const [prefilled, setPrefilled] = useState(false);

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
      <div className="p-12 flex flex-col items-center justify-center min-h-[380px] space-y-3 bg-white rounded-2xl border border-slate-100 shadow-sm max-w-2xl mx-auto my-6">
        <IconLoader2 size={32} className="animate-spin text-emerald-600" />
        <p className="text-xs text-slate-400 font-medium">Memuat lokasi toko...</p>
      </div>
    );
  }

  const selectedDestStore = stores.find((s) => s.uid === destinationUid);

  const handleProductFound = (product: Product) => {
    if (items.some((i) => i.product_uid === product.uid)) {
      toast.error(`Produk "${product.nama}" sudah ada di daftar pengiriman`);
      return;
    }
    setItems([
      ...items,
      {
        product_uid: product.uid,
        nama: product.nama,
        barcode: product.barcode,
        stok_tersedia: product.stok,
        kuantitas: 1,
      },
    ]);
    toast.success(`"${product.nama}" ditambahkan`);
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <TransferCreateHeader />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
