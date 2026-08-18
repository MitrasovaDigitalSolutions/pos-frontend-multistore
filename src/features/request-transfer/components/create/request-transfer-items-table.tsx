"use client";

import { useEffect, useRef, useState } from "react";
import { IconMinus, IconPackage, IconPlus, IconScan, IconTrash } from "@tabler/icons-react";
import { NumberInput } from "@/components/ui/number-input";
import { BarcodeInput } from "@/components/shared/barcode-input";
import type { Product } from "@/features/master/products/types";
import type { RequestLineItem } from "../../schemas/request-transfer-schema";

interface RequestTransferItemsTableProps {
  items: RequestLineItem[];
  totalQty: number;
  onProductFound: (product: Product) => void;
  onUpdateQty: (productUid: string, qty: number) => void;
  onRemoveItem: (productUid: string) => void;
}

export function RequestTransferItemsTable({
  items,
  totalQty,
  onProductFound,
  onUpdateQty,
  onRemoveItem,
}: RequestTransferItemsTableProps) {
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [lastScannedUid, setLastScannedUid] = useState<string | null>(null);

  const handleProductFoundWrapper = (product: Product) => {
    setLastScannedUid(product.uid);
    onProductFound(product);
  };

  useEffect(() => {
    if (lastScannedUid) {
      const timer = setTimeout(() => {
        const inputEl = qtyInputRefs.current.get(lastScannedUid);
        if (inputEl) {
          inputEl.focus();
          inputEl.select();
        }
        setLastScannedUid(null);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [items, lastScannedUid]);

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
            <IconPackage size={15} />
          </div>
          <span>Daftar Barang Request</span>
        </h3>
        {items.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
            {items.length} Produk ({totalQty} unit)
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 font-medium">Langkah 2 dari 2</span>
        )}
      </div>

      {/* Barcode Scanner Box */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <IconScan size={13} className="text-emerald-600" />
          <span>Cari / Scan Produk</span>
        </label>
        <BarcodeInput
          ref={barcodeInputRef}
          refocusOnFound={false}
          onProductFound={handleProductFoundWrapper}
          placeholder="Scan barcode SKU atau ketik nama produk..."
        />
      </div>

      {/* Selected Items Table */}
      {items.length > 0 ? (
        <div className="border border-slate-100 rounded-xl overflow-x-auto shadow-2xs">
          <table className="w-full text-xs text-left min-w-[380px]">
            <thead className="bg-slate-50/80 border-b border-slate-100 font-bold text-slate-600">
              <tr>
                <th className="px-3.5 py-2.5">Produk</th>
                <th className="px-3.5 py-2.5 text-center w-36">Kuantitas</th>
                <th className="px-3 py-2.5 text-center w-12">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {items.map((item) => (
                <tr key={item.product_uid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-3.5 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-900 text-xs">{item.nama}</span>
                      {item.barcode && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {item.barcode}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.product_uid, Math.max(0, item.kuantitas - 1))}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                      >
                        <IconMinus size={13} />
                      </button>
                      <NumberInput
                        ref={(el) => {
                          if (el) {
                            qtyInputRefs.current.set(item.product_uid, el);
                          } else {
                            qtyInputRefs.current.delete(item.product_uid);
                          }
                        }}
                        value={item.kuantitas}
                        onChange={(val) => onUpdateQty(item.product_uid, val || 0)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            barcodeInputRef.current?.focus();
                            barcodeInputRef.current?.select();
                          }
                        }}
                        min={0}
                        allowNegative={false}
                        className="h-7 w-14 text-center text-xs font-bold border-slate-200 rounded-lg px-1"
                      />
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.product_uid, item.kuantitas + 1)}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-all cursor-pointer"
                      >
                        <IconPlus size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.product_uid)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                      title="Hapus produk dari daftar"
                    >
                      <IconTrash size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-7 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <IconPackage size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Daftar Produk Masih Kosong</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
              Pilih katalog sales di atas untuk mengisi otomatis, atau gunakan pencarian / scanner di atas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
