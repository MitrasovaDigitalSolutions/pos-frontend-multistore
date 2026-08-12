"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSwitch } from "@/components/forms/form-switch";
import { Show } from "@/components/ui/show";
import { Badge } from "@/components/ui/badge";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { getImageUrl } from "@/lib/utils";
import { useActiveStoreStore } from "@/stores/active-store-store";
import { IconCheck, IconInfoCircle, IconLoader2, IconPackage, IconTag, IconTrendingUp } from "@tabler/icons-react";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { useUpdateProductStore } from "../api/product-store-api";
import type { Product } from "../types";
import { formatRupiah } from "@/hooks/use-format-rupiah";

interface StoreProductEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

interface StoreProductEditFormValues {
    harga_jual: number | null;
    harga_beli: number | null;
    harga_grosir: number | null;
    min_qty_grosir: number | null;
    harga_grosir_total: number | null;
    is_grosir?: boolean;
    margin: number | null;
    stok: number;
}

export function StoreProductEditDialog({
    open,
    onOpenChange,
    product,
}: StoreProductEditDialogProps) {
    const activeStoreUid = useActiveStoreStore((s) => s.activeStoreUid);
    const updateProductStore = useUpdateProductStore();

    const methods = useForm<StoreProductEditFormValues>({
        defaultValues: {
            harga_jual: null,
            harga_beli: null,
            harga_grosir: null,
            min_qty_grosir: null,
            harga_grosir_total: null,
            is_grosir: false,
            margin: null,
            stok: 0,
        },
    });

    const { handleSubmit, reset, control, setValue } = methods;

    useEffect(() => {
        if (open && product) {
            const activeStore = product.product_stores?.find(s => s.store_uid === activeStoreUid) || product.product_stores?.[0];
            const rawHGrosir = product.harga_grosir ?? activeStore?.harga_grosir ?? null;
            const rawMinQty = product.min_qty_grosir ?? activeStore?.min_qty_grosir ?? null;
            const hGrosir = rawHGrosir !== null && rawHGrosir !== undefined ? Number(rawHGrosir) : null;
            const minQty = rawMinQty !== null && rawMinQty !== undefined ? Number(rawMinQty) : null;
            const hGrosirTotal = (hGrosir && minQty) ? Math.round(hGrosir * minQty) : null;
            const isGrosirFlag = product.is_grosir ?? activeStore?.is_grosir ?? false;

            reset({
                harga_jual: product.harga ?? activeStore?.harga_jual ?? null,
                harga_beli: product.harga_beli ?? activeStore?.harga_beli ?? null,
                harga_grosir: hGrosir,
                min_qty_grosir: minQty,
                harga_grosir_total: hGrosirTotal,
                is_grosir: Boolean(isGrosirFlag),
                margin: product.margin ?? activeStore?.margin ?? null,
                stok: product.stok ?? activeStore?.stok ?? 0,
            });
        }
    }, [open, product, activeStoreUid, reset]);

    // Automatic margin calculation using useWatch
    const watchHargaBeli = useWatch({ control, name: "harga_beli" });
    const watchHargaJual = useWatch({ control, name: "harga_jual" });
    const watchMargin = useWatch({ control, name: "margin" });
    const watchIsGrosir = useWatch({ control, name: "is_grosir" });
    const watchHargaGrosir = useWatch({ control, name: "harga_grosir" });
    const watchMinQtyGrosir = useWatch({ control, name: "min_qty_grosir" });
    const watchHargaGrosirTotal = useWatch({ control, name: "harga_grosir_total" });

    useEffect(() => {
        const activeId = document.activeElement?.id;
        if (activeId === "harga_beli" || activeId === "harga_jual") {
            const hBeli = Number(watchHargaBeli) || 0;
            const hJual = Number(watchHargaJual) || 0;
            if (hBeli > 0) {
                const calculatedMargin = ((hJual - hBeli) / hBeli) * 100;
                setValue("margin", Math.round(calculatedMargin * 100) / 100);
            }
        }
    }, [watchHargaBeli, watchHargaJual, setValue]);

    useEffect(() => {
        const activeId = document.activeElement?.id;
        if (activeId === "margin") {
            const hBeli = Number(watchHargaBeli) || 0;
            const mVal = Number(watchMargin) || 0;
            if (hBeli > 0) {
                const calculatedJual = hBeli + (hBeli * (mVal / 100));
                setValue("harga_jual", Math.round(calculatedJual));
            }
        }
    }, [watchMargin, watchHargaBeli, setValue]);

    // Auto calculate unit wholesale price & total wholesale price
    useEffect(() => {
        const activeId = document.activeElement?.id;
        if (activeId === "harga_grosir" || activeId === "min_qty_grosir") {
            const unitPrice = Number(watchHargaGrosir) || 0;
            const minQty = Number(watchMinQtyGrosir) || 0;
            if (unitPrice > 0 && minQty > 0) {
                setValue("harga_grosir_total", Math.round(unitPrice * minQty));
            } else {
                setValue("harga_grosir_total", null);
            }
        }
    }, [watchHargaGrosir, watchMinQtyGrosir, setValue]);

    useEffect(() => {
        const activeId = document.activeElement?.id;
        if (activeId === "harga_grosir_total") {
            const totalPrice = Number(watchHargaGrosirTotal) || 0;
            const minQty = Number(watchMinQtyGrosir) || 0;
            if (totalPrice > 0 && minQty > 0) {
                setValue("harga_grosir", Math.round(totalPrice / minQty));
            } else {
                setValue("harga_grosir", null);
            }
        }
    }, [watchHargaGrosirTotal, watchMinQtyGrosir, setValue]);

    const onSubmit = (data: StoreProductEditFormValues) => {
        if (!product) return;
        if (!activeStoreUid) {
            toast.error("Toko aktif tidak ditemukan.");
            return;
        }

        const isGrosir = Boolean(data.is_grosir);

        updateProductStore.mutate(
            {
                productUid: product.uid,
                storeUid: activeStoreUid,
                harga_jual: data.harga_jual ?? undefined,
                harga_beli: data.harga_beli ?? undefined,
                harga_grosir: isGrosir ? (data.harga_grosir ?? undefined) : undefined,
                min_qty_grosir: isGrosir ? (data.min_qty_grosir ?? undefined) : undefined,
                is_grosir: isGrosir,
                margin: data.margin ?? undefined,
            },
            {
                onSuccess: () => {
                    toast.success(`Harga "${product.nama}" berhasil diperbarui!`);
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memperbarui harga produk.");
                },
            }
        );
    };

    const imageUrl = getImageUrl(product?.image_url || product?.image_path);
    const profitPerUnit = (Number(watchHargaJual) || 0) - (Number(watchHargaBeli) || 0);

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <IconTag size={18} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">Edit Harga Produk Toko</h4>
                        <p className="text-[11px] text-slate-400 font-medium">Penyesuaian harga jual, harga beli, &amp; margin cabang</p>
                    </div>
                </div>
            }
            className="sm:max-w-4xl"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* 2-Column Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Column 1: Product Summary & Profit Preview */}
                        <div className="space-y-3 flex flex-col justify-between">
                            {product && (
                                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
                                    <div className="flex items-start gap-3">
                                        {imageUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={imageUrl}
                                                alt={product.nama}
                                                className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 shadow-xs"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-xs">
                                                <IconPackage size={22} />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-xs text-slate-900 leading-tight truncate">
                                                    {product.nama}
                                                </span>
                                                {product.is_jasa ? (
                                                    <Badge className="text-[9px] px-1.5 py-0 bg-blue-50 text-blue-700 border-blue-100 font-bold">
                                                        Jasa
                                                    </Badge>
                                                ) : product.stok > 10 ? (
                                                    <Badge className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                                        Stok: {product.stok} Pcs
                                                    </Badge>
                                                ) : product.stok > 0 ? (
                                                    <Badge className="text-[9px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200 font-bold">
                                                        Stok: {product.stok} Pcs
                                                    </Badge>
                                                ) : (
                                                    <Badge className="text-[9px] px-1.5 py-0 bg-rose-50 text-rose-700 border-rose-200 font-bold">
                                                        Stok: 0 Pcs
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
                                                {product.barcode && (
                                                    <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-700">
                                                        {product.barcode}
                                                    </span>
                                                )}
                                                {product.category && (
                                                    <span>Kat: <strong className="text-slate-700">{product.category.nama}</strong></span>
                                                )}
                                                {product.brand && (
                                                    <span>Brand: <strong className="text-slate-700">{product.brand.nama}</strong></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Banner on Stock Management */}
                                    <div className="p-2 bg-white border border-slate-200/70 rounded-lg text-[10px] text-slate-500 flex items-start gap-1.5">
                                        <IconInfoCircle size={14} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span>Stok fisik diubah via <strong>Penerimaan / Opname Stok</strong>.</span>
                                    </div>
                                </div>
                            )}

                            {/* Interactive Profit Live Preview */}
                            <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl space-y-1 text-xs">
                                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px]">
                                    <IconTrendingUp size={14} className="text-emerald-600 shrink-0" />
                                    <span>Estimasi Keuntungan Bersih:</span>
                                </div>
                                <div className="flex items-baseline justify-between pt-0.5">
                                    <span className="font-extrabold text-emerald-900 text-base">
                                        {formatRupiah(profitPerUnit > 0 ? profitPerUnit : 0)}
                                    </span>
                                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                                        / unit ({watchMargin || 0}%)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Financial & Wholesale Inputs */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                <FormNominalInput<StoreProductEditFormValues>
                                    name="harga_beli"
                                    label="Harga Beli"
                                    placeholder="8.000"
                                    disabled={updateProductStore.isPending}
                                />
                                <FormNominalInput<StoreProductEditFormValues>
                                    name="harga_jual"
                                    label="Harga Jual"
                                    placeholder="10.000"
                                    disabled={updateProductStore.isPending}
                                />
                                <FormNumberInput<StoreProductEditFormValues>
                                    name="margin"
                                    label="Margin (%)"
                                    placeholder="20"
                                    disabled={updateProductStore.isPending}
                                />
                            </div>

                            {/* Fitur Grosir */}
                            <FormSwitch<StoreProductEditFormValues>
                                name="is_grosir"
                                label="Harga Grosir Toko"
                                description="Aktifkan penentuan harga grosir khusus untuk toko ini."
                                disabled={updateProductStore.isPending}
                            />

                            <Show.When isTrue={Boolean(watchIsGrosir)}>
                                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 animate-in fade-in-50 duration-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-800">Konfigurasi Grosir</span>
                                        <span className="text-[9px] text-slate-400 font-medium">Auto-sync unit &amp; total</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <FormNumberInput<StoreProductEditFormValues>
                                            name="min_qty_grosir"
                                            label="Min Qty"
                                            placeholder="12"
                                            disabled={updateProductStore.isPending}
                                        />
                                        <FormNominalInput<StoreProductEditFormValues>
                                            name="harga_grosir"
                                            label="Harga Unit"
                                            placeholder="4.800"
                                            disabled={updateProductStore.isPending}
                                        />
                                        <FormNominalInput<StoreProductEditFormValues>
                                            name="harga_grosir_total"
                                            label="Total Akumulasi"
                                            placeholder="57.600"
                                            disabled={updateProductStore.isPending}
                                        />
                                    </div>
                                </div>
                            </Show.When>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onOpenChange(false)}
                            disabled={updateProductStore.isPending}
                            className="h-9 px-4 text-xs font-bold rounded-xl border-slate-200"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateProductStore.isPending}
                            className="h-9 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer"
                        >
                            {updateProductStore.isPending ? (
                                <>
                                    <IconLoader2 size={16} className="animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IconCheck size={16} />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
