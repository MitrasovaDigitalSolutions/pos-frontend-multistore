"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { AppButton } from "@/components/shared/app-button";
import type { Product } from "@/features/master/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPackage, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import type { ConsignmentReceivingFormValues } from "../../schemas/consignment-schema";
import { ConsignmentItemMobileCard } from "./consignment-item-mobile-card";

interface ConsignmentItemsTableProps {
  productsMap: Map<string, Product>;
  onRemoveItem: (index: number) => void;
  disabled?: boolean;
  barcodeInputRef?: React.RefObject<HTMLInputElement | null>;
  lastAddedUid?: string | null;
}

export function ConsignmentItemsTable({
  productsMap,
  onRemoveItem,
  disabled = false,
  barcodeInputRef,
  lastAddedUid,
}: ConsignmentItemsTableProps) {
  const { control } = useFormContext<ConsignmentReceivingFormValues>();
  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = useWatch({ control, name: "items" }) || [];

  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const prevLengthRef = useRef(fields.length);

  const qtyInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  const hargaBeliInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      const newIndex = fields.length - 1;
      setFlashIndex(newIndex);
      const timer = setTimeout(() => setFlashIndex(null), 800);
      return () => clearTimeout(timer);
    }
    prevLengthRef.current = fields.length;
  }, [fields.length]);

  useEffect(() => {
    if (lastAddedUid && watchItems.length > 0) {
      const targetIndex = watchItems.findIndex((it) => it.product_uid === lastAddedUid);
      const indexToFocus = targetIndex >= 0 ? targetIndex : watchItems.length - 1;
      const timer = setTimeout(() => {
        const qtyEl = qtyInputRefs.current.get(indexToFocus);
        if (qtyEl) {
          qtyEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
          qtyEl.focus({ preventScroll: true });
          qtyEl.select();
        }
      }, 60);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastAddedUid, watchItems.length]);

  const totalItems = (watchItems || []).reduce((acc: number, item) => acc + Number(item?.kuantitas || 0), 0);
  const totalValue = (watchItems || []).reduce(
    (acc: number, item) => acc + Number(item?.kuantitas || 0) * Number(item?.harga_beli || 0),
    0
  );

  const handleQtyEnter = (index: number) => {
    const hargaBeliEl = hargaBeliInputRefs.current.get(index);
    if (hargaBeliEl) {
      hargaBeliEl.focus();
      hargaBeliEl.select();
    }
  };

  const handleHargaBeliEnter = () => {
    if (barcodeInputRef?.current) {
      barcodeInputRef.current.focus();
      barcodeInputRef.current.select();
    }
  };

  if (fields.length === 0) {
    return (
      <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-white shadow-xs">
        <div className="w-14 h-14 mx-auto mb-3 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100/50">
          <IconPackage size={26} className="text-emerald-600" />
        </div>
        <p className="text-sm font-bold text-slate-800">Belum ada barang konsinyasi</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Scan barcode atau masukkan kode/nama produk pada kotak di atas untuk menambahkan barang titipan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Mobile Card Grid (Visible on mobile screens < 768px) ── */}
      <div className="block md:hidden space-y-3">
        {fields.map((field, index) => {
          const item = watchItems[index];
          const product = productsMap.get(item?.product_uid || "");
          const isFlashing = flashIndex === index;

          return (
            <ConsignmentItemMobileCard
              key={field.id}
              index={index}
              item={item}
              product={product}
              disabled={disabled}
              isFlashing={isFlashing}
              onRemoveItem={() => onRemoveItem(index)}
              setQtyInputRef={(el) => {
                if (el) qtyInputRefs.current.set(index, el);
                else qtyInputRefs.current.delete(index);
              }}
              setHargaBeliInputRef={(el) => {
                if (el) hargaBeliInputRefs.current.set(index, el);
                else hargaBeliInputRefs.current.delete(index);
              }}
              onQtyKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleQtyEnter(index);
                }
              }}
              onHargaBeliKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleHargaBeliEnter();
                }
              }}
            />
          );
        })}
      </div>

      {/* ── Desktop Table View (Visible on screens >= 768px) ── */}
      <div className="hidden md:block border border-slate-100 rounded-2xl overflow-hidden shadow-xs bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-3 w-10">No</th>
                <th className="p-3 w-32 min-w-[120px]">Barcode</th>
                <th className="p-3 min-w-[260px]">Nama Produk</th>
                <th className="p-3 text-center w-24 min-w-[90px]">Qty</th>
                <th className="p-3 text-right w-36 min-w-[130px]">Harga Beli</th>
                <th className="p-3 text-right w-36 min-w-[130px]">Subtotal</th>
                <th className="p-3 w-14 text-center sticky right-0 bg-slate-50 border-l border-slate-100 z-10">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fields.map((field, index) => {
                const item = watchItems[index];
                const product = productsMap.get(item?.product_uid || "");
                const qty = Number(item?.kuantitas || 0);
                const hargaBeli = Number(item?.harga_beli || 0);
                const subtotal = qty * hargaBeli;
                const isFlashing = flashIndex === index;

                return (
                  <tr
                    key={field.id}
                    className={`
                      group transition-all duration-300 hover:bg-slate-50/60
                      ${isFlashing ? "bg-emerald-50 ring-1 ring-inset ring-emerald-200" : ""}
                    `}
                  >
                    <td className="p-3 text-slate-400 font-mono font-bold">{index + 1}</td>

                    <td className="p-3">
                      <span className="font-mono text-slate-500 text-[11px]">
                        {product?.barcode || "—"}
                      </span>
                    </td>

                    <td className="p-3 min-w-[260px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 text-xs">
                          {product?.nama || "Produk Konsinyasi"}
                        </span>
                        {isFlashing && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                            ⚡ baru
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3">
                      <FormNumberInput<ConsignmentReceivingFormValues>
                        name={`items.${index}.kuantitas`}
                        min={0.01}
                        allowDecimal={true}
                        disabled={disabled}
                        inputRef={(el) => {
                          if (el) qtyInputRefs.current.set(index, el);
                          else qtyInputRefs.current.delete(index);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleQtyEnter(index);
                          }
                        }}
                        className="w-full h-8 text-center text-xs font-bold text-slate-800 rounded-lg border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                      />
                    </td>

                    <td className="p-3">
                      <FormNominalInput<ConsignmentReceivingFormValues>
                        name={`items.${index}.harga_beli`}
                        disabled={disabled}
                        inputRef={(el) => {
                          if (el) hargaBeliInputRefs.current.set(index, el);
                          else hargaBeliInputRefs.current.delete(index);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleHargaBeliEnter();
                          }
                        }}
                        className="w-full h-8 text-right text-xs font-bold text-slate-800 font-mono rounded-lg border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                      />
                    </td>

                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      {formatRupiah(subtotal)}
                    </td>

                    <td
                      className={`p-3 text-center sticky right-0 border-l border-slate-100/80 z-10 transition-colors ${
                        isFlashing ? "bg-emerald-50" : "bg-white group-hover:bg-slate-50/60"
                      }`}
                    >
                      <AppButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onRemoveItem(index)}
                        disabled={disabled}
                        className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Hapus item"
                      >
                        <IconTrash size={16} />
                      </AppButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Summary & Totals Banner (Responsive for both Mobile & Desktop) ── */}
      <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-xs">
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Qty:
            </span>
            <span className="font-extrabold text-slate-800 font-mono">
              {totalItems} pcs
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Variasi:
            </span>
            <span className="font-extrabold text-slate-800 font-mono">
              {fields.length} produk
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Nilai Titipan:
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-600 font-mono">
            {formatRupiah(totalValue)}
          </span>
        </div>
      </div>
    </div>
  );
}
