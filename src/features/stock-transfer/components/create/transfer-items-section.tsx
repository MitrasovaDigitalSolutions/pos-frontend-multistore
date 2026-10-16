"use client";

import { useEffect, useRef, useState } from "react";
import { IconPackage, IconScan } from "@tabler/icons-react";
import { BarcodeInput } from "@/components/shared/barcode-input";
import type { Product } from "@/features/master/products/types";
import { TRANSFER_TYPE, type TransferType } from "../../constants";
import type { CommissionType } from "../../hooks/use-consignment-commission-mode";
import { TransferItemCard } from "./transfer-item-card";

export interface TransferItem {
  product_uid: string;
  nama: string;
  barcode?: string | null;
  stok_tersedia?: number;
  kuantitas: number;
  modal_pusat?: number;
  harga_dasar_pusat?: number;
  harga_pasok?: number;
  harga_beli?: number;
  harga_jual?: number;
  tipe_komisi?: CommissionType;
  nilai_komisi?: number;
}

interface TransferItemsSectionProps {
  items: TransferItem[];
  tipeTransfer?: TransferType;
  onProductFound: (product: Product) => void;
  onUpdateQty: (uid: string, qty: number) => void;
  onUpdateKomisi?: (uid: string, tipe: CommissionType, nilai: number) => void;
  onRemoveItem: (uid: string) => void;
}

export function TransferItemsSection({
  items,
  tipeTransfer = TRANSFER_TYPE.REGULAR,
  onProductFound,
  onUpdateQty,
  onUpdateKomisi,
  onRemoveItem,
}: TransferItemsSectionProps) {
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const qtyInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const [lastScannedUid, setLastScannedUid] = useState<string | null>(null);

  const totalQty = items.reduce((acc, curr) => acc + curr.kuantitas, 0);

  const handleProductFoundWrapper = (product: Product) => {
    setLastScannedUid(product.uid);
    onProductFound(product);
  };

  useEffect(() => {
    if (lastScannedUid) {
      const timer = setTimeout(() => {
        const inputEl = qtyInputRefs.current.get(lastScannedUid);
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          inputEl.focus({ preventScroll: true });
          inputEl.select();
        }
        setLastScannedUid(null);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [items, lastScannedUid]);

  const handleEnterKey = () => {
    barcodeInputRef.current?.focus();
    barcodeInputRef.current?.select();
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600">
            <IconPackage size={15} />
          </div>
          <span>Daftar Barang Transfer</span>
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
      <div id="transfer-barcode-box" className="space-y-1.5">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <IconScan size={13} className="text-emerald-600" />
          <span>Cari / Scan Produk</span>
        </label>
        <BarcodeInput
          id="transfer-barcode-input"
          ref={barcodeInputRef}
          refocusOnFound={false}
          isJasa={false}
          onProductFound={handleProductFoundWrapper}
          placeholder="Scan barcode SKU atau ketik nama produk..."
        />
      </div>

      {/* Selected Items (Carding List) */}
      {items.length > 0 ? (
        <div id="transfer-items-table" className="space-y-2.5">
          {items.map((item, idx) => (
            <TransferItemCard
              key={item.product_uid}
              item={item}
              index={idx}
              tipeTransfer={tipeTransfer}
              onUpdateQty={onUpdateQty}
              onUpdateKomisi={onUpdateKomisi}
              onRemoveItem={onRemoveItem}
              qtyInputRef={(el) => {
                if (el) {
                  qtyInputRefs.current.set(item.product_uid, el);
                } else {
                  qtyInputRefs.current.delete(item.product_uid);
                }
              }}
              onEnterPress={handleEnterKey}
            />
          ))}
        </div>
      ) : (
        <div id="transfer-items-table" className="p-7 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <IconPackage size={22} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Daftar Produk Masih Kosong</p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-0.5">
              Gunakan kotak pencarian atau scanner barcode di atas untuk menambahkan barang ke daftar transfer stok.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
