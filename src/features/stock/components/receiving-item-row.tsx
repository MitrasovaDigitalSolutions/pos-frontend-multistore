"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { Button } from "@/components/ui/button";
import type { CommandOption } from "@/components/ui/command-select";
import type { Product } from "@/features/products/types";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { cn } from "@/lib/utils";
import { IconX } from "@tabler/icons-react";
import { useFormContext, type FieldPath } from "react-hook-form";
import type { ReceivingInput } from "../schemas/receiving-schema";

interface ReceivingItemRowProps {
    idx: number;
    isPending: boolean;
    products: Product[];
    productOptions: CommandOption[];
    remove: (index: number) => void;
    showDelete: boolean;
}

export function ReceivingItemRow({
    idx,
    isPending,
    products,
    productOptions,
    remove,
    showDelete,
}: ReceivingItemRowProps) {
    const { watch, setValue, getValues } = useFormContext<ReceivingInput>();

    // Watch fields locally inside this component for precise, optimal re-rendering
    const productId = watch(`items.${idx}.product_id`);
    const hargaBeliBaru = watch(`items.${idx}.harga_beli`) || 0;
    const updateHargaJual = watch(`items.${idx}.update_harga_jual`);

    const selectedProduct = products.find((p) => p.id === Number(productId));

    const hargaBeliLama = selectedProduct?.harga_beli ?? 0;
    const hargaJualLama = selectedProduct?.harga ?? 0;
    const marginLama = selectedProduct?.margin ?? 0;

    const hargaJualSaran = marginLama > 0
        ? Math.round(Number(hargaBeliBaru) * (1 + marginLama / 100))
        : hargaJualLama;

    const selisihHargaBeli = Number(hargaBeliBaru) - hargaBeliLama;
    const perluAlert = Number(hargaBeliBaru) > hargaBeliLama;

    return (
        <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/20 space-y-4 shadow-sm">
            {/* Input Grid */}
            <div className="grid grid-cols-12 gap-3 items-end">
                {/* Product Select */}
                <div className="col-span-12 sm:col-span-5">
                    <FormSelect<ReceivingInput>
                        name={`items.${idx}.product_id` as FieldPath<ReceivingInput>}
                        options={productOptions}
                        placeholder="-- Pilih Produk --"
                        disabled={isPending}
                        label="Produk"
                        onChange={(val) => {
                            const prod = products.find((p) => p.id === Number(val));
                            if (prod) {
                                setValue(`items.${idx}.harga_beli` as FieldPath<ReceivingInput>, prod.harga_beli ?? 0);

                                // Default qty to 1 if empty/0
                                const currentQty = getValues(`items.${idx}.kuantitas` as FieldPath<ReceivingInput>);
                                if (!currentQty) {
                                    setValue(`items.${idx}.kuantitas` as FieldPath<ReceivingInput>, 1);
                                }
                            }
                        }}
                    />
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-2">
                    <FormNumberInput<ReceivingInput>
                        name={`items.${idx}.kuantitas` as FieldPath<ReceivingInput>}
                        placeholder="Qty"
                        disabled={isPending}
                        label="Qty"
                    />
                </div>

                {/* Harga Beli */}
                <div className="col-span-8 sm:col-span-4">
                    <FormNominalInput<ReceivingInput>
                        name={`items.${idx}.harga_beli` as FieldPath<ReceivingInput>}
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

            {/* Price Comparison Analysis */}
            {selectedProduct && (
                <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">Harga Beli Lama:</span>
                            <span className="font-semibold text-slate-700">
                                {formatRupiah(hargaBeliLama)}
                            </span>
                        </div>

                        {hargaBeliBaru > 0 && (
                            <>
                                <span className="text-slate-200">|</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-slate-400">Selisih:</span>
                                    <span className={cn(
                                        "font-bold",
                                        selisihHargaBeli > 0 ? "text-rose-600" : selisihHargaBeli < 0 ? "text-emerald-600" : "text-slate-500"
                                    )}>
                                        {selisihHargaBeli > 0 ? `+${formatRupiah(selisihHargaBeli)}` : formatRupiah(selisihHargaBeli)}
                                    </span>
                                </div>
                            </>
                        )}

                        {perluAlert && (
                            <span className="bg-rose-50 text-rose-700 text-[9px] font-bold px-2 py-0.5 rounded border border-rose-100 uppercase tracking-wide animate-pulse">
                                Harga Naik!
                            </span>
                        )}
                    </div>

                    {/* Toggle Update Harga Jual */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`items.${idx}.update_harga_jual`}
                            checked={!!updateHargaJual}
                            onChange={(e) => {
                                setValue(`items.${idx}.update_harga_jual` as FieldPath<ReceivingInput>, e.target.checked);
                                if (!e.target.checked) {
                                    setValue(`items.${idx}.harga_jual_baru` as FieldPath<ReceivingInput>, null);
                                    setValue(`items.${idx}.margin_baru` as FieldPath<ReceivingInput>, null);
                                }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                        />
                        <label
                            htmlFor={`items.${idx}.update_harga_jual`}
                            className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                        >
                            Sesuaikan Harga Jual / Margin Produk
                        </label>
                    </div>

                    {/* Custom Pricing Form Panel */}
                    {updateHargaJual && (
                        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100/80 mt-1">
                            <div className="col-span-12 text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span>Harga Jual Saat Ini: <strong className="text-slate-800">{formatRupiah(hargaJualLama)}</strong> (Margin: {marginLama}%)</span>
                                <span className="text-slate-300">|</span>
                                <span>Saran Harga (Margin Lama): <strong className="text-slate-800">{formatRupiah(hargaJualSaran)}</strong></span>
                            </div>

                            <div className="col-span-12 sm:col-span-6">
                                <FormNominalInput<ReceivingInput>
                                    name={`items.${idx}.harga_jual_baru` as FieldPath<ReceivingInput>}
                                    placeholder={`Contoh: ${hargaJualSaran}`}
                                    disabled={isPending}
                                    label="Harga Jual Baru"
                                />
                            </div>
                            <div className="col-span-12 sm:col-span-6">
                                <FormNumberInput<ReceivingInput>
                                    name={`items.${idx}.margin_baru` as FieldPath<ReceivingInput>}
                                    placeholder={`Contoh: ${marginLama}`}
                                    disabled={isPending}
                                    label="Margin Baru (%)"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
