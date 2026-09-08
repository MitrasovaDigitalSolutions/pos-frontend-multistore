"use client";

import React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { UpdateAssetSchemaInput } from "../../../schemas/asset-schema";
import type { Asset } from "../../../types";

interface AssetFormEditViewProps {
    form: UseFormReturn<UpdateAssetSchemaInput>;
    asset: Asset;
    isPending: boolean;
    onSubmit: (values: UpdateAssetSchemaInput) => void;
    onCancel: () => void;
}

export function AssetFormEditView({
    form,
    asset,
    isPending,
    onSubmit,
    onCancel,
}: AssetFormEditViewProps) {
    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = form;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-1">
            {/* Readonly Overview Card */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
                <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">No. Aset</span>
                    <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {asset.nomor_aset}
                    </div>
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Kategori</span>
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                        {asset.category?.nama || "-"}
                    </div>
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Harga Perolehan</span>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                        {formatRupiah(Number(asset.harga_perolehan) || 0)}
                    </div>
                </div>
                <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Nilai Buku</span>
                    <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(Number(asset.nilai_buku) || 0)}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="edit_nama" className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Nama Aset <span className="text-rose-500">*</span>
                    </label>
                    <Input
                        id="edit_nama"
                        placeholder="Nama aset..."
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
                    <label htmlFor="edit_kode" className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        SN <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <Input
                        id="edit_kode"
                        placeholder="SN: C02X1234"
                        {...register("kode_aset")}
                        disabled={isPending}
                        className="h-8 text-xs rounded-lg"
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

                <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="edit_catatan" className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                        Catatan <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <Input
                        id="edit_catatan"
                        placeholder="Catatan kondisi aset, lokasi penempatan, vendor..."
                        {...register("catatan")}
                        disabled={isPending}
                        className="h-8 text-xs rounded-lg"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isPending}
                    className="h-8 px-3 text-xs rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="h-8 px-3.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs cursor-pointer"
                >
                    {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
            </div>
        </form>
    );
}
