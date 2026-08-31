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
        <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                <IconFileDescription className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Informasi & Nilai Kapitalisasi
                </h4>
            </div>

            {/* Nama Aset */}
            <div className="space-y-1">
                <label htmlFor="nama" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Nama Aset <span className="text-rose-500">*</span>
                </label>
                <Input
                    id="nama"
                    placeholder="Contoh: Laptop MacBook Pro M3, Mobil Suzuki Carry 2024"
                    {...register("nama")}
                    disabled={isPending}
                    className="h-8.5 text-xs rounded-xl"
                />
                {errors.nama && (
                    <p className="text-[11px] text-rose-500 font-medium">
                        {errors.nama.message}
                    </p>
                )}
            </div>

            {/* Kategori & Kode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Kategori Aset <span className="text-rose-500">*</span>
                    </label>
                    <CommandSelect
                        options={categoryOptions}
                        value={watchedCategoryUid || ""}
                        onChange={(val: string) => setValue("asset_category_uid", val)}
                        placeholder="Pilih Kategori..."
                        disabled={isPending}
                        className="h-8.5 text-xs rounded-xl"
                    />
                    {categoryAssetCoa && (
                        <p
                            className="text-[10px] text-slate-500 truncate"
                            title={`Akun: [${categoryAssetCoa.kode}] ${categoryAssetCoa.nama}`}
                        >
                            Akun:{" "}
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                                [{categoryAssetCoa.kode}]
                            </span>{" "}
                            {categoryAssetCoa.nama}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <label htmlFor="kode_aset" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Kode / Serial No. <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <Input
                        id="kode_aset"
                        placeholder="Contoh: AST-001 / SN-2024"
                        {...register("kode_aset")}
                        disabled={isPending}
                        className="h-8.5 text-xs rounded-xl"
                    />
                </div>
            </div>

            {/* Tanggal, Harga & Residu */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
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
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
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
                                className="h-8.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 rounded-xl"
                            />
                        )}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
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
                                className="h-8.5 text-xs rounded-xl"
                            />
                        )}
                    />
                </div>
            </div>

            {/* Catatan */}
            <div className="space-y-1">
                <label htmlFor="catatan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                    id="catatan"
                    rows={2}
                    placeholder="Keterangan vendor pembelian, lokasi penempatan, kondisi..."
                    {...register("catatan")}
                    disabled={isPending}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
            </div>
        </div>
    );
}
