"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { CommandSelect } from "@/components/ui/command-select";
import { DatePicker } from "@/components/ui/date-picker";
import {
    IconBuildingWarehouse,
    IconCoin,
    IconBuildingBank,
    IconAlertTriangle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
    createAssetSchema,
    updateAssetSchema,
    type CreateAssetSchemaInput,
    type UpdateAssetSchemaInput,
} from "../../schemas/asset-schema";
import { useCreateAsset, useUpdateAsset } from "../../api/assets-api";
import { useCashAccounts } from "@/features/cash/api/cash-api";
import { useFlatChartOfAccounts } from "@/features/accounting/api/coa-api";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import type { Asset, AssetCategory } from "../../types";

interface AssetFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingAsset?: Asset | null;
    categories: AssetCategory[];
}

export function AssetFormDialog({
    open,
    onOpenChange,
    editingAsset = null,
    categories,
}: AssetFormDialogProps) {
    const isEdit = !!editingAsset;
    const createAsset = useCreateAsset();
    const updateAsset = useUpdateAsset();

    const { data: cashAccounts = [], isLoading: isLoadingCash } = useCashAccounts();
    const { data: flatAccounts = [], isLoading: isLoadingCoa } = useFlatChartOfAccounts();

    // Filter valid cash accounts for asset purchase (exclude register / kasir)
    const validCashAccounts = useMemo(() => {
        return cashAccounts.filter((acc) => acc.tipe !== "register");
    }, [cashAccounts]);

    const cashOptions = useMemo(() => {
        return validCashAccounts.map((acc) => ({
            value: acc.uid,
            label: `${acc.nama} (Saldo: ${formatRupiah(Number(acc.saldo) || 0)})`,
        }));
    }, [validCashAccounts]);

    const categoryOptions = useMemo(() => {
        return categories.map((c) => ({
            value: c.uid,
            label: `[${c.kode || "-"}] ${c.nama}`,
        }));
    }, [categories]);

    const nonKasCoaOptions = useMemo(() => {
        // Equity (Modal) and Liability (Hutang) accounts for non-cash offset
        return flatAccounts
            .filter((c) => c.tipe === "equity" || c.tipe === "liability")
            .map((c) => ({
                value: c.uid,
                label: `[${c.kode}] ${c.nama} (${c.tipe === "equity" ? "Ekuitas/Modal" : "Kewajiban/Utang"})`,
            }));
    }, [flatAccounts]);

    const createForm = useForm<CreateAssetSchemaInput>({
        resolver: zodResolver(createAssetSchema),
        defaultValues: {
            nama: "",
            asset_category_uid: "",
            kode_aset: null,
            tanggal_perolehan: new Date().toISOString().split("T")[0],
            harga_perolehan: 0,
            nilai_residu: 0,
            sumber_perolehan: "kas",
            cash_account_uid: null,
            offset_coa_uid: null,
            catatan: null,
        },
    });

    const updateForm = useForm<UpdateAssetSchemaInput>({
        resolver: zodResolver(updateAssetSchema),
        defaultValues: {
            nama: "",
            kode_aset: null,
            nilai_residu: 0,
            catatan: null,
        },
    });

    useEffect(() => {
        if (open) {
            if (editingAsset) {
                updateForm.reset({
                    nama: editingAsset.nama,
                    kode_aset: editingAsset.kode_aset || null,
                    nilai_residu: editingAsset.nilai_residu || 0,
                    catatan: editingAsset.catatan || null,
                });
            } else {
                createForm.reset({
                    nama: "",
                    asset_category_uid: categories.length > 0 ? categories[0].uid : "",
                    kode_aset: null,
                    tanggal_perolehan: new Date().toISOString().split("T")[0],
                    harga_perolehan: 0,
                    nilai_residu: 0,
                    sumber_perolehan: "kas",
                    cash_account_uid: validCashAccounts.length > 0 ? validCashAccounts[0].uid : null,
                    offset_coa_uid: null,
                    catatan: null,
                });
            }
        }
    }, [open, editingAsset, categories, validCashAccounts, createForm, updateForm]);

    const isPending = createAsset.isPending || updateAsset.isPending;

    const watchedSumber = createForm.watch("sumber_perolehan");
    const watchedCategoryUid = createForm.watch("asset_category_uid");
    const watchedHarga = createForm.watch("harga_perolehan") || 0;
    const watchedCashUid = createForm.watch("cash_account_uid");

    const selectedCashAccount = useMemo(() => {
        if (!watchedCashUid) return null;
        return validCashAccounts.find((a) => a.uid === watchedCashUid) || null;
    }, [watchedCashUid, validCashAccounts]);

    const isCashInsufficient = useMemo(() => {
        if (isEdit || watchedSumber !== "kas" || !selectedCashAccount) return false;
        return (Number(selectedCashAccount.saldo) || 0) < watchedHarga;
    }, [isEdit, watchedSumber, selectedCashAccount, watchedHarga]);

    const selectedCategory = useMemo(() => {
        if (!watchedCategoryUid) return null;
        return categories.find((c) => c.uid === watchedCategoryUid) || null;
    }, [watchedCategoryUid, categories]);

    const onCreateSubmit = (values: CreateAssetSchemaInput) => {
        createAsset.mutate(values, {
            onSuccess: () => {
                toast.success("Perolehan aset berhasil dicatat.");
                onOpenChange(false);
            },
            onError: (err) => {
                toast.error(err.message || "Gagal mencatat perolehan aset.");
            },
        });
    };

    const onUpdateSubmit = (values: UpdateAssetSchemaInput) => {
        if (!editingAsset) return;
        updateAsset.mutate(
            {
                uid: editingAsset.uid,
                data: values,
            },
            {
                onSuccess: () => {
                    toast.success("Data aset berhasil diperbarui.");
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Gagal memperbarui data aset.");
                },
            }
        );
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <IconBuildingWarehouse className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>{isEdit ? "Ubah Data Aset" : "Catat Perolehan Aset Baru"}</span>
                </div>
            }
            className="max-w-xl"
        >
            {isEdit ? (
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-3.5 pt-2">
                    <div className="space-y-1">
                        <label htmlFor="edit_nama" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Nama Aset <span className="text-rose-500">*</span>
                        </label>
                        <Input
                            id="edit_nama"
                            placeholder="Nama aset..."
                            {...updateForm.register("nama")}
                            disabled={isPending}
                            className="h-8.5 text-xs rounded-xl"
                        />
                        {updateForm.formState.errors.nama && (
                            <p className="text-[11px] text-rose-500 font-medium">
                                {updateForm.formState.errors.nama.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label htmlFor="edit_kode" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Kode / No. Seri <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <Input
                                id="edit_kode"
                                placeholder="Contoh: SN: C02X1234"
                                {...updateForm.register("kode_aset")}
                                disabled={isPending}
                                className="h-8.5 text-xs rounded-xl"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Nilai Residu <span className="text-slate-400 font-normal">(Sisa Minimum)</span>
                            </label>
                            <Controller
                                control={updateForm.control}
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

                    <div className="space-y-1">
                        <label htmlFor="edit_catatan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Catatan <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            id="edit_catatan"
                            rows={2}
                            placeholder="Catatan tambahan..."
                            {...updateForm.register("catatan")}
                            disabled={isPending}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

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
                            {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-3.5 pt-2">
                    {/* 1. Nama Aset & Kategori */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                            <label htmlFor="nama" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Nama Aset <span className="text-rose-500">*</span>
                            </label>
                            <Input
                                id="nama"
                                placeholder="Contoh: Laptop MacBook Pro M3, Mobil Suzuki Carry 2024"
                                {...createForm.register("nama")}
                                disabled={isPending}
                                className="h-8.5 text-xs rounded-xl"
                            />
                            {createForm.formState.errors.nama && (
                                <p className="text-[11px] text-rose-500 font-medium">
                                    {createForm.formState.errors.nama.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Kategori Aset <span className="text-rose-500">*</span>
                            </label>
                            <CommandSelect
                                options={categoryOptions}
                                value={watchedCategoryUid || ""}
                                onChange={(val: string) => createForm.setValue("asset_category_uid", val)}
                                placeholder="Pilih Kategori..."
                                disabled={isPending}
                                className="h-8.5 text-xs rounded-xl"
                            />
                            {selectedCategory && (
                                <p className="text-[10px] text-slate-500 line-clamp-1">
                                    Akun: {selectedCategory.coaAsset ? `[${selectedCategory.coaAsset.kode}] ${selectedCategory.coaAsset.nama}` : "Auto"}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="kode_aset" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Kode / No. Seri <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <Input
                                id="kode_aset"
                                placeholder="Contoh: AST-INV-001, SN: C02X1234"
                                {...createForm.register("kode_aset")}
                                disabled={isPending}
                                className="h-8.5 text-xs rounded-xl"
                            />
                        </div>
                    </div>

                    {/* 2. Tanggal & Nilai Perolehan */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Tanggal Perolehan <span className="text-rose-500">*</span>
                            </label>
                            <Controller
                                control={createForm.control}
                                name="tanggal_perolehan"
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
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Harga Perolehan <span className="text-rose-500">*</span>
                            </label>
                            <Controller
                                control={createForm.control}
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
                                control={createForm.control}
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

                    {/* 3. Sumber Perolehan Dana (Kas / Non-Kas) */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-3 space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Sumber Dana Perolehan <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => createForm.setValue("sumber_perolehan", "kas")}
                                    className={`h-8.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        watchedSumber === "kas"
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    <IconBuildingBank className="w-4 h-4" />
                                    <span>Kas / Rekening Bank</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => createForm.setValue("sumber_perolehan", "non_kas")}
                                    className={`h-8.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                        watchedSumber === "non_kas"
                                            ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    <IconCoin className="w-4 h-4" />
                                    <span>Non-Kas (Modal / Utang)</span>
                                </button>
                            </div>
                        </div>

                        {/* Sumber Kas */}
                        {watchedSumber === "kas" && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Pilih Akun Kas / Bank Pembayar <span className="text-rose-500">*</span>
                                </label>
                                <CommandSelect
                                    options={cashOptions}
                                    value={watchedCashUid || ""}
                                    onChange={(val: string) => createForm.setValue("cash_account_uid", val || null)}
                                    placeholder={isLoadingCash ? "Memuat akun kas..." : "Pilih Kas Utama / Rekening..."}
                                    disabled={isPending || isLoadingCash}
                                    className="h-8.5 text-xs rounded-xl"
                                />

                                {isCashInsufficient && (
                                    <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-[11px] font-medium">
                                        <IconAlertTriangle className="w-4 h-4 shrink-0" />
                                        <span>
                                            Saldo kas tidak mencukupi untuk pembelian ini (Saldo: {formatRupiah(Number(selectedCashAccount?.saldo) || 0)}).
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sumber Non-Kas (Offset COA) */}
                        {watchedSumber === "non_kas" && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Akun Penyeimbang / Sumber Ekuitas / Utang <span className="text-rose-500">*</span>
                                </label>
                                <CommandSelect
                                    options={nonKasCoaOptions}
                                    value={createForm.watch("offset_coa_uid") || ""}
                                    onChange={(val: string) => createForm.setValue("offset_coa_uid", val || null)}
                                    placeholder={isLoadingCoa ? "Memuat akun COA..." : "Pilih Akun Modal / Hutang..."}
                                    disabled={isPending || isLoadingCoa}
                                    className="h-8.5 text-xs rounded-xl"
                                />
                                <p className="text-[10px] text-slate-500">
                                    Pilih akun Modal Pemilik, Hutang Usaha, atau Hibah jika perolehan tidak menggunakan kas tunai.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* 4. Catatan */}
                    <div className="space-y-1">
                        <label htmlFor="catatan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            id="catatan"
                            rows={2}
                            placeholder="Catatan kondisi aset, lokasi penempatan, vendor pembelian..."
                            {...createForm.register("catatan")}
                            disabled={isPending}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
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
                            disabled={isPending || isCashInsufficient}
                            className="h-8.5 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isPending ? "Menyimpan..." : "Simpan Perolehan Aset"}
                        </Button>
                    </div>
                </form>
            )}
        </BaseDialog>
    );
}
