"use client";

import React from "react";
import { FormProvider } from "react-hook-form";
import { BaseDialog } from "@/components/ui/base-dialog";
import { Button } from "@/components/ui/button";
import { FormDatePicker } from "@/components/forms/form-date-picker";
import { FormNominalInput } from "@/components/forms/form-nominal-input";
import { FormSelect } from "@/components/forms/form-select";
import { FormInput } from "@/components/forms/form-input";
import {
    IconReceiptRefund,
    IconTrendingUp,
    IconTrendingDown,
    IconEqual,
    IconCheck,
    IconInfoCircle,
    IconAlertTriangle,
} from "@tabler/icons-react";
import { formatRupiah } from "@/hooks/use-format-rupiah";
import { useAssetSellForm } from "../../hooks/use-asset-sell-form";
import type { Asset } from "../../types";
import type { SellAssetSchemaInput } from "../../schemas/asset-sell-schema";

interface AssetSellDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: Asset | null;
    onSuccess?: () => void;
}

export function AssetSellDialog({
    open,
    onOpenChange,
    asset,
    onSuccess,
}: AssetSellDialogProps) {
    const {
        form,
        isPending,
        isLoadingCash,
        isLoadingCoa,
        cashOptions,
        offsetCoaOptions,
        selectedCashAccount,
        selectedOffsetCoa,
        assetCoa,
        nilaiBukuSaatIni,
        hargaPerolehanAwal,
        totalPenyusutanSaatIni,
        watchedNominalJual,
        hasEnteredNominal,
        selisih,
        isGain,
        isLoss,
        isBreakeven,
        handleNominalChange,
        handleSubmit,
    } = useAssetSellForm({
        asset,
        onOpenChange,
        onSuccess,
    });

    if (!asset) return null;

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
                        <IconReceiptRefund className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            Penjualan Aset
                        </span>
                    </div>
                </div>
            }
            className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[92dvh] !p-3.5 sm:!p-4"
        >
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-2.5 text-xs"
                >
                    {/* 1. TOP: Ultra-compact Slim Horizontal Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                                {asset.nama}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                {asset.nomor_aset}
                            </span>
                            {asset.kode_aset && (
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                    • SN: {asset.kode_aset}
                                </span>
                            )}
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wide bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                                {asset.category?.nama || "-"}
                            </span>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 text-[11px] font-mono flex-wrap">
                            <span className="text-slate-500 dark:text-slate-400">
                                Beli: <strong className="text-slate-800 dark:text-slate-200">{formatRupiah(hargaPerolehanAwal)}</strong>
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                            <span className="text-slate-500 dark:text-slate-400">
                                Susut: <strong className="text-amber-600 dark:text-amber-400">{formatRupiah(totalPenyusutanSaatIni)}</strong>
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                                Nilai Buku: {formatRupiah(nilaiBukuSaatIni)}
                            </span>
                        </div>
                    </div>

                    {/* 2. MIDDLE: Balanced Compact 2-Column Responsive Grid on Desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                        {/* Kolom Kiri: Parameter Penjualan & Pembayaran */}
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                                    <span className="p-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                                        <IconReceiptRefund className="w-3 h-3" />
                                    </span>
                                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                        Parameter Penjualan & Pembayaran
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* Tanggal Penjualan */}
                                    <FormDatePicker<SellAssetSchemaInput>
                                        name="tanggal_jual"
                                        label="Tanggal Penjualan *"
                                        placeholder="Pilih tanggal penjualan..."
                                        disabled={isPending}
                                        clearable={false}
                                    />

                                    {/* Nominal Penjualan (Harga Jual) */}
                                    <FormNominalInput<SellAssetSchemaInput>
                                        name="nominal_jual"
                                        label="Harga Jual (Rp) *"
                                        placeholder="Contoh: 5.000.000"
                                        disabled={isPending}
                                        onValueChange={handleNominalChange}
                                    />
                                </div>

                                {/* Akun Kas / Bank Penerimaan */}
                                <FormSelect<SellAssetSchemaInput>
                                    name="cash_account_uid"
                                    label="Akun Kas / Bank Penerimaan *"
                                    options={cashOptions}
                                    placeholder={isLoadingCash ? "Memuat akun kas..." : "Pilih Kas Utama / Bank..."}
                                    isLoading={isLoadingCash}
                                    disabled={isPending || isLoadingCash}
                                />

                                {/* Catatan Penjualan */}
                                <FormInput<SellAssetSchemaInput>
                                    name="catatan"
                                    label="Catatan (Opsional)"
                                    placeholder="Nama pembeli, alasan Penjualan aset..."
                                    disabled={isPending}
                                />
                            </div>

                            {/* Peringatan Status Lock */}
                            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                                <IconAlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                <span>
                                    Setelah diproses, status aset menjadi <strong>Dijual</strong> & terkunci permanen.
                                </span>
                            </div>
                        </div>

                        {/* Kolom Kanan: Hasil Penjualan & Simulasi Jurnal GL */}
                        <div className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800 space-y-2 flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                                    <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                                        <IconInfoCircle className="w-3 h-3" />
                                    </span>
                                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                                        Hasil Penjualan & Penjurnalan GL
                                    </span>
                                </div>

                                {/* 1. Real-time Calculation & CoA Offset Dynamic Handler */}
                                {!hasEnteredNominal && (
                                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-0.5">
                                        <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold block">
                                            Masukkan Nominal Harga Jual
                                        </span>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            Sistem akan otomatis menghitung selisih laba/rugi dan memandu pemilihan akun penyeimbang.
                                        </p>
                                    </div>
                                )}

                                {isGain && (
                                    <div className="p-2 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/70 space-y-1.5 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className="p-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                                                    <IconTrendingUp className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs">
                                                    Keuntungan (Gain)
                                                </span>
                                            </div>
                                            <span className="font-mono font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
                                                +{formatRupiah(selisih)}
                                            </span>
                                        </div>

                                        {/* Akun CoA Penyeimbang Keuntungan */}
                                        <div className="pt-1 border-t border-emerald-200/60 dark:border-emerald-800/50">
                                            <FormSelect<SellAssetSchemaInput>
                                                key="gain-offset-coa"
                                                name="offset_coa_uid"
                                                label="Akun Pendapatan / Ekuitas Penyeimbang *"
                                                options={offsetCoaOptions}
                                                placeholder={
                                                    isLoadingCoa
                                                        ? "Memuat akun CoA..."
                                                        : "Pilih Akun Pendapatan/Ekuitas..."
                                                }
                                                isLoading={isLoadingCoa}
                                                disabled={isPending || isLoadingCoa}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isLoss && (
                                    <div className="p-2 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/70 space-y-1.5 animate-in fade-in duration-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <div className="p-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                                                    <IconTrendingDown className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="font-extrabold text-rose-800 dark:text-rose-300 text-xs">
                                                    Kerugian (Loss)
                                                </span>
                                            </div>
                                            <span className="font-mono font-extrabold text-xs text-rose-700 dark:text-rose-300">
                                                -{formatRupiah(Math.abs(selisih))}
                                            </span>
                                        </div>

                                        {/* Akun CoA Penyeimbang Kerugian */}
                                        <div className="pt-1 border-t border-rose-200/60 dark:border-rose-800/50">
                                            <FormSelect<SellAssetSchemaInput>
                                                key="loss-offset-coa"
                                                name="offset_coa_uid"
                                                label="Akun Beban Penyeimbang *"
                                                options={offsetCoaOptions}
                                                placeholder={
                                                    isLoadingCoa
                                                        ? "Memuat akun CoA..."
                                                        : "Pilih Akun Beban..."
                                                }
                                                isLoading={isLoadingCoa}
                                                disabled={isPending || isLoadingCoa}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isBreakeven && (
                                    <div className="p-2 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] animate-in fade-in duration-200">
                                        <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                            <IconEqual className="w-3.5 h-3.5" /> Impas (Harga = Nilai Buku)
                                        </span>
                                        <span className="font-mono text-[10px] text-slate-500">
                                            Selisih Rp 0 (Tanpa CoA)
                                        </span>
                                    </div>
                                )}

                                {/* 2. Simulasi Jurnal GL Otomatis (Compact Slip) */}
                                <div className="p-2 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100/70 dark:border-indigo-900/30 space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                        <span className="flex items-center gap-1">
                                            <IconInfoCircle className="w-3 h-3" />
                                            Simulasi Jurnal GL
                                        </span>
                                        <span className="font-normal text-slate-400 text-[9px]">
                                            Tutup saldo (0-0)
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                                        {/* Debet Kas */}
                                        <div className="flex items-center justify-between gap-1 p-1 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 min-w-0">
                                            <span className="text-slate-600 dark:text-slate-300 truncate">
                                                [D] {selectedCashAccount ? selectedCashAccount.nama : "Kas"}
                                            </span>
                                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
                                                +{formatRupiah(watchedNominalJual)}
                                            </span>
                                        </div>

                                        {/* Kredit/Debet Offset */}
                                        {isGain && (
                                            <div className="flex items-center justify-between gap-1 p-1 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 min-w-0">
                                                <span className="text-slate-600 dark:text-slate-300 truncate">
                                                    [K] {selectedOffsetCoa ? selectedOffsetCoa.nama : "(Pilih Akun Pendapatan)"}
                                                </span>
                                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
                                                    +{formatRupiah(selisih)}
                                                </span>
                                            </div>
                                        )}

                                        {isLoss && (
                                            <div className="flex items-center justify-between gap-1 p-1 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 min-w-0">
                                                <span className="text-slate-600 dark:text-slate-300 truncate">
                                                    [D] {selectedOffsetCoa ? selectedOffsetCoa.nama : "(Pilih Akun Beban)"}
                                                </span>
                                                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 shrink-0 ml-1">
                                                    +{formatRupiah(Math.abs(selisih))}
                                                </span>
                                            </div>
                                        )}

                                        {/* Tutup Akumulasi Penyusutan */}
                                        <div className="flex items-center justify-between gap-1 p-1 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 min-w-0">
                                            <span className="text-slate-600 dark:text-slate-300 truncate">
                                                [D] Akum. Susut
                                            </span>
                                            <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                                                Tutup
                                            </span>
                                        </div>

                                        {/* Nol-kan Akun Aset Tetap */}
                                        <div className="flex items-center justify-between gap-1 p-1 rounded bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 min-w-0">
                                            <span className="text-slate-600 dark:text-slate-300 truncate">
                                                [K] {assetCoa ? assetCoa.nama : "Aset"}
                                            </span>
                                            <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                                                {formatRupiah(hargaPerolehanAwal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. BOTTOM: Action Footer */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                            className="h-8 px-3.5 text-xs rounded-lg border-slate-200 dark:border-slate-800 cursor-pointer"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                isPending ||
                                !hasEnteredNominal ||
                                ((isGain || isLoss) && !form.watch("offset_coa_uid")) ||
                                !form.watch("cash_account_uid")
                            }
                            className="h-8 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IconCheck className="w-3.5 h-3.5" />
                            <span>{isPending ? "Memproses..." : "Konfirmasi & Jual Aset"}</span>
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </BaseDialog>
    );
}
