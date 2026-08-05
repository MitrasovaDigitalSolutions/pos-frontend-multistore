"use client";

import { IconMinus, IconPackage, IconPlus, IconTrash } from "@tabler/icons-react";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { NumberInput } from "@/components/ui/number-input";
import type { Product } from "@/features/master/products/types";

export interface TransferItem {
  product_uid: string;
  nama: string;
  barcode?: string | null;
  stok_tersedia?: number;
  kuantitas: number;
}

interface TransferItemsSectionProps {
  items: TransferItem[];
  onProductFound: (product: Product) => void;
  onUpdateQty: (uid: string, qty: number) => void;
  onRemoveItem: (uid: string) => void;
}

export function TransferItemsSection({
  items,
  onProductFound,
  onUpdateQty,
  onRemoveItem,
}: TransferItemsSectionProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <IconPackage size={16} className="text-emerald-600" />
          <span>Pilih Barang untuk Ditransfer</span>
        </h3>
        <span className="text-xs text-slate-400 font-medium">Scan barcode atau cari nama produk</span>
      </div>

      <BarcodeInput
        onProductFound={onProductFound}
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
                        onClick={() => onUpdateQty(item.product_uid, item.kuantitas - 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <IconMinus size={13} />
                      </button>
                      <NumberInput
                        value={item.kuantitas}
                        onChange={(val) => onUpdateQty(item.product_uid, val || 1)}
                        min={1}
                        allowNegative={false}
                        className="h-7 w-16 text-center text-xs font-bold border-slate-200 rounded-lg px-1"
                      />
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.product_uid, item.kuantitas + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <IconPlus size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product_uid)}
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
  );
}
