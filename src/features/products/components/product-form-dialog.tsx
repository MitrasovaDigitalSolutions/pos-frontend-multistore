"use client";

import { FormImageUpload } from "@/components/forms/form-image-upload";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrands } from "@/features/brands/api/brands-api";
import { useCategories } from "@/features/categories/api/categories-api";
import { getImageUrl } from "@/lib/utils";
import { IconInfoCircle, IconPackage } from "@tabler/icons-react";
import { useEffect, useMemo } from "react";
import { useFormContext, type FieldErrors } from "react-hook-form";
import { toast } from "sonner";
import { useCreateProduct, useUpdateProduct } from "../api/products-api";
import { type ProductInput } from "../schemas/product-schema";
import type { Product } from "../types";

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
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext<ProductInput>();

    const isPending = createProduct.isPending || updateProduct.isPending;

    // Load categories and brands
    const { data: categoriesRes } = useCategories({ per_page: 1000 });
    const { data: brandsRes } = useBrands({ per_page: 1000 });

    const categoryOptions = useMemo(() => {
        const list = categoriesRes?.data || [];
        return [
            { value: "", label: "Tanpa Kategori" },
            ...list.map((c) => ({ value: String(c.uid), label: c.nama }))
        ];
    }, [categoriesRes]);

    const brandOptions = useMemo(() => {
        const list = brandsRes?.data || [];
        return [
            { value: "", label: "Tanpa Brand" },
            ...list.map((b) => ({ value: String(b.uid), label: b.nama }))
        ];
    }, [brandsRes]);

    // Automatic Margin & Price calculations
    const hargaBeli = watch("harga_beli");
    const harga = watch("harga");
    const margin = watch("margin");
    const isJasa = watch("is_jasa");

    useEffect(() => {
        if (isJasa) {
            setValue("stok", 0);
        }
    }, [isJasa, setValue]);

    useEffect(() => {
        const activeId = document.activeElement?.id;

        if (activeId === "harga_beli" || activeId === "harga") {
            const hBeli = Number(hargaBeli) || 0;
            const hJual = Number(harga) || 0;
            if (hBeli > 0) {
                const calculatedMargin = ((hJual - hBeli) / hBeli) * 100;
                setValue("margin", parseFloat(calculatedMargin.toFixed(2)));
            } else {
                setValue("margin", 0);
            }
        }
    }, [hargaBeli, harga, setValue]);

    useEffect(() => {
        const activeId = document.activeElement?.id;

        if (activeId === "margin") {
            const hBeli = Number(hargaBeli) || 0;
            const mrg = Number(margin) || 0;
            const calculatedHarga = hBeli * (1 + mrg / 100);
            setValue("harga", Math.round(calculatedHarga));
        }
    }, [margin, hargaBeli, setValue]);


    const onSubmit = (data: ProductInput) => {
        const formData = new FormData();
        formData.append("nama", data.nama);

        const selectedBrandOption = brandOptions.find((b) => b.value === String(data.brand_uid));
        const brandName = selectedBrandOption && data.brand_uid ? selectedBrandOption.label : "Umum";
        formData.append("merek", brandName);

        if (data.barcode) {
            formData.append("barcode", data.barcode);
        }

        formData.append("harga_jual", String(data.harga));

        if (data.stok !== undefined && data.stok !== null) {
            formData.append("stok", String(data.stok));
        }

        if (data.harga_beli !== null && data.harga_beli !== undefined) {
            formData.append("harga_beli", String(data.harga_beli));
        }

        if (data.margin !== null && data.margin !== undefined) {
            formData.append("margin", String(data.margin));
        }

        formData.append("category_uid", data.category_uid ? String(data.category_uid) : "");
        formData.append("brand_uid", data.brand_uid ? String(data.brand_uid) : "");

        if (data.image instanceof File) {
            formData.append("image", data.image);
        }

        formData.append("is_jasa", data.is_jasa ? "1" : "0");

        if (editingProduct) {
            formData.append("status", editingProduct.status);
            updateProduct.mutate(
                { uid: editingProduct.uid, data: formData },
                {
                    onSuccess: (res) => {
                        toast.success(
                            res.message || "Produk berhasil diperbarui!",
                        );
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui produk.");
                    },
                },
            );
        } else {
            createProduct.mutate(formData, {
                onSuccess: (res) => {
                    toast.success(
                        res.message || "Produk berhasil ditambahkan!",
                    );
                    onOpenChange(false);
                    if (res.data) {
                        onSuccess?.(res.data);
                    }
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal menambahkan produk.");
                },
            });
        }
    };

    const onError = (formErrors: FieldErrors<ProductInput>) => {
        console.error("Product Form Validation Errors:", formErrors);
        toast.error("Gagal menyimpan produk. Silakan periksa kembali input Anda.");
    };

    const initialImageUrl = getImageUrl(editingProduct?.image_path);

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    <IconPackage size={20} className="text-emerald-500" />
                    <span>
                        {editingProduct
                            ? "Edit Detail Produk"
                            : "Tambah Produk Baru"}
                    </span>
                </>
            }
            className="sm:max-w-4xl"
            scrollable={true}
        >
            <form
                onSubmit={handleSubmit(onSubmit, onError)}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 "
            >
                {infoMessage && (
                    <div className="md:col-span-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2.5">
                        <IconInfoCircle size={18} className="text-amber-600 shrink-0" />
                        <p className="font-bold">Info:</p> {infoMessage}
                    </div>
                )}
                {/* Kolom Kiri: Upload Gambar */}
                <div className="md:col-span-1">
                    <FormImageUpload<ProductInput>
                        name="image"
                        label="Gambar Produk"
                        disabled={isPending}
                        initialUrl={initialImageUrl}
                    />
                </div>

                {/* Kolom Kanan: Detail & Informasi Produk */}
                <div className="md:col-span-2 space-y-4">
                    {/* Barcode & Nama Produk */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Barcode / SKU
                            </label>
                            <Input
                                type="text"
                                placeholder="Contoh: 8990002004"
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={isPending}
                                {...register("barcode")}
                            />
                            {errors.barcode && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.barcode.message}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Nama Produk
                            </label>
                            <Input
                                type="text"
                                placeholder="Nama produk lengkap..."
                                className="h-10 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                                disabled={isPending}
                                {...register("nama")}
                            />
                            {errors.nama && (
                                <p className="text-[10px] text-rose-500 font-medium">
                                    {errors.nama.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Kategori, Brand & Stok */}
                    <div className="grid grid-cols-3 gap-3">
                        <FormSelect<ProductInput>
                            name="category_uid"
                            label="Kategori"
                            options={categoryOptions}
                            placeholder="Pilih Kategori"
                            searchPlaceholder="Cari kategori..."
                            disabled={isPending}
                            size="md"
                        />
                        <FormSelect<ProductInput>
                            name="brand_uid"
                            label="Brand"
                            options={brandOptions}
                            placeholder="Pilih Brand"
                            searchPlaceholder="Cari brand..."
                            disabled={isPending}
                            size="md"
                        />
                        <FormNumberInput<ProductInput>
                            name="stok"
                            label="Stok"
                            placeholder={isJasa ? "0" : "50"}
                            disabled={isPending || !!editingProduct || isJasa}
                            helperText={
                                isJasa ? (
                                    <p className="text-[9px] text-blue-500 font-semibold mt-0.5 leading-snug">
                                        Stok produk jasa selalu bernilai 0.
                                    </p>
                                ) : editingProduct ? (
                                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5 leading-snug">
                                        Stok hanya dapat disesuaikan melalui menu stok masuk/keluar.
                                    </p>
                                ) : undefined
                            }
                        />
                    </div>

                    <FormSwitch<ProductInput>
                        name="is_jasa"
                        label="Produk Jasa / Layanan"
                        description="Aktifkan jika produk ini berupa layanan atau jasa yang tidak memerlukan stok fisik."
                        disabled={isPending}
                    />

                    {/* Keuangan: Harga Beli, Harga Jual, Margin */}
                    <div className="grid grid-cols-3 gap-3">
                        <FormNominalInput<ProductInput>
                            name="harga_beli"
                            label="Harga Beli (Rp)"
                            placeholder="Contoh: 8.000"
                            disabled={isPending}
                        />

                        <FormNominalInput<ProductInput>
                            name="harga"
                            label="Harga Jual (Rp)"
                            placeholder="Contoh: 10.000"
                            disabled={isPending}
                        />

                        <FormNumberInput<ProductInput>
                            name="margin"
                            label="Margin (%)"
                            placeholder="Contoh: 20"
                            disabled={isPending}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                            disabled={isPending}
                        >
                            {isPending ? "Menyimpan..." : "Simpan Produk"}
                        </Button>
                    </div>
                </div>
            </form>
        </BaseDialog>
    );
}
