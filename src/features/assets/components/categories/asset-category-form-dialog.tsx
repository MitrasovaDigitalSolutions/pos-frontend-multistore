"use client";

import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { CoaPickerTrigger } from "@/features/accounting/components/shared";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconAdjustmentsHorizontal,
    IconBuildingBank,
    IconCategory,
    IconInfoCircle,
    IconSparkles,
} from "@tabler/icons-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
    useCreateAssetCategory,
    useUpdateAssetCategory,
} from "../../api/asset-categories-api";
import {
    assetCategorySchema,
    type AssetCategorySchemaInput,
} from "../../schemas/asset-category-schema";
import type { AssetCategory } from "../../types";

interface AssetCategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingCategory?: AssetCategory | null;
}

interface AssetCategoryFormContentProps {
    editingCategory: AssetCategory | null;
    onOpenChange: (open: boolean) => void;
}

function AssetCategoryFormContent({
    editingCategory,
    onOpenChange,
}: AssetCategoryFormContentProps) {
    const isEdit = !!editingCategory;
    const createCategory = useCreateAssetCategory();
    const updateCategory = useUpdateAssetCategory();
    const { data: flatAccounts, isLoading: isLoadingCoas } = useFlatChartOfAccounts();

    const [isCustomCoa, setIsCustomCoa] = useState<boolean>(() => {
        return !!(
            editingCategory?.coa_asset_uid ||
            editingCategory?.coa_asset?.uid ||
            editingCategory?.coa_akumulasi_penyusutan_uid ||
            editingCategory?.coa_akumulasi_penyusutan?.uid ||
            editingCategory?.coa_beban_penyusutan_uid ||
            editingCategory?.coa_beban_penyusutan?.uid
        );
    });

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<AssetCategorySchemaInput>({
        resolver: zodResolver(assetCategorySchema),
        defaultValues: {
            nama: editingCategory?.nama || "",
            kode: editingCategory?.kode || "",
            keterangan: editingCategory?.keterangan || "",
            coa_asset_uid:
                editingCategory?.coa_asset_uid ||
                editingCategory?.coa_asset?.uid ||
                null,
            coa_akumulasi_penyusutan_uid:
                editingCategory?.coa_akumulasi_penyusutan_uid ||
                editingCategory?.coa_akumulasi_penyusutan?.uid ||
                null,
            coa_beban_penyusutan_uid:
                editingCategory?.coa_beban_penyusutan_uid ||
                editingCategory?.coa_beban_penyusutan?.uid ||
                null,
        },
    });



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

    const coaAssetVal = useWatch({ name: "coa_asset_uid", control });
    const coaAkumulasiVal = useWatch({ name: "coa_akumulasi_penyusutan_uid", control });
    const coaBebanVal = useWatch({ name: "coa_beban_penyusutan_uid", control });

    const handleResetToAuto = () => {
        setIsCustomCoa(false);
        setValue("coa_asset_uid", null);
        setValue("coa_akumulasi_penyusutan_uid", null);
        setValue("coa_beban_penyusutan_uid", null);
    };

    return (
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
                        {/* Header CoA */}
                        <div className="flex items-center gap-1.5 pb-1 border-b border-indigo-100 dark:border-indigo-900/50">
                            <IconBuildingBank className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                Pengaturan Akun Akuntansi (CoA)
                            </span>
                        </div>

                        {/* SEGMENTED TAB SWITCHER */}
                        <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl gap-1">
                            <button
                                type="button"
                                onClick={handleResetToAuto}
                                className={cn(
                                    "flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                                    !isCustomCoa
                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                )}
                            >
                                <IconSparkles className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Otomatis (Sistem)</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCustomCoa(true)}
                                className={cn(
                                    "flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer",
                                    isCustomCoa
                                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                                )}
                            >
                                <IconAdjustmentsHorizontal className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">Atur Manual (CoA)</span>
                            </button>
                        </div>

                        {/* Mode Explanation / Inputs */}
                        {!isCustomCoa ? (
                            <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                                    <IconSparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                                    <span>Mode Otomatis Aktif</span>
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
                                    <span>Pilih akun CoA yang sudah terdaftar di sistem:</span>
                                </div>

                                {/* 1. Akun Aset Tetap */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <label className="font-semibold text-slate-700 dark:text-slate-300">
                                            1. Akun Aset Tetap
                                        </label>
                                        <span className="text-[9px] text-slate-400 font-mono">Tipe Asset</span>
                                    </div>
                                    <CoaPickerTrigger
                                        accounts={flatAccounts}
                                        allowedTypes={["asset"]}
                                        value={coaAssetVal || ""}
                                        onChange={(val: string) =>
                                            setValue("coa_asset_uid", val || null)
                                        }
                                        placeholder="Pilih akun aset tetap..."
                                        dialogTitle="Pilih Akun Aset Tetap"
                                        disabled={isPending || isLoadingCoas}
                                        size="md"
                                        allowClear
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
                                    <CoaPickerTrigger
                                        accounts={flatAccounts}
                                        allowedTypes={["asset"]}
                                        value={coaAkumulasiVal || ""}
                                        onChange={(val: string) =>
                                            setValue("coa_akumulasi_penyusutan_uid", val || null)
                                        }
                                        placeholder="Pilih akun akumulasi susut..."
                                        dialogTitle="Pilih Akun Akumulasi Penyusutan"
                                        disabled={isPending || isLoadingCoas}
                                        size="md"
                                        allowClear
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
                                    <CoaPickerTrigger
                                        accounts={flatAccounts}
                                        allowedTypes={["expense"]}
                                        value={coaBebanVal || ""}
                                        onChange={(val: string) =>
                                            setValue("coa_beban_penyusutan_uid", val || null)
                                        }
                                        placeholder="Pilih akun beban penyusutan..."
                                        dialogTitle="Pilih Akun Beban Penyusutan"
                                        disabled={isPending || isLoadingCoas}
                                        size="md"
                                        allowClear
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
    );
}

export function AssetCategoryFormDialog({
    open,
    onOpenChange,
    editingCategory = null,
}: AssetCategoryFormDialogProps) {
    const isEdit = !!editingCategory;

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
            {open && (
                <AssetCategoryFormContent
                    key={editingCategory?.uid || "new"}
                    editingCategory={editingCategory}
                    onOpenChange={onOpenChange}
                />
            )}
        </BaseDialog>
    );
}
