"use client";

import React, { useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import {
    IconTrendingDown,
    IconArrowRight,
    IconCheck,
    IconArrowLeft,
    IconFlame,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
    assetPenyusutanSchema,
    type AssetPenyusutanSchemaInput,
} from "../../../schemas/asset-penyusutan-schema";
import { useCreateAssetPenyusutan } from "../../../api/assets-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Asset } from "../../../types";

interface AssetDetailDepreciationFormProps {
    asset: Asset;
    onSuccess: () => void;
    onCancel: () => void;
}

export function AssetDetailDepreciationForm({
    asset,
    onSuccess,
    onCancel,
}: AssetDetailDepreciationFormProps) {
    const createPenyusutan = useCreateAssetPenyusutan();

    const maxSusut = useMemo(() => {
        return Math.max(
            0,
            (Number(asset.nilai_buku) || 0) - (Number(asset.nilai_residu) || 0)
        );
    }, [asset]);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<AssetPenyusutanSchemaInput>({
        resolver: zodResolver(assetPenyusutanSchema),
        defaultValues: {
            tanggal: new Date().toISOString().split("T")[0],
            nominal: 0,
            keterangan: `Penyusutan aset ${asset.nama}`,
        },
    });

    const watchedNominal = (useWatch({
        control,
        name: "nominal",
        defaultValue: 0,
    }) || 0) as number;

    const isExceedingMax = watchedNominal > maxSusut;
    const nilaiBukuSebelum = Number(asset.nilai_buku) || 0;
    const nilaiBukuSesudah = Math.max(0, nilaiBukuSebelum - watchedNominal);
    const isPending = createPenyusutan.isPending;

    const onSubmit = (data: AssetPenyusutanSchemaInput) => {
        if (data.nominal <= 0) {
            toast.error("Nominal penyusutan harus lebih dari Rp 0.");
            return;
        }

        if (data.nominal > maxSusut) {
            toast.error(
                `Nominal tidak boleh melebihi sisa susut (${formatRupiah(maxSusut)})`
            );
            return;
        }

        createPenyusutan.mutate(
            {
                assetUid: asset.uid,
                data: {
                    tanggal: data.tanggal,
                    nominal: data.nominal,
                    keterangan: data.keterangan || null,
                },
            },
            {
                onSuccess: () => {
                    toast.success("Penyusutan aset berhasil dicatat.");
                    onSuccess();
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mencatat penyusutan aset.");
                },
            }
        );
    };

    return (
        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-200">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg">
                        <IconTrendingDown className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                            Catat Penyusutan Baru
                        </h4>
                        <span className="text-[10px] text-slate-500 block">
                            Maks susut yang tersedia: {formatRupiah(maxSusut)}
                        </span>
                    </div>
                </div>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isPending}
                    className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg cursor-pointer flex items-center gap-1"
                >
                    <IconArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Riwayat</span>
                </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Tanggal */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Tgl Penyusutan <span className="text-rose-500">*</span>
                        </label>
                        <Controller
                            control={control}
                            name="tanggal"
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
                        {errors.tanggal && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                {errors.tanggal.message}
                            </p>
                        )}
                    </div>

                    {/* Nominal */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Nominal Susut <span className="text-rose-500">*</span>
                        </label>
                        <Controller
                            control={control}
                            name="nominal"
                            render={({ field }) => (
                                <NumberInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    disabled={isPending}
                                    placeholder="Rp 0"
                                    min={1}
                                    max={maxSusut}
                                    className="h-8.5 text-xs font-bold text-amber-600 dark:text-amber-400 rounded-xl"
                                />
                            )}
                        />
                        {isExceedingMax && (
                            <p className="text-[10px] text-rose-500 font-medium">
                                Melebihi sisa nilai susut maksimum ({formatRupiah(maxSusut)})
                            </p>
                        )}
                    </div>
                </div>

                {/* Quick Fill Pills */}
                {maxSusut > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                            <IconFlame className="w-3 h-3 text-amber-500" />
                            Alokasi Cepat:
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setValue("nominal", maxSusut)}
                            disabled={isPending}
                            className="h-6 px-2 text-[10px] font-bold rounded-lg border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 cursor-pointer"
                        >
                            100% Habis ({formatRupiah(maxSusut)})
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setValue("nominal", Math.round(maxSusut / 2))}
                            disabled={isPending}
                            className="h-6 px-2 text-[10px] font-bold rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                            50% ({formatRupiah(Math.round(maxSusut / 2))})
                        </Button>
                    </div>
                )}

                {/* Keterangan */}
                <div className="space-y-1">
                    <label htmlFor="keterangan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Keterangan <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <Input
                        id="keterangan"
                        placeholder="Contoh: Penyusutan aset bulan berjalan..."
                        {...register("keterangan")}
                        disabled={isPending}
                        className="h-8.5 text-xs rounded-xl"
                    />
                </div>

                {/* Real-time Calculation Simulation Card */}
                <div className="p-2.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-xs space-y-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                        Simulasi Nilai Buku Setelah Penyusutan:
                    </span>
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-xs">
                        <span>{formatRupiah(nilaiBukuSebelum)}</span>
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <span>- {formatRupiah(watchedNominal)}</span>
                            <IconArrowRight className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">
                            {formatRupiah(nilaiBukuSesudah)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isPending}
                        className="h-8 px-3 text-xs rounded-xl border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || watchedNominal <= 0 || isExceedingMax}
                        className="h-8 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                        <IconCheck className="w-3.5 h-3.5" />
                        <span>{isPending ? "Menyimpan..." : "Simpan Penyusutan"}</span>
                    </Button>
                </div>
            </form>
        </div>
    );
}
