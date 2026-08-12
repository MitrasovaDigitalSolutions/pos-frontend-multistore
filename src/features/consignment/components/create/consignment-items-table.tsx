"use client";

import { FormNumberInput } from "@/components/forms/form-number-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { Product } from "@/features/master/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconPackage, IconTrash } from "@tabler/icons-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ConsignmentReceivingFormValues } from "../../schemas/consignment-schema";

interface ConsignmentItemsTableProps {
  productsMap: Map<string, Product>;
  onRemoveItem: (index: number) => void;
}

export function ConsignmentItemsTable({ productsMap, onRemoveItem }: ConsignmentItemsTableProps) {
  const { control, watch, setValue } = useFormContext<ConsignmentReceivingFormValues>();
  const { fields } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items") || [];

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-2xs p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">
            <IconPackage size={18} />
          </div>
          <span>Daftar Barang Titipan</span>
          <span className="text-xs font-medium text-slate-400">({fields.length} Produk)</span>
        </h3>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
          <IconPackage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Belum ada barang titipan ditambahkan.</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Gunakan barcode scanner atau pencarian di atas untuk menambahkan produk konsinyasi.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-bold">
                <th className="py-2.5 px-3 text-left w-12">#</th>
                <th className="py-2.5 px-3 text-left">Produk</th>
                <th className="py-2.5 px-3 text-center w-28">Qty Titipan</th>
                <th className="py-2.5 px-3 text-right w-36">Harga Beli (Rp)</th>
                <th className="py-2.5 px-3 text-center w-36">Penyesuaian Jual</th>
                <th className="py-2.5 px-3 text-right w-36">Subtotal</th>
                <th className="py-2.5 px-3 text-center w-14">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fields.map((field, index) => {
                const item = watchItems[index];
                const product = productsMap.get(item?.product_uid || "");
                const qty = Number(item?.kuantitas || 0);
                const hargaBeli = Number(item?.harga_beli || 0);
                const subtotal = qty * hargaBeli;
                const updateHargaJual = !!item?.update_harga_jual;

                return (
                  <tr key={field.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-medium">{index + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-xs">
                          {product?.nama || "Produk Konsinyasi"}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {product?.barcode || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <FormNumberInput<ConsignmentReceivingFormValues>
                        name={`items.${index}.kuantitas`}
                        min={0.01}
                        className="h-8 text-xs text-center font-bold"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <FormNumberInput<ConsignmentReceivingFormValues>
                        name={`items.${index}.harga_beli`}
                        min={0}
                        className="h-8 text-xs text-right font-bold"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col items-center gap-1.5">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer">
                          <Checkbox
                            checked={updateHargaJual}
                            onCheckedChange={(checked) =>
                              setValue(`items.${index}.update_harga_jual`, !!checked)
                            }
                          />
                          <span>Ubah Harga</span>
                        </label>

                        {updateHargaJual && (
                          <FormNumberInput<ConsignmentReceivingFormValues>
                            name={`items.${index}.harga_jual_baru`}
                            min={0}
                            placeholder="Harga jual..."
                            className="h-7 text-[11px] text-right font-bold w-28"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatRupiah(subtotal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(index)}
                        className="h-7 w-7 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <IconTrash size={15} />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
