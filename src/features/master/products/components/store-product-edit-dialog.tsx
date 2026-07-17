"use client";

import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
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
            margin: null,
            stok: 0,
        },
    });

    const { handleSubmit, reset, control, setValue } = methods;

    useEffect(() => {
        if (open && product) {
            reset({
                harga_jual: product.harga ?? null,
                harga_beli: product.harga_beli ?? null,
                margin: product.margin ?? null,
                stok: product.stok ?? 0,
            });
        }
    }, [open, product, reset]);

    // Automatic margin calculation using useWatch
    const watchHargaBeli = useWatch({ control, name: "harga_beli" });
    const watchHargaJual = useWatch({ control, name: "harga_jual" });
    const watchMargin = useWatch({ control, name: "margin" });

    useEffect(() => {
        const activeId = document.activeElement?.id;
        if (activeId === "harga_beli" || activeId === "harga_jual") {
            const hBeli = Number(watchHargaBeli) || 0;
            const hJual = Number(watchHargaJual) || 0;
            if (hBeli > 0) {
                const calculatedMargin = ((hJual - hBeli) / hBeli) * 100;
                setValue("margin", parseFloat(calculatedMargin.toFixed(2)));
            } else {
                setValue("margin", 0);
            }
        }
    }, [watchHargaBeli, watchHargaJual, setValue]);

    useEffect(() => {
        const activeId = document.activeElement?.id;
        if (activeId === "margin") {
            const hBeli = Number(watchHargaBeli) || 0;
            const mrg = Number(watchMargin) || 0;
            const calculatedHarga = hBeli * (1 + mrg / 100);
            setValue("harga_jual", Math.round(calculatedHarga));
        }
    }, [watchMargin, watchHargaBeli, setValue]);

    const onSubmit = (data: StoreProductEditFormValues) => {
        if (!product) return;
        if (!activeStoreUid) {
            toast.error("Toko aktif tidak ditemukan.");
            return;
        }

        updateProductStore.mutate(
            {
                productUid: product.uid,
                storeUid: activeStoreUid,
                harga_jual: data.harga_jual ?? undefined,
                harga_beli: data.harga_beli ?? undefined,
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

    const imageUrl = getImageUrl(product?.image_path);
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
            className="sm:max-w-lg"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Read-only Product Detail Summary Card */}
                    {product && (
                        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                            <div className="flex items-start gap-3.5">
                                {imageUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={imageUrl}
                                        alt={product.nama}
                                        className="w-14 h-14 object-cover rounded-2xl border border-slate-200 shrink-0 shadow-xs"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-xs">
                                        <IconPackage size={26} />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-sm text-slate-900 leading-tight truncate">
                                            {product.nama}
                                        </span>
                                        {product.is_jasa ? (
                                            <Badge className="text-[9px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-100 font-bold">
                                                Jasa
                                            </Badge>
                                        ) : product.stok > 10 ? (
                                            <Badge className="text-[9px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">
                                                Stok: {product.stok} Pcs
                                            </Badge>
                                        ) : product.stok > 0 ? (
                                            <Badge className="text-[9px] px-2 py-0.5 bg-amber-50 text-amber-700 border-amber-200 font-bold">
                                                Stok Menipis: {product.stok} Pcs
                                            </Badge>
                                        ) : (
                                            <Badge className="text-[9px] px-2 py-0.5 bg-rose-50 text-rose-700 border-rose-200 font-bold">
                                                Stok Habis: 0 Pcs
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
                                        {product.barcode && (
                                            <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-700">
                                                {product.barcode}
                                            </span>
                                        )}
                                        {product.category && (
                                            <span>Kategori: <strong className="text-slate-700">{product.category.nama}</strong></span>
                                        )}
                                        {product.brand && (
                                            <span>Brand: <strong className="text-slate-700">{product.brand.nama}</strong></span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Info Banner on Stock Management */}
                            <div className="p-2.5 bg-white border border-slate-200/70 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                                <IconInfoCircle size={16} className="text-slate-400 shrink-0" />
                                <span>Stok produk fisik tidak dapat diubah di sini. Gunakan fitur <strong>Penerimaan / Opname Stok</strong>.</span>
                            </div>
                        </div>
                    )}

                    {/* Financial Inputs */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                            <FormNominalInput<StoreProductEditFormValues>
                                name="harga_beli"
                                label="Harga Beli (Rp)"
                                placeholder="Contoh: 8.000"
                                disabled={updateProductStore.isPending}
                            />
                            <FormNominalInput<StoreProductEditFormValues>
                                name="harga_jual"
                                label="Harga Jual (Rp)"
                                placeholder="Contoh: 10.000"
                                disabled={updateProductStore.isPending}
                            />
                            <FormNumberInput<StoreProductEditFormValues>
                                name="margin"
                                label="Margin (%)"
                                placeholder="Contoh: 20"
                                disabled={updateProductStore.isPending}
                            />
                        </div>

                        {/* Interactive Profit Live Preview */}
                        <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                                <IconTrendingUp size={16} className="text-emerald-600 shrink-0" />
                                <span>Estimasi Keuntungan Bersih:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-extrabold text-emerald-900 text-sm">
                                    {formatRupiah(profitPerUnit > 0 ? profitPerUnit : 0)}
                                </span>
                                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100/80 px-1.5 py-0.5 rounded-md">
                                    / unit ({watchMargin || 0}%)
                                </span>
                            </div>
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
