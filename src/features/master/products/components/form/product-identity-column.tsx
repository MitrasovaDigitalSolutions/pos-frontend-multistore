"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormSelect, type FormSelectProps } from "@/components/forms/form-select";
import { FormRadioChips } from "@/components/forms/form-radio-chips";
import { FormSwitch } from "@/components/forms/form-switch";
import { Scrollable } from "@/components/ui/scrollable";
import { generateEan13Barcode } from "@/lib/barcode-utils";
import { toast } from "sonner";
import {
    IconBarcode,
    IconBox,
    IconLock,
    IconPackage,
    IconSparkles,
    IconTools,
} from "@tabler/icons-react";
import type { Category } from "@/features/master/categories/types";
import type { Brand } from "@/features/master/brands/types";
import type { Unit } from "@/features/master/units/types";
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
    canEditMasterData?: boolean;
    isEditing?: boolean;
    categorySelectProps: Omit<FormSelectProps<ProductInput, Category>, "name">;
    brandSelectProps: Omit<FormSelectProps<ProductInput, Brand>, "name">;
    unitSelectProps: Omit<FormSelectProps<ProductInput, Unit>, "name">;
}

export function ProductIdentityColumn({
    onProductTypeChange,
    disabled = false,
    canEditMasterData = true,
    isEditing = false,
    categorySelectProps,
    brandSelectProps,
    unitSelectProps,
}: ProductIdentityColumnProps) {
    const {
        register,
        setValue,
        formState: { errors },
    } = useFormContext<ProductInput>();

    const isActive = useWatch<ProductInput>({ name: "is_active" });
    const currentBarcode = useWatch<ProductInput>({ name: "barcode" });
    const isMasterDataDisabled = disabled || (isEditing && !canEditMasterData);

    const handleAutoGenerateBarcode = () => {
        const newBarcode = generateEan13Barcode();
        setValue("barcode", newBarcode, { shouldDirty: true, shouldValidate: true });
        toast.success(`Barcode otomatis dibuat: ${newBarcode}`);
    };

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs flex flex-col md:h-full min-h-0">
            {/* Header Kolom */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 shrink-0">
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <IconPackage size={12} />
                </div>
                <span className="text-xs font-bold text-slate-800">
                    Identitas &amp; Klasifikasi
                </span>
            </div>

            {/* Scrollable Body Kolom */}
            <Scrollable className="flex-1 min-h-0 pr-2 pt-2" scrollbarClassName="z-20">
                <div className="space-y-3 pb-2">
                    {isEditing && !canEditMasterData && (
                        <div className="p-2.5 bg-amber-50/80 border border-amber-200/70 rounded-xl flex items-start gap-2 text-amber-900 text-xs">
                            <IconLock size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <div className="leading-snug">
                                <p className="font-bold text-[11px]">Data Master Produk Dikunci</p>
                                <p className="text-[10px] text-amber-700">
                                    Toko cabang dilarang mengubah nama, barcode, atau klasifikasi produk.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Nama Produk */}
                    <div className="space-y-1" id="form-product-name-input">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Nama Produk <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="Contoh: Kemeja Formal Pria Slim Fit Cotton"
                            className="h-9 text-xs font-semibold border-slate-200 focus-visible:ring-emerald-600 rounded-xl"
                            disabled={isMasterDataDisabled}
                            {...register("nama")}
                        />
                        {errors.nama && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.nama.message}
                            </p>
                        )}
                    </div>

                    {/* Tipe Produk (Radio / Chip Select) */}
                    <div id="form-product-type-select">
                        <FormRadioChips<ProductInput>
                            name="product_type"
                            label="Tipe Produk"
                            options={PRODUCT_TYPE_OPTIONS}
                            variant="segmented"
                            size="sm"
                            onChange={(val) => onProductTypeChange((val as ProductType) || "finished_good")}
                            disabled={isMasterDataDisabled}
                        />
                    </div>

                    {/* Barcode / SKU with Generate Action */}
                    <div className="space-y-1" id="form-product-barcode-container">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Barcode / SKU
                            </label>
                            {!currentBarcode && !isMasterDataDisabled && (
                                <button
                                    id="btn-generate-barcode-addon"
                                    type="button"
                                    onClick={handleAutoGenerateBarcode}
                                    disabled={isMasterDataDisabled}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                    <IconSparkles size={11} />
                                    <span>Buat Barcode</span>
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Contoh: 8990002004"
                                className="h-9 text-xs border-slate-200 focus-visible:ring-emerald-600 rounded-xl font-mono pr-8"
                                disabled={isMasterDataDisabled}
                                {...register("barcode")}
                            />
                            <IconBarcode
                                size={16}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                            />
                        </div>
                        {errors.barcode && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.barcode.message}
                            </p>
                        )}
                    </div>

                    {/* Kategori & Brand */}
                    <div className="grid grid-cols-2 gap-2" id="form-product-category-brand">
                        <FormSelect<ProductInput, Category>
                            name="category_uid"
                            label="Kategori"
                            {...categorySelectProps}
                            placeholder="Pilih Kategori"
                            searchPlaceholder="Cari kategori..."
                            disabled={isMasterDataDisabled}
                            size="sm"
                        />

                        <FormSelect<ProductInput, Brand>
                            name="brand_uid"
                            label="Brand / Merek"
                            {...brandSelectProps}
                            placeholder="Pilih Brand"
                            searchPlaceholder="Cari brand..."
                            disabled={isMasterDataDisabled}
                            size="sm"
                        />
                    </div>

                    {/* Satuan Unit Pengukuran */}
                    <div className="space-y-1" id="form-product-unit-select">
                        <FormSelect<ProductInput, Unit>
                            name="unit_uid"
                            label="Satuan Standar"
                            {...unitSelectProps}
                            placeholder="Pilih Satuan (Pcs, Kg, Meter, dll)"
                            searchPlaceholder="Cari satuan..."
                            disabled={isMasterDataDisabled}
                            size="sm"
                        />
                    </div>

                    {/* Status Aktif / Nonaktif Switch */}
                    <div className="pt-2 border-t border-slate-100">
                        <FormSwitch<ProductInput>
                            name="is_active"
                            label={isActive !== false ? "Status Produk: Aktif" : "Status Produk: Nonaktif"}
                            description={
                                isEditing && !canEditMasterData
                                    ? "Pengubahan status produk dinonaktifkan oleh kebijakan Toko Pusat."
                                    : isActive !== false
                                        ? "Produk aktif dan dapat diperjualbelikan serta didistribusikan."
                                        : "Produk dinonaktifkan sementara dari katalog dan transaksi kasir."
                            }
                            disabled={isMasterDataDisabled}
                        />
                    </div>
                </div>
            </Scrollable>
        </div>
    );
}
