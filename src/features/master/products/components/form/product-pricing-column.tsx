"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { Show } from "@/components/ui/show";
import { IconTag } from "@tabler/icons-react";
import type { ProductType } from "../../hooks/use-product-form-dialog";
import type { ProductInput } from "../../schemas/product-schema";

interface ProductPricingColumnProps {
    productType: ProductType;
    isGrosir: boolean;
    disabled?: boolean;
    onHargaBeliChange?: (val: number | null) => void;
    onHargaChange?: (val: number | null) => void;
    onMarginChange?: (val: number | null) => void;
    onHargaGrosirChange?: (val: number | null) => void;
    onMinQtyGrosirChange?: (val: number | null) => void;
    onHargaGrosirTotalChange?: (val: number | null) => void;
}

export function ProductPricingColumn({
    productType,
    isGrosir,
    disabled = false,
    onHargaBeliChange,
    onHargaChange,
    onMarginChange,
    onHargaGrosirChange,
    onMinQtyGrosirChange,
    onHargaGrosirTotalChange,
}: ProductPricingColumnProps) {
    return (
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs space-y-2.5 flex flex-col justify-between h-full">
            <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <IconTag size={12} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                        {productType === "raw_material"
                            ? "Biaya & Stok Bahan"
                            : productType === "jasa"
                                ? "Tarif Layanan"
                                : "Harga & Persediaan"}
                    </span>
                </div>

                {/* Case 1: Barang Jadi */}
                {productType === "finished_good" && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <FormNominalInput<ProductInput>
                                name="harga_beli"
                                label="Harga Modal"
                                placeholder="0"
                                disabled={disabled}
                                onValueChange={onHargaBeliChange}
                            />
                            <FormNumberInput<ProductInput>
                                name="margin"
                                label="Margin (%)"
                                placeholder="0"
                                disabled={disabled}
                                onValueChange={onMarginChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <FormNominalInput<ProductInput>
                                name="harga"
                                label="Harga Jual *"
                                placeholder="0"
                                disabled={disabled}
                                onValueChange={onHargaChange}
                            />
                            <FormNumberInput<ProductInput>
                                name="stok"
                                label="Stok Awal"
                                placeholder="0"
                                disabled={disabled}
                            />
                        </div>

                        {/* Grosir Toggle */}
                        <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-700">Harga Grosir (Opsional)</span>
                                <FormSwitch<ProductInput>
                                    name="is_grosir"
                                    label=""
                                    disabled={disabled}
                                />
                            </div>

                            <Show.When isTrue={isGrosir}>
                                <div className="grid grid-cols-3 gap-1.5 pt-1 animate-in fade-in-50 duration-200">
                                    <FormNumberInput<ProductInput>
                                        name="min_qty_grosir"
                                        label="Min. Qty"
                                        placeholder="Min Qty"
                                        disabled={disabled}
                                        onValueChange={onMinQtyGrosirChange}
                                    />
                                    <FormNominalInput<ProductInput>
                                        name="harga_grosir"
                                        label="Harga Satuan"
                                        placeholder="0"
                                        disabled={disabled}
                                        onValueChange={onHargaGrosirChange}
                                    />
                                    <FormNominalInput<ProductInput>
                                        name="harga_grosir_total"
                                        label="Total"
                                        placeholder="0"
                                        disabled={disabled}
                                        onValueChange={onHargaGrosirTotalChange}
                                    />
                                </div>
                            </Show.When>
                        </div>
                    </div>
                )}

                {/* Case 2: Bahan Baku */}
                {productType === "raw_material" && (
                    <div className="space-y-2.5">
                        <FormNominalInput<ProductInput>
                            name="harga_beli"
                            label="Harga Beli Modal (Rp)"
                            placeholder="0"
                            disabled={disabled}
                            onValueChange={onHargaBeliChange}
                        />
                        <FormNumberInput<ProductInput>
                            name="stok"
                            label="Stok Awal Bahan Baku"
                            placeholder="0"
                            disabled={disabled}
                        />
                    </div>
                )}

                {/* Case 3: Jasa */}
                {productType === "jasa" && (
                    <div className="space-y-2.5">
                        <FormNominalInput<ProductInput>
                            name="harga"
                            label="Tarif Biaya Jasa / Layanan (Rp) *"
                            placeholder="0"
                            disabled={disabled}
                            onValueChange={onHargaChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
