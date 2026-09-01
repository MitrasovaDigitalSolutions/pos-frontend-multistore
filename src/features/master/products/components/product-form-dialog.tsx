"use client";

import { FormImageUpload } from "@/components/forms/form-image-upload";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormNumberInput } from "@/components/forms/form-number-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormSwitch } from "@/components/forms/form-switch";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBrandSelectConfig } from "@/features/master/brands/hooks/use-brand-select";
import type { Brand } from "@/features/master/brands/types";
import { useCategorySelectConfig } from "@/features/master/categories/hooks/use-category-select";
import type { Category } from "@/features/master/categories/types";
import { queryKeys } from "@/lib/query-keys";
import { getImageUrl } from "@/lib/utils";
import { IconInfoCircle, IconPackage } from "@tabler/icons-react";
import { useForm, FormProvider, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Show } from "@/components/ui/show";
import { useCreateProduct, useUpdateProduct } from "../api/products-api";
import { productSchema, type ProductInput } from "../schemas/product-schema";
import type { Product } from "../types";

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingProduct: Product | null;
    onSuccess?: (product: Product) => void;
    infoMessage?: string;
}

const defaultProductValues: ProductInput = {
    nama: "",
    merek: "",
    barcode: "",
    harga: 0,
    harga_grosir: null,
    min_qty_grosir: null,
    harga_grosir_total: null,
    stok: 0,
    harga_beli: 0,
    margin: 0,
    category_uid: null,
    brand_uid: null,
    image: undefined,
    is_jasa: false,
    is_raw_material: false,
    is_grosir: false,
};

