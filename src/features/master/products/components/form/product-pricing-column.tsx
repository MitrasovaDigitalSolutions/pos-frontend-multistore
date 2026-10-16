"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { Show } from "@/components/ui/show";
import { Scrollable } from "@/components/ui/scrollable";
import { IconShieldCheck, IconTag } from "@tabler/icons-react";
import type { ProductType } from "../../hooks/use-product-form-dialog";
import type { ProductInput } from "../../schemas/product-schema";

interface ProductPricingColumnProps {
    productType: ProductType;
    isGrosir: boolean;
    disabled?: boolean;
    isCentralStore?: boolean;
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
    isCentralStore = true,
    onHargaBeliChange,
    onHargaChange,
    onMarginChange,
    onHargaGrosirChange,
    onMinQtyGrosirChange,
    onHargaGrosirTotalChange,
}: ProductPricingColumnProps) {
    const isPriceDisabled = disabled || !isCentralStore;

    return (
        <div id="form-product-pricing-col" className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col md:h-full min-h-0">
            {/* Header Kolom */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/60 shrink-0">
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

            {/* Scrollable Body Kolom */}
            <Scrollable className="flex-1 min-h-0 pr-1.5 pt-2" scrollbarClassName="z-20">
                <div className="space-y-3 pb-2">
                    {!isCentralStore && (
                        <div className="p-2.5 bg-purple-50/80 border border-purple-200/70 rounded-xl flex items-start gap-2 text-purple-900 text-xs">
                            <IconShieldCheck size={16} className="text-purple-600 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                                <p className="font-bold text-[11px]">Harga Dikontrol Gudang Pusat</p>
                                <p className="text-[10px] text-purple-700">
                                    Cabang dilarang mengubah harga. Harga retail kasir ditentukan dari Pusat.
                                </p>
                            </div>
                        </div>
                    )}
                    {/* Case 1: Barang Jadi */}
                    {productType === "finished_good" && (
                        <div className="space-y-2.5">
                            <div className="grid grid-cols-2 gap-2">
                                <div id="form-product-harga-beli-box">
                                    <FormNominalInput<ProductInput>
                                        name="harga_beli"
                                        label="Harga Modal"
                                        placeholder="0"
                                        disabled={isPriceDisabled}
                                        onValueChange={onHargaBeliChange}
                                    />
                                </div>
                                <div id="form-product-margin-box">
                                    <FormNumberInput<ProductInput>
                                        name="margin"
                                        label="Margin (%)"
                                        placeholder="0"
                                        disabled={isPriceDisabled}
                                        onValueChange={onMarginChange}
                                    />
                                </div>
                            </div>

                            {/* Harga Jual — Full Width (Form Stok Awal dihapus) */}
                            <div id="form-product-harga-jual-box">
                                <FormNominalInput<ProductInput>
                                    name="harga"
                                    label="Harga Jual *"
                                    placeholder="0"
                                    disabled={isPriceDisabled}
                                    onValueChange={onHargaChange}
                                />
                            </div>

                            {/* Grosir Toggle & Multi-line Form */}
                            <div id="product-form-wholesale-section" className="pt-2 border-t border-slate-200/70 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 block">
                                            Harga Grosir Bertingkat
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            Harga khusus pembelian kuantitas banyak
                                        </span>
                                    </div>
                                    <FormSwitch<ProductInput>
                                        name="is_grosir"
                                        label=""
                                        disabled={isPriceDisabled}
                                    />
                                </div>

                                <Show.When isTrue={isGrosir}>
                                    <div className="bg-white border border-slate-200/90 rounded-xl p-3 space-y-2.5 shadow-2xs animate-in fade-in-50 duration-200">
                                        {/* Baris 1: Min Qty */}
                                        <div id="form-product-min-qty-grosir-box">
                                            <FormNumberInput<ProductInput>
                                                name="min_qty_grosir"
                                                label="Minimal Kuantitas (Qty)"
                                                placeholder="Contoh: 12"
                                                disabled={isPriceDisabled}
                                                onValueChange={onMinQtyGrosirChange}
                                            />
                                        </div>

                                        {/* Baris 2: Harga Satuan Grosir */}
                                        <div id="form-product-harga-grosir-box">
                                            <FormNominalInput<ProductInput>
                                                name="harga_grosir"
                                                label="Harga Grosir per Satuan"
                                                placeholder="0"
                                                disabled={isPriceDisabled}
                                                onValueChange={onHargaGrosirChange}
                                            />
                                        </div>

                                        {/* Baris 3: Total Paket Grosir */}
                                        <div id="form-product-harga-grosir-total-box">
                                            <FormNominalInput<ProductInput>
                                                name="harga_grosir_total"
                                                label="Total Harga Paket Grosir"
                                                placeholder="0"
                                                disabled={isPriceDisabled}
                                                onValueChange={onHargaGrosirTotalChange}
                                            />
                                        </div>
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
                                disabled={isPriceDisabled}
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
                                disabled={isPriceDisabled}
                                onValueChange={onHargaChange}
                            />
                        </div>
                    )}
                </div>
            </Scrollable>
        </div>
    );
}
