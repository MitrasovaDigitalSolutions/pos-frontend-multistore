"use client";

import { ROUTES } from "@/constants/routes";
import { useStores } from "@/features/stores/api/stores-api";
import { useAppRouter } from "@/hooks/use-app-router";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useCreateStockTransfer } from "../api/stock-transfer-api";

import { BarcodeInput } from "@/components/shared/barcode-input";
import { AccessDeniedState } from "@/components/ui/access-denied-state";
import { Button } from "@/components/ui/button";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { NumberInput } from "@/components/ui/number-input";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingStore,
  IconDeviceFloppy,
  IconInfoCircle,
  IconMinus,
  IconNotes,
  IconPackage,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

import type { Product } from "@/features/master/products/types";

interface TransferItem {
  product_uid: string;
  nama: string;
  barcode?: string | null;
  stok_tersedia?: number;
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
  const storeOptions: CommandOption[] = destStores.map((s) => ({
    value: s.uid,
    label: `${s.nama}${s.is_central ? " (Toko Pusat)" : ""}`,
  }));

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

    createMutation.mutate(
      {
        store_uid_destination: destinationUid,
        catatan: catatan || undefined,
        items: items.map((i) => ({ product_uid: i.product_uid, kuantitas: i.kuantitas })),
      },
      {
        onSuccess: (res) => {
          toast.success("Draft transfer stok berhasil disimpan!");
          router.push(`${ROUTES.ADMIN_STOCK_TRANSFERS}/${res.data.uid}`);
        },
        onError: (err) => toast.error(err.message || "Gagal membuat transfer stok"),
      }
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white"
        >
          <IconArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Buat Transfer Stok Baru</h2>
          <p className="text-xs text-slate-400">Pilih cabang tujuan dan tentukan jumlah barang yang dikirim.</p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Details & Items */}
        <div className="lg:col-span-8 space-y-6">
          {/* Visual Route Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconBuildingStore size={16} className="text-emerald-600" />
              <span>Rute Distribusi Toko</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
              {/* Asal */}
              <div className="sm:col-span-5 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Toko Asal (Pengirim)
                </span>
                <p className="font-bold text-slate-900 text-sm">{activeStore?.nama || "Toko Pusat"}</p>
                <span className="inline-block text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Pusat Aktif
                </span>
              </div>

              {/* Arrow */}
              <div className="sm:col-span-1 flex justify-center py-1">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <IconArrowRight size={16} />
                </div>
              </div>

              {/* Tujuan */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Toko Tujuan (Penerima) *
                </label>
                <CommandSelect
                  options={storeOptions}
                  value={destinationUid}
                  onChange={setDestinationUid}
                  placeholder="Pilih cabang tujuan..."
                  searchPlaceholder="Cari toko cabang..."
                  emptyMessage="Tidak ada toko cabang terdaftar"
                />
              </div>
            </div>

            {/* Catatan Field */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <IconNotes size={15} className="text-slate-400" />
                Catatan Pengiriman (Opsional)
              </label>
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Misal: Pengiriman stok mingguan cabang ABC..."
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Product Search & Scanner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <IconPackage size={16} className="text-emerald-600" />
                <span>Pilih Barang untuk Ditransfer</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Scan barcode atau cari nama produk</span>
            </div>

            <BarcodeInput
              onProductFound={handleProductFound}
              placeholder="Scan barcode SKU atau ketik nama barang..."
            />

            {/* Selected Items Table */}
            {items.length > 0 ? (
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Nama Produk</th>
                      <th className="px-4 py-3 text-center w-28">Kuantitas</th>
                      <th className="px-4 py-3 text-center w-12">Hapus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item) => (
                      <tr key={item.product_uid} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          <div className="flex flex-col">
                            <span>{item.nama}</span>
                            {item.barcode && (
                              <span className="text-[10px] font-mono text-slate-400">{item.barcode}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateQty(item.product_uid, item.kuantitas - 1)}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                            >
                              <IconMinus size={13} />
                            </button>
                            <NumberInput
                              value={item.kuantitas}
                              onChange={(val) => updateQty(item.product_uid, val || 1)}
                              min={1}
                              allowNegative={false}
                              className="h-7 w-16 text-center text-xs font-bold border-slate-200 rounded-lg px-1"
                            />
                            <button
                              type="button"
                              onClick={() => updateQty(item.product_uid, item.kuantitas + 1)}
                              className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                            >
                              <IconPlus size={13} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeItem(item.product_uid)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                          >
                            <IconTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-2">
                <IconPackage size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">Daftar Produk Masih Kosong</p>
                <p className="text-[11px] text-slate-400">
                  Gunakan pencarian barcode atau nama barang di atas untuk menambahkan produk yang ingin ditransfer.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 space-y-5 sticky top-6">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-50 pb-3">
              Ringkasan Transfer
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-600">
                <span>Toko Pengirim:</span>
                <span className="font-bold text-slate-800">{activeStore?.nama || "Toko Pusat"}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Toko Penerima:</span>
                <span className="font-bold text-emerald-700">
                  {selectedDestStore?.nama || "— Belum dipilih"}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pt-2 border-t border-slate-100">
                <span>Jenis Produk:</span>
                <span className="font-bold text-slate-900">{totalJenis} Barang</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Total Unit Dikirim:</span>
                <span className="font-extrabold text-slate-900 text-sm">{totalQty} pcs</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[11px] space-y-1">
              <div className="flex items-center gap-1 font-bold text-amber-900">
                <IconInfoCircle size={14} className="shrink-0 text-amber-600" />
                Info Alur Transfer:
              </div>
              <p className="text-[10px] leading-relaxed">
                Menyimpan transfer akan membuatnya berstatus <strong className="font-bold">Draft</strong>. Setelah diperiksa, tombol <strong className="font-bold">Finalize / Kirim</strong> pada halaman detail akan secara fisik memotong stok di toko pusat.
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || items.length === 0 || !destinationUid}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <IconDeviceFloppy size={16} />
              Simpan Draft Transfer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