export function ProductFormDialog({
    open,
    onOpenChange,
    editingProduct,
    onSuccess,
    infoMessage,
}: ProductFormDialogProps) {
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const queryClient = useQueryClient();

    const methods = useForm<ProductInput>({
        resolver: zodResolver(productSchema) as Resolver<ProductInput>,
        defaultValues: defaultProductValues,
    });

    const {
        register,
        handleSubmit,
        control,
        setValue,
        reset,
        formState: { errors },
    } = methods;

    const isPending = createProduct.isPending || updateProduct.isPending;

    useEffect(() => {
        if (open) {
            if (editingProduct) {
                const storeProduct = editingProduct.product_stores?.[0];
                const rawHGrosir = editingProduct.harga_grosir ?? storeProduct?.harga_grosir ?? null;
                const rawMinQty = editingProduct.min_qty_grosir ?? storeProduct?.min_qty_grosir ?? null;
                const hGrosir = rawHGrosir !== null && rawHGrosir !== undefined ? Number(rawHGrosir) : null;
                const minQty = rawMinQty !== null && rawMinQty !== undefined ? Number(rawMinQty) : null;
                const hGrosirTotal = (hGrosir && minQty) ? Math.round(hGrosir * minQty) : null;

                reset({
                    nama: editingProduct.nama,
                    merek: editingProduct.merek || "",
                    barcode: editingProduct.barcode || "",
                    harga: editingProduct.harga ?? storeProduct?.harga_jual ?? 0,
                    harga_grosir: hGrosir,
                    min_qty_grosir: minQty,
                    harga_grosir_total: hGrosirTotal,
                    stok: editingProduct.stok ?? storeProduct?.stok ?? 0,
                    harga_beli: editingProduct.harga_beli ?? storeProduct?.harga_beli ?? 0,
                    margin: editingProduct.margin ?? storeProduct?.margin ?? 0,
                    category_uid: editingProduct.category_uid ?? null,
                    brand_uid: editingProduct.brand_uid ?? null,
                    image: undefined,
                    is_jasa: !!editingProduct.is_jasa,
                    is_raw_material: !!editingProduct.is_raw_material,
                    is_grosir: Boolean(editingProduct.is_grosir ?? storeProduct?.is_grosir ?? false),
                });
            } else {
                reset(defaultProductValues);
            }
        }
    }, [open, editingProduct, reset]);

    const categorySelectProps = useCategorySelectConfig({
        targetUid: editingProduct?.category_uid,
        targetCategory: editingProduct?.category,
    });

    const brandSelectProps = useBrandSelectConfig({
        targetUid: editingProduct?.brand_uid,
        targetBrand: editingProduct?.brand,
    });

    // Automatic Margin & Price calculations using useWatch
    const hargaBeli = useWatch({ control, name: "harga_beli" });
    const harga = useWatch({ control, name: "harga" });
    const margin = useWatch({ control, name: "margin" });
    const isJasa = useWatch({ control, name: "is_jasa" });
    const isRawMaterial = useWatch({ control, name: "is_raw_material" });
    const isGrosir = useWatch({ control, name: "is_grosir" });
    const hargaGrosir = useWatch({ control, name: "harga_grosir" });
    const minQtyGrosir = useWatch({ control, name: "min_qty_grosir" });
    const hargaGrosirTotal = useWatch({ control, name: "harga_grosir_total" });

    useEffect(() => {
        if (isJasa) {
            setValue("stok", 0);
            setValue("is_raw_material", false);
        }
    }, [isJasa, setValue]);

    useEffect(() => {
        if (isRawMaterial) {
            setValue("is_jasa", false);
        }
    }, [isRawMaterial, setValue]);

    // Single consolidated effect for margin and wholesale price calculations
    useEffect(() => {
        const activeId = typeof document !== "undefined" ? document.activeElement?.id : undefined;
        if (!activeId) return;

        const hBeli = Number(hargaBeli) || 0;
        const hJual = Number(harga) || 0;
        const minQty = Number(minQtyGrosir) || 0;

        if (activeId === "harga_beli" || activeId === "harga") {
            if (hBeli > 0) {
                const calculatedMargin = ((hJual - hBeli) / hBeli) * 100;
                setValue("margin", parseFloat(calculatedMargin.toFixed(2)));
            } else {
                setValue("margin", 0);
            }
        } else if (activeId === "margin") {
            const mrg = Number(margin) || 0;
            const calculatedHarga = hBeli * (1 + mrg / 100);
            setValue("harga", Math.round(calculatedHarga));
        } else if (activeId === "harga_grosir" || activeId === "min_qty_grosir") {
            const unitPrice = Number(hargaGrosir) || 0;
            if (minQty > 0 && unitPrice > 0) {
                setValue("harga_grosir_total", Math.round(unitPrice * minQty));
            } else if (!hargaGrosir) {
                setValue("harga_grosir_total", null);
            }
        } else if (activeId === "harga_grosir_total") {
            const totalPrice = Number(hargaGrosirTotal) || 0;
            if (minQty > 0 && totalPrice > 0) {
                setValue("harga_grosir", Math.round(totalPrice / minQty));
            } else if (!hargaGrosirTotal) {
                setValue("harga_grosir", null);
            }
        }
    }, [hargaBeli, harga, margin, hargaGrosir, minQtyGrosir, hargaGrosirTotal, setValue]);

    const onSubmit = (data: ProductInput) => {
        const formData = new FormData();
        formData.append("nama", data.nama);

        const brandUid = data.brand_uid;
        let brandName = "Umum";
        if (brandUid) {
            if (editingProduct?.brand_uid === brandUid && editingProduct.brand) {
                brandName = editingProduct.brand.nama;
            } else {
                const caches = queryClient.getQueriesData<{ pages?: { data?: Brand[] }[] }>({
                    queryKey: [...queryKeys.brands.all, "infinite"],
                });
                for (const [, cacheData] of caches) {
                    const found = cacheData?.pages?.flatMap(p => p.data || []).find(b => String(b?.uid) === String(brandUid));
                    if (found) {
                        brandName = found.nama;
                        break;
                    }
                }
            }
        }
        formData.append("merek", brandName);

        if (data.barcode) {
            formData.append("barcode", data.barcode);
        }

        formData.append("harga_jual", String(data.harga));

        if (data.harga_grosir !== null && data.harga_grosir !== undefined) {
            formData.append("harga_grosir", String(data.harga_grosir));
        }

        if (data.min_qty_grosir !== null && data.min_qty_grosir !== undefined) {
            formData.append("min_qty_grosir", String(data.min_qty_grosir));
        }

        const isGrosir = Boolean(data.is_grosir);
        formData.append("is_grosir", isGrosir ? "1" : "0");

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
        formData.append("is_raw_material", data.is_raw_material ? "1" : "0");

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

    const onError = () => {
        toast.error("Gagal menyimpan produk. Harap lengkapi semua input yang wajib diisi.");
    };

    const initialImageUrl = getImageUrl(editingProduct?.image_url || editingProduct?.image_path);

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
            <FormProvider {...methods}>
                <form
                    onSubmit={handleSubmit(onSubmit, onError)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {infoMessage && (
                        <div className="md:col-span-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium flex items-center gap-2.5">
                            <IconInfoCircle size={18} className="text-amber-600 shrink-0" />
                            <p className="font-bold">Info:</p> {infoMessage}
                        </div>
                    )}
                    {/* Kolom Kiri: Upload Gambar */}
                    <div className="md:col-span-1 space-y-4">
                        <FormImageUpload<ProductInput>
                            name="image"
                            label="Gambar Produk"
                            disabled={isPending}
                            initialUrl={initialImageUrl}
                        />

                        <FormSwitch<ProductInput>
                            name="is_jasa"
                            label="Produk Jasa / Layanan"
                            description="Aktifkan jika produk ini berupa layanan yang tidak memerlukan stok fisik."
                            disabled={isPending || isRawMaterial}
                        />

                        <FormSwitch<ProductInput>
                            name="is_raw_material"
                            label="Bahan Baku (Khusus Produksi)"
                            description="Aktifkan jika produk ini adalah bahan baku konveksi/produksi (tidak dijual di kasir POS)."
                            disabled={isPending || isJasa}
                        />
                    </div>

                    {/* Kolom Kanan: Detail & Informasi Produk */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Barcode & Nama Produk */}
                        <div className="grid grid-cols-2 gap-3">
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

                            <div className="col-span-1 space-y-1.5">
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

                        {/* Kategori & Brand */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormSelect<ProductInput, Category>
                                name="category_uid"
                                label="Kategori"
                                {...categorySelectProps}
                                placeholder="Pilih Kategori"
                                searchPlaceholder="Cari kategori..."
                                disabled={isPending}
                                size="md"
                            />
                            <FormSelect<ProductInput, Brand>
                                name="brand_uid"
                                label="Brand"
                                {...brandSelectProps}
                                placeholder="Pilih Brand"
                                searchPlaceholder="Cari brand..."
                                disabled={isPending}
                                size="md"
                            />
                        </div>

                        {/* Keuangan: Harga Beli, Margin, Harga Jual, Stok */}
                        <div className="grid grid-cols-3 gap-3">
                            <FormNominalInput<ProductInput>
                                name="harga_beli"
                                label="Harga Beli (Modal)"
                                placeholder="0"
                                disabled={isPending}
                            />
                            <FormNumberInput<ProductInput>
                                name="margin"
                                label="Margin (%)"
                                placeholder="0"
                                disabled={isPending}
                            />
                            <FormNominalInput<ProductInput>
                                name="harga"
                                label="Harga Jual *"
                                placeholder="0"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <FormNumberInput<ProductInput>
                                name="stok"
                                label="Stok Awal"
                                placeholder="0"
                                disabled={isPending || isJasa}
                            />
                        </div>

                        {/* Fitur Grosir */}
                        <div className="pt-2 border-t border-slate-100">
                            <FormSwitch<ProductInput>
                                name="is_grosir"
                                label="Aktifkan Harga Grosir"
                                description="Beri potongan harga jika beli dalam jumlah banyak"
                                disabled={isPending}
                            />
                        </div>

                        <Show.When isTrue={Boolean(isGrosir)}>
                            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <FormNumberInput<ProductInput>
                                        name="min_qty_grosir"
                                        label="Min. Qty Grosir"
                                        placeholder="Contoh: 12"
                                        disabled={isPending}
                                    />
                                    <FormNominalInput<ProductInput>
                                        name="harga_grosir"
                                        label="Harga Grosir / Satuan (Rp)"
                                        placeholder="Contoh: 4.800"
                                        disabled={isPending}
                                    />
                                </div>
                                <div>
                                    <FormNominalInput<ProductInput>
                                        name="harga_grosir_total"
                                        label="Total Akumulasi Grosir (Rp)"
                                        placeholder="Contoh: 57.600"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>
                        </Show.When>

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
            </FormProvider>
        </BaseDialog>
    );
}
