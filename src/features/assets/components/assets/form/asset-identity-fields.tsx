"use client";

import React from "react";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { CommandSelect, type CommandOption } from "@/components/ui/command-select";
import { DatePicker } from "@/components/ui/date-picker";
import { IconFileDescription } from "@tabler/icons-react";
import type { CreateAssetSchemaInput } from "../../../schemas/asset-schema";
import type { ChartOfAccount } from "@/features/accounting/types";

interface AssetIdentityFieldsProps {
    form: UseFormReturn<CreateAssetSchemaInput>;
    categoryOptions: CommandOption[];
    categoryAssetCoa: ChartOfAccount | null;
    isPending: boolean;
}

export function AssetIdentityFields({
    form,
    categoryOptions,
    categoryAssetCoa,
    isPending,
}: AssetIdentityFieldsProps) {
    const {
        register,
        control,
        setValue,
        formState: { errors },
    } = form;

    const watchedCategoryUid = useWatch({
        control,
        name: "asset_category_uid",
    });

    return (
        <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                <IconFileDescription className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Informasi & Kapitalisasi
                </h4>
            </div>

            {/* Row 1: Nama Aset & Kode / Serial No. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 space-y-1">
                    <label htmlFor="nama" className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Nama Aset <span className="text-rose-500">*</span>
                    </label>
                    <Input
                        id="nama"
                        placeholder="Contoh: Laptop MacBook Pro M3, Mobil Carry"
                        {...register("nama")}
                        disabled={isPending}
                        className="h-8 text-xs rounded-lg"
                    />
                    {errors.nama && (
                        <p className="text-[10px] text-rose-500 font-medium">
                            {errors.nama.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <label htmlFor="kode_aset" className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate block">
                        SN <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <Input
                        id="kode_aset"
                        placeholder="AST-001"
                        {...register("kode_aset")}
                        disabled={isPending}
                        className="h-8 text-xs rounded-lg"
                    />
                </div>
            </div>

            {/* Row 2: Kategori Aset & Indikator Akun CoA */}
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Kategori Aset <span className="text-rose-500">*</span>
                    </label>
                    {categoryAssetCoa && (
                        <span
                            className="text-[10px] text-slate-500 truncate max-w-[240px]"
                            title={`Akun: [${categoryAssetCoa.kode}] ${categoryAssetCoa.nama}`}
                        >
                            Akun:{" "}
                            <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                                [{categoryAssetCoa.kode}]
                            </strong>{" "}
                            {categoryAssetCoa.nama}
                        </span>
                    )}
                </div>
                <CommandSelect
                    options={categoryOptions}
                    value={watchedCategoryUid || ""}
                    onChange={(val: string) => setValue("asset_category_uid", val)}
                    placeholder="Pilih Kategori Aset..."
                    disabled={isPending}
                    className="h-8 text-xs rounded-lg"
                />
            </div>

            {/* Row 3: Tanggal, Harga & Residu */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Tgl Perolehan <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                        control={control}
                        name="tanggal_perolehan"
                        render={({ field }) => (
                            <DatePicker
                                value={field.value}
                                onChange={(val) => field.onChange(val)}
                                placeholder="Pilih tgl..."
                                disabled={isPending}
                                size="sm"
                            />
                        )}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Harga Perolehan <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                        control={control}
                        name="harga_perolehan"
                        render={({ field }) => (
                            <NumberInput
                                value={field.value}
                                onChange={field.onChange}
                                disabled={isPending}
                                placeholder="Rp 0"
                                min={0}
                                className="h-8 text-xs font-bold text-emerald-600 dark:text-emerald-400 rounded-lg"
                            />
                        )}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate block">
                        Nilai Residu <span className="text-slate-400 font-normal">(Sisa)</span>
                    </label>
                    <Controller
                        control={control}
                        name="nilai_residu"
                        render={({ field }) => (
                            <NumberInput
                                value={field.value || 0}
                                onChange={field.onChange}
                                disabled={isPending}
                                placeholder="Rp 0"
                                min={0}
                                className="h-8 text-xs rounded-lg"
                            />
                        )}
                    />
                </div>
            </div>

            {/* Row 4: Catatan Tambahan (Compact Input) */}
            <div className="space-y-1">
                <label htmlFor="catatan" className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <Input
                    id="catatan"
                    placeholder="Vendor pembelian, nomor faktur, lokasi penempatan..."
                    {...register("catatan")}
                    disabled={isPending}
                    className="h-8 text-xs rounded-lg"
                />
            </div>
        </div>
    );
}
