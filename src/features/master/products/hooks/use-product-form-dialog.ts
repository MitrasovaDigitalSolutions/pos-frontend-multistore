"use client";

import { useForm, useWatch, type Resolver, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { queryKeys } from "@/lib/query-keys";
import { getImageUrl } from "@/lib/utils";
import { useCategorySelectConfig } from "@/features/master/categories/hooks/use-category-select";
import { useBrandSelectConfig } from "@/features/master/brands/hooks/use-brand-select";
import type { Brand } from "@/features/master/brands/types";
import { apiPatch } from "@/shared/api/api-client";
import { useCreateProduct, useUpdateProduct } from "../api/products-api";
import { productSchema, type ProductInput } from "../schemas/product-schema";
import type { Product } from "../types";

export type ProductType = "finished_good" | "raw_material" | "jasa";

export const defaultProductValues: ProductInput = {
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
    product_type: "finished_good",
    is_jasa: false,
    is_raw_material: false,
    is_grosir: false,
    is_active: true,
    status: "active",
};

interface UseProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingProduct: Product | null;
    duplicateProduct?: Product | null;
    onSuccess?: (product: Product) => void;
}

export function useProductFormDialog({
    open,
    onOpenChange,
    editingProduct,
    duplicateProduct,
    onSuccess,
}: UseProductFormDialogProps) {
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const queryClient = useQueryClient();

    const methods = useForm<ProductInput>({
        resolver: zodResolver(productSchema) as Resolver<ProductInput>,
        defaultValues: defaultProductValues,
    });

    const {
        control,
        setValue,
        getValues,
        reset,
    } = methods;

    const isPending = createProduct.isPending || updateProduct.isPending;

    // Reset form when dialog opens or editingProduct/duplicateProduct changes
    useEffect(() => {
        if (open) {
            if (editingProduct) {
                const storeProduct = editingProduct.product_stores?.[0];
                const rawHGrosir = editingProduct.harga_grosir ?? storeProduct?.harga_grosir ?? null;
                const rawMinQty = editingProduct.min_qty_grosir ?? storeProduct?.min_qty_grosir ?? null;
                const hGrosir = rawHGrosir !== null && rawHGrosir !== undefined ? Number(rawHGrosir) : null;
                const minQty = rawMinQty !== null && rawMinQty !== undefined ? Number(rawMinQty) : null;
                const hGrosirTotal = (hGrosir && minQty) ? Math.round(hGrosir * minQty) : null;

                const initialProductType: ProductType = editingProduct.is_jasa
                    ? "jasa"
                    : editingProduct.is_raw_material
                        ? "raw_material"
                        : "finished_good";

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
                    product_type: initialProductType,
                    is_jasa: !!editingProduct.is_jasa,
                    is_raw_material: !!editingProduct.is_raw_material,
                    is_grosir: Boolean(editingProduct.is_grosir ?? storeProduct?.is_grosir ?? false),
                    is_active: editingProduct.status !== "inactive",
                    status: editingProduct.status,
                });
            } else if (duplicateProduct) {
                const storeProduct = duplicateProduct.product_stores?.[0];
                const rawHGrosir = duplicateProduct.harga_grosir ?? storeProduct?.harga_grosir ?? null;
                const rawMinQty = duplicateProduct.min_qty_grosir ?? storeProduct?.min_qty_grosir ?? null;
                const hGrosir = rawHGrosir !== null && rawHGrosir !== undefined ? Number(rawHGrosir) : null;
                const minQty = rawMinQty !== null && rawMinQty !== undefined ? Number(rawMinQty) : null;
                const hGrosirTotal = (hGrosir && minQty) ? Math.round(hGrosir * minQty) : null;

                const initialProductType: ProductType = duplicateProduct.is_jasa
                    ? "jasa"
                    : duplicateProduct.is_raw_material
                        ? "raw_material"
                        : "finished_good";

                reset({
                    nama: duplicateProduct.nama,
                    merek: duplicateProduct.merek || "",
                    barcode: "", // Barcode dikosongkan untuk produk baru hasil duplikasi
                    harga: duplicateProduct.harga ?? storeProduct?.harga_jual ?? 0,
                    harga_grosir: hGrosir,
                    min_qty_grosir: minQty,
                    harga_grosir_total: hGrosirTotal,
                    stok: duplicateProduct.stok ?? storeProduct?.stok ?? 0,
                    harga_beli: duplicateProduct.harga_beli ?? storeProduct?.harga_beli ?? 0,
                    margin: duplicateProduct.margin ?? storeProduct?.margin ?? 0,
                    category_uid: duplicateProduct.category_uid ?? null,
                    brand_uid: duplicateProduct.brand_uid ?? null,
                    image: undefined,
                    product_type: initialProductType,
                    is_jasa: !!duplicateProduct.is_jasa,
                    is_raw_material: !!duplicateProduct.is_raw_material,
                    is_grosir: Boolean(duplicateProduct.is_grosir ?? storeProduct?.is_grosir ?? false),
                    is_active: true,
                    status: "active",
                });
            } else {
                reset(defaultProductValues);
            }
        }
    }, [open, editingProduct, duplicateProduct, reset]);

    const activeProduct = editingProduct ?? duplicateProduct;

    const categorySelectProps = useCategorySelectConfig({
        targetUid: activeProduct?.category_uid,
        targetCategory: activeProduct?.category,
    });

    const brandSelectProps = useBrandSelectConfig({
        targetUid: activeProduct?.brand_uid,
        targetBrand: activeProduct?.brand,
    });

    // Form Watches
    const hargaBeli = useWatch({ control, name: "harga_beli" });
    const harga = useWatch({ control, name: "harga" });
    const margin = useWatch({ control, name: "margin" });
    const isJasa = useWatch({ control, name: "is_jasa" });
    const isRawMaterial = useWatch({ control, name: "is_raw_material" });
    const isGrosir = useWatch({ control, name: "is_grosir" });
    const watchedProductType = useWatch({ control, name: "product_type" });

    // Derive active product type
    const productType: ProductType = watchedProductType || (
        isJasa
            ? "jasa"
            : isRawMaterial
                ? "raw_material"
                : "finished_good"
    );

    const handleProductTypeChange = (value: ProductType) => {
        setValue("product_type", value, { shouldValidate: true, shouldDirty: true });
        if (value === "jasa") {
            setValue("is_jasa", true, { shouldValidate: true, shouldDirty: true });
            setValue("is_raw_material", false, { shouldValidate: true, shouldDirty: true });
            setValue("is_grosir", false, { shouldValidate: true, shouldDirty: true });
            setValue("stok", 0);
            setValue("harga_beli", 0);
            setValue("margin", 0);
        } else if (value === "raw_material") {
            setValue("is_jasa", false, { shouldValidate: true, shouldDirty: true });
            setValue("is_raw_material", true, { shouldValidate: true, shouldDirty: true });
            setValue("is_grosir", false, { shouldValidate: true, shouldDirty: true });
            setValue("harga", 0);
            setValue("margin", 0);
        } else {
            setValue("is_jasa", false, { shouldValidate: true, shouldDirty: true });
            setValue("is_raw_material", false, { shouldValidate: true, shouldDirty: true });
        }
    };

    // Direct Event-Driven Calculations (No fragile useEffect)
    const handleHargaBeliChange = (val: number | null) => {
        const newHBeli = val || 0;
        if (productType === "finished_good") {
            const currentHJual = Number(getValues("harga")) || 0;
            if (newHBeli > 0 && currentHJual > 0) {
                const calculatedMargin = ((currentHJual - newHBeli) / newHBeli) * 100;
                setValue("margin", parseFloat(calculatedMargin.toFixed(2)));
            } else {
                setValue("margin", 0);
            }
        }
    };

    const handleHargaChange = (val: number | null) => {
        const newHJual = val || 0;
        if (productType === "finished_good") {
            const currentHBeli = Number(getValues("harga_beli")) || 0;
            if (currentHBeli > 0) {
                const calculatedMargin = ((newHJual - currentHBeli) / currentHBeli) * 100;
                setValue("margin", parseFloat(calculatedMargin.toFixed(2)));
            } else {
                setValue("margin", 0);
            }
        }
    };

    const handleMarginChange = (val: number | null) => {
        const newMargin = val || 0;
        if (productType === "finished_good") {
            const currentHBeli = Number(getValues("harga_beli")) || 0;
            if (currentHBeli > 0) {
                const calculatedHarga = currentHBeli * (1 + newMargin / 100);
                setValue("harga", Math.round(calculatedHarga));
            }
        }
    };

    const handleHargaGrosirChange = (val: number | null) => {
        const unitPrice = val || 0;
        const minQty = Number(getValues("min_qty_grosir")) || 0;
        if (minQty > 0 && unitPrice > 0) {
            setValue("harga_grosir_total", Math.round(unitPrice * minQty));
        } else if (!val) {
            setValue("harga_grosir_total", null);
        }
    };

    const handleMinQtyGrosirChange = (val: number | null) => {
        const minQty = val || 0;
        const unitPrice = Number(getValues("harga_grosir")) || 0;
        if (minQty > 0 && unitPrice > 0) {
            setValue("harga_grosir_total", Math.round(unitPrice * minQty));
        } else if (!val) {
            setValue("harga_grosir_total", null);
        }
    };

    const handleHargaGrosirTotalChange = (val: number | null) => {
        const totalPrice = val || 0;
        const minQty = Number(getValues("min_qty_grosir")) || 0;
        if (minQty > 0 && totalPrice > 0) {
            setValue("harga_grosir", Math.round(totalPrice / minQty));
        } else if (!val) {
            setValue("harga_grosir", null);
        }
    };

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

        const finalHargaJual = data.is_raw_material
            ? (data.harga || data.harga_beli || 0)
            : (data.harga || 0);

        formData.append("harga_jual", String(finalHargaJual));

        const isGrosirFlag = Boolean(data.is_grosir && !data.is_raw_material && !data.is_jasa);
        formData.append("is_grosir", isGrosirFlag ? "1" : "0");

        if (isGrosirFlag && data.harga_grosir !== null && data.harga_grosir !== undefined) {
            formData.append("harga_grosir", String(data.harga_grosir));
        }

        if (isGrosirFlag && data.min_qty_grosir !== null && data.min_qty_grosir !== undefined) {
            formData.append("min_qty_grosir", String(data.min_qty_grosir));
        }

        if (data.stok !== undefined && data.stok !== null) {
            formData.append("stok", String(data.is_jasa ? 0 : data.stok));
        }

        if (data.harga_beli !== null && data.harga_beli !== undefined) {
            formData.append("harga_beli", String(data.is_jasa ? 0 : data.harga_beli));
        }

        const finalMargin = (data.is_raw_material || data.is_jasa) ? 0 : (data.margin ?? 0);
        formData.append("margin", String(finalMargin));

        formData.append("category_uid", data.category_uid ? String(data.category_uid) : "");
        formData.append("brand_uid", data.brand_uid ? String(data.brand_uid) : "");

        if (data.image instanceof File) {
            formData.append("image", data.image);
        }

        formData.append("is_jasa", data.is_jasa ? "1" : "0");
        formData.append("is_raw_material", data.is_raw_material ? "1" : "0");

        const targetStatus: "active" | "inactive" = data.is_active !== false ? "active" : "inactive";

        if (editingProduct) {
            formData.append("status", targetStatus);
            updateProduct.mutate(
                { uid: editingProduct.uid, data: formData },
                {
                    onSuccess: async (res) => {
                        if (editingProduct.status !== targetStatus && editingProduct.status !== "archived") {
                            try {
                                await apiPatch(`/v1/products/${editingProduct.uid}/status`, { status: targetStatus });
                            } catch {
                                // Handled by formData or silent fallback
                            }
                        }
                        toast.success(res.message || "Produk berhasil diperbarui!");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui produk.");
                    },
                },
            );
        } else {
            formData.append("status", targetStatus);
            createProduct.mutate(formData, {
                onSuccess: (res) => {
                    toast.success(res.message || "Produk berhasil ditambahkan!");
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

    const onError = (fieldErrors: FieldErrors<ProductInput>) => {
        const errorList = Object.values(fieldErrors);
        if (errorList.length > 0 && errorList[0]?.message) {
            toast.error(`Validasi: ${errorList[0].message}`);
        } else {
            toast.error("Harap lengkapi semua kolom formulir yang wajib diisi.");
        }
    };

    const initialImageUrl = getImageUrl(editingProduct?.image_url || editingProduct?.image_path);
    const profitPerUnit = (Number(harga) || 0) - (Number(hargaBeli) || 0);

    return {
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
        isGrosir: Boolean(isGrosir),
        // Event-driven calculation handlers
        handleHargaBeliChange,
        handleHargaChange,
        handleMarginChange,
        handleHargaGrosirChange,
        handleMinQtyGrosirChange,
        handleHargaGrosirTotalChange,
    };
}
