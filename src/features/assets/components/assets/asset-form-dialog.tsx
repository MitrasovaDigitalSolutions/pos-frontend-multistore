"use client";

import { useMemo } from "react";
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
    IconInfoCircle,
    IconFileDescription,
    IconReceipt2,
    IconArrowUpRight,
    IconArrowDownLeft,
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
import { formatToReadableDate } from "@/lib/date-utils";
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
            asset_category_uid: categories.length > 0 ? categories[0].uid : "",
            kode_aset: null,
            tanggal_perolehan: new Date().toISOString().split("T")[0],
            harga_perolehan: 0,
            nilai_residu: 0,
            sumber_perolehan: "kas",
            cash_account_uid: validCashAccounts.length > 0 ? validCashAccounts[0].uid : null,
            offset_coa_uid: null,
            catatan: null,
        },
    });

    const updateForm = useForm<UpdateAssetSchemaInput>({
        resolver: zodResolver(updateAssetSchema),
        defaultValues: {
            nama: editingAsset?.nama || "",
            kode_aset: editingAsset?.kode_aset || null,
            nilai_residu: editingAsset?.nilai_residu || 0,
            catatan: editingAsset?.catatan || null,
        },
    });

    const isPending = createAsset.isPending || updateAsset.isPending;

    const watchedSumber = createForm.watch("sumber_perolehan");
    const watchedCategoryUid = createForm.watch("asset_category_uid");
    const watchedHarga = createForm.watch("harga_perolehan") || 0;
    const watchedCashUid = createForm.watch("cash_account_uid");
    const watchedOffsetCoaUid = createForm.watch("offset_coa_uid");

    const selectedCashAccount = useMemo(() => {
        if (!watchedCashUid) return null;
        return validCashAccounts.find((a) => a.uid === watchedCashUid) || null;
    }, [watchedCashUid, validCashAccounts]);

    const selectedOffsetCoa = useMemo(() => {
        if (!watchedOffsetCoaUid) return null;
        return flatAccounts.find((a) => a.uid === watchedOffsetCoaUid) || null;
    }, [watchedOffsetCoaUid, flatAccounts]);

    const selectedCategory = useMemo(() => {
        if (!watchedCategoryUid) return null;
        return categories.find((c) => c.uid === watchedCategoryUid) || null;
    }, [watchedCategoryUid, categories]);

    const categoryAssetCoa = useMemo(() => {
        if (!selectedCategory) return null;
        return selectedCategory.coa_asset || selectedCategory.coaAsset || null;
    }, [selectedCategory]);

    const isCashInsufficient = useMemo(() => {
        if (isEdit || watchedSumber !== "kas" || !selectedCashAccount) return false;
        return (Number(selectedCashAccount.saldo) || 0) < watchedHarga;
    }, [isEdit, watchedSumber, selectedCashAccount, watchedHarga]);

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
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                        <IconBuildingWarehouse className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100 block">
                            {isEdit ? "Ubah Data Aset" : "Catat Perolehan Aset Baru"}
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal block">
                            {isEdit
                                ? `Mengubah data identitas aset ${editingAsset?.nomor_aset}`
                                : "Kapitalisasi aset tetap baru beserta pengalokasian sumber dana perolehan"}
                        </span>
                    </div>
                </div>
            }
            className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl lg:max-w-5xl"
        >
            {isEdit && editingAsset ? (
                /* ======================== EDIT MODE ======================== */
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4 pt-2">
                    {/* Readonly Overview Card */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400">No. Aset</span>
                            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                {editingAsset.nomor_aset}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Kategori</span>
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                                {editingAsset.category?.nama || "-"}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Harga Perolehan</span>
                            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                                {formatRupiah(Number(editingAsset.harga_perolehan) || 0)}
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Nilai Buku Saat Ini</span>
                            <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                                {formatRupiah(Number(editingAsset.nilai_buku) || 0)}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="space-y-1.5 sm:col-span-2">
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

                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5 sm:col-span-2">
                            <label htmlFor="edit_catatan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                Catatan <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <textarea
                                id="edit_catatan"
                                rows={2}
                                placeholder="Catatan kondisi aset, lokasi penempatan, vendor..."
                                {...updateForm.register("catatan")}
                                disabled={isPending}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                /* ======================== CREATE MODE (2-COLUMN GRID) ======================== */
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                        {/* ─── KOLOM KIRI (7 Kolom): IDENTITAS & NILAI ASET ─── */}
                        <div className="lg:col-span-7 space-y-3.5">
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

                            {/* Kategori & Kode */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    {categoryAssetCoa && (
                                        <p className="text-[10px] text-slate-500 truncate" title={`Akun: [${categoryAssetCoa.kode}] ${categoryAssetCoa.nama}`}>
                                            Akun: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">[{categoryAssetCoa.kode}]</span> {categoryAssetCoa.nama}
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
                                        {...createForm.register("kode_aset")}
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
                                        control={createForm.control}
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

                            {/* Catatan */}
                            <div className="space-y-1">
                                <label htmlFor="catatan" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                    Catatan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <textarea
                                    id="catatan"
                                    rows={2}
                                    placeholder="Keterangan vendor pembelian, lokasi penempatan, kondisi..."
                                    {...createForm.register("catatan")}
                                    disabled={isPending}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 resize-none outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        {/* ─── KOLOM KANAN (5 Kolom): SUMBER DANA & JURNAL OTOMATIS ─── */}
                        <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                                    <IconReceipt2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                        Pembiayaan & Penjurnalan
                                    </h4>
                                </div>

                                {/* Switcher Tab Sumber Dana */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                        Sumber Dana Perolehan <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => createForm.setValue("sumber_perolehan", "kas")}
                                            className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                watchedSumber === "kas"
                                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                            }`}
                                        >
                                            <IconBuildingBank className="w-3.5 h-3.5" />
                                            <span>Kas / Bank</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => createForm.setValue("sumber_perolehan", "non_kas")}
                                            className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                watchedSumber === "non_kas"
                                                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/60 dark:border-slate-700"
                                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                            }`}
                                        >
                                            <IconCoin className="w-3.5 h-3.5" />
                                            <span>Non-Kas (Modal/Utang)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Pilihan Kas / Bank */}
                                {watchedSumber === "kas" && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                            Pilih Akun Kas / Bank Pembayar <span className="text-rose-500">*</span>
                                        </label>
                                        <CommandSelect
                                            options={cashOptions}
                                            value={watchedCashUid || ""}
                                            onChange={(val: string) => createForm.setValue("cash_account_uid", val || null)}
                                            placeholder={isLoadingCash ? "Memuat kas..." : "Pilih Kas / Bank..."}
                                            disabled={isPending || isLoadingCash}
                                            className="h-8.5 text-xs rounded-xl"
                                        />

                                        {isCashInsufficient && (
                                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-medium">
                                                <IconAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <span>
                                                    Saldo kas tidak mencukupi untuk pembelian ini (Tersedia: {formatRupiah(Number(selectedCashAccount?.saldo) || 0)}).
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Pilihan Non-Kas (Offset COA) */}
                                {watchedSumber === "non_kas" && (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                                            Akun Penyeimbang COA (Ekuitas / Utang) <span className="text-rose-500">*</span>
                                        </label>
                                        <CommandSelect
                                            options={nonKasCoaOptions}
                                            value={watchedOffsetCoaUid || ""}
                                            onChange={(val: string) => createForm.setValue("offset_coa_uid", val || null)}
                                            placeholder={isLoadingCoa ? "Memuat COA..." : "Pilih Akun Ekuitas / Kewajiban..."}
                                            disabled={isPending || isLoadingCoa}
                                            className="h-8.5 text-xs rounded-xl"
                                        />
                                        <p className="text-[10px] text-slate-500">
                                            Pilih akun Modal Pemilik, Hutang Usaha, atau Hibah jika tidak dibayar tunai.
                                        </p>
                                    </div>
                                )}

                                {/* Live Journal Preview Slip */}
                                <div className="p-3 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-2">
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                                        <IconInfoCircle className="w-3.5 h-3.5" />
                                        <span>Simulasi Jurnal Otomatis</span>
                                    </div>

                                    <div className="space-y-1.5 text-xs">
                                        {/* Debit */}
                                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="p-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                                                    <IconArrowUpRight className="w-3.5 h-3.5" />
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-300 truncate">
                                                    [D] {categoryAssetCoa ? `${categoryAssetCoa.nama}` : "Akun Aset Kategori"}
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                                +{formatRupiah(watchedHarga)}
                                            </span>
                                        </div>

                                        {/* Kredit */}
                                        <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="p-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 shrink-0">
                                                    <IconArrowDownLeft className="w-3.5 h-3.5" />
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-300 truncate">
                                                    [K] {watchedSumber === "kas"
                                                        ? (selectedCashAccount ? selectedCashAccount.nama : "Akun Kas/Bank")
                                                        : (selectedOffsetCoa ? selectedOffsetCoa.nama : "Akun Modal/Utang")}
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0">
                                                -{formatRupiah(watchedHarga)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                        </div>
                    </div>
                </form>
            )}
        </BaseDialog>
    );
}
