"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { DatePicker } from "@/components/ui/date-picker";
import {
    IconTrendingDown,
    IconArrowRight,
    IconCheck,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
    assetPenyusutanSchema,
    type AssetPenyusutanSchemaInput,
} from "../../schemas/asset-penyusutan-schema";
import { useCreateAssetPenyusutan } from "../../api/assets-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Asset } from "../../types";

interface AssetPenyusutanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: Asset | null;
}

export function AssetPenyusutanDialog({
    open,
    onOpenChange,
    asset,
}: AssetPenyusutanDialogProps) {
    const createPenyusutan = useCreateAssetPenyusutan();

    const maxSusut = useMemo(() => {
        if (!asset) return 0;
        return Math.max(0, (Number(asset.nilai_buku) || 0) - (Number(asset.nilai_residu) || 0));
    }, [asset]);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AssetPenyusutanSchemaInput>({
        resolver: zodResolver(assetPenyusutanSchema),
        defaultValues: {
            tanggal: new Date().toISOString().split("T")[0],
            nominal: 0,
            keterangan: null,
        },
    });

    useEffect(() => {
        if (open && asset) {
            reset({
                tanggal: new Date().toISOString().split("T")[0],
                nominal: 0,
                keterangan: `Penyusutan aset ${asset.nama}`,
            });
        }
    }, [open, asset, reset]);

    const watchedNominal = watch("nominal") || 0;
    const isExceedingMax = watchedNominal > maxSusut;

    const nilaiBukuSebelum = asset ? Number(asset.nilai_buku) || 0 : 0;
    const nilaiBukuSesudah = Math.max(0, nilaiBukuSebelum - watchedNominal);

    const isPending = createPenyusutan.isPending;

    const onSubmit = (data: AssetPenyusutanSchemaInput) => {
        if (!asset) return;
        if (data.nominal > maxSusut) {
            toast.error(`Nominal tidak boleh melebihi sisa susut (${formatRupiah(maxSusut)})`);
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
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal mencatat penyusutan aset.");
                },
            }
        );
    };

    if (!asset) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconTrendingDown className="w-5 h-5 text-amber-500" />
                    <span>Catat Penyusutan Aset</span>
                </div>
            }
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
                {/* Asset Info Card */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                            {asset.nama}
                        </div>
                        <span className="font-mono text-[11px] font-bold text-slate-500">
                            {asset.nomor_aset}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                        <div>
                            <span className="text-slate-400 block text-[10px]">Harga Beli</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                {formatRupiah(Number(asset.harga_perolehan) || 0)}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px]">Nilai Buku</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(nilaiBukuSebelum)}
                            </span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px]">Sisa Maks Susut</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">
                                {formatRupiah(maxSusut)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Tanggal Penyusutan <span className="text-rose-500">*</span>
                        </label>
                        <Controller
                            control={control}
                            name="tanggal"
                            render={({ field }) => (
                                <DatePicker
                                    value={field.value}
                                    onChange={(val) => field.onChange(val)}
                                    placeholder="Pilih tanggal..."
                                    disabled={isPending}
                                    size="sm"
                                />
                            )}
                        />
                        {errors.tanggal && (
                            <p className="text-[11px] text-rose-500 font-medium">
                                {errors.tanggal.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Nominal Penyusutan <span className="text-rose-500">*</span>
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

                {/* Quick Value Buttons */}
                {maxSusut > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-semibold mr-1">Alokasi Cepat:</span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setValue("nominal", maxSusut)}
                            className="h-6 px-2 text-[10px] rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                            100% Habis Susut ({formatRupiah(maxSusut)})
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setValue("nominal", Math.round(maxSusut / 2))}
                            className="h-6 px-2 text-[10px] rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                            50% ({formatRupiah(Math.round(maxSusut / 2))})
                        </Button>
                    </div>
                )}

                {/* Keterangan */}
                <div className="space-y-1">
                    <label htmlFor="keterangan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Keterangan Log <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <Input
                        id="keterangan"
                        placeholder="Penyusutan periode bulan..."
                        {...register("keterangan")}
                        disabled={isPending}
                        className="h-8.5 text-xs rounded-xl"
                    />
                </div>

                {/* Real-time Calculation Card */}
                <div className="p-3 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-medium text-slate-600 dark:text-slate-400 text-[11px]">
                        <span>Simulasi Nilai Buku:</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>{formatRupiah(nilaiBukuSebelum)}</span>
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                            <span>- {formatRupiah(watchedNominal)}</span>
                            <IconArrowRight className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400">
                            {formatRupiah(nilaiBukuSesudah)}
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="h-8.5 px-3.5 text-xs rounded-xl border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || watchedNominal <= 0 || isExceedingMax}
                        className="h-8.5 px-4 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        <IconCheck className="w-3.5 h-3.5 mr-1" />
                        {isPending ? "Menyimpan..." : "Simpan Penyusutan"}
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}
