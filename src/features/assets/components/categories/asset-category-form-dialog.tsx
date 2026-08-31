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
    IconInfoCircle,
    IconChevronDown,
    IconChevronUp,
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

    const [showAdvancedCoa, setShowAdvancedCoa] = useState<boolean>(false);

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
                if (
                    editingCategory.coa_asset_uid ||
                    editingCategory.coa_akumulasi_penyusutan_uid ||
                    editingCategory.coa_beban_penyusutan_uid
                ) {
                    setShowAdvancedCoa(true);
                } else {
                    setShowAdvancedCoa(false);
                }
            } else {
                reset({
                    nama: "",
                    kode: "",
                    keterangan: "",
                    coa_asset_uid: null,
                    coa_akumulasi_penyusutan_uid: null,
                    coa_beban_penyusutan_uid: null,
                });
                setShowAdvancedCoa(false);
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
                        coa_asset_uid: data.coa_asset_uid,
                        coa_akumulasi_penyusutan_uid: data.coa_akumulasi_penyusutan_uid,
                        coa_beban_penyusutan_uid: data.coa_beban_penyusutan_uid,
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
            createCategory.mutate(data, {
                onSuccess: () => {
                    toast.success("Kategori aset berhasil dibuat.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal membuat kategori aset.");
                },
            });
        }
    };

    const coaAssetVal = watch("coa_asset_uid");
    const coaAkumulasiVal = watch("coa_akumulasi_penyusutan_uid");
    const coaBebanVal = watch("coa_beban_penyusutan_uid");

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconCategory className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>{isEdit ? "Ubah Kategori Aset" : "Tambah Kategori Aset Baru"}</span>
                </div>
            }
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
                {/* Nama Kategori */}
                <div className="space-y-1.5">
                    <label htmlFor="nama" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Nama Kategori <span className="text-rose-500">*</span>
                    </label>
                    <Input
                        id="nama"
                        placeholder="Contoh: Kendaraan Operasional, Peralatan Toko, Gedung"
                        {...register("nama")}
                        disabled={isPending}
                        className="h-9 text-xs rounded-xl"
                    />
                    {errors.nama && (
                        <p className="text-[11px] text-rose-500 font-medium">
                            {errors.nama.message}
                        </p>
                    )}
                </div>

                {/* Kode Kategori (Opsional / Auto-generated) */}
                {!isEdit && (
                    <div className="space-y-1.5">
                        <label htmlFor="kode" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Kode Kategori <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <Input
                            id="kode"
                            placeholder="Dikosongkan untuk auto: KAT-AST-01, KAT-AST-02"
                            {...register("kode")}
                            disabled={isPending}
                            className="h-9 text-xs rounded-xl font-mono uppercase"
                        />
                    </div>
                )}

                {/* Keterangan */}
                <div className="space-y-1.5">
                    <label htmlFor="keterangan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Keterangan <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <textarea
                        id="keterangan"
                        rows={2}
                        placeholder="Deskripsi peruntukan atau jenis aset dalam kategori ini..."
                        {...register("keterangan")}
                        disabled={isPending}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                {/* Collapsible COA Integration */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-3 space-y-2.5">
                    <button
                        type="button"
                        onClick={() => setShowAdvancedCoa(!showAdvancedCoa)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                        <div className="flex items-center gap-1.5">
                            <IconInfoCircle className="w-4 h-4 text-indigo-500" />
                            <span>Pengaturan Akun Akuntansi (COA)</span>
                        </div>
                        {showAdvancedCoa ? (
                            <IconChevronUp className="w-4 h-4" />
                        ) : (
                            <IconChevronDown className="w-4 h-4" />
                        )}
                    </button>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                        Jika dikosongkan, sistem akan <strong>otomatis membuat 3 akun COA</strong> baru (Akun Aset, Akumulasi Penyusutan, dan Beban Penyusutan) sesuai nama kategori ini.
                    </p>

                    {showAdvancedCoa && (
                        <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                            {/* Akun Aset */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    Akun Aset Tetap (1-1xxx)
                                </label>
                                <CommandSelect
                                    options={assetCoaOptions}
                                    value={coaAssetVal || ""}
                                    onChange={(val: string) => setValue("coa_asset_uid", val || null)}
                                    placeholder={
                                        isLoadingCoas
                                            ? "Memuat COA..."
                                            : "Pilih akun aset (atau biarkan otomatis)"
                                    }
                                    disabled={isPending || isLoadingCoas}
                                    className="h-8.5 text-xs rounded-xl"
                                />
                            </div>

                            {/* Akun Akumulasi Penyusutan */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    Akun Akumulasi Penyusutan (1-1xx9)
                                </label>
                                <CommandSelect
                                    options={assetCoaOptions}
                                    value={coaAkumulasiVal || ""}
                                    onChange={(val: string) =>
                                        setValue("coa_akumulasi_penyusutan_uid", val || null)
                                    }
                                    placeholder={
                                        isLoadingCoas
                                            ? "Memuat COA..."
                                            : "Pilih akun akumulasi (atau biarkan otomatis)"
                                    }
                                    disabled={isPending || isLoadingCoas}
                                    className="h-8.5 text-xs rounded-xl"
                                />
                            </div>

                            {/* Akun Beban Penyusutan */}
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    Akun Beban Penyusutan (5-14xx)
                                </label>
                                <CommandSelect
                                    options={expenseCoaOptions}
                                    value={coaBebanVal || ""}
                                    onChange={(val: string) =>
                                        setValue("coa_beban_penyusutan_uid", val || null)
                                    }
                                    placeholder={
                                        isLoadingCoas
                                            ? "Memuat COA..."
                                            : "Pilih akun beban (atau biarkan otomatis)"
                                    }
                                    disabled={isPending || isLoadingCoas}
                                    className="h-8.5 text-xs rounded-xl"
                                />
                            </div>
                        </div>
                    )}
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
                        disabled={isPending}
                        className="h-8.5 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
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
