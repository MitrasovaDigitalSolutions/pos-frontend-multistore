"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommandSelect } from "@/components/ui/command-select";
import {
    IconCategory,
    IconBuildingBank,
    IconSparkles,
    IconInfoCircle,
    IconRotate2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
    assetCategorySchema,
    type AssetCategorySchemaInput,
} from "../../schemas/asset-category-schema";
import {
    useCreateAssetCategory,
    useUpdateAssetCategory,
} from "../../api/asset-categories-api";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import type { AssetCategory } from "../../types";

interface AssetCategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCategory?: AssetCategory | null;
}

export function AssetCategoryFormDialog({
    open,
    onOpenChange,
    editingCategory = null,
}: AssetCategoryFormDialogProps) {
    const isEdit = !!editingCategory;
    const createCategory = useCreateAssetCategory();
    const updateCategory = useUpdateAssetCategory();
    const { data: flatAccounts, isLoading: isLoadingCoas } = useFlatChartOfAccounts();

    const [isCustomCoa, setIsCustomCoa] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<AssetCategorySchemaInput>({
        resolver: zodResolver(assetCategorySchema),
        defaultValues: {
            nama: "",
            kode: "",
            keterangan: "",
            coa_asset_uid: null,
            coa_akumulasi_penyusutan_uid: null,
            coa_beban_penyusutan_uid: null,
        },
    });

    useEffect(() => {
        if (open) {
            if (editingCategory) {
                reset({
                    nama: editingCategory.nama,
                    kode: editingCategory.kode || "",
                    keterangan: editingCategory.keterangan || "",
                    coa_asset_uid: editingCategory.coa_asset_uid || null,
                    coa_akumulasi_penyusutan_uid:
                        editingCategory.coa_akumulasi_penyusutan_uid || null,
                    coa_beban_penyusutan_uid:
                        editingCategory.coa_beban_penyusutan_uid || null,
                });
                setIsCustomCoa(
                    !!(
                        editingCategory.coa_asset_uid ||
                        editingCategory.coa_akumulasi_penyusutan_uid ||
                        editingCategory.coa_beban_penyusutan_uid
                    )
                );
            } else {
                reset({
                    nama: "",
                    kode: "",
                    keterangan: "",
                    coa_asset_uid: null,
                    coa_akumulasi_penyusutan_uid: null,
                    coa_beban_penyusutan_uid: null,
                });
                setIsCustomCoa(false);
            }
        }
    }, [open, editingCategory, reset]);

    const assetCoaOptions = useMemo(() => {
        if (!flatAccounts) return [];
        return flatAccounts
            .filter((c) => c.tipe === "asset")
            .map((c) => ({
                value: c.uid,
                label: `[${c.kode}] ${c.nama}`,
            }));
    }, [flatAccounts]);

    const expenseCoaOptions = useMemo(() => {
        if (!flatAccounts) return [];
        return flatAccounts
            .filter((c) => c.tipe === "expense")
            .map((c) => ({
                value: c.uid,
                label: `[${c.kode}] ${c.nama}`,
            }));
    }, [flatAccounts]);

    const isPending = createCategory.isPending || updateCategory.isPending;

    const onSubmit = (data: AssetCategorySchemaInput) => {
        if (isEdit && editingCategory) {
            updateCategory.mutate(
                {
                    uid: editingCategory.uid,
                    data: {
                        nama: data.nama,
                        keterangan: data.keterangan,
                        coa_asset_uid: isCustomCoa ? data.coa_asset_uid : null,
                        coa_akumulasi_penyusutan_uid: isCustomCoa
                            ? data.coa_akumulasi_penyusutan_uid
                            : null,
                        coa_beban_penyusutan_uid: isCustomCoa
                            ? data.coa_beban_penyusutan_uid
                            : null,
                    },
                },
                {
                    onSuccess: () => {
                        toast.success("Kategori aset berhasil diperbarui.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal memperbarui kategori aset.");
                    },
                }
            );
        } else {
            createCategory.mutate(
                {
                    ...data,
                    coa_asset_uid: isCustomCoa ? data.coa_asset_uid : null,
                    coa_akumulasi_penyusutan_uid: isCustomCoa
                        ? data.coa_akumulasi_penyusutan_uid
                        : null,
                    coa_beban_penyusutan_uid: isCustomCoa
                        ? data.coa_beban_penyusutan_uid
                        : null,
                },
                {
                    onSuccess: () => {
                        toast.success("Kategori aset berhasil dibuat.");
                        onOpenChange(false);
                    },
                    onError: (err) => {
                        toast.error(err.message || "Gagal membuat kategori aset.");
                    },
                }
            );
        }
    };

    const coaAssetVal = watch("coa_asset_uid");
    const coaAkumulasiVal = watch("coa_akumulasi_penyusutan_uid");
    const coaBebanVal = watch("coa_beban_penyusutan_uid");

    const handleResetToAuto = () => {
        setIsCustomCoa(false);
        setValue("coa_asset_uid", null);
        setValue("coa_akumulasi_penyusutan_uid", null);
        setValue("coa_beban_penyusutan_uid", null);
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                        <IconCategory className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">
                        {isEdit ? "Ubah Kategori Aset" : "Tambah Kategori Aset Baru"}
                    </span>
                </div>
            }
            className="w-full max-w-[95vw] sm:max-w-2xl md:max-w-3xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
                {/* Scrollable Container on Mobile with 2-Column Responsive Grid on Desktop */}
                <div className="max-h-[75dvh] md:max-h-[65dvh] overflow-y-auto pr-1 -mr-1">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-3.5 items-start">
                        {/* LEFT COLUMN: Identitas Kategori (Col 5) */}
                        <div className="md:col-span-5 space-y-3 p-3 sm:p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 pb-1 border-b border-slate-200/60 dark:border-slate-800">
                                <IconCategory className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                    Identitas Kategori
                                </span>
                            </div>

                            {/* Nama Kategori */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="nama"
                                    className="text-[11px] font-bold text-slate-700 dark:text-slate-200"
                                >
                                    Nama Kategori <span className="text-rose-500">*</span>
                                </label>
                                <Input
                                    id="nama"
                                    placeholder="Contoh: Kendaraan Operasional, Peralatan"
                                    {...register("nama")}
                                    disabled={isPending}
                                    className="h-9 text-xs rounded-xl bg-white dark:bg-slate-900"
                                />
                                {errors.nama && (
                                    <p className="text-[10px] text-rose-500 font-medium">
                                        {errors.nama.message}
                                    </p>
                                )}
                            </div>

                            {/* Kode Kategori (Opsional / Auto) */}
                            {!isEdit && (
                                <div className="space-y-1">
                                    <label
                                        htmlFor="kode"
                                        className="text-[11px] font-bold text-slate-700 dark:text-slate-200"
                                    >
                                        Kode Kategori{" "}
                                        <span className="text-slate-400 font-normal">
                                            (Opsional)
                                        </span>
                                    </label>
                                    <Input
                                        id="kode"
                                        placeholder="Auto: KAT-AST-01, KAT-AST-02"
                                        {...register("kode")}
                                        disabled={isPending}
                                        className="h-9 text-xs rounded-xl font-mono uppercase bg-white dark:bg-slate-900"
                                    />
                                </div>
                            )}

                            {/* Keterangan */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="keterangan"
                                    className="text-[11px] font-bold text-slate-700 dark:text-slate-200"
                                >
                                    Keterangan{" "}
                                    <span className="text-slate-400 font-normal">
                                        (Opsional)
                                    </span>
                                </label>
                                <textarea
                                    id="keterangan"
                                    rows={3}
                                    placeholder="Deskripsi peruntukan atau jenis aset dalam kategori ini..."
                                    {...register("keterangan")}
                                    disabled={isPending}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Pengaturan Akun Akuntansi (Col 7) */}
                        <div className="md:col-span-7 space-y-3 p-3 sm:p-3.5 rounded-2xl bg-indigo-500/[0.03] dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                            {/* Header COA with toggle */}
                            <div className="flex items-center justify-between gap-2 pb-1 border-b border-indigo-100 dark:border-indigo-900/50">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <IconBuildingBank className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                        Pengaturan Akun Akuntansi (COA)
                                    </span>
                                </div>

                                <div className="shrink-0">
                                    {!isCustomCoa ? (
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomCoa(true)}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                                        >
                                            <span>Ubah Manual</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResetToAuto}
                                            className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:underline cursor-pointer flex items-center gap-1"
                                        >
                                            <IconRotate2 className="w-3 h-3" />
                                            <span>Reset Auto</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Mode Explanation Banner */}
                            {!isCustomCoa ? (
                                <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 space-y-1">
                                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                                        <IconSparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                        <span>Mode Auto-Generate COA Aktif</span>
                                    </div>
                                    <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                        Sistem akan <strong>otomatis membuat 3 akun buku besar baru</strong> yang terisolasi khusus kategori ini:
                                    </p>
                                    <ul className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 pl-3 list-disc">
                                        <li>Akun Aset Tetap</li>
                                        <li>Akun Akumulasi Penyusutan</li>
                                        <li>Akun Beban Penyusutan</li>
                                    </ul>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                                        <IconInfoCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                        <span>Pilih akun COA yang sudah terdaftar di sistem:</span>
                                    </div>

                                    {/* 1. Akun Aset Tetap */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                                1. Akun Aset Tetap
                                            </label>
                                            <span className="text-[9px] text-slate-400 font-mono">Tipe Asset</span>
                                        </div>
                                        <CommandSelect
                                            options={assetCoaOptions}
                                            value={coaAssetVal || ""}
                                            onChange={(val: string) =>
                                                setValue("coa_asset_uid", val || null)
                                            }
                                            placeholder={
                                                isLoadingCoas
                                                    ? "Memuat COA..."
                                                    : "Pilih akun aset tetap..."
                                            }
                                            disabled={isPending || isLoadingCoas}
                                            className="h-8.5 text-xs rounded-xl bg-white dark:bg-slate-900"
                                        />
                                    </div>

                                    {/* 2. Akun Akumulasi Penyusutan */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                                2. Akun Akumulasi Penyusutan
                                            </label>
                                            <span className="text-[9px] text-slate-400 font-mono">Kontra Asset</span>
                                        </div>
                                        <CommandSelect
                                            options={assetCoaOptions}
                                            value={coaAkumulasiVal || ""}
                                            onChange={(val: string) =>
                                                setValue("coa_akumulasi_penyusutan_uid", val || null)
                                            }
                                            placeholder={
                                                isLoadingCoas
                                                    ? "Memuat COA..."
                                                    : "Pilih akun akumulasi susut..."
                                            }
                                            disabled={isPending || isLoadingCoas}
                                            className="h-8.5 text-xs rounded-xl bg-white dark:bg-slate-900"
                                        />
                                    </div>

                                    {/* 3. Akun Beban Penyusutan */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                                                3. Akun Beban Penyusutan
                                            </label>
                                            <span className="text-[9px] text-slate-400 font-mono">Tipe Expense</span>
                                        </div>
                                        <CommandSelect
                                            options={expenseCoaOptions}
                                            value={coaBebanVal || ""}
                                            onChange={(val: string) =>
                                                setValue("coa_beban_penyusutan_uid", val || null)
                                            }
                                            placeholder={
                                                isLoadingCoas
                                                    ? "Memuat COA..."
                                                    : "Pilih akun beban penyusutan..."
                                            }
                                            disabled={isPending || isLoadingCoas}
                                            className="h-8.5 text-xs rounded-xl bg-white dark:bg-slate-900"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Action Buttons (Responsive stacking on mobile) */}
                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="w-full sm:w-auto h-9 sm:h-8.5 px-3.5 text-xs rounded-xl border-slate-200 dark:border-slate-800 cursor-pointer"
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full sm:w-auto h-9 sm:h-8.5 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                    >
                        {isPending
                            ? "Menyimpan..."
                            : isEdit
                            ? "Simpan Perubahan"
                            : "Buat Kategori Aset"}
                    </Button>
                </div>
            </form>
        </BaseDialog>
    );
}
