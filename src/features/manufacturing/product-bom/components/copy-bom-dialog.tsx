"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { BarcodeInput } from "@/components/shared/barcode-input";
import { IconCopy, IconLoader2 } from "@tabler/icons-react";
import type { Product } from "@/features/master/products/types";
import { useCopyProductBom } from "../api/product-bom-api";
import { copyBomSchema, type CopyBomInput } from "../schemas/product-bom-schema";
import { useState } from "react";

interface CopyBomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetProduct: Product;
    onSuccess?: () => void;
}

export function CopyBomDialog({
    open,
    onOpenChange,
    targetProduct,
    onSuccess,
}: CopyBomDialogProps) {
    const copyMutation = useCopyProductBom();
    const [selectedSourceProduct, setSelectedSourceProduct] = useState<Product | null>(null);

    const {
        handleSubmit,
        setValue,
        reset,
    } = useForm<CopyBomInput>({
        resolver: zodResolver(copyBomSchema) as Resolver<CopyBomInput>,
        defaultValues: {
            source_product_uid: "",
            ratio: 1.0,
        },
    });

    const handleSourceFound = (prod: Product) => {
        if (prod.uid === targetProduct.uid) {
            toast.error("Tidak dapat menyalin BoM dari produk yang sama.");
            return;
        }
        if (prod.is_raw_material) {
            toast.error("Produk sumber harus berupa barang jadi (bukan bahan baku).");
            return;
        }
        setSelectedSourceProduct(prod);
        setValue("source_product_uid", prod.uid, { shouldValidate: true });
        toast.info(`Produk sumber terpilih: ${prod.nama}`);
    };

    const onSubmit = (data: CopyBomInput) => {
        copyMutation.mutate(
            { targetProductUid: targetProduct.uid, data },
            {
                onSuccess: (res) => {
                    toast.success(res.message || "Resep BoM berhasil disalin.");
                    reset();
                    setSelectedSourceProduct(null);
                    onOpenChange(false);
                    onSuccess?.();
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menyalin BoM.");
                },
            }
        );
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <IconCopy size={17} />
                    </div>
                    <div>
                        <span className="text-sm font-bold text-slate-900 block">
                            Salin Resep dari Produk Lain
                        </span>
                        <span className="text-[11px] font-normal text-slate-400 block">
                            Menyalin komposisi bahan baku ke <strong>{targetProduct.nama}</strong>
                        </span>
                    </div>
                </div>
            }
            className="max-w-md"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Cari Produk Sumber */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Pilih Produk Sumber (Barang Jadi Lain yang Sudah Ber-BoM) *
                    </label>
                    <BarcodeInput
                        isRawMaterial={false}
                        isJasa={false}
                        hasBom={true}
                        onProductFound={handleSourceFound}
                        placeholder="Scan barcode / cari nama produk sumber..."
                        disabled={copyMutation.isPending}
                    />
                    {selectedSourceProduct && (
                        <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs mt-2">
                            <div>
                                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                                    Resep Sumber Terpilih:
                                </span>
                                <span className="font-bold text-slate-900 block">
                                    {selectedSourceProduct.nama}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                    {selectedSourceProduct.barcode || "-"}
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedSourceProduct(null);
                                    setValue("source_product_uid", "");
                                }}
                                className="h-7 text-xs text-emerald-700 hover:bg-emerald-100/80 font-semibold"
                            >
                                Ganti
                            </Button>
                        </div>
                    )}
                </div>

                {/* Rasio Pengali */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Rasio Skala Bahan (Ratio) *
                    </label>
                    <span className="text-[10px] text-slate-400 block mb-1">
                        Gunakan 1.0 jika kebutuhan bahan identik, atau misal 1.15 untuk varian ukuran lebih besar.
                    </span>
                    <FormNumberInput<CopyBomInput>
                        name="ratio"
                        placeholder="1.0"
                        allowDecimal={true}
                        disabled={copyMutation.isPending}
                        className="h-9 text-xs font-mono font-bold text-center"
                    />
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        disabled={copyMutation.isPending || !selectedSourceProduct}
                        className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                    >
                        {copyMutation.isPending ? (
                            <>
                                <IconLoader2 size={15} className="animate-spin" />
                                <span>Menyalin Resep...</span>
                            </>
                        ) : (
                            <>
                                <IconCopy size={15} />
                                <span>Terapkan Resep ke Produk Ini</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}
