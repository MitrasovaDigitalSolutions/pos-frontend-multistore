"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormSelect, type FormSelectProps } from "@/components/forms/form-select";
import { FormRadioChips } from "@/components/forms/form-radio-chips";
import { IconBarcode, IconBox, IconPackage, IconTools } from "@tabler/icons-react";
import type { Category } from "@/features/master/categories/types";
import type { Brand } from "@/features/master/brands/types";
import type { ProductInput } from "../../schemas/product-schema";
import type { ProductType } from "../../hooks/use-product-form-dialog";

const PRODUCT_TYPE_OPTIONS = [
    { value: "finished_good", label: "Barang Jadi", icon: <IconPackage size={13} /> },
    { value: "raw_material", label: "Bahan Baku", icon: <IconBox size={13} /> },
    { value: "jasa", label: "Jasa", icon: <IconTools size={13} /> },
];

interface ProductIdentityColumnProps {
    onProductTypeChange: (value: ProductType) => void;
    disabled?: boolean;
    categorySelectProps: Omit<FormSelectProps<ProductInput, Category>, "name">;
    brandSelectProps: Omit<FormSelectProps<ProductInput, Brand>, "name">;
}

export function ProductIdentityColumn({
    onProductTypeChange,
    disabled = false,
    categorySelectProps,
    brandSelectProps,
}: ProductIdentityColumnProps) {
    const {
        register,
        formState: { errors },
    } = useFormContext<ProductInput>();

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100">
                    <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <IconPackage size={12} />
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                        Identitas &amp; Klasifikasi
                    </span>
                </div>

                {/* Nama Produk */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Nama Produk <span className="text-rose-500">*</span>
                    </label>
                    <Input
                        type="text"
                        placeholder="Contoh: Kemeja Formal Pria Slim Fit Cotton"
                        className="h-9 text-xs font-semibold border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                        disabled={disabled}
                        {...register("nama")}
                    />
                    {errors.nama && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.nama.message}
                        </p>
                    )}
                </div>

                {/* Tipe Produk (Radio / Chip Select) */}
                <FormRadioChips<ProductInput>
                    name="product_type"
                    label="Tipe Produk"
                    options={PRODUCT_TYPE_OPTIONS}
                    variant="segmented"
                    size="sm"
                    onChange={(val) => onProductTypeChange((val as ProductType) || "finished_good")}
                    disabled={disabled}
                />

                {/* Barcode / SKU */}
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Barcode / SKU
                    </label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Contoh: 8990002004"
                            className="h-9 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl font-mono pr-7"
                            disabled={disabled}
                            {...register("barcode")}
                        />
                        <IconBarcode size={15} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    {errors.barcode && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.barcode.message}
                        </p>
                    )}
                </div>

                {/* Kategori & Brand */}
                <div className="grid grid-cols-2 gap-2">
                    <FormSelect<ProductInput, Category>
                        name="category_uid"
                        label="Kategori"
                        {...categorySelectProps}
                        placeholder="Pilih Kategori"
                        searchPlaceholder="Cari kategori..."
                        disabled={disabled}
                        size="sm"
                    />

                    <FormSelect<ProductInput, Brand>
                        name="brand_uid"
                        label="Brand / Merek"
                        {...brandSelectProps}
                        placeholder="Pilih Brand"
                        searchPlaceholder="Cari brand..."
                        disabled={disabled}
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
}
