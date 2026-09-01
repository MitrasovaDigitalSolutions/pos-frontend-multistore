"use client";

import { useId } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import type { CommandOption } from "@/components/ui/command-select";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Product } from "@/features/master/products/types";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import type { ProductionCreateInput } from "../../schemas/production-schema";

interface MaterialItemRowProps {
    index: number;
    options: CommandOption[];
    products: Product[];
    disabled: boolean;
    onRemove: (index: number) => void;
}

export function MaterialItemRow({
    index,
    options,
    products,
    disabled,
    onRemove,
}: MaterialItemRowProps) {
    const { watch, setValue } = useFormContext<ProductionCreateInput>();

    const productUid = watch(`materials.${index}.product_uid`);
    const kuantitas = watch(`materials.${index}.kuantitas`) || 0;
    const hargaSatuan = watch(`materials.${index}.harga_satuan`) || 0;

    const selectedProduct = products.find((p) => p.uid === productUid);
    const stokTersedia = selectedProduct?.stok ?? 0;
    const subtotal = (Number(kuantitas) || 0) * (Number(hargaSatuan) || 0);
    const isStokKurang = (Number(kuantitas) || 0) > stokTersedia;

    const qtyFieldId = useId();
    const priceFieldId = useId();

    return (
        <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3 shadow-2xs">
            <div className="grid grid-cols-12 gap-3 items-end">
                {/* Pilih Bahan Baku */}
                <div className="col-span-12 sm:col-span-5">
                    <FormSelect<ProductionCreateInput>
                        name={`materials.${index}.product_uid` as FieldPath<ProductionCreateInput>}
                        options={options}
                        placeholder="Pilih Bahan Baku..."
                        searchPlaceholder="Ketik nama/barcode bahan..."
                        disabled={disabled}
                        label={`Bahan Baku #${index + 1}`}
                        onChange={(val) => {
                            const prod = products.find((p) => p.uid === val);
                            if (prod) {
                                setValue(
                                    `materials.${index}.harga_satuan` as FieldPath<ProductionCreateInput>,
                                    prod.harga_beli ?? 0
                                );
                                if (!kuantitas) {
                                    setValue(
                                        `materials.${index}.kuantitas` as FieldPath<ProductionCreateInput>,
                                        1
                                    );
                                }
                            }
                        }}
                    />
                </div>

                {/* Kuantitas Pemakaian */}
                <div className="col-span-6 sm:col-span-3">
                    <FormNumberInput<ProductionCreateInput>
                        id={qtyFieldId}
                        name={`materials.${index}.kuantitas` as FieldPath<ProductionCreateInput>}
                        placeholder="Qty"
                        disabled={disabled}
                        label="Qty Pakai"
                        allowDecimal={true}
                    />
                </div>

                {/* Harga Modal Satuan */}
                <div className="col-span-6 sm:col-span-3">
                    <FormNominalInput<ProductionCreateInput>
                        id={priceFieldId}
                        name={`materials.${index}.harga_satuan` as FieldPath<ProductionCreateInput>}
                        placeholder="Rp 0"
                        disabled={disabled}
                        label="Harga Modal (HPP)"
                    />
                </div>

                {/* Action Remove */}
                <div className="col-span-12 sm:col-span-1 flex justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => onRemove(index)}
                        disabled={disabled}
                        className="h-10 w-10 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
                        title="Hapus Bahan"
                    >
                        <IconTrash size={18} />
                    </Button>
                </div>
            </div>

            {/* Sub-info Stok & Subtotal */}
            {selectedProduct && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">Stok Toko:</span>
                        <span
                            className={`font-bold ${
                                isStokKurang ? "text-rose-600" : "text-slate-800"
                            }`}
                        >
                            {stokTersedia} {selectedProduct.is_jasa ? "Layanan" : "Unit/Pcs/Meter"}
                        </span>
                        {isStokKurang && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                <IconAlertTriangle size={12} /> Stok tidak mencukupi!
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Subtotal Biaya:</span>
                        <span className="font-bold text-slate-900 font-mono text-xs">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
