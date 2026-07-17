"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useStores } from "@/features/stores/api/stores-api";
import { useCreateStockTransfer } from "../api/stock-transfer-api";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useAppRouter } from "@/hooks/use-app-router";
import { ROUTES } from "@/constants/routes";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { IconArrowLeft, IconTrash, IconDeviceFloppy } from "@tabler/icons-react";
import { toast } from "sonner";
import { AccessDeniedState } from "@/components/ui/access-denied-state";

interface TransferItem {
  product_uid: string;
  nama: string;
  kuantitas: number;
}

export function TransferCreatePage() {
  const router = useAppRouter();
  const { data: session } = useSession();
  const activeStoreUid = useActiveStoreStore((state) => state.activeStoreUid);
  const activeStore = session?.user?.stores?.find((s) => s.uid === activeStoreUid);

  const { data: storesRes } = useStores({ per_page: 1000 });
  const stores = storesRes?.data ?? [];
  const destStores = stores.filter((s) => s.uid !== activeStoreUid);
  const storeOptions: CommandOption[] = destStores.map((s) => ({ value: s.uid, label: s.nama }));

  const [destinationUid, setDestinationUid] = useState<string>("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState<TransferItem[]>([]);
  const createMutation = useCreateStockTransfer();

  if (!activeStore?.is_central) {
    return (
      <AccessDeniedState
        title="Restriksi Toko Pusat"
        description="Hanya toko Pusat yang dapat membuat pengiriman / transfer stok ke cabang lain."
        requiredPermission="store_central"
      />
    );
  }

  const handleProductFound = (product: { uid: string; nama: string }) => {
    if (items.some((i) => i.product_uid === product.uid)) {
      toast.error("Produk sudah ada di daftar");
      return;
    }
    setItems([...items, { product_uid: product.uid, nama: product.nama, kuantitas: 1 }]);
  };

  const updateQty = (uid: string, qty: number) => {
    setItems(items.map((i) => (i.product_uid === uid ? { ...i, kuantitas: qty } : i)));
  };

  const removeItem = (uid: string) => {
    setItems(items.filter((i) => i.product_uid !== uid));
  };

  const handleSubmit = () => {
    if (!destinationUid) return toast.error("Toko tujuan wajib dipilih");
    if (items.length === 0) return toast.error("Minimal 1 produk");
    if (items.some((i) => i.kuantitas <= 0)) return toast.error("Kuantitas harus > 0");

    createMutation.mutate(
      {
        store_uid_destination: destinationUid,
        catatan: catatan || undefined,
        items: items.map((i) => ({ product_uid: i.product_uid, kuantitas: i.kuantitas })),
      },
      {
        onSuccess: (res) => {
          toast.success("Transfer berhasil dibuat");
          router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/${res.data.uid}`);
        },
        onError: (err) => toast.error(err.message || "Gagal membuat transfer"),
      },
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()} className="h-9 w-9 p-0 rounded-xl">
          <IconArrowLeft size={18} />
        </Button>
        <h2 className="text-lg font-bold">Buat Transfer Stok</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">Toko Tujuan</label>
            <CommandSelect
              options={storeOptions}
              value={destinationUid}
              onChange={setDestinationUid}
              placeholder="Pilih toko tujuan"
              searchPlaceholder="Cari toko..."
              emptyMessage="Tidak ada toko tujuan"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600">Catatan</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Opsional"
              className="w-full resize-none h-[42px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-600">Cari Produk</label>
          <BarcodeInput
            onProductFound={handleProductFound}
            placeholder="Scan barcode atau ketik nama/SKU..."
          />
        </div>

        {items.length > 0 && (
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-700">Produk</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 w-32">Kuantitas</th>
                  <th className="px-4 py-3 font-semibold text-slate-700 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.product_uid}>
                    <td className="px-4 py-3">{item.nama}</td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0.001"
                        step="1"
                        value={item.kuantitas}
                        onChange={(e) => updateQty(item.product_uid, parseFloat(e.target.value) || 0)}
                        className="h-8"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.product_uid)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <IconTrash size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <IconDeviceFloppy size={16} className="mr-2" /> Simpan Draft
          </Button>
        </div>
      </div>
    </div>
  );
}
