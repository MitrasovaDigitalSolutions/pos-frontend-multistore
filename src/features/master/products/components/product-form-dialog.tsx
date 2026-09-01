"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    IconCheck,
    IconInfoCircle,
    IconLoader2,
    IconPackage,
} from "@tabler/icons-react";
import { FormProvider } from "react-hook-form";
import type { Product } from "../types";
import { useProductFormDialog } from "../hooks/use-product-form-dialog";
import { ProductMediaColumn } from "./form/product-media-column";
import { ProductIdentityColumn } from "./form/product-identity-column";
import { ProductPricingColumn } from "./form/product-pricing-column";

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingProduct: Product | null;
    onSuccess?: (product: Product) => void;
    infoMessage?: string;
}

export function ProductFormDialog({
    open,
    onOpenChange,
    editingProduct,
    onSuccess,
    infoMessage,
}: ProductFormDialogProps) {
    const {
        methods,
        isPending,
        productType,
        handleProductTypeChange,
        categorySelectProps,
        brandSelectProps,
        onSubmit,
        onError,
        initialImageUrl,
        profitPerUnit,
        margin,
        isGrosir,
        handleHargaBeliChange,
        handleHargaChange,
        handleMarginChange,
        handleHargaGrosirChange,
        handleMinQtyGrosirChange,
        handleHargaGrosirTotalChange,
    } = useProductFormDialog({
        open,
        onOpenChange,
        editingProduct,
        onSuccess,
    });

    const { handleSubmit } = methods;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 shrink-0">
                        <IconPackage size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                {editingProduct ? "Edit Detail Produk" : "Tambah Produk Baru"}
                            </h4>
                            <Badge variant={editingProduct ? "secondary" : "success"} className="text-[9px] px-1.5 py-0 font-bold">
                                {editingProduct ? "Edit Mode" : "Katalog Master"}
                            </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 font-normal">
                            {editingProduct
                                ? "Perbarui spesifikasi, penetapan harga, dan stok cabang"
                                : "Lengkapi spesifikasi produk untuk didistribusikan ke toko"}
                        </p>
                    </div>
                </div>
            }
            className="sm:max-w-5xl"
            scrollable={true}
        >
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit, onError)}
                    className="space-y-3 pt-1"
                >
                    {infoMessage && (
                        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2">
                            <IconInfoCircle size={15} className="text-amber-600 shrink-0" />
                            <span><strong>Info:</strong> {infoMessage}</span>
                        </div>
                    )}

                    {/* ── 3-Column 3-5-4 Harmonic Bento Grid Layout ── */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch">
                        {/* Kolom 1: Foto Produk & Live Preview (Compact - 3 cols) */}
                        <div className="md:col-span-3">
                            <ProductMediaColumn
                                productType={productType}
                                disabled={isPending}
                                initialImageUrl={initialImageUrl}
                                profitPerUnit={profitPerUnit}
                                margin={margin}
                            />
                        </div>

                        {/* Kolom 2: Identitas, FormSelect Tipe Produk, & Klasifikasi (Ekstra Luas - 5 cols) */}
                        <div className="md:col-span-5">
                            <ProductIdentityColumn
                                onProductTypeChange={handleProductTypeChange}
                                disabled={isPending}
                                categorySelectProps={categorySelectProps}
                                brandSelectProps={brandSelectProps}
                            />
                        </div>

                        {/* Kolom 3: Harga, Stok Qty, & Grosir (Nyaman & Pas - 4 cols) */}
                        <div className="md:col-span-4">
                            <ProductPricingColumn
                                productType={productType}
                                isGrosir={isGrosir}
                                disabled={isPending}
                                onHargaBeliChange={handleHargaBeliChange}
                                onHargaChange={handleHargaChange}
                                onMarginChange={handleMarginChange}
                                onHargaGrosirChange={handleHargaGrosirChange}
                                onMinQtyGrosirChange={handleMinQtyGrosirChange}
                                onHargaGrosirTotalChange={handleHargaGrosirTotalChange}
                            />
                        </div>
                    </div>

                    {/* ── Dialog Footer Actions (Always in immediate view) ── */}
                    <div className="pt-2.5 flex items-center justify-end gap-2 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="h-9 px-5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                            {isPending ? (
                                <>
                                    <IconLoader2 size={15} className="animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <IconCheck size={15} />
                                    <span>{editingProduct ? "Simpan Perubahan" : "Simpan Produk"}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
