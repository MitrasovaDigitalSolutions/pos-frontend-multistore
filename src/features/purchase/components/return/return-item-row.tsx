"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import type { CommandOption } from "@/components/ui/command-select";
import type { Product } from "@/features/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { IconX } from "@tabler/icons-react";
import { useFormContext, type FieldPath } from "react-hook-form";
import type { PurchaseReturnInput } from "../../schemas/return-schema";

interface ReturnItemRowProps {
    idx: number;
    isPending: boolean;
    products: Product[];
    productOptions: CommandOption[];
    remove: (index: number) => void;
    showDelete: boolean;
}

export function ReturnItemRow({
    idx,
    isPending,
    products,
    productOptions,
    remove,
    showDelete,
}: ReturnItemRowProps) {
    const { watch, setValue, getValues } = useFormContext<PurchaseReturnInput>();

    const productId = watch(`items.${idx}.product_uid`);
    const selectedProduct = products.find((p) => p.uid === productId);

    const currentQty = watch(`items.${idx}.kuantitas`) || 0;
    const currentPrice = watch(`items.${idx}.harga_beli`) || 0;
    const subtotal = currentQty * currentPrice;

    return (
        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20 space-y-4 shadow-sm">
            <div className="grid grid-cols-12 gap-3 items-end">
                {/* Product Select */}
                <div className="col-span-12 sm:col-span-5">
                    <FormSelect<PurchaseReturnInput>
                        name={`items.${idx}.product_uid` as FieldPath<PurchaseReturnInput>}
                        options={productOptions}
                        placeholder="-- Pilih Produk --"
                        disabled={isPending}
                        label="Produk"
                        onChange={(val) => {
                            const prod = products.find((p) => p.uid === val);
                            if (prod) {
                                // Default unit price to purchase price (harga_beli) of product
                                setValue(`items.${idx}.harga_beli` as FieldPath<PurchaseReturnInput>, prod.harga_beli ?? 0);

                                // Default qty to 1 if empty/0
                                const currentQty = getValues(`items.${idx}.kuantitas` as FieldPath<PurchaseReturnInput>);
                                if (!currentQty) {
                                    setValue(`items.${idx}.kuantitas` as FieldPath<PurchaseReturnInput>, 1);
                                }
                            }
                        }}
                    />
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-2">
                    <FormNumberInput<PurchaseReturnInput>
                        name={`items.${idx}.kuantitas` as FieldPath<PurchaseReturnInput>}
                        placeholder="Qty"
                        disabled={isPending}
                        label="Qty"
                    />
                </div>

                {/* Harga Beli */}
                <div className="col-span-8 sm:col-span-4">
                    <FormNominalInput<PurchaseReturnInput>
                        name={`items.${idx}.harga_beli` as FieldPath<PurchaseReturnInput>}
                        placeholder="Rp 0"
                        disabled={isPending}
                        label="Harga Beli Satuan"
                    />
                </div>

                {/* Delete button */}
                <div className="col-span-12 sm:col-span-1 flex justify-end">
                    {showDelete && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => remove(idx)}
                            className="p-2 h-10 w-10 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl cursor-pointer"
                            disabled={isPending}
                        >
                            <IconX size={18} />
                        </Button>
                    )}
                </div>
            </div>

            {/* Subtotal & Product Info Preview */}
            {selectedProduct && (
                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                        <span>Stok Saat Ini:</span>
                        <span className="font-semibold text-slate-700">
                            {selectedProduct.stok ?? 0} pcs
                        </span>
                        <span className="text-slate-200">|</span>
                        <span>Harga Beli Terakhir:</span>
                        <span className="font-semibold text-slate-700 font-mono">
                            {selectedProduct.harga_beli ? formatRupiah(selectedProduct.harga_beli) : "Rp 0"}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Subtotal Retur:</span>
                        <span className="font-bold text-emerald-600 font-mono text-sm">
                            {formatRupiah(subtotal)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
