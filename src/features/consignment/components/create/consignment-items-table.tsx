"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { AppButton } from "@/components/shared/app-button";
import type { Product } from "@/features/master/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPackage, IconTrash } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ConsignmentReceivingFormValues } from "../../schemas/consignment-schema";

interface ConsignmentItemsTableProps {
  productsMap: Map<string, Product>;
  onRemoveItem: (index: number) => void;
  disabled?: boolean;
}

export function ConsignmentItemsTable({
  productsMap,
  onRemoveItem,
  disabled = false,
}: ConsignmentItemsTableProps) {
  const { control, watch } = useFormContext<ConsignmentReceivingFormValues>();
  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items") || [];

  const [flashIndex, setFlashIndex] = useState<number | null>(null);
  const prevLengthRef = useRef(fields.length);
  const tableEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      const newIndex = fields.length - 1;
      setFlashIndex(newIndex);
      const timer = setTimeout(() => setFlashIndex(null), 800);
      tableEndRef.current?.scrollIntoView({ behavior: "smooth" });
      return () => clearTimeout(timer);
    }
    prevLengthRef.current = fields.length;
  }, [fields.length]);

  const totalItems = watchItems.reduce((acc, item) => acc + Number(item?.kuantitas || 0), 0);
  const totalValue = watchItems.reduce(
    (acc, item) => acc + Number(item?.kuantitas || 0) * Number(item?.harga_beli || 0),
    0
  );

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
    <div className="space-y-3">
      <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs bg-white">
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
                        className="w-full h-8 text-center text-xs font-bold text-slate-800 rounded-lg border-slate-200 focus-visible:ring-emerald-400/20 focus-visible:border-emerald-400"
                      />
                    </td>

                    <td className="p-3">
                      <FormNominalInput<ConsignmentReceivingFormValues>
                        name={`items.${index}.harga_beli`}
                        disabled={disabled}
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
                        className="text-rose-400 hover:text-rose-600 hover:bg-rose-50"
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

        {/* Footer totals */}
        <div className="bg-slate-50/80 border-t border-slate-100 px-4 py-3 flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Items
            </span>
            <span className="text-sm font-extrabold text-slate-800">
              {totalItems} pcs
            </span>
            <span className="text-slate-200">|</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {fields.length} produk
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Nilai Titipan
            </span>
            <span className="text-base font-extrabold text-emerald-600 font-mono">
              {formatRupiah(totalValue)}
            </span>
          </div>
        </div>
      </div>

      <div ref={tableEndRef} />
    </div>
  );
}
